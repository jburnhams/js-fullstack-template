import { describe, it, expect } from "vitest";
import { calculate } from "../../src/calculator";
import { CalculationOperation } from "../../src/types";

describe("Calculator Coverage", () => {
  it("should throw error for unknown operation", () => {
    expect(() => calculate(1, 2, "unknown" as CalculationOperation)).toThrow("Unknown operation: unknown");
  });
});
