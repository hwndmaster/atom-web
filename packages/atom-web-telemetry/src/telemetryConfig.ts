import { resourceFromAttributes } from "@opentelemetry/resources";
import { ATTR_DEPLOYMENT_ENVIRONMENT_NAME, ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

/** Consecutive failed exports tolerated before an exporter is put to sleep. */
const FailuresBeforeSuspension = 3;
const InitialSuspensionMs = 30_000;
const MaxSuspensionMs = 5 * 60_000;

const DefaultOtlpBasePath = "/otlp";

interface AtomTelemetryOptions {
    /** Name this app reports itself as, e.g. "buddykenteken-web". Shown as the resource in the dashboard. */
    serviceName: string;

    /**
     * Base URL the OTLP signals are posted to, without the /v1/... suffix. Defaults to `<origin>/otlp`,
     * which assumes the SPA is served by an nginx that proxies /otlp/ to the collector — so the browser
     * only ever talks to its own origin and no CORS configuration is needed.
     */
    endpoint?: string;

    /** Deployment environment reported alongside the service name. Defaults to the bundler's mode. */
    environment?: string;

    /**
     * Capture console.error / console.warn, uncaught errors and unhandled rejections as OTLP log
     * records. Traces alone show that a request happened, not what the app concluded about it.
     * Defaults to true.
     */
    captureLogs?: boolean;
}

interface ExportResult {
    code: number;
    error?: unknown;
}

interface ResilientExporter {
    export(items: never, resultCallback: (result: ExportResult) => void): void;
    shutdown(): Promise<void>;
}

/**
 * Returns the value when it holds something other than whitespace, otherwise undefined.
 * @param value The raw configuration value.
 * @returns The trimmed value, or undefined when empty.
 */
function getNonEmptyValue(value: string | undefined): string | undefined {
    if (value == null) {
        return undefined;
    }

    const trimmedValue = value.trim();
    return trimmedValue.length > 0 ? trimmedValue : undefined;
}

/**
 * Builds the absolute URL one signal is exported to.
 * @param options The telemetry options.
 * @param signalPath Signal-specific suffix, e.g. "/v1/logs".
 * @returns The absolute URL to export to.
 */
function getOtlpEndpoint(options: AtomTelemetryOptions, signalPath: string): string {
    const configured = getNonEmptyValue(options.endpoint);
    if (configured != null) {
        return `${configured.replace(/\/$/, "")}${signalPath}`;
    }

    return `${window.location.origin}${DefaultOtlpBasePath}${signalPath}`;
}

/**
 * The resource attributes every signal from this app carries.
 * @param options The telemetry options.
 * @returns The OpenTelemetry resource.
 */
function createTelemetryResource(options: AtomTelemetryOptions): ReturnType<typeof resourceFromAttributes> {
    return resourceFromAttributes({
        [ATTR_SERVICE_NAME]: options.serviceName,
        [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: options.environment ?? "unknown",
    });
}

function isSuccessfulExportResult(result: ExportResult): boolean {
    return result.error == null && result.code === 0;
}

/**
 * Makes an exporter survive an unreachable collector.
 *
 * Repeated failed exports are expensive — every batch retries, every retry logs — so after a few
 * consecutive failures the exporter sleeps, with the sleep doubling up to five minutes. A single
 * successful export clears it. Notably this does NOT disable telemetry for the rest of the browser
 * session: doing that meant one restart of the collector left the SPA silent until the user happened
 * to reload the page.
 *
 * While suspended the export is reported as successful so the SDK drops the batch instead of queueing
 * it: these are diagnostics, and holding stale records is worse than losing them.
 * @param exporter The OTLP exporter to wrap. Mutated in place and returned for chaining.
 * @returns The same exporter.
 */
function withExportResilience<T extends ResilientExporter>(exporter: T): T {
    let consecutiveFailures = 0;
    let suspendedUntil = 0;
    let nextSuspensionMs = InitialSuspensionMs;

    const originalExport = exporter.export.bind(exporter);

    exporter.export = (items, resultCallback): void => {
        if (Date.now() < suspendedUntil) {
            resultCallback({ code: 0 });
            return;
        }

        originalExport(items, (result) => {
            if (isSuccessfulExportResult(result)) {
                consecutiveFailures = 0;
                nextSuspensionMs = InitialSuspensionMs;
                resultCallback(result);
                return;
            }

            consecutiveFailures += 1;
            if (consecutiveFailures >= FailuresBeforeSuspension) {
                suspendedUntil = Date.now() + nextSuspensionMs;
                nextSuspensionMs = Math.min(nextSuspensionMs * 2, MaxSuspensionMs);
                consecutiveFailures = 0;
            }

            // Reported as success: the batch is dropped rather than retried against a collector that is
            // evidently not answering.
            resultCallback({ code: 0 });
        });
    };

    return exporter;
}

export type { AtomTelemetryOptions };
export { getNonEmptyValue, getOtlpEndpoint, createTelemetryResource, withExportResilience };
