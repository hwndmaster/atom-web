import { setNotificationService } from "@hwndmaster/atom-web-core";
import type { ActionValidationErrors } from "@/actionExtensions";
import { ApiValidationError } from "@/callApi";
import { withValidatableCallback } from "@/withValidatableCallback";

function* validationFailingSaga(): Generator<unknown, never, unknown> {
    throw new ApiValidationError(
        {
            Email: ["Email is required"],
            Password: ["Password is required"],
        },
        400,
    );
}

describe("withValidatableCallback", () => {
    const toastMessages: { summary: string; detail?: string }[] = [];

    beforeEach(() => {
        toastMessages.length = 0;
        setNotificationService({
            showError(summary: string, detail?: string): void {
                toastMessages.push({ summary, detail });
            },
        });
    });

    test("Given API validation errors Then maps fields, rejects validation, and shows notification", () => {
        // Arrange
        const validationReject = vi.fn();
        const reject = vi.fn();
        const expectedErrors: ActionValidationErrors<{ email: string; password: string }> = {
            email: ["Email is required"],
            password: ["Password is required"],
        };
        const iterator = withValidatableCallback(
            { validationReject, reject },
            {
                mapValidationField(apiFieldName: string): "email" | "password" | undefined {
                    if (apiFieldName === "Email") {
                        return "email";
                    }

                    if (apiFieldName === "Password") {
                        return "password";
                    }

                    return undefined;
                },
            },
            validationFailingSaga,
        );

        // Act
        const result = iterator.next();

        // Verify
        expect(result).toEqual({ value: undefined, done: true });
        expect(validationReject).toHaveBeenCalledWith(expectedErrors);
        expect(reject).not.toHaveBeenCalled();
        expect(toastMessages).toEqual([
            {
                summary: "Validation Error",
                detail: "Couldn't proceed with operation due to validation error(s).",
            },
        ]);
    });
});
