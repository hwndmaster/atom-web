import { put } from "redux-saga/effects";
import type { ActionMeta, ActionMetaValidatable, ActionValidationErrors } from "./actionExtensions";
import { isApiValidationError, type ApiValidationErrorMessages } from "./callApi";
import * as common from "./common";

type SagaFunction<T> = () => Generator<unknown, T, unknown>;

interface ValidatableCallbackOptions<TFormData extends Record<string, unknown>> {
    mapValidationField: (apiFieldName: string) => Extract<keyof TFormData, string> | undefined;
}

function mapValidationErrors<TFormData extends Record<string, unknown>>(
    validationErrorMessages: ApiValidationErrorMessages,
    options: ValidatableCallbackOptions<TFormData>,
): ActionValidationErrors<TFormData> {
    const mappedErrors: ActionValidationErrors<TFormData> = {};

    for (const [apiFieldName, messages] of Object.entries(validationErrorMessages)) {
        const mappedFieldName = options.mapValidationField(apiFieldName);
        if (mappedFieldName == null || mappedFieldName.trim() === "") {
            continue;
        }

        mappedErrors[mappedFieldName] ??= [];
        mappedErrors[mappedFieldName].push(...messages);
    }

    return mappedErrors;
}

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

/**
 * Wraps a saga generator with resolve/reject callbacks and validation mapping.
 */
export function* withValidatableCallback<T, TFormData extends Record<string, unknown>>(
    meta: ActionMetaValidatable<T, TFormData>,
    options: ValidatableCallbackOptions<TFormData>,
    sagaFn: SagaFunction<T>
): Generator<unknown, T, unknown> {
    try {
        const result = yield* sagaFn();

        if (meta?.resolve != undefined) {
            meta.resolve(result);
        }

        return result;
    } catch (error) {
        if (isApiValidationError(error) && meta?.validationReject != undefined) {
            const validationErrors = mapValidationErrors(error.validationErrorMessages, options);

            if (Object.keys(validationErrors).length > 0) {
                meta.validationReject(validationErrors);
                return undefined!;
            }
        }

        const errorMessage = (error instanceof Error) ? error.message : (error?.toString() ?? "Unknown error");
        if (meta?.reject != undefined) {
            meta.reject(errorMessage);
        }
    }

    return undefined!;
}

export type { ValidatableCallbackOptions };
