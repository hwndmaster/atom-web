import { put } from "redux-saga/effects";
import type { LoadingParam } from "@hwndmaster/atom-web-core";
import * as common from "./common";
import type { SagaFunction } from "./types";

/**
 * Wraps a saga generator with loading state management.
 * @param loadingTarget The numeric loading target to show/hide (from project's LoadingTargets enum).
 * @param sagaFn The saga generator function to execute.
 * @param param Optional value qualifying the target, so the same target can be tracked
 *   independently per record. A LoadingSpinner only activates when both its target and
 *   its param match the ones blocked here.
 */
export function* withLoading<T>(
    loadingTarget: number,
    sagaFn: SagaFunction<T>,
    param?: LoadingParam
): Generator<unknown, T, unknown> {
    yield put(common.Actions.showLoader(loadingTarget, param));
    try {
        return yield* sagaFn();
    } finally {
        yield put(common.Actions.hideLoader(loadingTarget, param));
    }
}
