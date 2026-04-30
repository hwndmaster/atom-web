import { dateToTicks, getEnumOptions, inputDateToTicks, mapDictionary, ticksToDate } from "../src/helper";

enum TestStatus {
    Pending = 1,
    Done = 2,
}

enum TestTheme {
    Light = "Light",
    Dark = "Dark",
}

describe("getEnumOptions", () => {
    test("Given a numeric enum Then filters reverse numeric keys", () => {
        // Act
        const result = getEnumOptions(TestStatus);

        // Verify
        expect(result).toEqual([
            { label: "Pending", value: TestStatus.Pending },
            { label: "Done", value: TestStatus.Done },
        ]);
    });

    test("Given a string enum Then returns all enum members", () => {
        // Act
        const result = getEnumOptions(TestTheme);

        // Verify
        expect(result).toEqual([
            { label: "Light", value: TestTheme.Light },
            { label: "Dark", value: TestTheme.Dark },
        ]);
    });
});

describe("mapDictionary", () => {
    test("Given a dictionary Then maps each key value pair", () => {
        // Arrange
        const source = { first: 1, second: 2 };

        // Act
        const result = mapDictionary(source, (key, value) => `${key}:${value * 10}`);

        // Verify
        expect(result).toEqual({ first: "first:10", second: "second:20" });
    });
});

describe("ticks/date converters", () => {
    test("Given a date Then dateToTicks and ticksToDate round-trip", () => {
        // Arrange
        const sourceDate = new Date("2025-01-02T03:04:05.678Z");

        // Act
        const ticks = dateToTicks(sourceDate);
        const convertedDate = ticksToDate(ticks);

        // Verify
        expect(convertedDate.toISOString()).toBe(sourceDate.toISOString());
    });
});

describe("inputDateToTicks", () => {
    test("Given undefined Then returns undefined", () => {
        // Act
        const result = inputDateToTicks(undefined);

        // Verify
        expect(result).toBeUndefined();
    });

    test("Given invalid date string Then returns undefined", () => {
        // Act
        const result = inputDateToTicks("not-a-date");

        // Verify
        expect(result).toBeUndefined();
    });

    test("Given valid date string Then returns converted ticks", () => {
        // Arrange
        const input = "2025-12-31";

        // Act
        const result = inputDateToTicks(input);

        // Verify
        expect(result).toBe(dateToTicks(new Date(input)));
    });
});
