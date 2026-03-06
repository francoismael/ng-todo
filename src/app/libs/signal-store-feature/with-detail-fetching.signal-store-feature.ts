/* eslint-disable @typescript-eslint/no-explicit-any */
import { effect, inject, Injector, runInInjectionContext, Signal, signal, WritableSignal } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { signalStoreFeature, withHooks, withMethods, withProps, withState } from '@ngrx/signals';
import { select, Store } from '@ngrx/store';
import { map, Observable } from 'rxjs';
import { SubSink } from 'subsink';
import { AppRouterState } from '../../core/router-store/router.reducers';
import { getParams } from '../../core/router-store/router.selectors';
import { checkDuplicatedStoreKey } from './check-duplicated-store-key.utils';
import { updateState } from './with-devtools.signal-store-feature';
import { withUniqueSignalStoreFeature } from './with-unique-signal-store-feature.signal-store-feature';

/**
 * Extracts the type of the return value from a method.
 * @template F - A function type that returns an observable.
 * @returns The type of the observable returned by the function.
 */
type ExtractItemType<F> = F extends () => (...args: string[]) => Observable<infer U> ? U : never;

/**
 * Defines the state shape for the feature managing detail fetching,
 * including loading status, error state, and the fetched data.
 */
export interface DetailFetchingFeatureState<T> {
    /** Indicates whether the data is being loaded. */
    loading: boolean;

    /** Stores any error that occurred during loading. */
    error: Error | undefined;

    /** Stores the fetched data. */
    data: T | null;

    /** Optional method to reload data. */
    reload?: () => void;
}

/**
 * Extracts arguments from router parameters and updates corresponding signals.
 * @param argsFromRouterParams - The list of parameter names to extract from router params.
 * @param routerParamSignalRecord - The record that stores router parameter signals.
 * @returns An array of extracted values based on router parameters.
 */
function getArgsFromRouterParam(argsFromRouterParams: string[], routerParamSignalRecord: Record<string, Signal<string>>) {
    return argsFromRouterParams.map((arg: string) => routerParamSignalRecord[arg]());
}

/**
 * Builds a subscription to update router parameter signals when the router state changes.
 * @param store - The store instance to update.
 * @param param - The configuration object defining the parameters.
 * @returns The subscription object.
 */
const buildParamSignalSubscription = (store: any, param: any) =>
    inject(Store<AppRouterState>)
        .pipe(
            select(getParams),
            map((params) => ({ ...params }))
        )
        .subscribe((routerParams) => {
            for (const feature in param) {
                for (const argFromRouterParams of param[feature].argsFromRouterParams) {
                    if (store.routerParamSignalRecord[argFromRouterParams]) {
                        store.routerParamSignalRecord[argFromRouterParams].set(routerParams[argFromRouterParams] || null);
                    } else {
                        store.routerParamSignalRecord[argFromRouterParams] = signal(routerParams[argFromRouterParams] || null);
                    }
                }
            }
        });

/**
 * Updates the state to reflect that data is being loaded for a particular feature.
 * @param store - The store instance to update.
 * @param key - The key identifying the feature.
 */
const updateStateOnLoadingInProgress = <T>(store: any, key: Extract<keyof T, string>) => {
    updateState(store, `[${key}] Load Detail`, (state: any) => ({
        ...state,
        [key]: { ...state[key], loading: true, error: undefined },
    }));
};

/**
 * Updates the state to reflect that data loading was successful for a particular feature.
 * @param store - The store instance to update.
 * @param key - The key identifying the feature.
 * @param response - The successful response data.
 */
const updateStateOnSuccessfulLoading = <T>(store: any, key: Extract<keyof T, string>, response: any) => {
    updateState(store, `[${key}] Load Detail Success`, (state: any) => ({
        ...state,
        [key]: {
            ...state[key],
            loading: false,
            data: response,
        },
    }));
};

/**
 * Updates the state to reflect that data loading failed for a particular feature.
 * @param store - The store instance to update.
 * @param key - The key identifying the feature.
 * @param error - The error that occurred during loading.
 */
const updateStateOnFailedLoading = <T>(store: any, key: Extract<keyof T, string>, error: any) => {
    updateState(store, `[${key}] Load Detail Fail`, (state: any) => ({
        ...state,
        [key]: { ...state[key], loading: false, error },
    }));
};

/**
 * Builds the feature's state method to trigger the fetching logic when router parameters change.
 * @param injector - The injector to fetch dependencies.
 * @param fetchMethod - The method used to fetch data.
 * @returns A function that fetches data based on router parameters.
 */
const buildFeatureStateMethod =
    (injector: Injector, fetchMethod: () => (...args: any) => Observable<any>) =>
    () =>
    (...methodArgs: string[]) => {
        let fetchMethobirthDateservable;
        runInInjectionContext(injector, () => {
            fetchMethobirthDateservable = fetchMethod()(...(methodArgs as any));
        });
        return fetchMethobirthDateservable;
    };

/**
 * Builds the reload function to trigger the fetching of data when needed.
 * @param store - The store instance to update.
 * @param param - The configuration object defining the parameters.
 * @param key - The key identifying the feature.
 * @returns A function that triggers data reload.
 */
const buildReloadFn =
    <T>(store: any, param: any, key: Extract<keyof T, string>) =>
    () => {
        const args = getArgsFromRouterParam(param[key].argsFromRouterParams, store.routerParamSignalRecord);
        if (args.every((arg) => arg !== null)) {
            updateStateOnLoadingInProgress(store, key);
            store.withDetailFetchingSubs.sink = param[key]
                .method()(...(args as any))
                .pipe(
                    tapResponse({
                        next: (response) => updateStateOnSuccessfulLoading(store, key, response),
                        error: (error: any) => updateStateOnFailedLoading(store, key, error),
                    })
                )
                .subscribe();
        }
    };

/**
 * Higher-order function that wraps a feature for handling detail fetching with router parameters.
 * It integrates with NgRx Signals for reactive state updates and manages the fetching lifecycle.
 * @param param - The configuration object that defines each feature's method and parameters.
 * @returns A store feature that manages fetching, loading state, and reactivity.
 */
// eslint-disable-next-line max-lines-per-function
export function withDetailFetching<
    T extends {
        [K in keyof T]: {
            argsFromRouterParams: P[K];
            method: () => (...args: NoInfer<P[K]>) => Observable<any>;
        };
    },
    const P extends { [K in keyof T]: string[] } = { [K in keyof T]: T[K]['argsFromRouterParams'] }
>(param: T) {
    return signalStoreFeature(
        withUniqueSignalStoreFeature('withDetailFetching'),
        withMethods((store) => checkDuplicatedStoreKey(store, param)),
        withState(() => {
            const builtState: {
                [K in keyof T]: DetailFetchingFeatureState<ExtractItemType<T[K]['method']>>;
            } = {} as any;
            for (const key in param) {
                builtState[key] = {
                    loading: false,
                    error: undefined,
                    data: null,
                };
            }
            return builtState;
        }),
        withProps(() => ({
            routerParamSignalRecord: {} as Record<string, WritableSignal<string>>,
            withDetailFetchingSubs: new SubSink(),
        })),
        withProps((store) => ({
            routerParamSignalSubscription: buildParamSignalSubscription(store, param),
        })),
        withMethods(() => {
            const injector = inject(Injector);
            for (const key in param) {
                const fetchMethod = param[key].method;
                (param as any)[key].method = buildFeatureStateMethod(injector, fetchMethod);
            }
            return {};
        }),
        withHooks({
            onInit: (store: any) => {
                for (const key in param) {
                    store[key].reload = buildReloadFn(store, param, key);
                    effect(() => store[key].reload());
                }
            },
            onDestroy: (store: any) => {
                store.routerParamSignalSubscription.unsubscribe();
                store.withDetailFetchingSubs.unsubscribe();
            },
        })
    );
}
