import { call, put } from "redux-saga/effects";
import { ApiResponse, ApiCallResult } from "@hwndmaster/atom-api-core";
import type { ErrorInfo, HasToastedError } from "@hwndmaster/atom-web-core";
import * as commonActions from "./common/actions";
import { SagaGeneratorReturns } from "./types";

type ValidationErrorsByField = Record<string, string[]>;

type ApiValidationErrorMessages = ValidationErrorsByField;

const HttpStatusConflict = 409;

const DefaultVersionConflictTitle = "Changed elsewhere";
const DefaultVersionConflictMessage
    = "This item was modified since you opened it. The latest version has been reloaded — "
    + "please review your changes and try again.";

/**
 * Configures how a version conflict (HTTP 409) is handled for a single API request.
 * Enable it with {@link ApiRequest.onVersionConflict}.
 */
interface VersionConflictHandling {
    /**
     * Optional recovery saga run when a conflict is detected — typically re-fetches the entity so
     * the store carries a fresh concurrency token and the user can retry.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recover?: () => Generator<any, void, any>;

    /** Notification title. Defaults to "Changed elsewhere". */
    title?: string;

    /** Notification message. Defaults to a generic reload-and-retry message. */
    message?: string;
}

/**
 * Builds a user-facing error notification for a failed API request. Return `undefined` to fall
 * back to the default error handling for that status code.
 * @param statusCode The HTTP status code of the failed request (500 when unknown).
 * @param responseText The raw response body, when available.
 */
type ApiErrorMessageFactory = (statusCode: number, responseText?: string) => ErrorInfo | undefined;

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
    private versionConflictHandling: VersionConflictHandling | undefined;
    private errorMessageFactory: ApiErrorMessageFactory | undefined;

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

    /**
     * Enables optimistic-concurrency handling for this request. When the server responds with a
     * version conflict (HTTP 409), the optional {@link VersionConflictHandling.recover} saga runs
     * (e.g. to re-fetch the entity), a friendly notification is raised instead of the raw error, and
     * the request still fails so the caller's success path does not run.
     */
    public onVersionConflict(handling: VersionConflictHandling = {}): ApiRequest<TResponse> {
        this.versionConflictHandling = handling;
        return this;
    }

    /**
     * Customizes the user-facing error notification for this request. When the request fails, the
     * factory receives the HTTP status code and raw response body and returns the notification to
     * show instead of the default "Error code NNN" one; return `undefined` to keep the default
     * handling. Validation errors (parseable 400 responses) and {@link onVersionConflict} handling
     * take precedence. The request still fails so the caller's success path does not run.
     *
     * @example
     * yield* callApi(() => api.photos.upload(request))
     *     .onError((statusCode, responseText) => ({
     *         title: "Photo upload failed",
     *         message: statusCode === 413 ? "The photo is too large." : responseText ?? "Unknown error.",
     *     }))
     *     .invoke();
     */
    public onError(errorMessageFactory: ApiErrorMessageFactory): ApiRequest<TResponse> {
        this.errorMessageFactory = errorMessageFactory;
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

    private getResponseText(error: unknown): string | undefined {
        if (!isObjectRecord(error)) {
            return undefined;
        }

        let responseText: string | undefined;
        if (typeof error.response === "string") {
            responseText = error.response;
        } else if (isObjectRecord(error.response) && typeof error.response.data === "string") {
            responseText = error.response.data;
        } else if (typeof error.result === "string") {
            responseText = error.result;
        }

        if (responseText == null) {
            return undefined;
        }

        // Plain-string API responses (e.g. BadRequest("reason")) arrive JSON-encoded — unwrap them.
        const parsed = tryParseJson(responseText);
        return typeof parsed === "string" ? parsed : responseText;
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
        // NSwag's generated `throwException` rethrows the deserialized 400 body as-is rather than
        // wrapping it, so the error may itself be the ProblemDetails payload. Checked last to keep
        // the wrapped-error candidates above taking precedence.
        candidates.push(error);

        for (const candidate of candidates) {
            const parsedErrors = parseValidationProblemDetails(candidate);
            if (parsedErrors != null) {
                return parsedErrors;
            }
        }

        return null;
    }

    private *handleVersionConflict(error: unknown, handling: VersionConflictHandling): SagaGeneratorReturns<ApiCallResult<TResponse>> {
        if (handling.recover != null) {
            yield* handling.recover();
        }

        return yield* this.handleCustomError(error, HttpStatusConflict, {
            title: handling.title ?? DefaultVersionConflictTitle,
            message: handling.message ?? DefaultVersionConflictMessage,
        }, "VersionConflictError");
    }

    private *handleCustomError(error: unknown, statusCode: number, errorInfo: ErrorInfo, errorName = "ApiCallError"): SagaGeneratorReturns<ApiCallResult<TResponse>> {
        if (!this.isSuppressErrorLogs) {
            yield put(commonActions.raiseError({
                title: errorInfo.title ?? "Error",
                message: errorInfo.message,
            }));
        }

        if (this.isThrowOnError) {
            const wrappedError: HasToastedError = {
                name: errorName,
                message: errorInfo.message,
                cause: error,
                toasted: !this.isSuppressErrorLogs,
            };
            throw wrappedError;
        }

        return new ApiCallResult<TResponse>(undefined, [errorInfo.message], statusCode);
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
                if (response.status === HttpStatusConflict
                    && this.versionConflictHandling != null
                    && !this.nullOnStatuses.includes(response.status)) {
                    return yield* this.handleVersionConflict(undefined, this.versionConflictHandling);
                }

                if (this.errorMessageFactory != null && !this.nullOnStatuses.includes(response.status)) {
                    const responseText = typeof response.data === "string" ? response.data : undefined;
                    const errorInfo = this.errorMessageFactory(response.status, responseText);
                    if (errorInfo != null) {
                        return yield* this.handleCustomError(undefined, response.status, errorInfo);
                    }
                }

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

            if (statusCode === HttpStatusConflict && this.versionConflictHandling != null) {
                return yield* this.handleVersionConflict(error, this.versionConflictHandling);
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

            if (this.errorMessageFactory != null) {
                const errorInfo = this.errorMessageFactory(statusCode, this.getResponseText(error));
                if (errorInfo != null) {
                    return yield* this.handleCustomError(error, statusCode, errorInfo);
                }
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

export type { ApiValidationErrorMessages, VersionConflictHandling, ApiErrorMessageFactory };
export { ApiValidationError, isApiValidationError };
export { ApiCallResult };
