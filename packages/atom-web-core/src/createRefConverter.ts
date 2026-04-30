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

export type { IntRefConverter, GuidRefConverter };
export { createIntRefConverter, createGuidRefConverter };
