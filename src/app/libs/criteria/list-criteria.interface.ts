import { Filter } from './filter.interface';
import { Page } from './page.interface';
import { Sort } from './sort.interface';

/** Interface representing the criteria for listing items, including pagination, search, sorting, and filtering. */
export interface ListCriteria {
    /** The pagination settings (page and page size). */
    page: Page;

    /** The search term for filtering the list. */
    search: string;

    /** The sorting settings for the list. Can be null if no sorting is applied. */
    sort: Sort | null;

    /** The filters applied to the list. Can be null if no filters are set. */
    filter: Filter | null;
}
