import React from "react";
import { Controller, FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import styles from "./forms.module.scss";

interface FormInputNumberProps<TFieldValues extends FieldValues> {
    name: FieldPath<TFieldValues>;
    form: UseFormReturn<TFieldValues>;
    label: string;
    className?: string;
    allowDecimals?: boolean;
}

export const FormInputNumber = <TFieldValues extends FieldValues>({
    name,
    form,
    label,
    className,
    allowDecimals = false
}: FormInputNumberProps<TFieldValues>): React.ReactElement => {
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
                            type="number"
                            value={field.value?.toString() ?? ""}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === "") {
                                    field.onChange(undefined);
                                } else {
                                    field.onChange(allowDecimals ? parseFloat(value) : parseInt(value));
                                }
                            }}
                            onBlur={field.onBlur}
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
