import { withCUD } from './with-cud.signal-store-feature';

/**
 * A higher-order function to add delete functionality to a store, handling the state and lifecycle of a deletion action.
 * Uses the `withCUD` function with 'delete' as the action verb and 'deleting' as the present participle.
 */
export const withDeletion = withCUD('delete', 'deleting');
