import { call } from "redux-saga/effects";
import { AxiosError } from "axios";
import { withComponentName } from "@hwndmaster/atom-web-core";
import type { ErrorInfo, RaiseErrorInfo, ValidationError } from "@hwndmaster/atom-web-core";
import { isDev } from "@hwndmaster/atom-web-core";
import { getNotificationService } from "@/notifications";
import type { SagaGenerator } from "@/types";
import * as commonActions from "./actions";

const logger = withComponentName("Saga Common");

function raiseErrorInternal(message: string, title?: string, ...args: unknown[]): void {
    title = title ?? "Error";
    message = message ?? "Unknown error";
    getNotificationService().showError(title, message);
    logger.error(`${title}: ${message}` + (args.length > 0 ? ", details: %o" : ""), args);
}

function isGeneralErrorInfo(payload: RaiseErrorInfo): boolean {
    return payload != null && typeof payload === "object" && "message" in payload;
}

function isValidationErrorInfo(payload: ValidationError | unknown): boolean {
    return payload != null && typeof payload === "object" && "errors" in payload && "status" in payload;
}

/**
 * Handles the raise error action saga.
 * @param action - The action containing the error information.
 */
export function* raiseErrorSaga(action: ReturnType<typeof commonActions.raiseError>): SagaGenerator {
    if (action.payload instanceof AxiosError) {
        yield call(raiseErrorInternal, action.payload.message, "API Error", action.payload);
    } else if (action.payload instanceof Error) {
        yield call(raiseErrorInternal, action.payload.message, (action.payload.cause ?? "Error").toString(), {
            stack: isDev === true ? action.payload.stack : undefined,
        });
    } else if (isGeneralErrorInfo(action.payload)) {
        const errorInfo: ErrorInfo = action.payload as ErrorInfo;
        yield call(raiseErrorInternal, errorInfo.message, errorInfo.title);
    } else if (isValidationErrorInfo(action.payload)) {
        const errorInfo: ValidationError = action.payload as ValidationError;
        yield call(raiseErrorInternal, Object.values(errorInfo.errors).flat().join("\n"), errorInfo.title);
    } else {
        yield call(raiseErrorInternal, (action.payload ?? "").toString());
    }
}
