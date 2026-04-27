import React, { createContext, useContext, useRef, ReactNode, useEffect, useMemo, useCallback } from "react";
import { Toast } from "primereact/toast";
import { toastService } from "./toastService";

interface ToastContextType {
    showSuccess: (summary: string, detail?: string) => void;
    showError: (summary: string, detail?: string) => void;
    showInfo: (summary: string, detail?: string) => void;
    showWarn: (summary: string, detail?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext);
    if (context == null) {
        throw new Error("useToast must be used within ToastProvider");
    }
    return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const toast = useRef<Toast>(null);

    useEffect(() => {
        toastService.setToastRef(toast.current);
        return (): void => toastService.setToastRef(null);
    }, []);

    const showSuccess = useCallback((summary: string, detail?: string): void => {
        toastService.showSuccess(summary, detail);
    }, []);

    const showError = useCallback((summary: string, detail?: string): void => {
        toastService.showError(summary, detail);
    }, []);

    const showInfo = useCallback((summary: string, detail?: string): void => {
        toastService.showInfo(summary, detail);
    }, []);

    const showWarn = useCallback((summary: string, detail?: string): void => {
        toastService.showWarn(summary, detail);
    }, []);

    const contextValue = useMemo(
        () => ({ showSuccess, showError, showInfo, showWarn }),
        [showSuccess, showError, showInfo, showWarn]
    );

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
            <Toast ref={toast} />
        </ToastContext.Provider>
    );
};
