import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import FullReload from "vite-plugin-full-reload";
export default defineConfig({
  plugins: [
    react(),
    FullReload(["static/cards/**/*.md"]),
  ],
  publicDir: "static",
  build: {
    outDir: "public",
    emptyOutDir: true
  },
  server: {
    port: 5173,
    open: true
  },
  base: "./"
});
