import { put } from "redux-saga/effects";
import type { ActionMeta } from "./actionExtensions";
import * as common from "./common";

/**
 * Wraps a saga generator with loading state management.
 * @param loadingTarget The numeric loading target to show/hide (from project's LoadingTargets enum).
 * @param sagaFn The saga generator function to execute.
 */
export function* withLoading<T>(
    loadingTarget: number,
    sagaFn: () => Generator<unknown, T, unknown>
): Generator<unknown, T, unknown> {
    yield put(common.Actions.showLoader(loadingTarget));
    try {
        return yield* sagaFn();
    } finally {
        yield put(common.Actions.hideLoader(loadingTarget));
    }
}

/**
 * Wraps a saga generator with resolve/reject callbacks from action meta.
 * @param meta The action meta containing optional resolve/reject functions.
 * @param sagaFn The saga generator function to execute.
 */
export function* withCallback<T>(
    meta: ActionMeta<T>,
    sagaFn: () => Generator<unknown, T, unknown>
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
