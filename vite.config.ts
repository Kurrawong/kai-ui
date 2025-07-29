import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import { resolve } from "path";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import dts from "vite-plugin-dts";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [
        vue(),
        vueDevTools(),
        dts(),
        tailwindcss(),
    ],
    build: {
        sourcemap: true,
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            name: "kai-ui",
            fileName: "kai-ui",
            // fileName: (format, entryName) => {
            //     if (entryName === 'src/index') {
            //         return `kai-ui.${format === 'es' ? 'js' : 'cjs'}`;
            //     }
            //     return `${entryName}.${format === 'es' ? 'js' : 'cjs'}`;
            // },
            // formats: ['es', 'cjs'],
        },
        rollupOptions: {
            external: ["vue"],
            output: {
                globals: {
                    vue: "Vue"
                },
                inlineDynamicImports: true, // turn off chunking
                // preserveModules: true,
            }
        },
    },
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url))
        }
    },
    // ssr: {
    //     noExternal: ['to-px'],
    // },
});
