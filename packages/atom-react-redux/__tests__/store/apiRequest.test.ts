import { put } from "redux-saga/effects";
import { runSaga } from "redux-saga";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { ApiResponse } from "@hwndmaster/atom-api-core";
import { callApi } from "@/index";

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
});

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
