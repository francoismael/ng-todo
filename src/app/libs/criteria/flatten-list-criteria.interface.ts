/**
 * Represents list criteria used with getPaginated function
 * Flatten list criteria
 */
export interface FlattenListCriteria {
    /** Current page */
    page: number;

    /** Page size */
    pageSize: number;

    /**
     * field where sort will be applied
     * IMPORTANT: This field should be adjusted later to manage multiple sort fields
     */
    sortBy: string[];

    /**
     * Direction of the sort
     * -1: Descendant
     * 1: Ascendant
     * IMPORTANT: This field should be adjusted later to manage multiple sort fields
     */
    sortOrder: string[];

    /** Search term */
    search: string;

    /** Filters */
    [key: string]: string | string[] | number | number[];
}
