import React from "react";
import { Controller, FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { FloatLabel } from "primereact/floatlabel";
import { InputNumber } from "primereact/inputnumber";
import type { InputNumberProps } from "primereact/inputnumber";
import type { DataTestIdProp, WithDataTestId } from "./formDataTestIdProps";
import styles from "./forms.module.scss";

interface FormInputNumberProps<TFieldValues extends FieldValues> extends DataTestIdProp {
    name: FieldPath<TFieldValues>;
    form: UseFormReturn<TFieldValues>;
    label: string;
    className?: string;
    allowDecimals?: boolean;
    inputProps?: WithDataTestId<Omit<InputNumberProps, "id" | "inputId" | "value" | "onValueChange" | "onBlur">>;
}

export const FormInputNumber = <TFieldValues extends FieldValues>({
    name,
    form,
    label,
    className,
    allowDecimals = false,
    inputProps,
    "data-test_id": dataTestId
}: FormInputNumberProps<TFieldValues>): React.ReactElement => {
    const error = form.formState.errors[name];
    const maxFractionDigits = allowDecimals ? 4 : 0;

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
                            minFractionDigits={0}
                            maxFractionDigits={maxFractionDigits}
                            {...inputProps}
                            data-test_id={dataTestId}
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
