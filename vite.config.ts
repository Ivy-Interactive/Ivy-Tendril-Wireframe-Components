import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import dts from "vite-plugin-dts";
import { resolve } from "node:path";
import pkg from "./package.json" with { type: "json" };

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
        // Full stylesheet for consumers without Tailwind…
        tendril: resolve(__dirname, "src/styles/tendril.css"),
        // …and tokens only, for those who already run it.
        theme: resolve(__dirname, "src/styles/theme.css"),
      },
      formats: ["es", "cjs"],
      fileName: (format, name) => (format === "es" ? `${name}.js` : `${name}.cjs`),
    },
    rollupOptions: {
      // Everything in `dependencies` stays external. Bundling Radix or lucide
      // would give consumers a second copy — and a second React context, which
      // silently breaks portals and popovers.
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        ...Object.keys(pkg.dependencies ?? {}).map((name) => new RegExp(`^${name}(/.*)?$`)),
      ],
      output: { assetFileNames: "[name].[ext]" },
    },
  },
});
