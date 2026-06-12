"use client";

import { useState } from "react";
import { useToken } from "@/lib/token-context";
import { SAMPLES } from "@/lib/samples";
import { JwtEditor } from "./JwtEditor";

export function TokenInput({
  rows = 5,
  showSamples = true,
}: {
  rows?: number;
  showSamples?: boolean;
}) {
  const { token, setToken } = useToken();
  const [linkCopied, setLinkCopied] = useState(false);

  async function copyShareLink() {
    try {
      const url = `${window.location.origin}/decode#t=${encodeURIComponent(token)}`;
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 1500);
    } catch {
      // clipboard blocked; ignore
    }
  }

  return (
    <div className="panel p-4">
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor="token-input" className="label mb-0">
          JWT
        </label>
        <div className="flex items-center gap-3">
          {token && (
            <button
              type="button"
              className="text-xs text-slate-400 transition-colors hover:text-accent"
              onClick={copyShareLink}
              title="Copy a shareable link with this token in the URL fragment (never sent to a server)"
            >
              {linkCopied ? "Link copied ✓" : "Copy link"}
            </button>
          )}
          {token && (
            <button
              type="button"
              className="text-xs text-slate-400 transition-colors hover:text-slate-100"
              onClick={() => setToken("")}
            >
              Clear
            </button>
          )}
        </div>
      </div>
      <JwtEditor
        id="token-input"
        value={token}
        onChange={setToken}
        rows={rows}
        ariaDescribedBy="token-help"
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
          <span className="mx-1 text-line">|</span>
          <button
            type="button"
            onClick={() =>
              // Unsigned HS256 starter: {"alg":"HS256","typ":"JWT"}.{}.
              setToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.")
            }
            title="Start from a blank HS256 template and build a token from scratch"
            className="btn px-2 py-1 text-xs"
          >
            + Start blank
          </button>
        </div>
      )}
    </div>
  );
}
