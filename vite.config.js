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

// Determine base URL for GitHub Pages
// GITHUB_REPOSITORY is automatically populated by Actions, e.g., "VishruthM/portfolio"
const repo = process.env.GITHUB_REPOSITORY;
// If repo exists and doesn't end in .github.io, we need a subpath base.
const isUserSite = repo && repo.endsWith(".github.io");
const matchedPath = repo && !isUserSite ? `/${repo.split("/")[1]}/` : "/";

export default defineConfig({
  base: matchedPath,
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        ...projectInputs,
      },
    },
  },
});
