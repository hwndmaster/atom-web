import { AxiosError } from "axios";
import type { ErrorInfo } from "@hwndmaster/atom-web-core";
import { setNotificationService } from "@hwndmaster/atom-web-core";
import { SagaRunner } from "@hwndmaster/atom-testing-utils";
import * as commonActions from "@/common/actions";
import { raiseErrorSaga } from "@/common/sagas";

const errors: { summary: string; detail?: string }[] = [];

setNotificationService({
    showError(summary: string, detail?: string): void {
        errors.push({ summary, detail });
    },
});

describe("raiseErrorSaga", () => {
    afterEach(() => {
        errors.length = 0;
    });

    test("Given a string Then should raise an error", async () => {
        // Arrange
        const sagaRunner = new SagaRunner();
        const action = commonActions.raiseError("Error message");

        // Act
        await sagaRunner.runSaga(raiseErrorSaga, action);

        // Verify
        const toastMessages = errors;
        expect(toastMessages).toHaveLength(1);
        expect(toastMessages[0].detail).toBe("Error message");
        expect(toastMessages[0].summary).toBe("Error");
    });

    test("Given an AxiosError Then should raise an error", async () => {
        // Arrange
        const sagaRunner = new SagaRunner();
        const action = commonActions.raiseError(new AxiosError("Axios error message"));

        // Act
        await sagaRunner.runSaga(raiseErrorSaga, action);

        // Verify
        const toastMessages = errors;
        expect(toastMessages).toHaveLength(1);
        expect(toastMessages[0].detail).toBe("Axios error message");
        expect(toastMessages[0].summary).toBe("API Error");
    });

    test("Given an ErrorInfo Then should raise an error", async () => {
        // Arrange
        const sagaRunner = new SagaRunner();
        const payload: ErrorInfo = { message: "General error message", title: "General error title" };
        const action = commonActions.raiseError(payload);

        // Act
        await sagaRunner.runSaga(raiseErrorSaga, action);

        // Verify
        const toastMessages = errors;
        expect(toastMessages).toHaveLength(1);
        expect(toastMessages[0].detail).toBe("General error message");
        expect(toastMessages[0].summary).toBe("General error title");
    });
});
