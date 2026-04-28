import { importX } from "eslint-plugin-import-x";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import jsdocConfig from "eslint-plugin-jsdoc";
import ts from "@typescript-eslint/eslint-plugin";
import testingLibrary from "eslint-plugin-testing-library";

// TypeScript ESLint recommended flat configs
const tsRecommended = ts.configs["flat/recommended"];

/**
 * Shared ESLint flat config array.
 * Includes: @typescript-eslint rules, jsdoc, import-x.
 * Stylistic rules (indent, quotes, naming-convention) are in atom-eslint-stylistic.
 * React rules are in atom-eslint-react.
 * Testing-library rules are in testingConfig (this package).
 *
 * @example
 * // eslint.config.js in consuming project:
 * import { commonConfig } from "@hwndmaster/atom-eslint-common";
 * export default [
 *   { ignores: ["build/", "node_modules/"] },
 *   ...commonConfig,
 *   // project overrides
 * ];
 */
export const commonConfig = [
    // TypeScript ESLint recommended (base + eslint-recommended + recommended)
    ...(Array.isArray(tsRecommended) ? tsRecommended : [tsRecommended]),
    importX.flatConfigs.recommended,
    {
        ...importX.flatConfigs.typescript,
        settings: {
            ...importX.flatConfigs.typescript.settings,
            "import-x/resolver": undefined,
            "import-x/resolver-next": [
                createTypeScriptImportResolver({
                    alwaysTryTypes: true,
                }),
            ],
        },
    },
    {
        files: ["**/*.ts", "**/*.tsx"],
        plugins: {
            jsdoc: jsdocConfig,
        },
        rules: {
            // General rules
            "no-implied-eval": "off", // disabled in favor of `@typescript-eslint/no-implied-eval`
            "no-unused-expressions": "off", // disabled in favor of `@typescript-eslint/no-unused-expressions`
            "no-unused-vars": "off", // disabled in favor of `@typescript-eslint/no-unused-vars`
            "no-console": "warn",
            "no-var": "error",
            "@typescript-eslint/consistent-type-assertions": "error",
            "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
            "@typescript-eslint/consistent-type-exports": "error",
            "@typescript-eslint/explicit-function-return-type": "error",
            "@typescript-eslint/no-duplicate-enum-values": "error",
            "@typescript-eslint/no-empty-object-type": ["error", {
                allowInterfaces: "with-single-extends"
            }],
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/no-floating-promises": ["error", {
                ignoreVoid: true,
            }],
            "@typescript-eslint/no-implied-eval": "error",
            "@typescript-eslint/no-inferrable-types": "error",
            "@typescript-eslint/no-meaningless-void-operator": "error",
            "@typescript-eslint/no-misused-new": "error",
            "@typescript-eslint/no-misused-promises": "error",
            "@typescript-eslint/no-mixed-enums": "error",
            "@typescript-eslint/no-namespace": "error",
            "@typescript-eslint/no-non-null-asserted-nullish-coalescing": "error",
            "@typescript-eslint/no-non-null-asserted-optional-chain": "error",
            "@typescript-eslint/no-require-imports": "error",
            "@typescript-eslint/no-this-alias": "error",
            "@typescript-eslint/no-unnecessary-parameter-property-assignment": "error",
            "@typescript-eslint/no-unnecessary-template-expression": "error",
            "@typescript-eslint/no-unnecessary-type-constraint": "error",
            "@typescript-eslint/no-unsafe-argument": "error",
            "@typescript-eslint/no-unsafe-assignment": "error",
            "@typescript-eslint/no-unsafe-call": "error",
            "@typescript-eslint/no-unsafe-enum-comparison": "error",
            "@typescript-eslint/no-unsafe-member-access": "error",
            "@typescript-eslint/no-unused-vars": ["error", {
                "argsIgnorePattern": "^_",
                "varsIgnorePattern": "^_"
            }],
            "@typescript-eslint/no-unused-expressions": "error",
            "@typescript-eslint/no-wrapper-object-types": "error",
            "@typescript-eslint/only-throw-error": "error",
            "@typescript-eslint/prefer-as-const": "error",
            "@typescript-eslint/prefer-enum-initializers": "error",
            "@typescript-eslint/prefer-find": "error",
            "@typescript-eslint/prefer-for-of": "error",
            "@typescript-eslint/prefer-function-type": "error",
            "@typescript-eslint/prefer-includes": "error",
            "@typescript-eslint/prefer-literal-enum-member": ["error", {
                allowBitwiseExpressions: true
            }],
            "@typescript-eslint/prefer-nullish-coalescing": "error",
            "@typescript-eslint/prefer-optional-chain": "error",
            "@typescript-eslint/prefer-readonly": "warn",
            "@typescript-eslint/prefer-reduce-type-parameter": "error",
            "@typescript-eslint/promise-function-async": "error",
            "@typescript-eslint/require-array-sort-compare": "error",
            "@typescript-eslint/restrict-template-expressions": "error",
            "@typescript-eslint/strict-boolean-expressions": "error",
            "@typescript-eslint/use-unknown-in-catch-callback-variable": "error",

            // JSDoc rules
            "jsdoc/require-jsdoc": ["warn", {
                publicOnly: true
            }],
            "jsdoc/require-description": "error",
            "jsdoc/require-property-description": "error",
            "jsdoc/require-param-type": "off",
            "jsdoc/require-returns-type": "off",

            // Import rules
            "import-x/no-deprecated": "warn",
            "import-x/no-empty-named-blocks": "warn",
            "import-x/no-extraneous-dependencies": "warn",
            "import-x/no-mutable-exports": "error",
            "import-x/no-rename-default": "error",
            "import-x/no-unused-modules": "error",
            "import-x/no-amd": "error",
            "import-x/no-commonjs": "error",
            "import-x/no-import-module-exports": "error",
            "import-x/no-absolute-path": "error",
            "import-x/no-cycle": "error",
            "import-x/no-useless-path-segments": "error",
            "import-x/exports-last": "error",
            "import-x/first": "error",
            "import-x/max-dependencies": ["warn", {
                max: 20,
                ignoreTypeImports: true,
            }],
            "import-x/newline-after-import": "error",
            "import-x/no-anonymous-default-export": "error",
            "import-x/order": ["error", {
                groups: [
                    "builtin",
                    "external",
                    "internal",
                    "parent",
                    "sibling",
                    "index",
                    "object"
                ],
            }],
        },
    },
];

/**
 * Shared ESLint flat config for testing-library rules.
 * Applies to test files matching `**\/__tests__/*` and `**\/serviceWorker.ts`.
 *
 * @example
 * // eslint.config.js in consuming project:
 * import { commonConfig, testingConfig } from "@hwndmaster/atom-eslint-common";
 * export default [
 *   ...commonConfig,
 *   ...testingConfig,
 * ];
 */
export const testingConfig = [
    {
        files: ["**/__tests__/*", "**/serviceWorker.ts"],
        plugins: {
            "testing-library": testingLibrary,
        },
        rules: {
            // Testing-library rules
            "testing-library/await-async-events": "error",
            "testing-library/await-async-queries": "error",
            "testing-library/await-async-utils": "error",
            "testing-library/consistent-data-testid": [
                "error",
                {
                    // TODO: Cannot use `{fileName}` placeholder due to an error in the lib.
                    //       Ref: https://github.com/testing-library/eslint-plugin-testing-library/issues/782
                    //testIdPattern: "^{fileName}__([A-Z]+[a-z]+_?)+$", // Example: SideNav_ButtonGroup_Projects
                    testIdPattern: "^[A-Za-z]+__([A-Z]+[a-z]+_?)+$", // Example: SideNav_ButtonGroup_Projects
                    testIdAttribute: "data-testid"
                }
            ],
            "testing-library/no-debugging-utils": "error",
            "testing-library/no-dom-import": "error",
        }
    }
];
