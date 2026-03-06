/* eslint-disable @typescript-eslint/no-explicit-any */
import { isPlatformServer } from '@angular/common';
import { effect, inject, PLATFORM_ID, signal, Signal } from '@angular/core';
import {
    EmptyFeatureResult,
    patchState as originalPatchState,
    PartialStateUpdater,
    SignalStoreFeature,
    WritableStateSource,
} from '@ngrx/signals';

/** Global interface for Redux DevTools extension. */
declare global {
    /** Extends the Window interface to include Redux DevTools extension properties. */
    interface Window {
        /** The Redux DevTools Extension, if available, provides access to connect to devtools. */
        __REDUX_DEVTOOLS_EXTENSION__:
            | {
                  connect: (options: { name: string }) => {
                      /**
                       * Sends the action and state to the Redux DevTools.
                       * @param action The action dispatched in the store.
                       * @param state The current state of the store.
                       */
                      send: (action: Action, state: Record<string, unknown>) => void;
                  };
              }
            | undefined;
    }
}

/** Utility type to prettify object types. */
type Prettify<Type extends object> = {
    [Key in keyof Type]: Type[Key];
};

/** Interface for DevTools connection response. */
interface ConnectResponse {
    /**
     * Sends an action along with the state.
     * @param action - The action to send.
     * @param state - The current state to send with the action.
     */
    send: (action: Action, state: Record<string, unknown>) => void;
}

/** Holds the connection response, if available. */
let connection: ConnectResponse | undefined;

/** Interface representing an action. */
export interface Action {
    /** The type of the action. */
    type: string;
}

/** Registry for storing signals, identified by string keys. */
const storeRegistry = signal<Record<string, Signal<unknown>>>({});

/** Set to track unique action names. */
let currentActionNames = new Set<string>();

/** Flag indicating if synchronization has been initialized. */
let synchronizationInitialized = false;

/** Initializes synchronization with Redux DevTools. */
function initSynchronization() {
    effect(() => {
        if (!connection) {
            return;
        }

        const stores = storeRegistry();
        const rootState: Record<string, unknown> = {};
        for (const name in stores) {
            const store = stores[name];
            rootState[name] = store();
        }

        const names = Array.from(currentActionNames);
        const type = names.length ? names.join(', ') : 'Store Update';
        currentActionNames = new Set<string>();

        connection.send({ type }, rootState);
    });
}

/**
 * Retrieves a value from an object using a symbol key.
 * @param obj - The target object.
 * @param symbol - The symbol key.
 * @returns The corresponding value.
 */
function getValueFromSymbol(obj: unknown, symbol: symbol) {
    if (typeof obj === 'object' && obj && symbol in obj) {
        return (obj as { [key: symbol]: any })[symbol];
    }
}

/**
 * Retrieves the store signal from an object.
 * @param store - The store object.
 * @returns The signal associated with the store.
 */
function getStoreSignal(store: unknown): Signal<unknown> {
    const [signalStateKey] = Object.getOwnPropertySymbols(store);
    if (!signalStateKey) {
        throw new Error('Cannot find State Signal');
    }

    return getValueFromSymbol(store, signalStateKey);
}

/** Resets the DevTools connection and synchronization state. Used for testing. */
export function reset() {
    connection = undefined;
    synchronizationInitialized = false;
    storeRegistry.set({});
}

/** Stub for DevTools integration. Can be used to disable DevTools in production. */
export const withDevToolsStub: typeof withDevtools = () => (store) => store;

/**
 * Enhances a store with DevTools integration.
 * @param name - The store's name as it should appear in the DevTools.
 * @returns A feature that integrates with DevTools.
 */
export function withDevtools<Input extends EmptyFeatureResult>(name: string): SignalStoreFeature<Input, EmptyFeatureResult> {
    return (store) => {
        const isServer = isPlatformServer(inject(PLATFORM_ID));
        if (isServer) {
            return store;
        }

        const extensions = window.__REDUX_DEVTOOLS_EXTENSION__;
        if (!extensions) {
            return store;
        }

        if (!connection) {
            connection = extensions.connect({
                name: 'NgRx Signal Store',
            });
        }

        const storeSignal = getStoreSignal(store);
        storeRegistry.update((value) => ({
            ...value,
            [name]: storeSignal,
        }));

        if (!synchronizationInitialized) {
            initSynchronization();
            synchronizationInitialized = true;
        }

        return store;
    };
}

/** Type definition for a patched state function. */
type PatchFn = typeof originalPatchState extends (arg1: infer First, ...args: infer Rest) => infer Returner
    ? (state: First, action: string, ...rest: Rest) => Returner
    : never;

/**
 * Wrapper for `patchState` to integrate with DevTools.
 * @param stateSource - The Signal Store state source.
 * @param action - The action name to display in DevTools.
 * @param updaters - Updater functions or objects.
 */
export function updateState<State extends object>(
    stateSource: WritableStateSource<State>,
    action: string,
    ...updaters: Array<Partial<Prettify<State>> | PartialStateUpdater<Prettify<State>>>
): void {
    currentActionNames.add(action);
    return originalPatchState(stateSource, ...updaters);
}

/**
 * Patches the state by calling the updateState function.
 * @param state The current state to be updated.
 * @param action The action that triggers the state update.
 * @param rest Additional parameters passed to updateState.
 */
export const patchState: PatchFn = (state, action, ...rest) => {
    updateState(state, action, ...rest);
};
