# @hwndmaster/atom-testing-utils

## 0.2.1

### Patch Changes

- Updated dependencies
  - @hwndmaster/atom-react-redux@0.1.15

## 0.2.0

### Minor Changes

- **Breaking:** migrate from `react-router-dom` to `react-router` v8.

  React Router v8 removed the `react-router-dom` package entirely; DOM-specific code now lives in
  `react-router` and `react-router/dom`. The `react-router-dom` peer dependency is therefore replaced
  by `react-router` (`>=8.0.0`), and all internal imports now come from `react-router`.

  This also clears GHSA-qwww-vcr4-c8h2 (high): `react-router` was vulnerable in `>=7.12.0 <8.3.0` and
  is patched in `8.3.0`. Because `react-router-dom@7.18.1` pins `react-router@7.18.1` exactly, the
  patched version is unreachable while depending on `react-router-dom` — dropping it is the only fix.

  Consuming apps must migrate too:

  ```diff
  -import { Outlet, useLocation, useNavigate, useParams, createBrowserRouter } from "react-router-dom";
  +import { Outlet, useLocation, useNavigate, useParams, createBrowserRouter } from "react-router";

  -import { RouterProvider } from "react-router-dom";
  +import { RouterProvider } from "react-router/dom";
  ```

  Note the new floors imposed by react-router v8: React >= 19.2.7, Node >= 22.22.0, Vite >= 7, and
  ESM-only publishing.

### Patch Changes

- @hwndmaster/atom-react-redux@0.1.14

## 0.1.14

### Patch Changes

- e4ad2f4: callApi fixes, useAtomForm removal
- Updated dependencies [e4ad2f4]
  - @hwndmaster/atom-react-redux@0.1.13

## 0.1.13

### Patch Changes

- Updated dependencies
  - @hwndmaster/atom-react-redux@0.1.12

## 0.1.12

### Patch Changes

- Updated dependencies
  - @hwndmaster/atom-react-redux@0.1.11

## 0.1.11

### Patch Changes

- Updated dependencies
  - @hwndmaster/atom-react-redux@0.1.10

## 0.1.10

### Patch Changes

- Parametrizes Loading Targets
- Updated dependencies
  - @hwndmaster/atom-react-redux@0.1.9
  - @hwndmaster/atom-web-core@0.1.6

## 0.1.9

### Patch Changes

- Testing utilities
  - @hwndmaster/atom-react-redux@0.1.8

## 0.1.8

### Patch Changes

- Updated dependencies
  - @hwndmaster/atom-react-redux@0.1.8
  - @hwndmaster/atom-web-core@0.1.5

## 0.1.7

### Patch Changes

- Updated dependencies
  - @hwndmaster/atom-react-redux@0.1.7

## 0.1.6

### Patch Changes

- Updated dependencies
  - @hwndmaster/atom-web-core@0.1.4
  - @hwndmaster/atom-react-redux@0.1.6

## 0.1.5

### Patch Changes

- Updated dependencies
  - @hwndmaster/atom-react-redux@0.1.5
  - @hwndmaster/atom-web-core@0.1.3

## 0.1.4

### Patch Changes

- Updated dependencies
  - @hwndmaster/atom-react-redux@0.1.4
  - @hwndmaster/atom-web-core@0.1.2

## 0.1.3

### Patch Changes

- Updated dependencies
  - @hwndmaster/atom-web-core@0.1.1
  - @hwndmaster/atom-react-redux@0.1.3

## 0.1.2

### Patch Changes

- Updated dependencies [f306639]
  - @hwndmaster/atom-react-redux@0.1.2
  - @hwndmaster/atom-web-core@0.1.0
