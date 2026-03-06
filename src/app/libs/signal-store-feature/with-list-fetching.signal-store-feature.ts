/* eslint-disable @typescript-eslint/no-explicit-any */
import { inject, Injector, runInInjectionContext } from '@angular/core';
import { Params } from '@angular/router';
import { tapResponse } from '@ngrx/operators';
import { signalStoreFeature, withHooks, withMethods, withProps, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { Store } from '@ngrx/store';
import { debounceTime, distinctUntilChanged, Observable, of, OperatorFunction, pipe, switchMap, take, tap } from 'rxjs';
import { SubSink } from 'subsink';
import { AppRouterState } from '../../core/router-store/router.reducers';
import { getQueryParams } from '../../core/router-store/router.selectors';
import { DEFAULT_LIST_CRITERIA } from '../criteria/default-list-criteria.constant';
import { flattenCriteria } from '../criteria/flatten-criteria.utils';
import { FlattenListCriteria } from '../criteria/flatten-list-criteria.interface';
import { ListCriteria } from '../criteria/list-criteria.interface';
import { Paginated } from '../http-response/paginated.interface';
import { checkDuplicatedStoreKey } from './check-duplicated-store-key.utils';
import { parseCriteriaFromQueryParams } from './query-params-to-list-criteria-parser.utils';
import { updateState } from './with-devtools.signal-store-feature';
import { withUniqueSignalStoreFeature } from './with-unique-signal-store-feature.signal-store-feature';

/**
 * Type definition for the parameter expected by `withListFetching` function.
 * It maps the key of each store to a function that takes criteria and returns an Observable of a paginated response.
 */
type WithListFetchingParam = Record<string, () => (criteria: ListCriteria) => Observable<Paginated<any>>>;

/**
 * Extracts the item type from a function that returns a paginated list.
 * This is useful for extracting the type of items in the list.
 */
type ExtractItemType<F> = F extends () => (criteria: any) => Observable<Paginated<infer U>> ? U : never;

/** Interface representing the state of the list fetching feature, including loading, error, items, and pagination criteria. */
export interface ListFetchingFeatureState<T> {
    /** Indicates whether the list is being fetched */
    loading: boolean;

    /** The error, if any, that occurred while fetching the list */
    error: Error | undefined;

    /** The fetched list of items */
    items: T[];

    /** The total number of items available */
    totalItems: number;

    /** The criteria used for fetching the list */
    criteria: ListCriteria | null;

    /** A function to trigger re-fetching the list */
    reload?: () => void;
}

/**
 * Updates the URL query parameters based on the provided criteria and feature key.
 * @param criteria - The criteria to update in the query parameters.
 * @param featureKey - The feature key to associate with the criteria.
 */
const updateUrlQueryParams = (criteria: ListCriteria, featureKey: string): void => {
    const url = new URL(window.location.href);
    const flattenedCriteria: FlattenListCriteria = flattenCriteria(criteria);
    Object.keys(flattenedCriteria).forEach((criteriaKey) => {
        url.searchParams.set(`${featureKey}-${criteriaKey}`, (flattenedCriteria as any)[criteriaKey]);
    });
    window.history.pushState(null, '', url.toString());
};

/**
 * Builds the initial state for the list fetching feature based on the provided parameters.
 * @param param - The parameters that define the structure of the feature's state.
 * @returns The built state.
 */
const buildState = <T>(param: T) => {
    const builtState: {
        // typing here doesn't work anymore
        [K in keyof T]: ListFetchingFeatureState<ExtractItemType<T[K]>>;
    } = {} as any;

    for (const key in param) {
        builtState[key] = {
            loading: false,
            error: undefined,
            items: [],
            totalItems: 0,
            criteria: null,
        };
    }
    return builtState;
};

/**
 * Creates a function to patch the criteria in the store's state.
 * @param store - The store to patch the criteria in.
 * @param key - The key of the feature in the store.
 * @returns A function to patch the criteria.
 */
const buildPatchCriteriaFn =
    <T>(store: any, key: Extract<keyof T, string>) =>
    (criteria: Partial<ListCriteria>) => {
        updateState(store, `[${key}] Patch Criteria`, (state: any) => ({
            ...state,
            [key]: { ...state[key], criteria: { ...state[key].criteria, ...criteria } },
        }));
    };

/**
 * Updates the store state to indicate that data loading is in progress.
 * @param store - The store to update.
 * @param key - The key of the feature in the store.
 */
const updateStateOnLoadingInProgress = <T>(store: any, key: Extract<keyof T, string>) => {
    updateState(store, `[${key}] Load List`, (state: any) => ({
        ...state,
        [key]: { ...state[key], loading: true },
    }));
};

/**
 * Updates the store state upon successful data loading, including the list of items and total count.
 * @param store - The store to update.
 * @param key - The key of the feature in the store.
 * @param response - The paginated response to update the state with.
 */
const updateStateOnSuccessfulLoading = <T>(store: any, key: Extract<keyof T, string>, response: Paginated<any>) => {
    updateState(store, `[${key}] Load List Success`, (state: any) => ({
        ...state,
        [key]: {
            ...state[key],
            loading: false,
            items: response.items,
            totalItems: response.totalItems,
        },
    }));
};

/**
 * Updates the store state upon failed data loading, setting the error state.
 * @param store - The store to update.
 * @param key - The key of the feature in the store.
 * @param error - The error that occurred.
 */
const updateStateOnFailedLoading = <T>(store: any, key: Extract<keyof T, string>, error: any) => {
    updateState(store, `[${key}] Load List Fail`, (state: any) => ({
        ...state,
        [key]: { ...state[key], loading: false, error },
    }));
};

/**
 * Builds the RxJS pipeline for loading data, including the necessary operators for handling loading states and errors.
 * @param store - The store to update.
 * @param key - The key of the feature in the store.
 * @param fetchMethod - The method to fetch the list of data.
 * @returns The RxJS pipeline.
 */
const buildDataLoadingRxPipes = <T>(
    store: any,
    key: Extract<keyof T, string>,
    fetchMethod: (criteria: ListCriteria) => Observable<Paginated<any>>
) =>
    [
        tap(() => updateStateOnLoadingInProgress(store, key)),
        switchMap((criteria: ListCriteria) =>
            fetchMethod(criteria).pipe(
                tapResponse({
                    next: (response: Paginated<any>) => updateStateOnSuccessfulLoading(store, key, response),
                    error: (error: any) => updateStateOnFailedLoading(store, key, error),
                })
            )
        ),
    ] as const;

/**
 * Sets up the RxJS pipeline for data loading, including URL query parameter updates and other RxJS operators.
 * @param store - The store to update.
 * @param key - The key of the feature in the store.
 * @param loadDataRxPipes - The RxJS pipeline for loading data.
 * @returns The setup function for data loading.
 */
const buildDataLoadingSetupFn = <T>(
    store: any,
    key: Extract<keyof T, string>,
    loadDataRxPipes: readonly [any, OperatorFunction<ListCriteria, Paginated<any>>]
) =>
    rxMethod<ListCriteria>(
        pipe(
            debounceTime(300),
            distinctUntilChanged(),
            tap((criteria: ListCriteria) => updateUrlQueryParams(criteria, key)),
            ...loadDataRxPipes
        )
    );

/**
 * Builds a function to trigger a reload of the list data.
 * @param store - The store to update.
 * @param key - The key of the feature in the store.
 * @param loadDataRxPipes - The RxJS pipeline for loading data.
 * @returns The reload function.
 */
const buildReloadFn =
    <T>(
        store: any,
        key: Extract<keyof T, string>,
        loadDataRxPipes: readonly [any, OperatorFunction<ListCriteria, Paginated<any>>]
    ) =>
    () => {
        store.withListFetchingSubs = of(store[key].criteria())
            .pipe(...loadDataRxPipes)
            .subscribe();
    };

/**
 * Handles reloading when query parameters change, updating the store's criteria.
 * @param store - The store to update.
 * @param param - The parameter that defines the features in the store.
 * @param queryParam - The new query parameters to parse and apply.
 */
const performReloadOnQueryParamChange =
    <T extends WithListFetchingParam>(store: any, param: T) =>
    (queryParam: Params) => {
        const listCriteriaRecord = parseCriteriaFromQueryParams(queryParam);
        for (const key in param) {
            const listCriteria = listCriteriaRecord[key];
            store.patchCriteria(key, listCriteria || DEFAULT_LIST_CRITERIA());
        }
    };

/**
 * Higher-order function that sets up list fetching features for the store.
 * @param param - The configuration defining the fetching methods and criteria for each feature.
 * @returns A store feature that provides list fetching functionality.
 */
// eslint-disable-next-line max-lines-per-function
export function withListFetching<T extends WithListFetchingParam>(param: T) {
    return signalStoreFeature(
        withMethods((store: any) => checkDuplicatedStoreKey(store, param)),
        withUniqueSignalStoreFeature('withListFetching'),
        withState(() => buildState(param)),
        withProps(() => ({
            withListFetchingSubs: new SubSink(),
        })),
        withMethods((store: any) => {
            const injector = inject(Injector);
            return {
                patchCriteria: (key: Extract<keyof T, string>, criteria: Partial<ListCriteria>) =>
                    buildPatchCriteriaFn(store, key)(criteria),
                setupDataLoading: (key: Extract<keyof T, string>, criteria: ListCriteria) => {
                    const loadDataRxPipes = buildDataLoadingRxPipes(store, key, param[key]());
                    buildDataLoadingSetupFn(store, key, loadDataRxPipes)(criteria);
                },
                reload: (key: Extract<keyof T, string>) => {
                    runInInjectionContext(injector, () => {
                        const loadDataRxPipes = buildDataLoadingRxPipes(store, key, param[key]());
                        buildReloadFn(store, key, loadDataRxPipes)();
                    });
                },
            };
        }),
        withHooks({
            onInit(store: any) {
                for (const key in param) {
                    store.setupDataLoading(key, store[key].criteria);
                }
                store.withListFetchingSubs = inject(Store<AppRouterState>)
                    .select(getQueryParams)
                    .pipe(take(1))
                    .subscribe(performReloadOnQueryParamChange(store, param));
            },
            onDestroy(store: any) {
                store.withListFetchingSubs.unsubscribe();
            },
        })
    );
}
