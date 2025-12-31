import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    include: ["tests/integration/**/*.{test,spec}.tsx"],
    environment: "happy-dom",
    setupFiles: ["tests/integration/setup.ts"],
    globals: true,
  },
});
