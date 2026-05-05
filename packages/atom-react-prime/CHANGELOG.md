# @hwndmaster/atom-react-prime

## 0.1.12

### Patch Changes

- Updated dependencies
  - @hwndmaster/atom-react-core@0.1.8

## 0.1.11

### Patch Changes

- Updated dependencies
  - @hwndmaster/atom-web-core@0.1.4
  - @hwndmaster/atom-react-core@0.1.7

## 0.1.10

### Patch Changes

- Updated dependencies
  - @hwndmaster/atom-web-core@0.1.3
  - @hwndmaster/atom-react-core@0.1.6

## 0.1.9

### Patch Changes

- Updated dependencies
  - @hwndmaster/atom-react-core@0.1.5
  - @hwndmaster/atom-web-core@0.1.2

## 0.1.8

### Patch Changes

- Updated dependencies
  - @hwndmaster/atom-web-core@0.1.1
  - @hwndmaster/atom-react-core@0.1.4

## 0.1.7

### Patch Changes

- Refactor form component test-id typing to use shared `DataTestIdProp` and `WithDataTestId` helper types, so naming-convention lint suppression is centralized in one place.

## 0.1.6

### Patch Changes

- Add `data-test_id` support to all Form components (component props and `inputProps`) and forward it to underlying PrimeReact inputs. Also simplify form stylesheet packaging by exporting `./styles/forms.scss` directly from `src/styles/forms.scss`.

## 0.1.5

### Patch Changes

- Fix form styling integration by correctly bundling SCSS modules in `atom-react-prime`, exporting package style entrypoints, and extending shared form layout styles for full-width controls.

## 0.1.4

### Patch Changes

- FormInputNumber fixes (2)

## 0.1.3

### Patch Changes

- 7915273: FormInputNumber fixes

## 0.1.2

### Patch Changes

- Updated dependencies [f306639]
  - @hwndmaster/atom-react-core@0.1.3
  - @hwndmaster/atom-web-core@0.1.0
