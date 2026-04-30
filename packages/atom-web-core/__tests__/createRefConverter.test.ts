import type { EntityGuidId, EntityIntId } from "../src/entityId";
import { createGuidRefConverter, createIntRefConverter } from "../src/createRefConverter";

describe("createIntRefConverter", () => {
    test("Given a number Then returns the typed integer ref", () => {
        // Arrange
        const converter = createIntRefConverter<EntityIntId<"user">>();

        // Act
        const result = converter(321);

        // Verify
        expect(result).toBe(321);
    });

    test("When default is called Then returns 0 ref", () => {
        // Arrange
        const converter = createIntRefConverter<EntityIntId<"user">>();

        // Act
        const result = converter.default();

        // Verify
        expect(result).toBe(0);
    });
});

describe("createGuidRefConverter", () => {
    test("Given a string Then returns the typed guid ref", () => {
        // Arrange
        const converter = createGuidRefConverter<EntityGuidId<"user">>();
        const guid = "8f7f2b56-65df-4bd8-8fcd-5902dfdf88f7";

        // Act
        const result = converter(guid);

        // Verify
        expect(result).toBe(guid);
    });

    test("When default is called Then returns empty guid ref", () => {
        // Arrange
        const converter = createGuidRefConverter<EntityGuidId<"user">>();

        // Act
        const result = converter.default();

        // Verify
        expect(result).toBe("");
    });
});
