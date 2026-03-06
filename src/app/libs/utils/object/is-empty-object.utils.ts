import { isObject } from './is-object.utils';

/**
 * Checks if an object is empty (has no own properties).
 * @param obj - The object to check.
 * @returns `true` if the object is empty, otherwise `false`.
 */
export const isEmptyObject = (obj: object | null | undefined) => obj && isObject(obj) && Object.keys(obj).length === 0;
