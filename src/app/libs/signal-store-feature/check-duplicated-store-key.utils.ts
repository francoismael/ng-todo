/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Checks if any of the keys in the given `param` object already exist in the `store`.
 * If a duplicate key is found, it throws an error with the duplicate key name.
 *
 * @param store - The store object where the keys will be checked.
 * @param param - The object whose keys will be checked for duplication in the store.
 * @returns An empty object if no duplication is found.
 * @throws Error if any key in `param` already exists in `store`.
 */
export const checkDuplicatedStoreKey = (store: any, param: Record<string, any>) => {
    for (const key in param) {
        if (store[key]) {
            throw new Error(`Key ${key} already exists in store`);
        }
    }
    return {};
};
