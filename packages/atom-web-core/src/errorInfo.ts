export type RaiseErrorInfo = Error | ErrorInfo | ValidationError | string | unknown;

export interface ErrorInfo {
    message: string;
    title?: string;
}

export interface ValidationError {
    errors: Record<string, string[]>;
    status: number;
    title?: string;
}

export interface HasToastedError extends Error {
    toasted: boolean;
}
