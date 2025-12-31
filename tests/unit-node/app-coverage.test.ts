import { describe, it, expect } from "vitest";
import app from "../../src/app";

describe("App API Coverage", () => {
  it("should return invalid JSON error for malformed JSON", async () => {
    const req = new Request("http://localhost/api/calculate", {
      method: "POST",
      body: "{ invalid json ",
      headers: { "Content-Type": "application/json" },
    });

    const res = await app.fetch(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toEqual({ error: "INVALID_JSON", message: "Request body must be valid JSON" });
  });
});
