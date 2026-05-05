import { call, put } from "redux-saga/effects";
import { ApiResponse, ApiCallResult } from "@hwndmaster/atom-api-core";
import type { HasToastedError } from "@hwndmaster/atom-web-core";
import * as commonActions from "./common/actions";

type ValidationErrorsByField = Record<string, string[]>;

type ApiValidationErrorMessages = ValidationErrorsByField;

class ApiValidationError extends Error {
    public readonly statusCode: number;
    public readonly validationErrorMessages: ApiValidationErrorMessages;
    public readonly cause: unknown;

    constructor(validationErrorMessages: ApiValidationErrorMessages, statusCode: number, cause?: unknown) {
        const flattenedErrors = Object.values(validationErrorMessages).flat();
        super(flattenedErrors.length > 0 ? flattenedErrors.join("\n") : "Validation error");
        this.name = "ApiValidationError";
        this.statusCode = statusCode;
        this.validationErrorMessages = validationErrorMessages;
        this.cause = cause;
    }
}

/**
 * Checks whether an unknown error is an API validation error.
 */
function isApiValidationError(value: unknown): value is ApiValidationError {
    return value instanceof ApiValidationError;
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
    return value != null && typeof value === "object" && !Array.isArray(value);
}

function isApiResponse<TResponse>(value: unknown): value is ApiResponse<TResponse> {
    return isObjectRecord(value) && typeof value.status === "number";
}

function tryParseJson(value: string): unknown {
    try {
        return JSON.parse(value);
    } catch {
        return undefined;
    }
}

function normalizeValidationErrors(errors: unknown): ValidationErrorsByField | null {
    if (!isObjectRecord(errors)) {
        return null;
    }

    const normalized: ValidationErrorsByField = {};

    for (const [fieldName, fieldErrors] of Object.entries(errors)) {
        if (fieldName.trim() === "") {
            continue;
        }

        if (Array.isArray(fieldErrors)) {
            const messages = fieldErrors
                .filter((item): item is string => typeof item === "string")
                .map((item) => item.trim())
                .filter((item) => item !== "");

            if (messages.length > 0) {
                normalized[fieldName] = messages;
            }

            continue;
        }

        if (typeof fieldErrors === "string" && fieldErrors.trim() !== "") {
            normalized[fieldName] = [fieldErrors.trim()];
        }
    }

    return Object.keys(normalized).length > 0 ? normalized : null;
}

function parseValidationProblemDetails(value: unknown): ValidationErrorsByField | null {
    const parsed = (typeof value === "string") ? tryParseJson(value) : value;
    if (!isObjectRecord(parsed)) {
        return null;
    }

    const directErrors = normalizeValidationErrors(parsed.errors);
    if (directErrors != null) {
        return directErrors;
    }

    if ("data" in parsed) {
        return parseValidationProblemDetails(parsed.data);
    }

    return null;
}

class ApiRequest<TResponse> {
    private nullOnStatuses: number[] = [];
    private isSuppressErrorLogs = false;
    private isThrowOnError = true;

    constructor(private readonly apiAction: () => Promise<ApiResponse<TResponse>>) {
    }

    public returnNullOn(statuses: number[] | number): ApiRequest<TResponse | null> {
        this.nullOnStatuses = Array.isArray(statuses) ? statuses : [statuses];
        return this as unknown as ApiRequest<TResponse | null>;
    }

    public suppressErrorLogs(suppress = true): ApiRequest<TResponse> {
        this.isSuppressErrorLogs = suppress;
        return this;
    }

    public throwOnError(throwError = true): ApiRequest<TResponse> {
        this.isThrowOnError = throwError;
        return this;
    }

    private getStatusCode(error: unknown): number {
        if (!isObjectRecord(error)) {
            return 500;
        }

        if (typeof error.status === "number") {
            return error.status;
        }

        if (isObjectRecord(error.response) && typeof error.response.status === "number") {
            return error.response.status;
        }

        return 500;
    }

    private processValidationError(error: unknown, statusCode: number): ValidationErrorsByField | null {
        if (statusCode !== 400) {
            return null;
        }

        if (!isObjectRecord(error)) {
            return null;
        }

        const candidates: unknown[] = [];
        if ("result" in error) {
            candidates.push(error.result);
        }
        if ("response" in error) {
            candidates.push(error.response);

            if (isObjectRecord(error.response) && "data" in error.response) {
                candidates.push(error.response.data);
            }
        }

        for (const candidate of candidates) {
            const parsedErrors = parseValidationProblemDetails(candidate);
            if (parsedErrors != null) {
                return parsedErrors;
            }
        }

        return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public *invoke(): Generator<any, TResponse | null, any> {
        const result: ApiCallResult<TResponse> = yield* this.invokeRaw();

        if (this.nullOnStatuses.includes(result.statusCode)) {
            return null;
        }

        if (result.hasErrors) {
            throw new Error(result.errors.join("\n"));
        }

        return result.data;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public *fetch<TModel>(converterFn: (data: TResponse) => TModel): Generator<any, TModel | null, any> {
        const result = yield* this.invoke();
        if (result == null) {
            return null;
        }
        return converterFn(result);
    }

    public *fetchArray<TItem, TModel>(
        this: TResponse extends TItem[] ? ApiRequest<TResponse> : never,
        converterFn: (data: TItem) => TModel
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): Generator<any, TModel[], any> {
        const result = yield* this.invoke();
        if (result == null) {
            return [];
        }
        if (!Array.isArray(result)) {
            throw new Error("Expected an array response for fetchArray.");
        }
        return result.map(converterFn);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public *invokeRaw(): Generator<any, ApiCallResult<TResponse>, any> {
        try {
            const responseUnknown: unknown = yield call(this.apiAction as () => Promise<ApiResponse<TResponse>>);
            if (!isApiResponse<TResponse>(responseUnknown)) {
                throw new Error("API call returned an invalid response.");
            }

            const response: ApiResponse<TResponse> = responseUnknown;

            if (response?.status === 200) {
                return new ApiCallResult<TResponse>(response.data, [], response.status);
            } else {
                if (this.isThrowOnError && !this.nullOnStatuses.includes(response.status)) {
                    throw new Error("Error code " + response.status, {
                        cause: `API call failed with error code ${response.status}`,
                    });
                }

                if (!this.isSuppressErrorLogs && !this.nullOnStatuses.includes(response.status)) {
                    yield put(
                        commonActions.raiseError({
                            message: "Error code " + response.status,
                            title: `API call failed with error code ${response.status}`,
                        })
                    );
                }

                return new ApiCallResult<TResponse>(undefined, ["Error code " + response.status], response?.status);
            }
        } catch (error) {
            const statusCode = this.getStatusCode(error);

            if (this.nullOnStatuses.includes(statusCode)) {
                return new ApiCallResult<TResponse>(undefined, [(error ?? "Api call failed").toString()], statusCode);
            }

            const validationErrorMessages = this.processValidationError(error, statusCode);
            if (validationErrorMessages != null) {
                if (this.isThrowOnError) {
                    throw new ApiValidationError(validationErrorMessages, statusCode, error);
                }

                const flattenedErrors = Object.values(validationErrorMessages).flat();
                return new ApiCallResult<TResponse>(
                    undefined,
                    flattenedErrors.length > 0 ? flattenedErrors : ["Validation error"],
                    statusCode,
                );
            }

            if (!this.isSuppressErrorLogs) {
                yield put(commonActions.raiseError(error));
            }

            if (this.isThrowOnError) {
                const errorTyped = error as Error;
                const wrappedError: HasToastedError = {
                    name: (errorTyped.name ?? "ApiCallError").toString(),
                    message: (errorTyped.message ?? "Api call failed").toString(),
                    cause: error,
                    toasted: !this.isSuppressErrorLogs,
                };
                throw wrappedError;
            } else {
                return new ApiCallResult<TResponse>(undefined, [(error ?? "Api call failed").toString()], statusCode);
            }
        }
    }
}

/**
 * Creates a new API request builder for use in redux-saga generators.
 * @param apiAction The API action to call (returns a Promise<ApiResponse<T>>).
 * @returns An ApiRequest builder with fluent configuration.
 *
 * @example
 * const products = yield* callApi(() => apiClient().products.productsAll()).fetchArray(convertProduct);
 */
export function callApi<TResponse>(
    apiAction: () => Promise<ApiResponse<TResponse>>,
): ApiRequest<TResponse> {
    return new ApiRequest(apiAction);
}

export type { ApiValidationErrorMessages };
export { ApiValidationError, isApiValidationError };
export { ApiCallResult };
