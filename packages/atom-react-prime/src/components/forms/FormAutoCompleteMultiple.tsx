import React from "react";
import { Controller, FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { AutoComplete } from "primereact/autocomplete";
import type { AutoCompleteProps } from "primereact/autocomplete";
import { FloatLabel } from "primereact/floatlabel";
import type { DataTestIdProp, WithDataTestId } from "./formDataTestIdProps";
import styles from "./forms.module.scss";

interface FormAutoCompleteMultipleProps<TFieldValues extends FieldValues> extends DataTestIdProp {
    name: FieldPath<TFieldValues>;
    form: UseFormReturn<TFieldValues>;
    label: string;
    suggestions: string[];
    completeMethod: (event: { query: string }) => void;
    inputProps?: WithDataTestId<Omit<AutoCompleteProps<string, true>, "id" | "value" | "onChange" | "onBlur" | "suggestions" | "completeMethod" | "multiple" | "forceSelection">>;
    className?: string;
}

export const FormAutoCompleteMultiple = <TFieldValues extends FieldValues>({
    name,
    form,
    label,
    suggestions,
    completeMethod,
    inputProps,
    className,
    "data-test_id": dataTestId
}: FormAutoCompleteMultipleProps<TFieldValues>): React.ReactElement => {
    const error = form.formState.errors[name];

    return (
        <div className={className ?? styles.fieldWrapper}>
            <FloatLabel>
                <Controller
                    name={name}
                    control={form.control}
                    render={({ field }) => (
                        <AutoComplete<string, true>
                            id={name}
                            value={(field.value as string[]) ?? []}
                            suggestions={suggestions}
                            completeMethod={completeMethod}
                            onChange={(e) => field.onChange((e.value as string[]) ?? [])}
                            onBlur={field.onBlur}
                            multiple
                            forceSelection={false}
                            dropdown
                            {...inputProps}
                            data-test_id={dataTestId}
                            style={{ width: "100%", ...inputProps?.style }}
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
