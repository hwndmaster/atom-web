import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    clean: true,
    splitting: false,
    external: [
        "axios",
        "axios-mock-adapter",
        "history",
        "react",
        "react-dom",
        "react-redux",
        "react-router-dom",
        "redux-saga",
        "vitest",
        "@testing-library/react",
        "@hwndmaster/atom-react-redux",
    ],
});
