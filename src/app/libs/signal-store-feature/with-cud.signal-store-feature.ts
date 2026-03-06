/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { tapResponse } from '@ngrx/operators';
import { signalStoreFeature, withHooks, withMethods, withProps, withState } from '@ngrx/signals';
import { Observable, from } from 'rxjs';
import { SubSink } from 'subsink';
import { updateState } from './with-devtools.signal-store-feature';
import { withUniqueSignalStoreFeature } from './with-unique-signal-store-feature.signal-store-feature';

/**
 * Extracts the return type of the Observable from a function type.
 * @param F - The function type.
 * @returns The type of the emitted value from the Observable.
 */
type ExtractItemType<F> = F extends () => (...arg: any[]) => Observable<infer U> | Promise<infer U> ? U : never;

/**
 * Extracts the argument types of a function type.
 * @param F - The function type.
 * @returns The types of the arguments of the function.
 */
type ExtractArgsType<F> = F extends () => (...args: infer A) => Observable<any> | Promise<any> ? A : never;

/**
 * Records the update methods for each feature, with the appropriate verb prefix.
 * @param T - The feature type.
 * @param VERB - The verb to use in the method name.
 * @returns A method record with dynamic method names.
 */
type MethodRecord<T, VERB extends string> = {
    [Key in keyof T as `${VERB}${Capitalize<string & Key>}`]: (
        ...updateMethodParam: ExtractArgsType<T[Key]>
    ) => Promise<ExtractItemType<T[Key]>>;
} & {
    [Key in keyof T as `reset${Capitalize<VERB>}${Capitalize<string & Key>}State`]: () => void;
};

/**
 * Extracts the return type of the update method function.
 * @param F - The update method function.
 * @returns The type of the emitted value from the Observable.
 */
type ExtractUpdateMethodReturnType<F> = F extends () => (...args: any[]) => Observable<infer U> | Promise<infer U> ? U : never;

/**
 * Represents the state of the feature, including success, error, and response.
 * @param T - The feature type.
 * @param PRESENT_PARTICIPLE - The present participle to describe the state (e.g., 'Updating').
 * @returns A state structure for each feature with success, error, and response properties.
 */
type BuiltState<T, PRESENT_PARTICIPLE extends string> = {
    [Key in keyof T as `${string & Key}${Capitalize<PRESENT_PARTICIPLE>}`]: boolean;
} & {
    [Key in keyof T as `${string & Key}${Capitalize<PRESENT_PARTICIPLE>}Error`]: Error | undefined;
} & {
    [Key in keyof T as `${string & Key}${Capitalize<PRESENT_PARTICIPLE>}Response`]: ExtractItemType<T[Key]>;
};

/**
 * Capitalizes the first letter of a string.
 * @param input - The string to capitalize.
 * @returns The input string with the first letter capitalized.
 */
function capitalizeFirstLetter(input: string): string {
    if (!input) {
        return input;
    }
    return input.charAt(0).toUpperCase() + input.slice(1);
}

/**
 * Builds the state object for each feature based on the provided parameters and present participle.
 * @param param - The feature parameter.
 * @param presentParticiple - The present participle (e.g., 'updating').
 * @returns A state object for the feature with success, error, and response properties.
 */
const buildState = <T, const PRESENT_PARTICIPLE extends string>(param: any, presentParticiple: PRESENT_PARTICIPLE) =>
    Object.keys(param).reduce((acc, key) => {
        const typedKey = key as keyof T;
        (acc as any)[`${String(typedKey)}${capitalizeFirstLetter(presentParticiple)}`] = false;
        (acc as any)[`${String(typedKey)}${capitalizeFirstLetter(presentParticiple)}Error`] = undefined;
        (acc as any)[`${String(typedKey)}${capitalizeFirstLetter(presentParticiple)}Response`] = undefined;
        return acc;
    }, {} as BuiltState<T, PRESENT_PARTICIPLE>);

/**
 * Updates the state to reflect that an action is in progress.
 * @param store - The store to update.
 * @param key - The feature key to update.
 * @param verb - The action verb.
 * @param prefix - The prefix for the state properties.
 */
const updateStateAsInProgress = <T>(store: any, key: Extract<keyof T, string>, verb: string, prefix: string) => {
    updateState(store, `[${key}] ${capitalizeFirstLetter(verb)} ${capitalizeFirstLetter(key)}`, (state: any) => ({
        ...state,
        [`${prefix}`]: true,
        [`${prefix}Response`]: undefined,
        [`${prefix}Error`]: undefined,
    }));
};

/**
 * Updates the state when an action is successful.
 * @param store - The store to update.
 * @param key - The feature key to update.
 * @param verb - The action verb.
 * @param prefix - The prefix for the state properties.
 * @param response - The response data from the action.
 */
const updateStateOnSuccessful = <T>(store: any, key: Extract<keyof T, string>, verb: string, prefix: string, response: any) => {
    updateState(store, `[${key}] ${capitalizeFirstLetter(verb)} ${capitalizeFirstLetter(key)} Success`, (state: any) => ({
        ...state,
        [`${prefix}`]: false,
        [`${prefix}Response`]: response,
        [`${prefix}Error`]: undefined,
    }));
};

/**
 * Resets the state when an action is cleared.
 * @param store - The store to update.
 * @param key - The feature key to update.
 * @param verb - The action verb.
 * @param prefix - The prefix for the state properties.
 * @param response - The response data from the action.
 */
const resetState = <T>(store: any, key: Extract<keyof T, string>, verb: string, prefix: string) => {
    updateState(store, `[${key}] ${capitalizeFirstLetter(verb)} ${capitalizeFirstLetter(key)} Clear State `, (state: any) => ({
        ...state,
        [`${prefix}`]: false,
        [`${prefix}Response`]: undefined,
        [`${prefix}Error`]: undefined,
    }));
};

/**
 * Updates the state when an action fails.
 * @param store - The store to update.
 * @param key - The feature key to update.
 * @param verb - The action verb.
 * @param prefix - The prefix for the state properties.
 * @param error - The error data from the action.
 */
const updateStateOnFailed = <T>(store: any, key: Extract<keyof T, string>, verb: string, prefix: string, error: any) => {
    updateState(store, `[${key}] ${capitalizeFirstLetter(verb)} ${capitalizeFirstLetter(key)} Fail`, (state: any) => ({
        ...state,
        [`${prefix}`]: false,
        [`${prefix}Response`]: undefined,
        [`${prefix}Error`]: error,
    }));
};

/**
 * Builds a method for creating, updating, or deleting data, handling the state updates and Observable flow.
 * @param store - The store to update.
 * @param key - The feature key.
 * @param verb - The action verb.
 * @param presentParticiple - The present participle (e.g., 'updating').
 * @param updateMethod - The method to be invoked for the action.
 * @returns A promise that resolves with the action's result.
 */
const buildCUDMethod =
    <T>(
        store: any,
        key: Extract<keyof T, string>,
        verb: string,
        presentParticiple: string,
        updateMethod: (...args: any[]) => Observable<any> | Promise<any>
    ) =>
    (...updateMethodParam: any[]): Promise<ExtractUpdateMethodReturnType<typeof updateMethod>> =>
        new Promise((resolve, reject) => {
            const prefix = `${key}${capitalizeFirstLetter(presentParticiple)}`;
            updateStateAsInProgress(store, key, verb, prefix);
            const updateMethodResult = updateMethod(...updateMethodParam);
            const updateMethobirthDateservable =
                updateMethodResult instanceof Promise
                    ? from(updateMethodResult)
                    : (updateMethodResult as Observable<ExtractUpdateMethodReturnType<typeof updateMethod>>);
            store[`withData${capitalizeFirstLetter(presentParticiple)}`] = (
                updateMethobirthDateservable as Observable<ExtractUpdateMethodReturnType<typeof updateMethod>>
            )
                .pipe(
                    tapResponse({
                        next: (response) => {
                            updateStateOnSuccessful(store, key, verb, prefix, response);
                            // Resolves the Promise on success
                            resolve(response);
                        },
                        error: (error: any) => {
                            updateStateOnFailed(store, key, verb, prefix, error);
                            reject(error);
                        },
                    })
                )
                .subscribe();
        });

const buildClearMethod =
    <T>(store: any, key: Extract<keyof T, string>, verb: string, presentParticiple: string) =>
    (): void => {
        const prefix = `${key}${capitalizeFirstLetter(presentParticiple)}`;
        resetState(store, key, verb, prefix);
    };

/**
 * A higher-order function that provides CRUD functionality with hooks and state management.
 * @param verb - The action verb (e.g., 'create', 'update', 'delete').
 * @param presentParticiple - The present participle (e.g., 'updating').
 * @returns A function that accepts the methods for the feature and returns the store with CUD functionality.
 */
export function withCUD<const PRESENT_PARTICIPLE extends string, const VERB extends string>(
    verb: VERB,
    presentParticiple: PRESENT_PARTICIPLE
) {
    return function <
        T extends {
            [K in keyof T]: () => (...args: any[]) => Observable<any> | Promise<any>;
        }
    >(param: T) {
        return signalStoreFeature(
            withUniqueSignalStoreFeature(`withData${capitalizeFirstLetter(presentParticiple)}`),
            withState(() => buildState<T, PRESENT_PARTICIPLE>(param, presentParticiple)),
            withProps(() => ({
                [`withData${capitalizeFirstLetter(presentParticiple)}Subs`]: new SubSink(),
            })),
            withMethods((store: any) => {
                const methodRecord = {};
                for (const key in param) {
                    const updateMethod = param[key]();
                    const keyWithVerb = `${verb}${capitalizeFirstLetter(key)}` as keyof MethodRecord<T, VERB>;
                    (methodRecord as any)[keyWithVerb] = buildCUDMethod(store, key, verb, presentParticiple, updateMethod);
                    (methodRecord as any)[`reset${capitalizeFirstLetter(keyWithVerb as string)}State`] = buildClearMethod(
                        store,
                        key,
                        verb,
                        presentParticiple
                    );
                }
                return methodRecord as MethodRecord<T, VERB>;
            }),
            withHooks({
                onDestroy: (store: any) => {
                    store[`withData${capitalizeFirstLetter(presentParticiple)}`].unsubscribe();
                },
            })
        );
    };
}
