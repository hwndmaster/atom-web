import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import vitest from "@vitest/eslint-plugin";

/**
 * Shared ESLint flat config for React + testing rules.
 * Split into reactConfig (main files) and reactTestConfig (test overrides).
 * Testing-library rules are in testingConfig in atom-eslint-common.
 *
 * @example
 * import { reactConfig, reactTestConfig } from "@hwndmaster/atom-eslint-react";
 * import { testingConfig } from "@hwndmaster/atom-eslint-common";
 * export default [...commonConfig, ...stylisticConfig, ...reactConfig, ...reactTestConfig, ...testingConfig];
 */
export const reactConfig = [
    {
        files: ["**/*.ts", "**/*.tsx"],
        plugins: {
            react,
            vitest,
            "react-hooks": reactHooks,
        },
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2025,
                ...vitest.environments.env.globals,
                "React": "readonly",
                "JSX": "readonly",
            }
        },
        settings: { react: { version: "detect" } },
        rules: {
            // Vitest recommended
            ...vitest.configs.recommended.rules,

            // React rules
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn",

            "vitest/no-conditional-tests": "error",
        },
    },
    {
        files: ["**/store/**/sagas.ts"],
        rules: {
            "@typescript-eslint/promise-function-async": "off", // Saga generator functions yield promises without async/await
        }
    }
];

export const reactTestConfig = [
    {
        files: ["**/__tests__/*", "**/serviceWorker.ts"],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2025,
                ...vitest.environments.env.globals,
                "React": "readonly",
                "JSX": "readonly",
            }
        },
        rules: {
            "no-console": "off",
        }
    }
];
