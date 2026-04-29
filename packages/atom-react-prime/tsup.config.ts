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
    esbuildPlugins: [
        // Compile SCSS modules with esbuild local-css loader so class mappings are emitted.
        sassPlugin({ filter: /\.module\.scss$/, type: "local-css" }),
        // Compile non-module SCSS into regular CSS output.
        sassPlugin({ filter: /\.scss$/, type: "css" }),
    ],
    external: [
        "react",
        "react-dom",
        "react-hook-form",
        "primereact",
        "@hwndmaster/atom-web-core",
        "@hwndmaster/atom-react-core",
    ],
});
