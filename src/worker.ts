import { Hono } from "hono";
import type { MiddlewareHandler } from "hono";
import { createCalculationResult } from "./calculator";
import type { CalculationRequest, ErrorResponse } from "./types";

export interface Env {
  ASSETS: Fetcher;
}

const app = new Hono<{ Bindings: Env }>();

function isValidOperation(op: string): op is "add" | "subtract" | "multiply" | "divide" {
  return ["add", "subtract", "multiply", "divide"].includes(op);
}

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

app.post("/api/calculate", async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "INVALID_JSON", message: "Request body must be valid JSON" }, 400);
  }

  if (!body || typeof body !== "object") {
    return c.json({ error: "INVALID_REQUEST", message: "Request body must be an object" }, 400);
  }

  const payload = body as Record<string, unknown>;

  if (typeof payload.a !== "number" || typeof payload.b !== "number") {
    return c.json({ error: "INVALID_OPERANDS", message: "Both 'a' and 'b' must be numbers" }, 400);
  }

  if (typeof payload.operation !== "string" || !isValidOperation(payload.operation)) {
    return c.json({ error: "INVALID_OPERATION", message: "Operation must be one of: add, subtract, multiply, divide" }, 400);
  }

  try {
    const result = createCalculationResult(payload.a, payload.b, payload.operation);
    return c.json(result);
  } catch (error) {
    return c.json({ error: "CALCULATION_ERROR", message: String(error) }, 400);
  }
});

app.get("/health", (c) => c.text("ok"));

// Serve static assets
app.use("/*", serveStatic());
// Fallback for SPA (serve index.html)
app.get("/*", serveStatic({ path: "index.html" }));

export default app;
