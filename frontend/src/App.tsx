import { useState, useEffect } from "react";
import { Calculator } from "./components/Calculator";
import { ResultDisplay } from "./components/ResultDisplay";
import { BuildTimestampBadge } from "./components/BuildTimestampBadge";
import type { CalculationResult, User, AuthErrorResponse, Session } from "./types";

export function App() {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("https://storage.jonathanburnhams.com/api/session", {
            credentials: 'include'
        });

        if (response.ok) {
          const sessionData: Session = await response.json();
          setUser(sessionData.user);
        } else if (response.status === 401) {
          const errorData: AuthErrorResponse = await response.json();
          if (errorData.login_url) {
            // Redirect to login
            const currentUrl = window.location.href;
            const redirectUrl = new URL(errorData.login_url);
            redirectUrl.searchParams.set('redirect_url', currentUrl);
            window.location.href = redirectUrl.toString();
          }
        }
      } catch (err) {
        console.error("Session check failed:", err);
      }
    };

    checkSession();
  }, []);

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
      <header className="mb-12 text-center relative">
        {user && (
          <div className="absolute top-0 right-0 text-sm text-text-dim flex items-center gap-2">
            {user.profile_picture && (
               <img src={user.profile_picture} alt={user.name} className="w-8 h-8 rounded-full" />
            )}
            <div className="text-right">
              <div className="font-semibold">{user.name}</div>
              <div className="text-xs">{user.email}</div>
            </div>
          </div>
        )}
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
