# @hwndmaster/atom-react-core

## 0.2.0

### Minor Changes

- **Breaking:** remove `useAtomForm` and the `AtomFormReturn` type. Use react-hook-form's `useForm`
  directly instead.

  The hook existed only to add a `setValues` helper, but react-hook-form provides `setValues` natively
  on `UseFormReturn` — so much so that the hook typed its own re-implementation as
  `UseFormReturn[...]["setValues"]`, which only compiles because the native member already exists. The
  two behaved identically for the object form (both update registered inputs and `watch`, neither
  marks the form dirty); the callback form differed only in that the wrapper performed a full
  `reset()`, discarding validation errors and the dirty/touched baseline.

  Worse, the wrapper returned `{ ...form, setValues }`. `useForm` returns a stable object whose
  `formState` property is reassigned to a fresh proxy on every render, so spreading captured a
  snapshot — and because the object identity never changes, the internal `useMemo` never recomputed
  and `formState` stayed frozen at its first render, where `errors` is always empty. Every consumer
  reading `form.formState.errors[name]` (as the atom form inputs do) therefore saw no errors at all,
  for both resolver-driven and server-side validation. Imperative APIs (`handleSubmit`, `setError`,
  focus-on-first-error) were unaffected, so submitting an invalid form appeared to do nothing but move
  focus.

  Migration:

  ```diff
  -import { useAtomForm } from "@hwndmaster/atom-react-core";
  +import { useForm } from "react-hook-form";

  -const form = useAtomForm<MyFormData>({ resolver: zodResolver(mySchema) });
  +const form = useForm<MyFormData>({ resolver: zodResolver(mySchema) });
  ```

## 0.1.10

### Patch Changes

- Updated dependencies
  - @hwndmaster/atom-web-core@0.1.6

## 0.1.9

### Patch Changes

- Updated dependencies
  - @hwndmaster/atom-web-core@0.1.5

## 0.1.8

### Patch Changes

- Handling validation errors in forms

## 0.1.7

### Patch Changes

- Updated dependencies
  - @hwndmaster/atom-web-core@0.1.4

## 0.1.6

### Patch Changes

- Updated dependencies
  - @hwndmaster/atom-web-core@0.1.3

## 0.1.5

### Patch Changes

- parseRef improvement + unit tests
- Updated dependencies
  - @hwndmaster/atom-web-core@0.1.2

## 0.1.4

### Patch Changes

- Updated dependencies
  - @hwndmaster/atom-web-core@0.1.1

## 0.1.3

### Patch Changes

- f306639: \* useAtomForm implementation
  - reference schema fixes
  * @hwndmaster/atom-web-core@0.1.0
