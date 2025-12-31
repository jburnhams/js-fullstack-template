import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, afterAll } from "vitest";
import { Miniflare } from "miniflare";
import { build } from "esbuild";
import { setupServer } from "msw/node";
import { handlers } from "../mocks/handlers";

let mf: Miniflare;
export const server = setupServer(...handlers);

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

  mf = new Miniflare({
    modules: true,
    scriptPath: "./dist/test-worker.js",
    compatibilityDate: "2024-01-01",
    compatibilityFlags: ["nodejs_compat"],
  });

  await mf.ready;

  // Polyfill fetch to hit the Miniflare via dispatchFetch for relative paths
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    let urlStr = typeof input === "string" ? input : input instanceof URL ? input.toString() : input instanceof Request ? input.url : "";

    // If it's a relative URL, assume it's for our backend
    if (urlStr.startsWith("/")) {
       const requestUrl = `http://localhost${urlStr}`;
       // We need to pass the body and headers from init
       return mf.dispatchFetch(requestUrl, init) as unknown as Promise<Response>;
    }

    // Also handle absolute localhost URLs if any
    if (urlStr.includes("localhost")) {
        return mf.dispatchFetch(urlStr, init) as unknown as Promise<Response>;
    }

    return originalFetch(input, init);
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
