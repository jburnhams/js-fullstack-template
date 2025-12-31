import { useState } from "react";
import type { CalculationOperation, CalculationResult, ErrorResponse } from "../types";

interface CalculatorProps {
  onResult: (result: CalculationResult) => void;
  onError: (error: string) => void;
}

export function Calculator({ onResult, onError }: CalculatorProps) {
  const [operandA, setOperandA] = useState<string>("");
  const [operandB, setOperandB] = useState<string>("");
  const [operation, setOperation] = useState<CalculationOperation>("add");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onError("");

    const a = parseFloat(operandA);
    const b = parseFloat(operandB);

    if (isNaN(a) || isNaN(b)) {
      onError("Please enter valid numbers");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ a, b, operation }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as ErrorResponse;
        onError(errorData.message || "Calculation failed");
        return;
      }

      onResult(data as CalculationResult);
    } catch (err) {
      onError(`Network error: ${String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-[150px_1fr] gap-4 items-center sm:grid-cols-1">
        <label className="text-text-dim font-medium" htmlFor="operand-a">First Number:</label>
        <input
          id="operand-a"
          type="number"
          step="any"
          value={operandA}
          onChange={(e) => setOperandA(e.target.value)}
          required
          disabled={loading}
          className="p-2 bg-bg border border-border rounded text-text text-base focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      <div className="grid grid-cols-[150px_1fr] gap-4 items-center sm:grid-cols-1">
        <label className="text-text-dim font-medium" htmlFor="operation">Operation:</label>
        <select
          id="operation"
          value={operation}
          onChange={(e) => setOperation(e.target.value as CalculationOperation)}
          disabled={loading}
          className="p-2 bg-bg border border-border rounded text-text text-base focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="add">Add (+)</option>
          <option value="subtract">Subtract (-)</option>
          <option value="multiply">Multiply (×)</option>
          <option value="divide">Divide (÷)</option>
        </select>
      </div>

      <div className="grid grid-cols-[150px_1fr] gap-4 items-center sm:grid-cols-1">
        <label className="text-text-dim font-medium" htmlFor="operand-b">Second Number:</label>
        <input
          id="operand-b"
          type="number"
          step="any"
          value={operandB}
          onChange={(e) => setOperandB(e.target.value)}
          required
          disabled={loading}
          className="p-2 bg-bg border border-border rounded text-text text-base focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="py-3 px-6 bg-primary text-white border-none rounded text-base font-semibold cursor-pointer transition-colors mt-2 hover:not-disabled:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Calculating..." : "Calculate"}
      </button>
    </form>
  );
}
