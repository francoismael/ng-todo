/* eslint-disable @typescript-eslint/unified-signatures */
/* eslint-disable max-lines-per-function */
import { isPlatformServer } from '@angular/common';
import { PLATFORM_ID, effect, inject } from '@angular/core';
import {
    EmptyFeatureResult,
    SignalStoreFeature,
    SignalStoreFeatureResult,
    getState,
    patchState,
    signalStoreFeature,
    withHooks,
    withMethods,
} from '@ngrx/signals';

/**  no-operation function. */
// eslint-disable-next-line @typescript-eslint/no-empty-function
const NOOP = () => {};

/** The result of the storage sync feature, including methods for interacting with the storage. */
type WithStorageSyncFeatureResult = EmptyFeatureResult & {
    methods: {
        clearStorage(): void;
        readFromStorage(): void;
        writeToStorage(): void;
    };
};

/** A stub for methods when running on the server platform (no-op) */
const StorageSyncStub: Pick<WithStorageSyncFeatureResult, 'methods'>['methods'] = {
    clearStorage: NOOP,
    readFromStorage: NOOP,
    writeToStorage: NOOP,
};

/** Configuration interface for syncing state to storage. */
export interface SyncConfig<State> {
    /** The key which is used to access the storage. */
    key: string;
    /**
     * Flag indicating if the store should read from storage on init and write to storage on every state change.
     *
     * `true` by default
     */
    autoSync?: boolean;
    /**
     * Function to select that portion of the state which should be stored.
     *
     * Returns the whole state object by default
     */
    select?: (state: State) => Partial<State>;
    /**
     * Function used to parse the state coming from storage.
     *
     * `JSON.parse()` by default
     */
    parse?: (stateString: string) => State;
    /**
     * Function used to tranform the state into a string representation.
     *
     * `JSON.stringify()` by default
     */
    stringify?: (state: State) => string;
    /**
     * Factory function used to select the storage.
     *
     * `localstorage` by default
     */
    storage?: () => Storage;
}

/**
 * Enables store synchronization with storage.
 *
 * Only works on browser platform.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function withStorageSync<State extends object, Input extends SignalStoreFeatureResult>(
    key: string,
): SignalStoreFeature<Input, WithStorageSyncFeatureResult>;

/** Creates a SignalStoreFeature that syncs state with storage (e.g., localStorage). */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function withStorageSync<State extends object, Input extends SignalStoreFeatureResult>(
    config: SyncConfig<Input['state']>,
): SignalStoreFeature<Input, WithStorageSyncFeatureResult>;

/** A feature that syncs state with storage (e.g., localStorage). */
export function withStorageSync<State extends object, Input extends SignalStoreFeatureResult>(
    configOrKey: SyncConfig<Input['state']> | string,
): SignalStoreFeature<Input, WithStorageSyncFeatureResult> {
    const {
        key,
        autoSync = true,
        select = (state: State) => state,
        parse = JSON.parse,
        stringify = JSON.stringify,
        storage: storageFactory = () => localStorage,
    } = typeof configOrKey === 'string' ? { key: configOrKey } : configOrKey;

    return signalStoreFeature(
        withMethods((store, platformId = inject(PLATFORM_ID)) => {
            if (isPlatformServer(platformId)) {
                return StorageSyncStub;
            }

            const storage = storageFactory();

            return {
                /** Removes the item stored in storage. */
                clearStorage(): void {
                    storage.removeItem(key);
                },

                /** Reads item from storage and patches the state. */
                readFromStorage(): void {
                    const stateString = storage.getItem(key);
                    if (stateString) {
                        patchState(store, parse(stateString));
                    }
                },

                /** Writes selected portion to storage. */
                writeToStorage(): void {
                    const slicedState = select(getState(store) as State);
                    storage.setItem(key, stringify(slicedState));
                },
            };
        }),
        withHooks({
            onInit(store, platformId = inject(PLATFORM_ID)) {
                if (isPlatformServer(platformId)) {
                    return;
                }

                if (autoSync) {
                    store.readFromStorage();

                    effect(() => {
                        store.writeToStorage();
                    });
                }
            },
        }),
    );
}
