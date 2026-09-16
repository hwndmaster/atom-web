import { commonConfig } from "@hwndmaster/atom-eslint-common";
import { reactConfig } from "@hwndmaster/atom-eslint-react";
import { stylisticConfig } from "@hwndmaster/atom-eslint-stylistic";

export default [
    { ignores: ["dist/", "node_modules/", "**/*.config.ts"] },
    ...commonConfig,
    ...reactConfig,
    ...stylisticConfig,
    {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            parserOptions: {
                project: "./tsconfig.eslint.json",
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
];
