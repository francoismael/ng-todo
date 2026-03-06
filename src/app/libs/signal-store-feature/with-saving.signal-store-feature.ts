import { withCUD } from './with-cud.signal-store-feature';

/** Creates a store feature for the 'save' action with a 'saving' state. */
export const withSaving = withCUD('save', 'saving');
