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
        "react",
        "react-dom",
        "react-hook-form",
        "react-redux",
        "@reduxjs/toolkit",
        "react-router-dom",
        "zod",
        "@hwndmaster/atom-web-core",
    ],
});
