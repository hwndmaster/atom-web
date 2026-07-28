import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { type UseFormReturn, useForm } from "react-hook-form";
import { type FormValidationErrors, translateErrorsToForm } from "@/form/translateErrorsToForm";

interface TestFormData {
    name: string;
    quantity: string;
}

/**
 * Mirrors how the atom-react-prime form inputs consume the form: the field component receives
 * `form` as a prop and reads `form.formState.errors[name]` during its own render.
 */
const FieldWithError: React.FC<{ form: UseFormReturn<TestFormData>; name: keyof TestFormData }> = ({ form, name }) => {
    const error = form.formState.errors[name];
    return (
        <>
            <input aria-label={name} {...form.register(name, { required: `${name} is required` })} />
            {error !== undefined && <small>{String(error.message)}</small>}
        </>
    );
};

const Harness: React.FC<{ serverErrors: FormValidationErrors<TestFormData> }> = ({ serverErrors }) => {
    const form = useForm<TestFormData>({ defaultValues: { name: "", quantity: "" } });

    return (
        <form onSubmit={(e) => void form.handleSubmit(() => undefined)(e)}>
            <FieldWithError form={form} name="name" />
            <FieldWithError form={form} name="quantity" />
            <button type="submit">Submit</button>
            <button type="button" onClick={() => translateErrorsToForm(form)(serverErrors)}>
                ApplyServerErrors
            </button>
        </form>
    );
};

describe("translateErrorsToForm", () => {
    it("translateErrorsToForm: surfaces a server field error on the matching input", async () => {
        // Arrange
        render(<Harness serverErrors={{ name: ["Name already exists."] }} />);

        // Act
        fireEvent.click(screen.getByRole("button", { name: "ApplyServerErrors" }));

        // Assert
        expect(await screen.findByText("Name already exists.")).toBeInTheDocument();
    });

    it("translateErrorsToForm: applies errors to several fields at once", async () => {
        // Arrange
        render(<Harness serverErrors={{ name: ["Bad name."], quantity: ["Bad quantity."] }} />);

        // Act
        fireEvent.click(screen.getByRole("button", { name: "ApplyServerErrors" }));

        // Assert
        expect(await screen.findByText("Bad name.")).toBeInTheDocument();
        expect(screen.getByText("Bad quantity.")).toBeInTheDocument();
    });

    it("translateErrorsToForm: uses the first non-blank message when a field has several", async () => {
        // Arrange
        render(<Harness serverErrors={{ name: ["First problem.", "Second problem."] }} />);

        // Act
        fireEvent.click(screen.getByRole("button", { name: "ApplyServerErrors" }));

        // Assert
        expect(await screen.findByText("First problem.")).toBeInTheDocument();
        expect(screen.queryByText("Second problem.")).not.toBeInTheDocument();
    });

    it("translateErrorsToForm: clears previously shown client-side errors", async () => {
        // Arrange - trigger the client-side required errors first.
        render(<Harness serverErrors={{ name: ["Server rejected this."] }} />);
        fireEvent.click(screen.getByRole("button", { name: "Submit" }));
        expect(await screen.findByText("quantity is required")).toBeInTheDocument();

        // Act
        fireEvent.click(screen.getByRole("button", { name: "ApplyServerErrors" }));

        // Assert - the stale client error is gone, the server error is shown.
        expect(await screen.findByText("Server rejected this.")).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.queryByText("quantity is required")).not.toBeInTheDocument();
        });
    });

    it("translateErrorsToForm: ignores empty and blank message lists", async () => {
        // Arrange
        render(<Harness serverErrors={{ name: [], quantity: ["   "] }} />);

        // Act
        fireEvent.click(screen.getByRole("button", { name: "ApplyServerErrors" }));

        // Assert - nothing is rendered for either field.
        await waitFor(() => {
            expect(screen.queryByText("name is required")).not.toBeInTheDocument();
        });
        expect(screen.queryByText("   ")).not.toBeInTheDocument();
    });
});
