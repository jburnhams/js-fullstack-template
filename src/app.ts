import { Hono } from "hono";
import { createCalculationResult } from "./calculator";

const app = new Hono();

function isValidOperation(op: string): op is "add" | "subtract" | "multiply" | "divide" {
  return ["add", "subtract", "multiply", "divide"].includes(op);
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

export default app;
