import React from "react";
import { Controller, FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import type { InputTextProps } from "primereact/inputtext";
import type { DataTestIdProp, WithDataTestId } from "./formDataTestIdProps";
import styles from "./forms.module.scss";

interface FormInputTextProps<TFieldValues extends FieldValues> extends DataTestIdProp {
    name: FieldPath<TFieldValues>;
    form: UseFormReturn<TFieldValues>;
    label: string;
    inputProps?: WithDataTestId<Omit<InputTextProps, "id" | "value" | "onChange" | "onBlur">>;
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
    disableFloatingLabel,
    "data-test_id": dataTestId
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
