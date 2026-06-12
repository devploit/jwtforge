"use client";

import { useEffect } from "react";

/**
 * Route-level error boundary. Keeps a runtime error from blanking the page —
 * shows a friendly recovery UI with a reset. Everything stays client-side, so
 * no error detail is reported anywhere.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface in the console for local debugging; never sent anywhere.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center">
      <p className="font-mono text-sm text-sev-high">
        <span className="text-slate-600">$</span> unexpected error
      </p>
      <h1 className="text-2xl font-bold text-slate-50">Something broke</h1>
      <p className="max-w-md text-slate-400">
        An unexpected error occurred in the browser. Your token never left the
        page. Try again, or reload — pasting a fresh token usually clears it.
      </p>
      <div className="flex flex-wrap justify-center gap-3 pt-1">
        <button type="button" className="btn btn-accent" onClick={reset}>
          Try again
        </button>
        <a href="/decode" className="btn">
          Back to Decode
        </a>
      </div>
    </div>
  );
}
