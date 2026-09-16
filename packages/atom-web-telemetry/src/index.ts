import { setupBrowserLogging } from "./browserLogging";
import { setupBrowserTracing } from "./browserTracing";
import type { AtomTelemetryOptions } from "./telemetryConfig";

/**
 * Initializes browser telemetry once per page load: traces always, and log export unless turned off.
 *
 * Call it before rendering, so a failure during start-up is still reported. Safe to call more than once;
 * subsequent calls are ignored.
 * @param options Service name and, optionally, the OTLP endpoint and environment.
 */
function setupAtomTelemetry(options: AtomTelemetryOptions): void {
    setupBrowserTracing(options);

    if (options.captureLogs !== false) {
        // After the tracer provider is registered, so a log raised during start-up can still be
        // correlated with the document-load trace.
        setupBrowserLogging(options);
    }
}

export { setupAtomTelemetry };
export { reportError } from "./browserLogging";
export { AtomErrorBoundary } from "./appErrorBoundary";
export type { AtomErrorBoundaryProps } from "./appErrorBoundary";
export type { AtomTelemetryOptions } from "./telemetryConfig";
