/**
 * Injectable notification service used by the common saga to show error toasts.
 * Call setNotificationService(toastService) in your app initialization to wire up toasts.
 *
 * @example
 * // In your app's main.tsx or store setup:
 * import { setNotificationService } from "@hwndmaster/atom-react-redux";
 * import { toastService } from "@hwndmaster/atom-react-prime";
 * setNotificationService(toastService);
 */
interface NotificationService {
    showError(summary: string, detail?: string): void;
}

let service: NotificationService = {
    // Default: log to console as fallback if setNotificationService hasn't been called
    // eslint-disable-next-line no-console
    showError: (summary: string, detail?: string): void => console.error(`[Error] ${summary}`, detail),
};

/**
 * Configures the notification service used by the common Redux saga for error reporting.
 * @param ns The notification service implementation (e.g. toastService from atom-react-prime).
 */
function setNotificationService(ns: NotificationService): void {
    service = ns;
}

/**
 * Returns the currently configured notification service.
 */
function getNotificationService(): NotificationService {
    return service;
}

export type { NotificationService };
export { setNotificationService, getNotificationService };
