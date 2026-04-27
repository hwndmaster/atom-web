import { createAction } from "@reduxjs/toolkit";
import type { RaiseErrorInfo } from "@hwndmaster/atom-web-core";

export const showLoader = createAction<number>("common/showLoader");
export const hideLoader = createAction<number>("common/hideLoader");
export const hideAllLoaders = createAction<void>("common/hideAllLoaders");
export const raiseError = createAction<RaiseErrorInfo>("common/raiseError");
