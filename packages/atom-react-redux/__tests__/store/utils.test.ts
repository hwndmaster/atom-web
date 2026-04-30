import { put } from "redux-saga/effects";
import * as common from "@/common";
import { withCallback, withLoading } from "@/utils";

function* successfulNumberSaga(): Generator<unknown, number, unknown> {
    return 55;
}

function* throwingSaga(): Generator<unknown, never, unknown> {
    throw new Error("Saga failed");
}

function* pausedSaga(): Generator<string, number, unknown> {
    yield "paused";
    return 1;
}

describe("withLoading", () => {
    test("Given successful saga Then dispatches show and hide around execution", () => {
        // Arrange
        const loadingTarget = 7;
        const iterator = withLoading(loadingTarget, successfulNumberSaga);

        // Act
        const first = iterator.next();
        const second = iterator.next();
        const third = iterator.next();

        // Verify
        expect(first.value).toEqual(put(common.Actions.showLoader(loadingTarget)));
        expect(second.value).toEqual(put(common.Actions.hideLoader(loadingTarget)));
        expect(third).toEqual({ value: 55, done: true });
    });

    test("Given failing saga Then still dispatches hide in finally and rethrows", () => {
        // Arrange
        const loadingTarget = 9;
        const iterator = withLoading(loadingTarget, throwingSaga);

        // Act
        const first = iterator.next();
        const second = iterator.next();

        // Verify
        expect(first.value).toEqual(put(common.Actions.showLoader(loadingTarget)));
        expect(second.value).toEqual(put(common.Actions.hideLoader(loadingTarget)));
        expect(() => iterator.next()).toThrow("Saga failed");
    });
});

describe("withCallback", () => {
    test("Given successful saga and resolve callback Then resolves with result", () => {
        // Arrange
        const resolve = vi.fn();
        const reject = vi.fn();
        const iterator = withCallback({ resolve, reject }, successfulNumberSaga);

        // Act
        const result = iterator.next();

        // Verify
        expect(result).toEqual({ value: 55, done: true });
        expect(resolve).toHaveBeenCalledWith(55);
        expect(reject).not.toHaveBeenCalled();
    });

    test("Given successful saga without callbacks Then returns result", () => {
        // Arrange
        const iterator = withCallback({}, successfulNumberSaga);

        // Act
        const result = iterator.next();

        // Verify
        expect(result).toEqual({ value: 55, done: true });
    });

    test("Given failing saga and reject callback Then rejects with error message", () => {
        // Arrange
        const reject = vi.fn();
        const iterator = withCallback({ reject }, throwingSaga);

        // Act
        const result = iterator.next();

        // Verify
        expect(result).toEqual({ value: undefined, done: true });
        expect(reject).toHaveBeenCalledWith("Saga failed");
    });

    test("Given non-error thrown into generator Then uses toString message", () => {
        // Arrange
        const reject = vi.fn();
        const iterator = withCallback({ reject }, pausedSaga);

        // Act
        const first = iterator.next();
        const completion = iterator.throw({ toString: (): string => "Custom failure" });

        // Verify
        expect(first).toEqual({ value: "paused", done: false });
        expect(completion).toEqual({ value: undefined, done: true });
        expect(reject).toHaveBeenCalledWith("Custom failure");
    });

    test("Given undefined thrown into generator Then falls back to Unknown error", () => {
        // Arrange
        const reject = vi.fn();
        const iterator = withCallback({ reject }, pausedSaga);

        // Act
        iterator.next();
        const completion = iterator.throw(undefined);

        // Verify
        expect(completion).toEqual({ value: undefined, done: true });
        expect(reject).toHaveBeenCalledWith("Unknown error");
    });
});
