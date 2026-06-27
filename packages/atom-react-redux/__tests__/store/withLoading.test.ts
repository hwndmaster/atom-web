import { put } from "redux-saga/effects";
import * as common from "@/common";
import { withLoading } from "@/withLoading";

function* successfulNumberSaga(): Generator<unknown, number, unknown> {
    return 55;
}

function* throwingSaga(): Generator<unknown, never, unknown> {
    throw new Error("Saga failed");
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

    test("Given a param Then dispatches show and hide for that parametrized target", () => {
        // Arrange
        const loadingTarget = 100;
        const param = 42;
        const iterator = withLoading(loadingTarget, successfulNumberSaga, param);

        // Act
        const first = iterator.next();
        const second = iterator.next();
        const third = iterator.next();

        // Verify
        expect(first.value).toEqual(put(common.Actions.showLoader(loadingTarget, param)));
        expect(second.value).toEqual(put(common.Actions.hideLoader(loadingTarget, param)));
        expect(third).toEqual({ value: 55, done: true });
    });
});
