import React from "react";
import { Controller, FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { AutoComplete } from "primereact/autocomplete";
import type { AutoCompleteProps } from "primereact/autocomplete";
import { FloatLabel } from "primereact/floatlabel";
import styles from "./forms.module.scss";

interface FormAutoCompleteProps<TFieldValues extends FieldValues> {
    name: FieldPath<TFieldValues>;
    form: UseFormReturn<TFieldValues>;
    label: string;
    suggestions: string[];
    completeMethod: (event: { query: string }) => void;
    inputProps?: Omit<AutoCompleteProps, "id" | "value" | "onChange" | "onBlur" | "suggestions" | "completeMethod">;
    className?: string;
    renderPrefix?: (value: string | undefined) => React.ReactNode;
}

export const FormAutoComplete = <TFieldValues extends FieldValues>({
    name,
    form,
    label,
    suggestions,
    completeMethod,
    inputProps,
    className,
    renderPrefix
}: FormAutoCompleteProps<TFieldValues>): React.ReactElement => {
    const error = form.formState.errors[name];

    return (
        <div className={className ?? styles.fieldWrapper}>
            <FloatLabel>
                <Controller
                    name={name}
                    control={form.control}
                    render={({ field }) => (
                        <div className={styles.inputWithPrefix}>
                            {renderPrefix?.(field.value)}
                            <AutoComplete
                                id={name}
                                value={field.value ?? ""}
                                suggestions={suggestions}
                                completeMethod={completeMethod}
                                onChange={(e) => field.onChange(e.value)}
                                forceSelection={false}
                                dropdown
                                {...inputProps}
                                className={renderPrefix != undefined ? styles.inputWithPrefixControl : undefined}
                            />
                        </div>
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
