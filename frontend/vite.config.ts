import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

export default defineConfig({
  root: resolve(__dirname),
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: resolve(__dirname, "index.html"),
    },
  },
});
