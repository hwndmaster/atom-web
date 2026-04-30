import type { IntRefConverter } from "../src/createRefConverter";
import type { EntityIntId } from "../src/entityId";
import { parseIntRef } from "../src/parseIntRef";

type TestRef = EntityIntId<"test">;

function createRefFuncSpy(): { refFunc: IntRefConverter<TestRef>; calls: number[] } {
    const calls: number[] = [];
    const callable = (value: number): TestRef => {
        calls.push(value);
        return value as TestRef;
    };
    const refFunc: IntRefConverter<TestRef> = Object.assign(callable, {
        default: (): TestRef => 0 as TestRef,
    });

    return { refFunc, calls };
}

describe("parseIntRef", () => {
    test("Given undefined Then returns null", () => {
        // Arrange
        const { refFunc, calls } = createRefFuncSpy();

        // Act
        const result = parseIntRef(undefined, refFunc);

        // Verify
        expect(result).toBeNull();
        expect(calls).toEqual([]);
    });

    test("Given a number Then returns converted ref immediately", () => {
        // Arrange
        const { refFunc, calls } = createRefFuncSpy();

        // Act
        const result = parseIntRef(42, refFunc);

        // Verify
        expect(result).toBe(42);
        expect(calls).toEqual([42]);
    });

    test("Given NaN number Then returns null", () => {
        // Arrange
        const { refFunc, calls } = createRefFuncSpy();

        // Act
        const result = parseIntRef(Number.NaN, refFunc);

        // Verify
        expect(result).toBeNull();
        expect(calls).toEqual([]);
    });

    test("Given an empty string Then returns null", () => {
        // Arrange
        const { refFunc, calls } = createRefFuncSpy();

        // Act
        const result = parseIntRef("   ", refFunc);

        // Verify
        expect(result).toBeNull();
        expect(calls).toEqual([]);
    });

    test("Given a non-numeric string Then returns null", () => {
        // Arrange
        const { refFunc, calls } = createRefFuncSpy();

        // Act
        const result = parseIntRef("not-a-number", refFunc);

        // Verify
        expect(result).toBeNull();
        expect(calls).toEqual([]);
    });

    test("Given a numeric string Then parses and converts", () => {
        // Arrange
        const { refFunc, calls } = createRefFuncSpy();

        // Act
        const result = parseIntRef("123", refFunc);

        // Verify
        expect(result).toBe(123);
        expect(calls).toEqual([123]);
    });

    test("Given unknown containing a numeric string Then parses and converts", () => {
        // Arrange
        const { refFunc, calls } = createRefFuncSpy();
        const value: unknown = "77";

        // Act
        const result = parseIntRef(value, refFunc);

        // Verify
        expect(result).toBe(77);
        expect(calls).toEqual([77]);
    });

    test("Given unknown non-string non-number Then returns null", () => {
        // Arrange
        const { refFunc, calls } = createRefFuncSpy();
        const value: unknown = { id: 10 };

        // Act
        const result = parseIntRef(value, refFunc);

        // Verify
        expect(result).toBeNull();
        expect(calls).toEqual([]);
    });
});
