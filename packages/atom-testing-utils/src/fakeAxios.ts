import axios, { AxiosInstance } from "axios";
import MockAdapter from "axios-mock-adapter";

type GetReplyDescriptor = ReturnType<MockAdapter["onGet"]>;
type PostReplyDescriptor = ReturnType<MockAdapter["onPost"]>;
type PutReplyDescriptor = ReturnType<MockAdapter["onPut"]>;
type ParamPrimitive = string | number | boolean;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BodyParam = Record<string, any> | any[];
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

    public reset(): void {
        this.axiosMock.reset();
    }

    public setupAxiosEndpoint(handler: (axiosMock: MockAdapter) => void): void {
        handler(this.axiosMock);
    }

    public setupGet<
        TClient extends ApiClientShape,
        TOperation extends keyof TClient["operationParams"] & keyof TClient["operations"]
    >(
        client: TClient,
        operation: TOperation & string,
        params?: TClient["operationParams"][TOperation]
    ): GetReplyDescriptor {
        let url = client.operations[operation]!;
        url = extractParams<TClient, TOperation>(params, url);
        return this.axiosMock.onGet(url);
    }

    public hasCalled<
        TClient extends ApiClientShape,
        TOperation extends keyof TClient["operationParams"] & keyof TClient["operations"]
    >(
        client: TClient, operation: TOperation & string
    ): boolean {
        return this.axiosMock.history.find((x) => x.url?.match(client.operations[operation]!)) !== undefined;
    }

    public setupPost<
        TClient extends ApiClientShape,
        TOperation extends keyof TClient["operationParams"] & keyof TClient["operations"]
    >(
        client: TClient,
        operation: TOperation & string,
        params?: TClient["operationParams"][TOperation]
    ): PostReplyDescriptor {
        let url = client.operations[operation]!;
        url = extractParams<TClient, TOperation>(params, url);
        const bodyMatcher = extractBodyMatcher(params);
        return this.axiosMock.onPost(url, bodyMatcher);
    }

    public setupPut<
        TClient extends ApiClientShape,
        TOperation extends keyof TClient["operationParams"] & keyof TClient["operations"]
    >(
        client: TClient,
        operation: TOperation & string,
        params?: TClient["operationParams"][TOperation]
    ): PutReplyDescriptor {
        let url = client.operations[operation]!;
        url = extractParams<TClient, TOperation>(params, url);
        const bodyMatcher = extractBodyMatcher(params);
        return this.axiosMock.onPut(url, bodyMatcher);
    }

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
                return Object.keys(body).every((key) =>
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
    if (!url.startsWith("/")) {
        url = "/" + url;
    }
    if (params != null) {
        let queryString = "";
        Object.keys(params).forEach((key) => {
            if (key === "body") {
                return;
            }
            const value = params[key];
            if (value !== undefined && value !== null) {
                const urlPlaceholder = `{${key}}`;
                if (url.includes(urlPlaceholder)) {
                    url = url.replace(urlPlaceholder, encodeURIComponent(String(value)));
                } else {
                    queryString += `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}&`;
                }
            }
        });
        if (queryString.length > 0) {
            url += "?" + queryString.replace(/&$/, "");
        }
    }
    return url;
}

export default FakeAxios;
