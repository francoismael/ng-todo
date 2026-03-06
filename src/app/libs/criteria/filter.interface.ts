/** Interface representing a filter with dynamic key-value pairs. */
export interface Filter {
    /** The key is a string, and the value can be a string, number, Date, or an array of strings or booleans, or a boolean. */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}
