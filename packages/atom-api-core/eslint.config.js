import { commonConfig } from "@hwndmaster/atom-eslint-common";
import { stylisticConfig } from "@hwndmaster/atom-eslint-stylistic";

export default [
    { ignores: ["dist/", "node_modules/", "**/*.config.ts", "setupTests.ts"] },
    ...commonConfig,
    ...stylisticConfig,
    {
        files: ["**/*.ts"],
        languageOptions: {
            parserOptions: {
                project: "./tsconfig.eslint.json",
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
];
