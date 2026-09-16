/* eslint-disable no-console */
import { SeverityNumber, logs, type AnyValue, type LogAttributes } from "@opentelemetry/api-logs";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-proto";
import { BatchLogRecordProcessor, LoggerProvider } from "@opentelemetry/sdk-logs";
import {
    createTelemetryResource,
    getOtlpEndpoint,
    withExportResilience,
    type AtomTelemetryOptions,
} from "./telemetryConfig";

const LoggerName = "atom-web-telemetry";

/**
 * Hard ceiling on records exported per page load. Browser errors arrive in bursts — a component that
 * throws on every render can call console.error hundreds of times a second — and the point of this is
 * awareness, not a complete transcript. Once the cap is reached the console still works normally; only
 * the export stops.
 */
const MaxRecordsPerPageLoad = 200;

/** Identical messages repeating inside this window are exported once. */
const DuplicateSuppressionMs = 5_000;

/** Console arguments are truncated to this length so one huge object cannot dominate a batch. */
const MaxAttributeLength = 2_000;

type CaptureSource = "console" | "window.onerror" | "unhandledrejection" | "react.errorBoundary";

let isInitialized = false;
let exportedRecordCount = 0;
/** Guards against a log emitted while emitting: the OTLP exporter logs its own failures to the console. */
let isEmitting = false;
const recentMessages = new Map<string, number>();

function isUnderCap(): boolean {
    return exportedRecordCount < MaxRecordsPerPageLoad;
}

function isDuplicate(message: string): boolean {
    const now = Date.now();
    const lastSeen = recentMessages.get(message);
    if (lastSeen != null && now - lastSeen < DuplicateSuppressionMs) {
        return true;
    }

    // Bounded: without this the map is an unbounded leak on a page that logs many distinct messages.
    if (recentMessages.size > 100) {
        recentMessages.clear();
    }

    recentMessages.set(message, now);
    return false;
}

function truncate(value: string): string {
    return value.length > MaxAttributeLength ? `${value.slice(0, MaxAttributeLength)}…` : value;
}

function formatArgument(value: unknown): string {
    if (value == null) {
        return String(value);
    }

    if (typeof value === "string") {
        return value;
    }

    if (value instanceof Error) {
        return `${value.name}: ${value.message}`;
    }

    if (typeof value === "object") {
        try {
            return JSON.stringify(value);
        } catch {
            // Circular structures and DOM nodes are common here.
            return Object.prototype.toString.call(value);
        }
    }

    return String(value);
}

function findError(args: unknown[]): Error | undefined {
    return args.find((arg): arg is Error => arg instanceof Error);
}

function emit(severityNumber: SeverityNumber, severityText: string, source: CaptureSource,
    message: string, error?: Error): void {
    if (isEmitting || !isUnderCap()) {
        return;
    }

    const body = truncate(message);
    if (isDuplicate(`${source}:${body}`)) {
        return;
    }

    const attributes: LogAttributes = {
        "app.log.source": source,
        // Path and query only: enough to know which screen the user was on, without the origin noise.
        "app.page.path": `${window.location.pathname}${window.location.search}`,
    };

    if (error != null) {
        attributes["exception.type"] = error.name;
        attributes["exception.message"] = error.message;
        if (error.stack != null) {
            attributes["exception.stacktrace"] = truncate(error.stack);
        }
    }

    isEmitting = true;
    try {
        // The SDK picks up the active span context automatically, so a log raised inside a traced fetch
        // is linked to that trace in the dashboard.
        logs.getLogger(LoggerName).emit({
            severityNumber,
            severityText,
            body: body as AnyValue,
            attributes,
        });
        exportedRecordCount += 1;
    } catch {
        // Telemetry must never break the app.
    } finally {
        isEmitting = false;
    }
}

/**
 * Reports an error caught by a React error boundary, or any error the app wants recorded.
 * @param error The error that was thrown.
 * @param componentStack The React component stack, when available.
 */
function reportError(error: Error, componentStack?: string): void {
    const message = componentStack != null
        ? `${error.message}\nComponent stack:${componentStack}`
        : error.message;
    emit(SeverityNumber.ERROR, "ERROR", "react.errorBoundary", message, error);
}

function captureConsole(): void {
    const originalError = console.error.bind(console);
    const originalWarn = console.warn.bind(console);

    // Only error and warn are intercepted. console.log/info are developer chatter and would add volume
    // without adding awareness. Atom's own logger (withComponentName) and the shared raiseErrorSaga both
    // write through console.error, so this captures them without either having to change.
    console.error = (...args: unknown[]): void => {
        originalError(...args);
        emit(SeverityNumber.ERROR, "ERROR", "console", args.map(formatArgument).join(" "), findError(args));
    };

    console.warn = (...args: unknown[]): void => {
        originalWarn(...args);
        emit(SeverityNumber.WARN, "WARN", "console", args.map(formatArgument).join(" "), findError(args));
    };
}

function captureGlobalErrors(): void {
    window.addEventListener("error", (event: ErrorEvent): void => {
        const where = event.filename != null && event.filename !== ""
            ? ` (${event.filename}:${event.lineno}:${event.colno})`
            : "";
        emit(SeverityNumber.ERROR, "ERROR", "window.onerror", `${event.message}${where}`,
            event.error instanceof Error ? event.error : undefined);
    });

    window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent): void => {
        const reason: unknown = event.reason;
        emit(SeverityNumber.ERROR, "ERROR", "unhandledrejection", formatArgument(reason),
            reason instanceof Error ? reason : undefined);
    });
}

/**
 * Initializes browser log export once per page load.
 * @param options The telemetry options.
 */
function setupBrowserLogging(options: AtomTelemetryOptions): void {
    if (isInitialized) {
        return;
    }

    isInitialized = true;

    const exporter = withExportResilience(new OTLPLogExporter({
        url: getOtlpEndpoint(options, "/v1/logs"),
    }));

    const loggerProvider = new LoggerProvider({
        resource: createTelemetryResource(options),
        processors: [
            new BatchLogRecordProcessor(exporter, {
                scheduledDelayMillis: 2_000,
                maxExportBatchSize: 20,
                maxQueueSize: 100,
            }),
        ],
    });

    logs.setGlobalLoggerProvider(loggerProvider);

    captureConsole();
    captureGlobalErrors();

    window.addEventListener("pagehide", () => {
        void loggerProvider.forceFlush();
    });

    emit(SeverityNumber.INFO, "INFO", "console",
        `${options.serviceName} started (${options.environment ?? "unknown"})`);
}

export { reportError, setupBrowserLogging };
