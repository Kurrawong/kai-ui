import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url"
import { resolve } from "path";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import dts from "vite-plugin-dts";
import tailwindcss from "@tailwindcss/vite";
// import monacoEditorPlugin from "vite-plugin-monaco-editor-esm";

export default defineConfig({
    plugins: [
        vue(),
        vueDevTools(),
        dts(),
        tailwindcss(),
        // monacoEditorPlugin(),
    ],
    build: {
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            name: "kai-ui",
            fileName: "kai-ui"
        },
        rollupOptions: {
            external: ["vue"],
            output: {
                globals: {
                    vue: "Vue"
                },
                inlineDynamicImports: true, // turn off chunking
            }
        }
    },
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url))
        }
    }
});
