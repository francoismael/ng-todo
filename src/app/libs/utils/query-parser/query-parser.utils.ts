/* eslint-disable complexity */

import { isObject } from '../object/is-object.utils';

/**
 * Value in query params entries are always string (egg: 'false', 'null', '1', ... )
 * so we have to transform them back to boolean, number, null, ...
 * @param val Objet representing a api request query params
 * @returns query params in which values are parsed
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseQueryParams = (val: any): any => {
    const value = structuredClone(val);
    if (isObject(value)) {
        Object.keys(value).forEach((key) => {
            value[key] = parseQueryParams(value[key]);
        });
        return value;
    }
    if (Array.isArray(value)) {
        return value.map((v) => parseQueryParams(v));
    }
    if (value === 'null') {
        return null;
    }
    if (value === 'false') {
        return false;
    }
    if (value === 'true') {
        return true;
    }
    if (value === '') {
        return '';
    }
    if (!isNaN(value) && !/^0[0-9].*$/.test(value)) {
        return Number(value);
    }
    return value;
};

/**
 * transform some value of an object into array
 * no object is returned but criteria is modified
 * @param criteria an object representing criteria
 * @param fields fields of criteria which need to be parsed to array
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const makeValuesArray = (criteria: Record<string, any>, fields: string[]): void => {
    for (const field of fields) {
        if (criteria[field]) {
            criteria[field] = Array.isArray(criteria[field]) ? criteria[field] : [criteria[field]];
        }
    }
};

export function getInitial(username?: string | null): string {
  if (!username) {return '?';}
  const parts = username.trim().split(/\s+/);
  if (parts.length === 0) {return '?';}
  return parts[0][0].toUpperCase();
}
