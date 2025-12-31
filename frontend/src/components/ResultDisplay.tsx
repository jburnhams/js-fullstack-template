import type { CalculationResult } from "../types";

interface ResultDisplayProps {
  result: CalculationResult;
}

const OPERATION_SYMBOLS: Record<string, string> = {
  add: "+",
  subtract: "-",
  multiply: "×",
  divide: "÷",
};

export function ResultDisplay({ result }: ResultDisplayProps) {
  const symbol = OPERATION_SYMBOLS[result.operation] || result.operation;

  return (
    <section className="bg-result-bg border border-result-border rounded-lg p-6 mb-8">
      <h2 className="text-[1.5rem] mb-4 text-[#6ee7b7]">Result</h2>
      <div className="flex flex-col gap-4">
        <div className="text-[1.2rem] text-text">
          {result.operands.a} {symbol} {result.operands.b} = {result.result}
        </div>
        <div className="text-[2.5rem] font-bold text-[#6ee7b7] font-mono sm:text-[2rem]">{result.result}</div>
      </div>
    </section>
  );
}
