import axios, { AxiosInstance } from "axios";
import MockAdapter from "axios-mock-adapter";

type GetReplyDescriptor = ReturnType<MockAdapter["onGet"]>;
type PostReplyDescriptor = ReturnType<MockAdapter["onPost"]>;
type PutReplyDescriptor = ReturnType<MockAdapter["onPut"]>;
type DeleteReplyDescriptor = ReturnType<MockAdapter["onDelete"]>
type ParamPrimitive = string | number | boolean;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BodyParam = Record<string, any> | any[]; // Object type for body parameters (for POST operations), which can be any shape
type ParamValue = ParamPrimitive | ParamPrimitive[] | BodyParam | null | undefined;

interface ApiClientShape {
    operations: Record<string, string>;
    operationParams: Record<string, Record<string, ParamValue>>;
}

/**
 * A generic fake Axios instance for testing purposes.
 * Pass the project's setAxiosInstance function to the constructor.
 *
 * @example
 * // In your project's test utils:
 * import FakeAxios from "@hwndmaster/atom-testing-utils";
 * import { setApiAxiosInstance } from "@/api/apiAxios";
 * export const fakeAxios = new FakeAxios(setApiAxiosInstance);
 */
class FakeAxios {
    private readonly currentAxiosInstance: AxiosInstance;
    private readonly axiosMock: MockAdapter;

    constructor(setAxiosInstance: (instance: AxiosInstance) => void) {
        this.currentAxiosInstance = axios.create();
        this.axiosMock = new MockAdapter(this.currentAxiosInstance, { onNoMatch: "throwException" });
        setAxiosInstance(this.currentAxiosInstance);
    }

    /**
     * Resets all the configured mocks.
     */
    public reset(): void {
        this.axiosMock.reset();
    }

    /**
     * Sets up an endpoint with the given axios mock adapter passed in.
     * Use this for custom setups that are not covered by the provided helper methods (e.g. for POST/PUT requests with complex body matchers, or for third-party APIs).
     * @param handler The handler to set up the endpoint with the axios mock adapter.
     */
    public setupAxiosEndpoint(handler: (axiosMock: MockAdapter) => void): void {
        handler(this.axiosMock);
    }

    /**
     * Sets up a GET request mock for the given client and operation.
     * @example
     * ```typescript
      * fakeAxios.setupGet(projectApi.UsersClient, "GetUsersBy", {
      *     filterParam,
      *     sortingParam,
     *   }).reply(200, [...]);
     * ```
     * @param client The API client.
     * @param operation The operation name, provided by the client.
     * @param params The operation parameters.
     * @returns The GET reply descriptor, to be used to set up the `reply`.
     */
    public setupGet<
        TClient extends ApiClientShape,
        TOperation extends keyof TClient["operationParams"] & keyof TClient["operations"]
    >(
        client: TClient,
        operation: TOperation & string,
        params?: TClient["operationParams"][TOperation]
    ): GetReplyDescriptor {
        let url = client.operations[operation];
        url = extractParams<TClient, TOperation>(params, url);
        return this.axiosMock.onGet(url);
    }

    /**
     * Checks whether a given operation has been called on the client.
     * @param client The API client.
     * @param operation The operation name, provided by the client.
     * @returns True if the operation has been called; false otherwise.
     */
    public hasCalled<
        TClient extends ApiClientShape,
        TOperation extends keyof TClient["operationParams"] & keyof TClient["operations"]
    >(
        client: TClient, operation: TOperation & string
    ): boolean {
        return this.axiosMock.history.find((x) => x.url?.match(client.operations[operation]!)) !== undefined;
    }

    /**
     * Sets up a POST request mock for the given client and operation.
     * @example
     * ```typescript
     * fakeAxios.setupPost(projectApi.UsersClient, "Create", {
     *     userGroupId,
     *     body: details
     *   }).reply(200, {...});
     * ```
     * @param client The API client.
     * @param operation The operation name, provided by the client.
     * @param params The operation parameters.
     * @returns The POST reply descriptor, to be used to set up the `reply`.
     */
    public setupPost<
        TClient extends ApiClientShape,
        TOperation extends keyof TClient["operationParams"] & keyof TClient["operations"]
    >(
        client: TClient,
        operation: TOperation & string,
        params?: TClient["operationParams"][TOperation]
    ): PostReplyDescriptor {
        let url = client.operations[operation];
        url = extractParams<TClient, TOperation>(params, url);
        const bodyMatcher = extractBodyMatcher(params);
        return this.axiosMock.onPost(url, bodyMatcher);
    }

    /**
     * Sets up a PUT request mock for the given client and operation.
     * @example
     * ```typescript
     * fakeAxios.setupPut(projectApi.UsersClient, "Update", {
     *     body: { id: userId, version: 1, ... }
     *   }).reply(200, {...});
     * ```
     * @param client The API client.
     * @param operation The operation name, provided by the client.
     * @param params The operation parameters.
     * @returns The PUT reply descriptor, to be used to set up the `reply`.
     */
    public setupPut<
        TClient extends ApiClientShape,
        TOperation extends keyof TClient["operationParams"] & keyof TClient["operations"]
    >(
        client: TClient,
        operation: TOperation & string,
        params?: TClient["operationParams"][TOperation]
    ): PutReplyDescriptor {
        let url = client.operations[operation];
        url = extractParams<TClient, TOperation>(params, url);
        const bodyMatcher = extractBodyMatcher(params);
        return this.axiosMock.onPut(url, bodyMatcher);
    }

    /**
     * Sets up a DELETE request mock for the given client and operation.
     * @example
     * ```typescript
     * fakeAxios.setupDelete(processingProjectsApi.ProcessingProjectsClient, "Delete", {
     *     id: projectId,
     *   }).reply(204);
     * ```
     * @param client The API client.
     * @param operation The operation name, provided by the client.
     * @param params The operation parameters.
     * @returns The DELETE reply descriptor, to be used to set up the `reply`.
     */
    public setupDelete<TClient extends {
        operations: Record<string, string>;
        operationParams: Record<string, Record<string, ParamValue>>;
    }, TOperation extends keyof TClient["operationParams"] & keyof TClient["operations"]>(
        client: TClient,
        operation: TOperation & string,
        params?: TClient["operationParams"][TOperation]
    ): DeleteReplyDescriptor {
        let url = client.operations[operation];
        url = extractParams<TClient, TOperation>(params, url);

        return this.axiosMock.onDelete(url);
    }

    /**
     * Gets the current Axios instance.
     */
    get axiosInstance(): AxiosInstance {
        return this.currentAxiosInstance;
    }
}

function extractBodyMatcher(params: Record<string, ParamValue> | undefined): { asymmetricMatch: (actual: unknown) => boolean } | undefined {
    const body = params?.["body"];
    if (body === undefined) {
        return undefined;
    }

    return {
        asymmetricMatch: (actual: unknown): boolean => {
            if (typeof actual === "string") {
                try {
                    actual = JSON.parse(actual);
                } catch {
                    return false;
                }
            }

            if (Array.isArray(body)) {
                return JSON.stringify(actual) === JSON.stringify(body);
            }

            if (typeof body === "object" && body !== null && typeof actual === "object" && actual !== null) {
                // Partial match: every key specified in the expected body must match in the actual body.
                return Object.keys(body).every(key =>
                    JSON.stringify((actual as Record<string, unknown>)[key]) === JSON.stringify((body as Record<string, unknown>)[key])
                );
            }

            return actual === body;
        },
    };
}

function extractParams<
    TClient extends ApiClientShape,
    TOperation extends keyof TClient["operationParams"] & keyof TClient["operations"]
>(params: TClient["operationParams"][TOperation] | undefined, url: string): string {
    // Ensure URL starts with '/' to match the actual request URL (generated clients prepend '/' to the path).
    if (!url.startsWith("/")) {
        url = "/" + url;
    }
    if (params != null) {
        let queryString = "";
        Object.keys(params).forEach((key) => {
            if (key === "body") {
                // 'body' is a request body parameter, not a URL parameter — skip it.
                return;
            }
            const value = params[key];
            if (value == null) {
                return;
            }
            if (url.includes(`{${key}}`)) {
                // If the parameter is part of the URL route, substitute it directly — it is never an array.
                const valueStr = String(value);
                url = url.replace(new RegExp("{" + key + "}", "g"), encodeURIComponent(valueStr));
            } else {
                const items = Array.isArray(value) ? value : [value];
                items.forEach((item) => {
                    queryString += `${key}=`;
                    queryString += encodeURIComponent(item as ParamPrimitive);
                    queryString += "&";
                });
            }
        });
        if (queryString.length > 0) {
            // Remove trailing '&' and append to URL
            url += "?" + queryString.replace(/&$/, "");
        }
    }
    return url;
}

export default FakeAxios;
