/**
 * Ticks offset between .NET epoch (Jan 1, 0001) and Unix epoch (Jan 1, 1970).
 */
const DotNetEpochOffsetTicks = 621355968000000000;

/**
 * Returns an array of enum options suitable for dropdowns or selection components.
 * @param enumObj The enum object to convert.
 * @returns An array of objects containing label and value properties.
 */
export function getEnumOptions<T extends Record<string, number | string>>(enumObj: T): Array<{ label: string; value: T[keyof T] }> {
    return Object.entries(enumObj)
        .filter(([key]) => isNaN(Number(key)))
        .map(([key, value]) => ({ label: key, value: value as T[keyof T] }));
}

/**
 * Maps the values of a dictionary using a provided mapping function.
 * @param dictionary The source dictionary to map.
 * @param mapValueFn The function to apply to each key-value pair.
 * @returns A new dictionary with mapped values.
 */
export function mapDictionary<TKey extends string | number | symbol, TValue, TTargetValue>(
    dictionary: Record<TKey, TValue>,
    mapValueFn: (key: TKey, value: TValue) => TTargetValue
): Record<TKey, TTargetValue> {
    const result = {} as Record<TKey, TTargetValue>;
    Object.entries(dictionary).forEach(([key, value]) => {
        result[key as TKey] = mapValueFn(key as TKey, value as TValue);
    });
    return result;
}

/**
 * Converts .NET DateTimeOffset ticks to a JavaScript Date.
 * @param ticks The .NET ticks value (100-nanosecond intervals since Jan 1, 0001).
 * @returns A JavaScript Date object.
 */
export function ticksToDate(ticks: number): Date {
    return new Date((ticks - DotNetEpochOffsetTicks) / 10000);
}

/**
 * Converts a JavaScript Date to .NET DateTimeOffset ticks.
 * @param date The JavaScript Date object.
 * @returns The .NET ticks value (100-nanosecond intervals since Jan 1, 0001).
 */
export function dateToTicks(date: Date): number {
    return date.getTime() * 10000 + DotNetEpochOffsetTicks;
}

/**
 * Converts an input date string (e.g., from a date input field) to .NET ticks.
 * @param input The input date string (e.g., "2024-12-31").
 * @returns The .NET ticks value or undefined if the input is empty or invalid.
 */
export function inputDateToTicks(input: string | undefined): number | undefined {
    if (input == undefined) {
        return undefined;
    }
    const date = new Date(input);
    if (isNaN(date.getTime())) {
        return undefined;
    }
    return dateToTicks(date);
}
