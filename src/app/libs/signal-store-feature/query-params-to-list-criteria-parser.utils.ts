import { Params } from '@angular/router';
import { ListCriteria } from '../criteria/list-criteria.interface';
import { parseQueryParams } from '../utils/query-parser/query-parser.utils';

/**
 * Forces a value to be an array if it's not already.
 * @param value - The value to be checked.
 * @returns The value as an array.
 */
const forceToBeArray = (value: unknown) => (Array.isArray(value) ? value : [value]);

/**
 * Checks if the criteria key is related to pagination (page or pageSize).
 * @param criteriaKey - The key to check.
 * @returns True if the criteria key is 'page' or 'pageSize', false otherwise.
 */
const isPage = (criteriaKey: string) => ['page', 'pageSize'].includes(criteriaKey);

/**
 * Checks if the criteria key is related to sorting by field.
 * @param criteriaKey - The key to check.
 * @returns True if the criteria key is 'sortBy', false otherwise.
 */
const isSortBy = (criteriaKey: string) => criteriaKey === 'sortBy';

/**
 * Checks if the criteria key is related to sorting order.
 * @param criteriaKey - The key to check.
 * @returns True if the criteria key is 'sortOrder', false otherwise.
 */
const isSortOrder = (criteriaKey: string) => criteriaKey === 'sortOrder';

/**
 * Checks if the criteria key is related to search.
 * @param criteriaKey - The key to check.
 * @returns True if the criteria key is 'search', false otherwise.
 */
const isSearch = (criteriaKey: string) => criteriaKey === 'search';

/**
 * Ensures the value is an empty object if it’s undefined.
 * @param value - The value to check.
 * @returns An empty object if the value is undefined, or the value itself.
 */
const defaultToEmptyObject = (value: object | undefined) => value || {};

/**
 * Parses query parameters into a structured criteria record for filtering, sorting, and pagination.
 * @param queryParams - The query parameters to parse.
 * @returns A record of parsed criteria based on the query parameters.
 */
export const parseCriteriaFromQueryParams = (queryParams: Params): Record<string, Partial<ListCriteria>> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const criteriaRecord: Record<string, any> = {};
    const parsedQueryParams = parseQueryParams(queryParams);
    for (const [key, value] of Object.entries(parsedQueryParams)) {
        const [feature, criteriaKey] = key.split('-');
        criteriaRecord[feature] = defaultToEmptyObject(criteriaRecord[feature]);
        if (isPage(criteriaKey)) {
            criteriaRecord[feature].page = defaultToEmptyObject(criteriaRecord[feature].page);
            criteriaRecord[feature].page[criteriaKey] = value;
        } else if (isSortBy(criteriaKey)) {
            criteriaRecord[feature].sort = defaultToEmptyObject(criteriaRecord[feature].sort);
            criteriaRecord[feature].sort.sortBy = forceToBeArray(value);
        } else if (isSortOrder(criteriaKey)) {
            criteriaRecord[feature].sort.sortOrder = forceToBeArray(value);
        } else if (isSearch(criteriaKey)) {
            criteriaRecord[feature].search = value;
        } else {
            criteriaRecord[feature].filter = defaultToEmptyObject(criteriaRecord[feature].filter);

            criteriaRecord[feature].filter[criteriaKey] = criteriaKey.endsWith(':list') ? forceToBeArray(value) : value;
        }
    }
    return criteriaRecord as Record<string, Partial<ListCriteria>>;
};
