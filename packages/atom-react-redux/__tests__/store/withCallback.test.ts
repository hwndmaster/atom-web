import { withCallback } from "@/withCallback";

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
