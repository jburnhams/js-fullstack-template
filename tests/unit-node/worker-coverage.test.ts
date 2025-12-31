import { describe, it, expect, vi } from "vitest";
import workerApp from "../../src/worker";

describe("Worker App Coverage", () => {
  it("should pass through when ASSETS binding is missing", async () => {
    // Mock environment without ASSETS
    const env = {};
    const req = new Request("http://localhost/some-asset");

    // We expect it to 404 because the app routes won't match "some-asset"
    // and the serveStatic middleware should call next() immediately if no ASSETS.
    const res = await workerApp.fetch(req, env);
    expect(res.status).toBe(404);
  });
});
