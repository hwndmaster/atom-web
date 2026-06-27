import { createAction } from "@reduxjs/toolkit";
import type { LoadingParam, LoadingTarget, LoadingTargetPayload, RaiseErrorInfo } from "@hwndmaster/atom-web-core";

function prepareLoadingTarget(target: LoadingTarget, param?: LoadingParam): { payload: LoadingTargetPayload } {
    return { payload: param == null ? target : { target, param } };
}

export const showLoader = createAction("common/showLoader", prepareLoadingTarget);
export const hideLoader = createAction("common/hideLoader", prepareLoadingTarget);
export const hideAllLoaders = createAction<void>("common/hideAllLoaders");
export const raiseError = createAction<RaiseErrorInfo>("common/raiseError");
