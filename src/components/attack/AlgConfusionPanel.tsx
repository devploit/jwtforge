"use client";

import { useState } from "react";
import type { DecodedJwt } from "@/lib/jwt";
import { generateAlgConfusion, type GeneratedToken } from "@/lib/attacks";
import type { ArtifactConfig } from "@/lib/artifacts";
import { GeneratedTokens } from "./GeneratedTokens";

export function AlgConfusionPanel({
  decoded,
  config,
}: {
  decoded: DecodedJwt;
  config: ArtifactConfig;
}) {
  const [publicKey, setPublicKey] = useState("");
  const [hmacAlg, setHmacAlg] = useState<"HS256" | "HS384" | "HS512">("HS256");
  const [tokens, setTokens] = useState<GeneratedToken[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run() {
    setError(null);
    setBusy(true);
    try {
      const result = await generateAlgConfusion(decoded, publicKey, hmacAlg);
      setTokens(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed.");
      setTokens([]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="confusion-pubkey" className="label">
          Server&apos;s RSA/EC public key (PEM)
        </label>
        <textarea
          id="confusion-pubkey"
          className="field min-h-[120px] resize-y"
          value={publicKey}
          onChange={(e) => setPublicKey(e.target.value)}
          placeholder={"-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A...\n-----END PUBLIC KEY-----"}
          spellCheck={false}
        />
        <p className="mt-1 text-xs text-slate-500">
          The public key is not secret. This re-signs the token as HMAC using
          the key text as the secret — the classic RS→HS confusion attack.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <select
          aria-label="Target HMAC algorithm"
          className="field w-auto"
          value={hmacAlg}
          onChange={(e) =>
            setHmacAlg(e.target.value as "HS256" | "HS384" | "HS512")
          }
        >
          <option value="HS256">HS256</option>
          <option value="HS384">HS384</option>
          <option value="HS512">HS512</option>
        </select>
        <button
          type="button"
          className="btn btn-accent"
          onClick={run}
          disabled={busy || !publicKey.trim()}
        >
          {busy ? "Generating…" : "Generate confused token"}
        </button>
      </div>
      {error && <p className="text-sm text-sev-high">{error}</p>}
      <GeneratedTokens tokens={tokens} config={config} />
    </div>
  );
}
