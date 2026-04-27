import { defineConfig } from "tsup";
import { sassPlugin } from "esbuild-sass-plugin";

export default defineConfig({
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    clean: true,
    splitting: false,
    injectStyle: true,
    esbuildPlugins: [sassPlugin({ type: "css" })],
    external: [
        "@reduxjs/toolkit",
        "axios",
        "react",
        "react-dom",
        "react-redux",
        "redux",
        "redux-persist",
        "redux-saga",
        "@hwndmaster/atom-web-core",
        "@hwndmaster/atom-api-core",
        "@hwndmaster/atom-react-core",
    ],
});
