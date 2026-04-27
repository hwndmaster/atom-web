/* eslint-disable @typescript-eslint/naming-convention */
import { call, put } from "redux-saga/effects";
import { ApiResponse, ApiCallResult } from "@hwndmaster/atom-api-core";
import type { HasToastedError } from "@hwndmaster/atom-web-core";
import * as commonActions from "./common/actions";

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
            const response: ApiResponse<TResponse> = yield call(this.apiAction as () => Promise<ApiResponse<TResponse>>);

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
            const err = error as { status?: number; response?: { status?: number } };
            const statusCode = err?.status ?? err?.response?.status ?? 500;

            if (this.nullOnStatuses.includes(statusCode)) {
                return new ApiCallResult<TResponse>(undefined, [(error ?? "Api call failed").toString()], statusCode);
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

export { ApiCallResult };
