import { useState } from "react";
import { Calculator } from "./components/Calculator";
import { ResultDisplay } from "./components/ResultDisplay";
import { BuildTimestampBadge } from "./components/BuildTimestampBadge";
import type { CalculationResult } from "./types";

export function App() {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string>("");

  const handleResult = (newResult: CalculationResult) => {
    setResult(newResult);
    setError("");
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    if (errorMessage) {
      setResult(null);
    }
  };

  return (
    <main className="max-w-[800px] mx-auto">
      <header className="mb-12 text-center">
        <h1 className="text-[2.5rem] mb-2 text-primary sm:text-[2rem]">Calculator App</h1>
        <p className="text-text-dim text-[1.1rem]">A simple calculator with a Cloudflare Worker backend.</p>
      </header>

      <section className="bg-surface border border-border rounded-lg p-6 mb-8">
        <h2 className="text-[1.5rem] mb-4 text-primary">Calculate</h2>
        <Calculator onResult={handleResult} onError={handleError} />
      </section>

      {error && (
        <section className="bg-error-bg border border-error-border rounded-lg p-6 mb-8">
          <h2 className="text-[1.5rem] mb-4 text-[#fca5a5]">Error</h2>
          <pre className="font-mono text-[0.9rem] whitespace-pre-wrap break-words text-[#fecaca]">{error}</pre>
        </section>
      )}

      {result && <ResultDisplay result={result} />}

      <footer className="text-center p-4 bg-transparent border-none">
        <BuildTimestampBadge />
      </footer>
    </main>
  );
}
