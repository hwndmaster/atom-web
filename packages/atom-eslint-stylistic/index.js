import stylistic from "@stylistic/eslint-plugin";

/**
 * Shared ESLint flat config for stylistic rules.
 * Includes: indent (4 spaces), quotes (double), brace-style, semi, naming-convention.
 * Extend this after commonConfig in your eslint.config.js.
 *
 * @example
 * import { stylisticConfig } from "@hwndmaster/atom-eslint-stylistic";
 * export default [...commonConfig, ...stylisticConfig, ...reactConfig];
 */
export const stylisticConfig = [
    {
        files: ["**/*.ts", "**/*.tsx"],
        plugins: {
            "@stylistic": stylistic,
        },
        rules: {
            "indent": ["error", 4, { "SwitchCase": 1 }],
            "quotes": ["error", "double"],
            "@stylistic/brace-style": ["error", "1tbs", { "allowSingleLine": true }],
            "@stylistic/no-extra-semi": "error",
            "@stylistic/semi": ["error", "always"],
            "@stylistic/member-delimiter-style": "error",
            "@stylistic/operator-linebreak": ["error", "before"],

            // Naming conventions
            "@typescript-eslint/naming-convention": ["error",
                {
                    "selector": "default",
                    "format": ["camelCase"]
                },
                {
                    "selector": "variable",
                    "format": ["camelCase", "PascalCase"]
                },
                {
                    "selector": "variable",
                    "modifiers": ["global"],
                    "format": ["camelCase", "PascalCase"]
                },
                {
                    "selector": "objectLiteralProperty",
                    "format": null // to allow dashes in the names, such as `data-testid` or `area-label`
                },
                {
                    "selector": "parameter",
                    "format": ["camelCase"],
                    "leadingUnderscore": "allow"
                },
                {
                    "selector": "parameterProperty",
                    "format": ["camelCase"],
                    "leadingUnderscore": "allow"
                },
                {
                    "selector": "property",
                    "filter": {
                        regex: "^VITE_.+",
                        match: true
                    },
                    "format": ["UPPER_CASE"]
                },
                {
                    "selector": "typeLike",
                    "format": ["PascalCase"]
                },
                {
                    "selector": "enumMember",
                    "format": ["PascalCase"]
                },
                {
                    "selector": "typeParameter",
                    "format": ["PascalCase"],
                    "prefix": ["T"]
                },
                {
                    "selector": "import",
                    "format": null
                },
                {
                    "selector": "interface",
                    "format": ["PascalCase"],
                    "custom": {
                        "regex": "^I[A-Z]", // Don't allow I prefix for interfaces
                        "match": false
                    }
                },
                {
                    "selector": "variable",
                    "types": ["boolean"],
                    "format": ["PascalCase"],
                    "prefix": ["is", "Is", "should", "Should", "has", "Has", "can", "Can", "does", "Does", "did", "Did", "will", "Will"]
                },
                {
                    "selector": "property",
                    "modifiers": ["readonly"],
                    "format": ["camelCase"],
                    "leadingUnderscore": "requireDouble",
                    "filter": {
                        "regex": "^__brand$",
                        "match": true
                    }
                },
            ],
        },
    },
];
