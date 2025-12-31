import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    include: ["tests/integration/**/*.{test,spec}.tsx"],
    environment: "happy-dom",
    setupFiles: ["tests/unit-dom/setup.ts"], // Reusing setup.ts from unit-dom as it likely has @testing-library/jest-dom
    globals: true,
  },
});
