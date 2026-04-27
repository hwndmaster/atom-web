import React from "react";
import { Controller, FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import type { InputTextProps } from "primereact/inputtext";
import styles from "./forms.module.scss";

interface FormInputTextProps<TFieldValues extends FieldValues> {
    name: FieldPath<TFieldValues>;
    form: UseFormReturn<TFieldValues>;
    label: string;
    inputProps?: Omit<InputTextProps, "id" | "value" | "onChange" | "onBlur">;
    onBlur?: (value: string) => void;
    className?: string;
    disableFloatingLabel?: boolean;
}

export const FormInputText = <TFieldValues extends FieldValues>({
    name,
    form,
    label,
    inputProps,
    onBlur,
    className,
    disableFloatingLabel
}: FormInputTextProps<TFieldValues>): React.ReactElement => {
    const error = form.formState.errors[name];

    return (
        <div className={className ?? styles.fieldWrapper}>
            <FloatLabel>
                <Controller
                    name={name}
                    control={form.control}
                    render={({ field }) => (
                        <InputText
                            id={name}
                            {...field}
                            value={field.value ?? ""}
                            onBlur={(e) => {
                                field.onBlur();
                                onBlur?.(e.target.value);
                            }}
                            className={disableFloatingLabel === true ? "no-float" : ""}
                            {...inputProps}
                        />
                    )}
                />
                <label htmlFor={name}>{label}</label>
                {error !== undefined && (
                    <small className="p-error">{String(error.message)}</small>
                )}
            </FloatLabel>
        </div>
    );
};
