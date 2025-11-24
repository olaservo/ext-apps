import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import { resolve } from "path";

// Get the entry from environment variable, default to ui-react
const uiPath = process.env.UI;

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    rollupOptions: {
      input: uiPath,
    },
    outDir: `dist`,
    emptyOutDir: false,
  },
});
