import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  css: { postcss: { plugins: [] } },
  build: { outDir: "dist", emptyOutDir: true, sourcemap: false },
  server: { host: "0.0.0.0" },
});
