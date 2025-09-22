import { defineConfig, PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import FullReload from "vite-plugin-full-reload";
import fs from "fs";
import path from "path";
import fg from "fast-glob";

export default defineConfig({
  plugins: [
    react(),
    FullReload(["static/cards/**/*"]),
    ManifestPlugin(),
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

function ManifestPlugin(): PluginOption {
  return {
    name: "cards-manifest",
    apply: "build",  // only run in build
    async buildStart() {
      const cardDir = path.resolve(__dirname, "static/cards");
      const pattern = path.join(cardDir, "**/*.md").replace(/\\/g, "/");
      const files = await fg(pattern, { cwd: __dirname });

      files.forEach(f => this.info(f))
      // strip leading "static/" so paths match runtime URLs
      const cards = files.map(f => f.replace(__dirname + "/", "").replace(/^static\//, ""));
      cards.forEach(f => this.info(f))

      const manifest = { cards };
      const outPath = path.resolve(__dirname, "static/cards-manifest.json");

      fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2), "utf-8");
      this.info(`Generated manifests with ${cards.length} cards`);
    },
  };
}
