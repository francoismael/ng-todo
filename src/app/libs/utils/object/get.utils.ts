/**
 * Retrieves the value at the specified path of an object, which can be a nested property.
 * The path is specified as a dot-separated string, and this function supports accessing properties
 * within arrays as well.
 *
 * @param object - The object from which to retrieve the value.
 * @param path - A dot-separated string that specifies the path to the desired property.
 * @returns The value at the specified path, or `undefined` if the path does not exist.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const get = (object: any, path: string): any =>
    path.split('.').reduce((m, o) => (Array.isArray(m) ? m.map((e) => e?.[o]) : m?.[o]), object);
