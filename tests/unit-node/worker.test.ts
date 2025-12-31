import { describe, expect, it } from "vitest";
import app from "../../src/worker";

// Mock global manifest/KV for Hono's serveStatic in Node environment
// This prevents "ReferenceError: __STATIC_CONTENT_MANIFEST is not defined"
(globalThis as any).__STATIC_CONTENT_MANIFEST = "{}";
(globalThis as any).__STATIC_CONTENT = {};

const dummyCtx = {
  waitUntil: () => {},
  passThroughOnException: () => {},
} as unknown as ExecutionContext;

const dummyEnv = {
    ASSETS: {
        fetch: async () => new Response("mock asset"),
    }
} as any;

describe("worker", () => {
  it("serves the frontend at root path", async () => {
    const request = new Request("https://worker.test/");
    const response = await app.fetch(request, dummyEnv, dummyCtx);
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("mock asset");
  });

  it("responds to health check", async () => {
    const request = new Request("https://worker.test/health");
    const response = await app.fetch(request, dummyEnv, dummyCtx);
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("ok");
  });

  it("returns 404 for unknown paths if asset not found", async () => {
     const notFoundEnv = {
        ASSETS: {
            fetch: async () => new Response("Not Found", { status: 404 }),
        }
     } as any;

    const apiRequest = new Request("https://worker.test/api/unknown");
    const apiResponse = await app.fetch(apiRequest, notFoundEnv, dummyCtx);
    expect(apiResponse.status).toBe(404);
  });

  describe("/api/calculate", () => {
    it("performs addition", async () => {
      const request = new Request("https://worker.test/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ a: 5, b: 3, operation: "add" }),
      });
      const response = await app.fetch(request, dummyEnv, dummyCtx);
      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result).toEqual({
        result: 8,
        operation: "add",
        operands: { a: 5, b: 3 },
      });
    });

    it("performs subtraction", async () => {
      const request = new Request("https://worker.test/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ a: 10, b: 4, operation: "subtract" }),
      });
      const response = await app.fetch(request, dummyEnv, dummyCtx);
      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result).toEqual({
        result: 6,
        operation: "subtract",
        operands: { a: 10, b: 4 },
      });
    });

    it("performs multiplication", async () => {
      const request = new Request("https://worker.test/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ a: 6, b: 7, operation: "multiply" }),
      });
      const response = await app.fetch(request, dummyEnv, dummyCtx);
      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result).toEqual({
        result: 42,
        operation: "multiply",
        operands: { a: 6, b: 7 },
      });
    });

    it("performs division", async () => {
      const request = new Request("https://worker.test/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ a: 10, b: 2, operation: "divide" }),
      });
      const response = await app.fetch(request, dummyEnv, dummyCtx);
      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result).toEqual({
        result: 5,
        operation: "divide",
        operands: { a: 10, b: 2 },
      });
    });

    it("returns error for division by zero", async () => {
      const request = new Request("https://worker.test/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ a: 10, b: 0, operation: "divide" }),
      });
      const response = await app.fetch(request, dummyEnv, dummyCtx);
      expect(response.status).toBe(400);
      const result = await response.json() as any;
      expect(result.error).toBe("CALCULATION_ERROR");
      expect(result.message).toContain("Division by zero");
    });

    it("serves frontend fallback for GET requests (SPA behavior)", async () => {
      const request = new Request("https://worker.test/api/calculate");
      const response = await app.fetch(request, dummyEnv, dummyCtx);
      expect(response.status).toBe(200);
      expect(await response.text()).toBe("mock asset");
    });

    it("returns error for invalid JSON", async () => {
      const request = new Request("https://worker.test/api/calculate", {
        method: "POST",
        body: "not json",
      });
      const response = await app.fetch(request, dummyEnv, dummyCtx);
      expect(response.status).toBe(400);
      const result = await response.json() as any;
      expect(result.error).toBe("INVALID_JSON");
    });

    it("returns error for missing operands", async () => {
      const request = new Request("https://worker.test/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ a: 5, operation: "add" }),
      });
      const response = await app.fetch(request, dummyEnv, dummyCtx);
      expect(response.status).toBe(400);
      const result = await response.json() as any;
      expect(result.error).toBe("INVALID_OPERANDS");
    });

    it("returns error for invalid operation", async () => {
      const request = new Request("https://worker.test/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ a: 5, b: 3, operation: "invalid" }),
      });
      const response = await app.fetch(request, dummyEnv, dummyCtx);
      expect(response.status).toBe(400);
      const result = await response.json() as any;
      expect(result.error).toBe("INVALID_OPERATION");
    });
  });
});
