import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: ["./setupTests.ts"],
    },
});
