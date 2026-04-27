---
applyTo: '**/*.ts, **/*.tsx'
---

# Web Standards for atom-web

## CSS Styling

- Always use SCSS Modules or main.scss for styling components. Do stack styles using multiple SCSS layers (e.g., component-level, feature-level, global-level).
- Use camelCase for CSS class names.
- when selecting a css class in a typescript file, use class name directly instead of bracket notation. E.g., `styles.myClassName` instead of `styles["my-class-name"]`.

## TypeScript Conventions

* Respect the ESLint rules defined in eslint.config.js of the package.
* Avoid conversion like `as unknown as Type` unless absolutely necessary. If you find yourself needing to do this, consider if there is a better way to structure your types or code to avoid it.

## Naming conventions

* Respect the @typescript-eslint/naming-convention rules defined in index.js of atom-eslint-stylistic package. In particular:
  * Use PascalCase for type names (e.g., `type User = { ... }`).
  * Use camelCase for variable and function names (e.g., `const userName = "John";`).
  * Use PascalCase for constants (e.g., `const MaxUsers = 100;`).

## React Component Conventions

- The order of imports in a React component file should be:
  1. React and related libraries (e.g., `import React from "react";`)
  2. Third-party libraries (e.g., `import { useSelector } from "react-redux";`)
  3. Imports from `atom-web` packages (e.g., `import { callApi } from "@hwndmaster/atom-react-redux";`)
  4. Application-wide imports (e.g., `import fileToImport from "@/fileToImport"`).
  5. Components from upper folder (e.g., `import AnotherComponent from "../anotherComponent";`)
  6. Local imports (e.g., `import AnotherComponent from "./anotherComponent";`)
  7. Styles (e.g., `import "./myComponent.module.scss";`)

## Tests

Do NOT write comprehensive unit tests. Do exactly as asked by the developer and keep the fundamental unit tests around:
- Test the rendering elements of a component
- Test the main logic of a function
- Test the standard business case scenarios
- Test the most likely edge cases

**ALWAYS** select your screen elements by their `data-test_id` attributes in your tests. If an elements is missing, just add it to the component. Always use the format `ComponentName__Element_Description`, e.g., `LoginButton__Submit_Button`. Avoid selecting elements by content text.
