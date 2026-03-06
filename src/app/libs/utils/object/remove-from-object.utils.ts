/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Remove a key - value form an object
 * @param object The object
 * @param key key to remove
 * @returns the object without the key
 */
export const removeFromObject = (object: { [key: string]: any }, key: string) => {
    const { [key]: removed, ...remaining } = object;
    return remaining;
};
