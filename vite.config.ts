import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import dts from "vite-plugin-dts";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({ tsconfigPath: "./tsconfig.dts.json", include: ["src"], exclude: ["src/stories/**", "src/**/*.stories.tsx"] }),
  ],
  resolve: { alias: { "@": resolve(__dirname, "src") } },
  build: {
    cssCodeSplit: true,
    lib: {
      // The CSS entry rides along so Tailwind emits dist/tendril.css next to the JS.
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        tendril: resolve(__dirname, "src/styles/tendril.css"),
      },
      formats: ["es", "cjs"],
      fileName: (format, name) => (format === "es" ? `${name}.js` : `${name}.cjs`),
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: { assetFileNames: "[name].[ext]" },
    },
  },
});
