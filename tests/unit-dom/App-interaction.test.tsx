import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, afterEach } from "vitest";
import { App } from "../../frontend/src/App";

// Mock child components to isolate App testing
vi.mock("../../frontend/src/components/Calculator", () => ({
  Calculator: ({ onResult, onError }: any) => (
    <div data-testid="calculator">
      <button onClick={() => onResult({ result: 42, operation: "add", operands: { a: 20, b: 22 } })}>
        Trigger Result
      </button>
      <button onClick={() => onError("Some error happened")}>
        Trigger Error
      </button>
      <button onClick={() => onError("")}>
        Clear Error
      </button>
    </div>
  ),
}));

vi.mock("../../frontend/src/components/ResultDisplay", () => ({
  ResultDisplay: ({ result }: any) => (
    <div data-testid="result-display">Result: {result.result}</div>
  ),
}));

describe("App Interaction", () => {
  it("shows result when Calculator returns a result", () => {
    render(<App />);
    const triggerBtn = screen.getByText("Trigger Result");
    fireEvent.click(triggerBtn);
    expect(screen.getByTestId("result-display")).toBeInTheDocument();
  });

  it("shows error when Calculator returns an error", () => {
    render(<App />);
    const triggerErr = screen.getByText("Trigger Error");
    fireEvent.click(triggerErr);
    expect(screen.getByText("Some error happened")).toBeInTheDocument();
    // Result should be cleared if there was one (implied by code)
    expect(screen.queryByTestId("result-display")).not.toBeInTheDocument();
  });

  it("clears result when error occurs", () => {
      render(<App />);
      // First set a result
      fireEvent.click(screen.getByText("Trigger Result"));
      expect(screen.getByTestId("result-display")).toBeInTheDocument();

      // Then trigger error
      fireEvent.click(screen.getByText("Trigger Error"));
      expect(screen.getByText("Some error happened")).toBeInTheDocument();
      expect(screen.queryByTestId("result-display")).not.toBeInTheDocument();
  });

   it("clears error when Calculator clears error", () => {
      render(<App />);
      // First trigger error
      fireEvent.click(screen.getByText("Trigger Error"));
      expect(screen.getByText("Some error happened")).toBeInTheDocument();

      // Then clear error (e.g. new submission starts)
      fireEvent.click(screen.getByText("Clear Error"));
      expect(screen.queryByText("Some error happened")).not.toBeInTheDocument();
  });
});
