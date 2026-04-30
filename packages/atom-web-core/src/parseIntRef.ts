import type { IntRefConverter } from "./createRefConverter";
import type { EntityIntId } from "./entityId";

/**
 * Parses a value into an entity reference using the provided ref converter.
 * If the value is null, empty, or cannot be parsed into a valid number, null is returned.
 */
function parseIntRef<TRef extends EntityIntId<string | undefined>>(value: string | number | undefined, refFunc: IntRefConverter<TRef>): TRef | null {
    if (value == null) {
        return null;
    }

    if (typeof value === "number") {
        if (Number.isNaN(value)) {
            return null;
        }

        return refFunc(value);
    }

    if (value.trim() === "") {
        return null;
    }

    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
        return null;
    }

    return refFunc(parsed);
}

export { parseIntRef };
