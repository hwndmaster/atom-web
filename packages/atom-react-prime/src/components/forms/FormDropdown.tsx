import React from "react";
import { Controller, FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { Dropdown } from "primereact/dropdown";
import type { DropdownProps } from "primereact/dropdown";
import { FloatLabel } from "primereact/floatlabel";
import type { DataTestIdProp, WithDataTestId } from "./formDataTestIdProps";
import styles from "./forms.module.scss";

interface FormDropdownProps<TFieldValues extends FieldValues, TOptionValue = unknown> extends DataTestIdProp {
    name: FieldPath<TFieldValues>;
    form: UseFormReturn<TFieldValues>;
    label: string;
    options: TOptionValue[];
    optionLabel?: string;
    optionValue?: string;
    inputProps?: WithDataTestId<Omit<DropdownProps, "id" | "value" | "onChange" | "onBlur" | "options" | "optionLabel" | "optionValue">>;
    className?: string;
    onValueChange?: (value: unknown) => void;
}

export const FormDropdown = <TFieldValues extends FieldValues, TOptionValue = unknown>({
    name,
    form,
    label,
    options,
    optionLabel,
    optionValue,
    inputProps,
    className,
    onValueChange,
    "data-test_id": dataTestId
}: FormDropdownProps<TFieldValues, TOptionValue>): React.ReactElement => {
    const error = form.formState.errors[name];

    return (
        <div className={className ?? styles.fieldWrapper}>
            <FloatLabel>
                <Controller
                    name={name}
                    control={form.control}
                    render={({ field }) => (
                        <Dropdown
                            id={name}
                            value={field.value}
                            onChange={(e) => {
                                field.onChange(e.value);
                                onValueChange?.(e.value);
                            }}
                            options={options}
                            optionLabel={optionLabel}
                            optionValue={optionValue}
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
