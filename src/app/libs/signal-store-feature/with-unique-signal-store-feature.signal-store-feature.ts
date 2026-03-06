import { signalStoreFeature, withMethods, withProps } from '@ngrx/signals';

/**
 * Ensures a Signal Store feature is used only once.
 * Throws an error if the feature is applied more than once.
 *
 * @param signalStoreFeatureName The unique name of the feature.
 * @returns The Signal Store feature with uniqueness check.
 */
export function withUniqueSignalStoreFeature(signalStoreFeatureName: string) {
    return signalStoreFeature(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        withMethods((store: any) => {
            if (store[signalStoreFeatureName]) {
                throw new Error(`Signal store feature ${signalStoreFeatureName} is not allowed to be used more than once`);
            }
            return {};
        }),
        withProps(() => ({
            [signalStoreFeatureName]: true,
        })),
    );
}
