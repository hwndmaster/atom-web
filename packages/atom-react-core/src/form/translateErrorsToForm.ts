import { FieldValues, Path, UseFormReturn } from "react-hook-form";

export type FormValidationErrors<TFieldValues extends FieldValues> = Partial<Record<Extract<keyof TFieldValues, string>, string[]>>;

/**
 * Creates a callback that maps server-side field errors to react-hook-form setError calls.
 */
export function translateErrorsToForm<TFieldValues extends FieldValues>(
    form: Pick<UseFormReturn<TFieldValues>, "setError" | "clearErrors">
): (errors: FormValidationErrors<TFieldValues>) => void {
    return (errors: FormValidationErrors<TFieldValues>): void => {
        form.clearErrors();

        for (const [fieldName, fieldErrors] of Object.entries(errors)) {
            if (!Array.isArray(fieldErrors) || fieldErrors.length === 0) {
                continue;
            }

            const firstMessage = fieldErrors.find((message) => message.trim() !== "") ?? fieldErrors[0];
            if (firstMessage.trim() === "") {
                continue;
            }

            form.setError(fieldName as Path<TFieldValues>, {
                type: "server",
                message: firstMessage,
            });
        }
    };
}
