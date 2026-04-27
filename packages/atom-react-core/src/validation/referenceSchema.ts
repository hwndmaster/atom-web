import { z } from "zod";
import type { EntityGuidId, EntityIntId } from "@hwndmaster/atom-web-core";

/**
 * Zod schema for a required reference field of any numeric entity ID type.
 * Ensures the field is a positive integer.
 *
 * @example
 * const schema = z.object({
 *     productRef: requiredRef<ProductRef>(),
 * });
 */
export const requiredIntRef = <T extends EntityIntId<string>>(message?: string): z.ZodType<T> =>
    z.number({ message }).int().positive({ message }) as unknown as z.ZodType<T>;

/**
 * Zod schema for an optional reference field of any numeric entity ID type.
 * Allows undefined values.
 *
 * @example
 * const schema = z.object({
 *     productRef: optionalRef<ProductRef>(),
 * });
 */
export const optionalIntRef = <T extends EntityIntId<string>>(): z.ZodType<T | undefined> =>
    z.number().int().positive().optional() as unknown as z.ZodType<T | undefined>;

/**
 * Zod schema for a required reference field of any Guid-based type.
 * Ensures the field is a non-empty string.
 *
 * @example
 * const schema = z.object({
 *     dataSetRef: requiredRef<DataSetRef>(),
 * });
 */
export const requiredGuidRef = <T extends EntityGuidId<string>>(
    customMessage: string | undefined = undefined
): z.ZodType<T> =>
    z.string()
        .min(1, {
            message: customMessage ?? "A selection must be made to proceed",
        }) as unknown as z.ZodType<T>;

/**
 * Zod schema for an optional reference field of any Guid-based type.
 * Allows empty strings or undefined values.
 *
 * @example
 * const schema = z.object({
 *     dataSetRef: optionalRef<DataSetRef>(),
 * });
 */
export const optionalGuidRef = <T extends EntityGuidId<string>>(): z.ZodType<T | undefined> =>
    z.string()
        .optional() as unknown as z.ZodType<T | undefined>;
