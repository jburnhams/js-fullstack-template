import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "../../frontend/src/App";

// We no longer use MSW. We rely on the global Miniflare instance running on port 8788.

describe("Integration: App with Miniflare", () => {
  it("calculates addition correctly using real Miniflare backend", async () => {
    render(<App />);

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
    // Use regular expression or exact match if it's unique, but strict mode might find multiple if ambiguous.
    // Given the failure was in browser test, let's check here too.
    // In integration test, getByText defaults to strict.
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

    expect(screen.getByText(/Division by zero/)).toBeInTheDocument();
  });
});
