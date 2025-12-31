import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ResultDisplay } from "../../frontend/src/components/ResultDisplay";

describe("ResultDisplay", () => {
  it("renders addition result correctly", () => {
    const result = {
      result: 42,
      operation: "add" as const,
      operands: { a: 20, b: 22 },
    };
    render(<ResultDisplay result={result} />);
    expect(screen.getByText("Result")).toBeInTheDocument();
    expect(screen.getByText("20 + 22 = 42")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders multiplication result with correct symbol", () => {
    const result = {
      result: 100,
      operation: "multiply" as const,
      operands: { a: 10, b: 10 },
    };
    render(<ResultDisplay result={result} />);
    expect(screen.getByText("10 × 10 = 100")).toBeInTheDocument();
  });
});
