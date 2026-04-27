import React from "react";
import { Controller, FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { InputTextarea } from "primereact/inputtextarea";
import type { InputTextareaProps } from "primereact/inputtextarea";
import styles from "./forms.module.scss";

interface FormInputTextareaProps<TFieldValues extends FieldValues> {
    name: FieldPath<TFieldValues>;
    form: UseFormReturn<TFieldValues>;
    label: string;
    inputProps?: Omit<InputTextareaProps, "id" | "value" | "onChange" | "onBlur">;
    className?: string;
}

export const FormInputTextarea = <TFieldValues extends FieldValues>({
    name,
    form,
    label,
    inputProps,
    className
}: FormInputTextareaProps<TFieldValues>): React.ReactElement => {
    const error = form.formState.errors[name];

    return (
        <div className={className ?? styles.fieldWrapper}>
            <label htmlFor={name}>{label}</label>
            <Controller
                name={name}
                control={form.control}
                render={({ field }) => (
                    <InputTextarea
                        id={name}
                        {...field}
                        value={field.value ?? ""}
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
