import { SpanStatusCode, type Span as ApiSpan } from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { DocumentLoadInstrumentation } from "@opentelemetry/instrumentation-document-load";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";
import { XMLHttpRequestInstrumentation } from "@opentelemetry/instrumentation-xml-http-request";
import { BatchSpanProcessor, WebTracerProvider, type Span, type SpanProcessor } from "@opentelemetry/sdk-trace-web";
import {
    createTelemetryResource,
    getOtlpEndpoint,
    withExportResilience,
    type AtomTelemetryOptions,
} from "./telemetryConfig";

/** Every OTLP signal this app exports, so instrumentation never traces its own exports. */
const OtlpExportUrlPattern = /\/otlp\/v1\//;

let isInitialized = false;

function getStringAttribute(span: Span, ...keys: string[]): string | undefined {
    for (const key of keys) {
        const value = span.attributes[key];
        if (typeof value === "string" && value !== "") {
            return value;
        }
    }

    return undefined;
}

/**
 * Renames HTTP client spans from the bare method (e.g. "PUT") to "METHOD path" (e.g.
 * "PUT api/v1/Records"), so the Aspire dashboard's trace list shows which endpoint was called.
 * Attribute keys are probed in both stable and legacy semantic-convention spellings.
 */
class HttpSpanNameProcessor implements SpanProcessor {
    public onStart(span: Span): void {
        const url = getStringAttribute(span, "url.full", "http.url");
        if (url == null) {
            return;
        }

        const method = getStringAttribute(span, "http.request.method", "http.method");

        try {
            const path = new URL(url).pathname.replace(/^\//, "");
            span.updateName(`${method ?? span.name} ${path}`);
        } catch {
            // Leave the original span name when the URL cannot be parsed.
        }
    }

    public onEnd(): void { /* nothing to do */ }
    public async forceFlush(): Promise<void> { /* nothing to flush */ }
    public async shutdown(): Promise<void> { /* nothing to shut down */ }
}

/**
 * Marks a span as failed when the HTTP response status indicates an error. The browser
 * instrumentations do not do this on their own for 4xx responses, and without an Error status the
 * Aspire dashboard renders failed requests just like successful ones.
 */
function applyHttpStatusToSpan(span: ApiSpan, httpStatus: number): void {
    if (httpStatus >= 400 || httpStatus === 0) {
        span.setStatus({
            code: SpanStatusCode.ERROR,
            message: httpStatus === 0 ? "Network error" : `HTTP ${httpStatus}`,
        });
    }
}

/**
 * Initializes browser tracing once per page load.
 * @param options The telemetry options.
 */
function setupBrowserTracing(options: AtomTelemetryOptions): void {
    if (isInitialized) {
        return;
    }

    isInitialized = true;

    const exporter = withExportResilience(new OTLPTraceExporter({
        url: getOtlpEndpoint(options, "/v1/traces"),
    }));

    const tracerProvider = new WebTracerProvider({
        resource: createTelemetryResource(options),
        spanProcessors: [
            new HttpSpanNameProcessor(),
            new BatchSpanProcessor(exporter, {
                scheduledDelayMillis: 1000,
                maxExportBatchSize: 20,
                maxQueueSize: 100,
            }),
        ],
    });

    tracerProvider.register();

    window.addEventListener("pagehide", () => {
        void tracerProvider.forceFlush();
    });

    registerInstrumentations({
        instrumentations: [
            new DocumentLoadInstrumentation(),
            new FetchInstrumentation({
                ignoreUrls: [OtlpExportUrlPattern],
                applyCustomAttributesOnSpan: (span, _request, result): void => {
                    if ("status" in result && typeof result.status === "number") {
                        applyHttpStatusToSpan(span, result.status);
                    }
                },
            }),
            new XMLHttpRequestInstrumentation({
                ignoreUrls: [OtlpExportUrlPattern],
                applyCustomAttributesOnSpan: (span, xhr): void => {
                    applyHttpStatusToSpan(span, xhr.status);
                },
            }),
        ],
    });
}

export { setupBrowserTracing };
