import React from "react";
import { Controller, FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { FloatLabel } from "primereact/floatlabel";
import { InputNumber } from "primereact/inputnumber";
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
                        <InputNumber
                            id={name}
                            inputId={name}
                            value={typeof field.value === "number" ? field.value : null}
                            onValueChange={(e) => field.onChange(e.value)}
                            onBlur={field.onBlur}
                            useGrouping={false}
                            minFractionDigits={allowDecimals ? undefined : 0}
                            maxFractionDigits={allowDecimals ? undefined : 0}
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
