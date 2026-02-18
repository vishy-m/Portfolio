import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { readdirSync } from "node:fs";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Dynamically discover all project-*.html files
const projectInputs = {};
readdirSync(__dirname)
  .filter((f) => /^project-.+\.html$/.test(f))
  .forEach((f) => {
    const key = f.replace(".html", "").replace(/-/g, "_");
    projectInputs[key] = resolve(__dirname, f);
  });

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        ...projectInputs,
      },
    },
  },
});
