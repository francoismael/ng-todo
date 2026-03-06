import { ListCriteria } from './list-criteria.interface';

/** Default values for list criteria, including pagination, search, sorting, and filtering. */
export const DEFAULT_LIST_CRITERIA = (): ListCriteria => ({
    /** Default pagination settings: page 1 and page size of 10. */
    page: { page: 1, pageSize: 2 },

    /** Default search term is an empty string. */
    search: '',

    /** Default sorting is set to null (no sorting). */
    sort: null,

    /** Default filter is set to null (no filtering). */
    filter: null,
});
