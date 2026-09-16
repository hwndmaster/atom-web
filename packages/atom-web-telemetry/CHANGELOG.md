# @hwndmaster/atom-web-telemetry

## 0.2.0

### Minor Changes

- New package: browser OpenTelemetry for Atom SPAs.

  Consolidates the `setupOpenTelemetry.ts` that was copied into buddy-kenteken, prepper-box and
  price-checker and had drifted into three different implementations, and adds what none of them had:

  - **Log export.** Traces show that a request happened; they do not show what the app concluded about
    it. `console.error` / `console.warn`, uncaught errors and unhandled rejections are exported as OTLP
    log records, capped at 200 per page load with duplicate suppression so a render loop cannot flood.
  - **Resilient exporters.** A failed export no longer disables telemetry for the rest of the browser
    session — one collector restart used to leave the SPA silent until the user reloaded. Exporters now
    back off (30s doubling to 5min) and recover on the first success.
  - **`AtomErrorBoundary`.** Reports render failures instead of unmounting the app into a blank page.

  `setupAtomTelemetry({ serviceName })` replaces the per-app copies.
