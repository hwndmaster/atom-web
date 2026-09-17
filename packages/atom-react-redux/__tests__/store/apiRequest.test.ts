import { put } from "redux-saga/effects";
import { runSaga } from "redux-saga";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { ApiResponse } from "@hwndmaster/atom-api-core";
import { callApi } from "@/index";
import { type ApiValidationError, isApiValidationError } from "@/callApi";

const TestEndpoint = "TestEndpoint";

const axiosInstance = axios.create();
const axiosMock = new MockAdapter(axiosInstance);

beforeEach(() => {
    axiosMock.reset();
});

describe("callApi", () => {
    test("Given the api action Then should call it and return the response", async () => {
        // Arrange
        axiosMock.onGet(TestEndpoint).reply(200, "TestResponse");

        // Act
        const dispatched: unknown[] = [];
        await runSaga(
            { dispatch: (action: unknown) => dispatched.push(action) },
            callApiSaga
        ).toPromise();

        // Verify
        expect(dispatched).toHaveLength(1);
        expect(dispatched[0]).toEqual({ type: "DUMMY_ACTION", payload: "TestResponse" });
    });

    test.each([201, 202, 204])(
        "Given a %i status Then should succeed rather than raise an error",
        async (status) => {
            // Arrange
            axiosMock.onGet(TestEndpoint).reply(status);

            // Act
            const dispatched: { type: string; payload?: unknown }[] = [];
            await runSaga(
                { dispatch: (action: { type: string }) => dispatched.push(action) },
                callApiSaga
            ).toPromise();

            // Verify
            expect(dispatched.filter(x => x.type !== "DUMMY_ACTION")).toHaveLength(0);
            expect(dispatched).toHaveLength(1);
        }
    );

    test("Given 204 status and returnNullOn(204) Then should return null", async () => {
        // Arrange
        axiosMock.onGet(TestEndpoint).reply(204);

        // Act
        const dispatched: unknown[] = [];
        await runSaga(
            { dispatch: (action: unknown) => dispatched.push(action) },
            callApiNullableSaga
        ).toPromise();

        // Verify
        expect(dispatched).toHaveLength(1);
        expect(dispatched[0]).toEqual({ type: "DUMMY_ACTION", payload: null });
    });

    test("Given a 409 conflict and onVersionConflict Then should recover, raise a friendly error and fail", async () => {
        // Arrange
        axiosMock.onPut(TestEndpoint).reply(409);

        // Act
        const dispatched: { type: string; payload?: unknown }[] = [];
        let isSucceeded = false;
        await runSaga(
            { dispatch: (action: { type: string }) => dispatched.push(action) },
            function* () {
                try {
                    yield* callApi(async () => dummyPutCall())
                        .onVersionConflict({
                            recover: function* () {
                                yield put({ type: "RECOVER_ACTION" });
                            },
                        })
                        .invoke();
                    isSucceeded = true;
                } catch {
                    // Expected: a version conflict fails the request.
                }
            }
        ).toPromise();

        // Verify
        expect(isSucceeded).toBe(false);
        expect(dispatched.some((action) => action.type === "RECOVER_ACTION")).toBe(true);
        const raised = dispatched.find((action) => action.type === "common/raiseError");
        expect(raised?.payload).toEqual(expect.objectContaining({ title: "Changed elsewhere" }));
    });

    test("Given a failing request and onError Then should raise the custom notification and fail", async () => {
        // Arrange
        axiosMock.onPost(TestEndpoint).reply(413, "<html>Request Entity Too Large</html>");

        // Act
        const dispatched: { type: string; payload?: unknown }[] = [];
        let isSucceeded = false;
        await runSaga(
            { dispatch: (action: { type: string }) => dispatched.push(action) },
            function* () {
                try {
                    yield* callApi(async () => dummyPostCall())
                        .onError((statusCode) => statusCode === 413
                            ? { title: "Photo upload failed", message: "The photo is too large." }
                            : undefined)
                        .invoke();
                    isSucceeded = true;
                } catch {
                    // Expected: the request still fails after the custom notification.
                }
            }
        ).toPromise();

        // Verify
        expect(isSucceeded).toBe(false);
        const raised = dispatched.find((action) => action.type === "common/raiseError");
        expect(raised?.payload).toEqual({ title: "Photo upload failed", message: "The photo is too large." });
    });

    test("Given a failing request and onError returning undefined Then should keep default handling", async () => {
        // Arrange
        axiosMock.onPost(TestEndpoint).reply(500);

        // Act
        const dispatched: { type: string; payload?: unknown }[] = [];
        await runSaga(
            { dispatch: (action: { type: string }) => dispatched.push(action) },
            function* () {
                try {
                    yield* callApi(async () => dummyPostCall())
                        .onError(() => undefined)
                        .invoke();
                } catch {
                    // Expected: default handling still fails the request.
                }
            }
        ).toPromise();

        // Verify - the default raiseError was dispatched (an error object, not our custom info).
        const raised = dispatched.find((action) => action.type === "common/raiseError");
        expect(raised).toBeDefined();
        expect(raised?.payload).not.toEqual(expect.objectContaining({ title: "Photo upload failed" }));
    });

    test("Given a 400 rejecting with a bare ProblemDetails Then should throw ApiValidationError with the field errors", async () => {
        // Arrange - NSwag's generated throwException rethrows the deserialized body as-is,
        // so the thrown value is the ProblemDetails object itself with no wrapper.
        const problemDetails = {
            type: "https://tools.ietf.org/html/rfc9110#section-15.5.1",
            title: "One or more validation errors occurred.",
            status: 400,
            errors: { Name: ["A category with name 'Food' already exists."] },
        };

        // Act
        const caught = await captureSagaError(function* () {
            yield* callApi(async () => {
                // Deliberately a non-Error object: this is what the generated NSwag client throws for a 400.
                // eslint-disable-next-line @typescript-eslint/only-throw-error
                throw problemDetails;
            }).invoke();
        });

        // Verify
        expect(isApiValidationError(caught)).toBe(true);
        expect((caught as ApiValidationError).statusCode).toBe(400);
        expect((caught as ApiValidationError).validationErrorMessages).toEqual({
            Name: ["A category with name 'Food' already exists."],
        });
    });

    test("Given a 400 wrapped in an error with a result payload Then should still resolve the field errors", async () => {
        // Arrange - the pre-existing wrapped shape must keep working (precedence unchanged).
        const wrappedError = {
            status: 400,
            result: { errors: { Quantity: ["Quantity must be at least 0.1."] } },
        };

        // Act
        const caught = await captureSagaError(function* () {
            yield* callApi(async () => {
                // Deliberately a non-Error object, matching the wrapped shape seen from real API clients.
                // eslint-disable-next-line @typescript-eslint/only-throw-error
                throw wrappedError;
            }).invoke();
        });

        // Verify
        expect(isApiValidationError(caught)).toBe(true);
        expect((caught as ApiValidationError).validationErrorMessages).toEqual({
            Quantity: ["Quantity must be at least 0.1."],
        });
    });
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function captureSagaError(saga: () => Generator<any, any, any>): Promise<unknown> {
    let caught: unknown;
    await runSaga({ dispatch: () => undefined }, function* () {
        try {
            yield* saga();
        } catch (error) {
            caught = error;
        }
    }).toPromise();
    return caught;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function* callApiSaga(): Generator<any, any, any> {
    const response = yield* callApi(async () => dummyApiCall()).invoke();
    yield put({ type: "DUMMY_ACTION", payload: response });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function* callApiNullableSaga(): Generator<any, any, any> {
    const response = yield* callApi(async () => dummyApiCall())
        .returnNullOn(204)
        .invoke();
    yield put({ type: "DUMMY_ACTION", payload: response });
}

async function dummyApiCall(): Promise<ApiResponse<string>> {
    return axiosInstance.get(TestEndpoint);
}

async function dummyPutCall(): Promise<ApiResponse<string>> {
    return axiosInstance.put(TestEndpoint);
}

async function dummyPostCall(): Promise<ApiResponse<string>> {
    return axiosInstance.post(TestEndpoint);
}
