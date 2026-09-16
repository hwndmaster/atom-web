import React, { Component } from "react";
import { reportError } from "./browserLogging";

interface AtomErrorBoundaryProps {
    children: React.ReactNode;

    /** Rendered instead of the children once a descendant has thrown. */
    fallback?: (message: string | undefined) => React.ReactNode;
}

interface AtomErrorBoundaryState {
    hasError: boolean;
    message?: string;
}

function defaultFallback(message: string | undefined): React.ReactNode {
    return (
        <div style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
            <h1 style={{ fontSize: "4em" }}>The application failed to start</h1>
            <span>{message}</span>
            <span>Reloading with a purged local cache usually helps:</span>
            <button
                onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                }}
            >
                Purge state
            </button>
        </div>
    );
}

/**
 * Catches render failures and reports them through the browser log exporter. Place it above the router:
 * a router's own errorElement only covers failures inside a route, and anything above it would otherwise
 * unmount the whole app into a blank page with no record of why.
 */
class AtomErrorBoundary extends Component<AtomErrorBoundaryProps, AtomErrorBoundaryState> {
    public constructor(props: AtomErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    public static getDerivedStateFromError(error: Error): AtomErrorBoundaryState {
        return { hasError: true, message: error.message };
    }

    public override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        reportError(error, errorInfo.componentStack ?? undefined);
    }

    public override render(): React.ReactNode {
        if (!this.state.hasError) {
            return this.props.children;
        }

        return (this.props.fallback ?? defaultFallback)(this.state.message);
    }
}

export { AtomErrorBoundary };
export type { AtomErrorBoundaryProps };
