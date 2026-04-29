import type { EntityIntId } from "./entityId";

type IntRefConverter<T> = ((value: number) => T) & { default: () => T };
type GuidRefConverter<T> = ((value: string) => T) & { default: () => T };

// Generic factory function to create ref converters with empty() method
const createIntRefConverter = <T>(): IntRefConverter<T> => {
    return Object.assign(
        <TValue extends number>(value: TValue): T => value as unknown as T,
        {
            default: (): T => 0 as unknown as T,
        }
    );
};

const createGuidRefConverter = <T>(): GuidRefConverter<T> => {
    return Object.assign(
        <TValue extends string>(value: TValue): T => value as unknown as T,
        {
            default: (): T => "" as unknown as T,
        }
    );
};

/**
 * Parses a string value into an entity reference using the provided ref converter.
 * If the value is null, empty, or cannot be parsed into a valid number, null is returned.
 */
function parseRef<TRef extends EntityIntId<string | undefined>>(value: string | undefined, refFunc: IntRefConverter<TRef>): TRef | null {
    if (value == null || value.trim() === "") {
        return null;
    }

    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
        return null;
    }

    return refFunc(parsed);
}

export type { IntRefConverter, GuidRefConverter };
export { createIntRefConverter, createGuidRefConverter, parseRef };
