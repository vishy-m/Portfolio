import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        financeWizard: resolve(__dirname, "project-finance-wizard.html"),
        enemyAi: resolve(__dirname, "project-enemy-ai.html"),
        aslTranslator: resolve(__dirname, "project-asl-translator.html"),
        bastionArtifact: resolve(__dirname, "project-bastion-artifact.html")
      }
    }
  }
});
