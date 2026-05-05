import { put } from "redux-saga/effects";
import * as common from "./common";
import type { SagaFunction } from "./types";

/**
 * Wraps a saga generator with loading state management.
 * @param loadingTarget The numeric loading target to show/hide (from project's LoadingTargets enum).
 * @param sagaFn The saga generator function to execute.
 */
export function* withLoading<T>(
    loadingTarget: number,
    sagaFn: SagaFunction<T>
): Generator<unknown, T, unknown> {
    yield put(common.Actions.showLoader(loadingTarget));
    try {
        return yield* sagaFn();
    } finally {
        yield put(common.Actions.hideLoader(loadingTarget));
    }
}
