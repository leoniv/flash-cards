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
  async function generate(plugin: PluginOption) {
    const cardDir = path.resolve(__dirname, "static/cards");
    const pattern = path.join(cardDir, "**/*.md").replace(/\\/g, "/");
    const files = await fg(pattern, { cwd: __dirname });

    files.forEach(f => plugin.info(f))
    const cards = files
      .map(f => f.replace(__dirname + "/", "").replace(/^static\//, ""))
      .map(card => {
        const id = card.replace(/^cards\//, "").replace(/\.md$/, "")
        const decks = id.split("/")
        const deck = decks.length > 1 ? decks[0] : "common"

        return {
          id,
          deck,
          path: card
        }
      });

    const manifest = { cards };
    const outPath = path.resolve(__dirname, "static/cards-manifest.json");

    fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2), "utf-8");
    plugin.info(`Generated manifests with ${cards.length} cards`);
  }
  return {
    name: "cards-manifest",
    async buildStart() { await generate(this) },
    configureServer(server) {
      const run = () => generate(this).then(() =>
        server.ws.send({ type: "full-reload" })
      );
      run();
      server.watcher.add("static/cards/**/*.md");
      server.watcher.on("add", (f) => /static\/cards\/.*\.md$/.test(f) && run());
      server.watcher.on("unlink", (f) => /static\/cards\/.*\.md$/.test(f) && run());
      server.watcher.on("change", (f) => /static\/cards\/.*\.md$/.test(f) && run());
    },
  };
}
