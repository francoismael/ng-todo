import { isObject } from '../utils/object/is-object.utils';
import { FlattenListCriteria } from './flatten-list-criteria.interface';
import { ListCriteria } from './list-criteria.interface';

/**
 * Object with nestings can't be passed as HTTP GET params, so we have to flatten it
 * For egg:
 * originalCriteria = { page: { page: 1, pageSize: 15 }, sort: { by: 'name', direction: 'asc' } }
 * flattenedCriteria = { page: 1, pageSize: 15, by: 'name', direction: 'asc' }
 * @listCriteria listCriteria Any data loading criteria
 * @returns Flattened criteria with all nesting removed
 */
export const flattenCriteria = (listCriteria: ListCriteria, defaultCriteria?: ListCriteria): FlattenListCriteria => {
    const criteria = listCriteria && Object.keys(listCriteria).length ? listCriteria : defaultCriteria;
    return Object.assign(
        {},
        ...Object.entries(criteria || {})
            .filter(([, value]) => (typeof value === 'boolean' ? true : value))
            .map(([key, value]) => (isObject(value) ? flattenCriteria(value) : { [key]: value }))
    );
};
