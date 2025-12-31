import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, afterAll } from "vitest";
import { Miniflare } from "miniflare";
import { build } from "esbuild";
import { setupServer } from "msw/node";
import { handlers } from "../mocks/handlers";

let mf: Miniflare;
export const server = setupServer(...handlers);

// Helper to find a free port
const getFreePort = async () => {
  const { createServer } = await import('net');
  return new Promise<number>((resolve, reject) => {
    const server = createServer();
    server.listen(0, () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      server.close(() => resolve(port));
    });
    server.on('error', reject);
  });
};

beforeAll(async () => {
  // Start MSW server
  server.listen();

  // Build the worker first
  await build({
    entryPoints: ["./src/worker.ts"],
    bundle: true,
    outfile: "./dist/test-worker.js",
    format: "esm",
    platform: "neutral",
  });

  const port = await getFreePort();

  mf = new Miniflare({
    modules: true,
    scriptPath: "./dist/test-worker.js",
    compatibilityDate: "2024-01-01",
    compatibilityFlags: ["nodejs_compat"],
    port: port,
  });

  await mf.ready;

  // Polyfill fetch to hit the Miniflare URL for relative paths
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    let url = input;
    if (typeof input === "string") {
       if (input.startsWith("/")) {
          url = `http://localhost:${port}${input}`;
       }
    } else if (input instanceof URL && input.pathname.startsWith("/")) {
       // Do nothing, let it flow? Or handle it.
    }

    return originalFetch(url, init);
  };
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

afterAll(async () => {
  if (mf) await mf.dispose();
  server.close();
});
