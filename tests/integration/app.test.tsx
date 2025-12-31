import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, beforeAll, afterAll, afterEach } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { App } from "../../frontend/src/App";

// Helper to create a delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const handlers = [
  http.post("/api/calculate", async ({ request }) => {
    // Read the body to verify request format if needed
    const body = await request.json() as any;

    // Simulate processing delay
    await delay(50);

    if (body.operation === "add") {
       return HttpResponse.json({
         result: body.a + body.b,
         operation: "add",
         operands: { a: body.a, b: body.b },
       });
    }

    if (body.operation === "divide" && body.b === 0) {
        return HttpResponse.json(
            { error: "CALCULATION_ERROR", message: "Division by zero" },
            { status: 400 }
        );
    }

    return HttpResponse.json(
        { error: "INVALID_OPERATION", message: "Not implemented in mock" },
        { status: 400 }
    );
  }),
];

const server = setupServer(...handlers);

describe("Integration: App with MSW", () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it("calculates addition correctly using mocked backend", async () => {
    render(<App />);

    // Wait for app to load (if any initial load)

    const inputA = screen.getByLabelText(/First Number/i);
    const inputB = screen.getByLabelText(/Second Number/i);
    const submitBtn = screen.getByRole("button", { name: /Calculate/i });

    fireEvent.change(inputA, { target: { value: "10" } });
    fireEvent.change(inputB, { target: { value: "20" } });
    fireEvent.click(submitBtn);

    // Should show loading state
    expect(screen.getByText("Calculating...")).toBeInTheDocument();

    // Wait for result
    await waitFor(() => {
      expect(screen.getByText("Result")).toBeInTheDocument();
    });

    expect(screen.getByText("10 + 20 = 30")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
  });

  it("handles errors from backend", async () => {
    render(<App />);

    const inputA = screen.getByLabelText(/First Number/i);
    const inputB = screen.getByLabelText(/Second Number/i);
    const operationSelect = screen.getByLabelText(/Operation/i);
    const submitBtn = screen.getByRole("button", { name: /Calculate/i });

    fireEvent.change(inputA, { target: { value: "10" } });
    fireEvent.change(inputB, { target: { value: "0" } });
    fireEvent.change(operationSelect, { target: { value: "divide" } });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("Error")).toBeInTheDocument();
    });

    expect(screen.getByText("Division by zero")).toBeInTheDocument();
  });
});
