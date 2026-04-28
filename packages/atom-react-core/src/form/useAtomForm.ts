import { useCallback, useMemo } from "react";
import {
    FieldValues,
    Path,
    PathValue,
    UseFormProps,
    UseFormReturn,
    useForm,
} from "react-hook-form";

export type AtomFormReturn<
    TFieldValues extends FieldValues,
    TContext,
    TTransformedValues extends FieldValues | undefined
> = UseFormReturn<TFieldValues, TContext, TTransformedValues> & {
    setValues: UseFormReturn<TFieldValues, TContext, TTransformedValues>["setValues"];
};

/**
 * Wrapper around react-hook-form useForm with an additional setValues helper.
 * Useful when form components expect setValues to be available.
 */
export function useAtomForm<
    TFieldValues extends FieldValues = FieldValues,
    TContext = unknown,
    TTransformedValues extends FieldValues | undefined = TFieldValues
>(
    props?: UseFormProps<TFieldValues, TContext, TTransformedValues>
): AtomFormReturn<TFieldValues, TContext, TTransformedValues> {
    const form = useForm<TFieldValues, TContext, TTransformedValues>(props);

    type SetValuesType = UseFormReturn<TFieldValues, TContext, TTransformedValues>["setValues"];

    const setValues = useCallback<SetValuesType>((value) => {
        if (typeof value === "function") {
            form.reset(value(form.getValues()));
            return;
        }

        Object.entries(value).forEach(([key, currentValue]) => {
            form.setValue(
                key as Path<TFieldValues>,
                currentValue as PathValue<TFieldValues, Path<TFieldValues>>
            );
        });
    }, [form]);

    return useMemo(() => ({
        ...form,
        setValues,
    }), [form, setValues]);
}