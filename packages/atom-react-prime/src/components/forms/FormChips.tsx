import React from "react";
import { Controller, FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { Chips } from "primereact/chips";
import type { ChipsProps } from "primereact/chips";
import styles from "./forms.module.scss";

interface FormChipsProps<TFieldValues extends FieldValues> {
    name: FieldPath<TFieldValues>;
    form: UseFormReturn<TFieldValues>;
    label: string;
    inputProps?: Omit<ChipsProps, "id" | "value" | "onChange" | "onBlur">;
    className?: string;
}

export const FormChips = <TFieldValues extends FieldValues>({
    name,
    form,
    label,
    inputProps,
    className
}: FormChipsProps<TFieldValues>): React.ReactElement => {
    const error = form.formState.errors[name];

    return (
        <div className={className ?? styles.fieldWrapper}>
            <label htmlFor={name}>{label}</label>
            <Controller
                name={name}
                control={form.control}
                render={({ field }) => (
                    <Chips
                        id={name}
                        value={field.value ?? []}
                        onChange={(e) => field.onChange(e.value ?? [])}
                        {...inputProps}
                    />
                )}
            />
            {error !== undefined && (
                <small className="p-error">{String(error.message)}</small>
            )}
        </div>
    );
};
