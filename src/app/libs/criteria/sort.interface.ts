/** Interface representing sorting criteria for a list, including the fields and sort order. */
export interface Sort {
    /** An array of field names to sort by. */
    sortBy: string[];

    /** An array indicating the sort order for each field (1 for ascending, -1 for descending). */
    sortOrder: Array<1 | -1>;
}
