import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, afterAll } from "vitest";
import { Miniflare } from "miniflare";
import { build } from "esbuild";

let mf: Miniflare;

beforeAll(async () => {
  // Build the worker first
  // We bundle everything.
  await build({
    entryPoints: ["./src/worker.ts"],
    bundle: true,
    outfile: "./dist/test-worker.js",
    format: "esm",
    platform: "neutral",
    // We mock/stub the assets fetcher in the worker if needed, or Miniflare handles it?
    // Miniflare 3 handles modules.
  });

  mf = new Miniflare({
    modules: true,
    scriptPath: "./dist/test-worker.js",
    compatibilityDate: "2024-01-01",
    compatibilityFlags: ["nodejs_compat"],
    port: 8788,
    // We don't provide ASSETS binding, so the worker will skip static serving logic.
    // This is fine for integration testing the API.
  });

  await mf.ready;

  // Polyfill fetch to hit the Miniflare URL for relative paths
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    let url = input;
    if (typeof input === "string" && input.startsWith("/")) {
      url = `http://localhost:8788${input}`;
    } else if (input instanceof URL && input.pathname.startsWith("/")) {
       // This condition is a bit loose, but assuming we construct URL with base in browser env
       // Actually HappyDOM might default to localhost or something.
       // Let's just catch string relatives which are common in React fetch("/api/...")
    }

    return originalFetch(url, init);
  };
});

afterEach(() => {
  cleanup();
});

afterAll(async () => {
  if (mf) await mf.dispose();
});
