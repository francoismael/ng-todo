/**
 * Check if value is an object
 * @param value tested value
 * @returns true if value is an object, false otherwise
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isObject = (value: any): boolean => value instanceof Object && value.constructor === Object;
