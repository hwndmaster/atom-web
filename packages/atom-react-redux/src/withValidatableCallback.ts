import { getNotificationService } from "@hwndmaster/atom-web-core";
import type { ActionMetaValidatable, ActionValidationErrors } from "./actionExtensions";
import { isApiValidationError, type ApiValidationErrorMessages } from "./callApi";
import type { SagaFunction } from "./types";

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
                getNotificationService().showError(
                    "Validation Error",
                    "Couldn't proceed with operation due to validation error(s).",
                );
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
