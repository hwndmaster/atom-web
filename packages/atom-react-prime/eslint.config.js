import { commonConfig } from "@hwndmaster/atom-eslint-common";
import { stylisticConfig } from "@hwndmaster/atom-eslint-stylistic";
import { reactConfig } from "@hwndmaster/atom-eslint-react";

export default [
    { ignores: ["dist/", "node_modules/", "**/*.config.ts", "setupTests.ts"] },
    ...commonConfig,
    ...stylisticConfig,
    ...reactConfig,
    {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            parserOptions: {
                project: "./tsconfig.eslint.json",
                tsconfigRootDir: import.meta.dirname,
            },
        },
        settings: { react: { version: "detect" } },
    },
];
