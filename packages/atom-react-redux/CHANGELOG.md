# @hwndmaster/atom-react-redux

## 0.1.12

### Patch Changes

- Fix server-side field validation errors being dropped for NSwag-generated API clients.

  NSwag's generated `throwException` rethrows the deserialized 400 response body as-is instead of
  wrapping it, so the thrown value is the `ProblemDetails` payload itself. `processValidationError`
  only inspected `error.result`, `error.response` and `error.response.data`, none of which exist on a
  bare payload, so no `ApiValidationError` was ever constructed: `validationReject` never fired and
  field-level errors never reached the form, falling back to a generic error instead.

  The error object itself is now also considered as a candidate payload. It is checked last, so the
  existing wrapped-error shapes keep their precedence.

- Updated dependencies
  - @hwndmaster/atom-react-core@0.2.0

## 0.1.11

### Patch Changes

- Add `ApiRequest.onError(...)` for customizing the user-facing error notification of a failed request. The factory receives the HTTP status code and raw response body and returns `{ title, message }`, or `undefined` to keep the default handling. Validation errors and `onVersionConflict` handling take precedence.

## 0.1.10

### Patch Changes

- Add `ApiRequest.onVersionConflict(...)` for optimistic-concurrency handling. When the server responds with HTTP 409, an optional `recover` saga runs (e.g. to re-fetch the entity), a friendly notification is raised instead of the raw error, and the request still fails so the caller's success path does not run.

## 0.1.9

### Patch Changes

- Parametrizes Loading Targets
- Updated dependencies
  - @hwndmaster/atom-web-core@0.1.6
  - @hwndmaster/atom-api-core@0.1.6
  - @hwndmaster/atom-react-core@0.1.10

## 0.1.8

### Patch Changes

- Sort things out
- Updated dependencies
  - @hwndmaster/atom-web-core@0.1.5
  - @hwndmaster/atom-api-core@0.1.5
  - @hwndmaster/atom-react-core@0.1.9

## 0.1.7

### Patch Changes

- API calls handling with validation errors
- Updated dependencies
  - @hwndmaster/atom-react-core@0.1.8

## 0.1.6

### Patch Changes

- Updated dependencies
  - @hwndmaster/atom-web-core@0.1.4
  - @hwndmaster/atom-api-core@0.1.4
  - @hwndmaster/atom-react-core@0.1.7

## 0.1.5

### Patch Changes

- Minor updates
- Updated dependencies
  - @hwndmaster/atom-web-core@0.1.3
  - @hwndmaster/atom-api-core@0.1.3
  - @hwndmaster/atom-react-core@0.1.6

## 0.1.4

### Patch Changes

- parseRef improvement + unit tests
- Updated dependencies
  - @hwndmaster/atom-react-core@0.1.5
  - @hwndmaster/atom-web-core@0.1.2
  - @hwndmaster/atom-api-core@0.1.2

## 0.1.3

### Patch Changes

- Updated dependencies
  - @hwndmaster/atom-web-core@0.1.1
  - @hwndmaster/atom-api-core@0.1.1
  - @hwndmaster/atom-react-core@0.1.4

## 0.1.2

### Patch Changes

- Updated dependencies [f306639]
  - @hwndmaster/atom-react-core@0.1.3
  - @hwndmaster/atom-api-core@0.1.0
  - @hwndmaster/atom-web-core@0.1.0
