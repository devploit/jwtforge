"use client";

import { useToken } from "@/lib/token-context";
import { SAMPLES } from "@/lib/samples";

export function TokenInput({
  rows = 5,
  showSamples = true,
}: {
  rows?: number;
  showSamples?: boolean;
}) {
  const { token, setToken } = useToken();

  return (
    <div className="panel p-4">
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor="token-input" className="label mb-0">
          JWT
        </label>
        <div className="flex items-center gap-2">
          {token && (
            <button
              type="button"
              className="text-xs text-slate-400 hover:text-slate-100"
              onClick={() => setToken("")}
            >
              Clear
            </button>
          )}
        </div>
      </div>
      <textarea
        id="token-input"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        rows={rows}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        placeholder="Paste a JWT here — eyJhbGciOi..."
        className="field resize-y break-all"
        aria-describedby="token-help"
      />
      <p id="token-help" className="mt-1.5 text-xs text-slate-500">
        Pasted tokens stay in your browser (saved to localStorage so it
        persists across tabs). Nothing is sent anywhere.
      </p>
      {showSamples && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500">Try an example:</span>
          {SAMPLES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setToken(s.token)}
              title={s.description}
              className="btn px-2 py-1 text-xs"
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
