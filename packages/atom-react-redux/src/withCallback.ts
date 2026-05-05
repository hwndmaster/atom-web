import type { ActionMeta } from "./actionExtensions";
import type { SagaFunction } from "./types";

/**
 * Wraps a saga generator with resolve/reject callbacks from action meta.
 * @param meta The action meta containing optional resolve/reject functions.
 * @param sagaFn The saga generator function to execute.
 */
export function* withCallback<T>(
    meta: ActionMeta<T>,
    sagaFn: SagaFunction<T>
): Generator<unknown, T, unknown> {
    try {
        const result = yield* sagaFn();

        if (meta?.resolve != undefined) {
            meta.resolve(result);
        }

        return result;
    } catch (error) {
        const errorMessage = (error instanceof Error) ? error.message : (error?.toString() ?? "Unknown error");
        if (meta?.reject != undefined) {
            meta.reject(errorMessage);
        }
    }

    return undefined!;
}
