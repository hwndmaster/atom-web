import type { Toast, ToastMessage } from "primereact/toast";
import { isTest } from "@hwndmaster/atom-web-core";

class ToastService {
    private toast: Toast | null = null;
    private messages: ToastMessage[] = [];

    setToastRef(ref: Toast | null): void {
        this.toast = ref;
    }

    show(message: ToastMessage): void {
        this.toast?.show(message);

        if (isTest) {
            this.messages.push(message);
        }
    }

    showSuccess(summary: string, detail?: string): void {
        this.show({ severity: "success", summary, detail });
    }

    showError(summary: string, detail?: string): void {
        this.show({ severity: "error", summary, detail, sticky: true });
    }

    showInfo(summary: string, detail?: string): void {
        this.show({ severity: "info", summary, detail });
    }

    showWarn(summary: string, detail?: string): void {
        this.show({ severity: "warn", summary, detail });
    }

    getMessages(): ToastMessage[] {
        if (!isTest) {
            throw new Error("ToastService: getMessages should only be called in test mode.");
        }
        return [...this.messages];
    }

    clearMessages(): void {
        this.messages = [];
    }
}

export const toastService = new ToastService();
