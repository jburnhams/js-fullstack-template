import { Hono } from "hono";
import type { MiddlewareHandler } from "hono";
import app from "./app";

export interface Env {
  ASSETS: Fetcher;
}

const workerApp = new Hono<{ Bindings: Env }>();

// Custom serveStatic middleware for Workers Assets
function serveStatic(options: { root?: string; path?: string } = {}): MiddlewareHandler {
  return async (c, next) => {
    const env = c.env as any;
    if (!env.ASSETS) {
      // If no ASSETS binding, skip (or strictly speaking, we can't serve assets)
      return next();
    }

    const url = new URL(c.req.url);
    let request = c.req.raw;

    if (options.path) {
      // If a specific path is requested (e.g. rewrite to index.html)
      const newUrl = new URL(url);
      newUrl.pathname = options.path.startsWith("/") ? options.path : "/" + options.path;
      request = new Request(newUrl.toString(), c.req.raw);
    }

    let response = await env.ASSETS.fetch(request);

    // If the asset is not found, proceed to the next middleware (e.g. API routes or fallback)
    if (response.status === 404) {
      return next();
    }

    // If found, return the response
    // Clone it to ensure it's fresh? Usually not needed for Fetcher responses unless read.
    return new Response(response.body, response);
  };
}

// Mount the shared app
workerApp.route("/", app);

// Serve static assets
workerApp.use("/*", serveStatic());
// Fallback for SPA (serve index.html)
workerApp.get("/*", serveStatic({ path: "index.html" }));

export default workerApp;
