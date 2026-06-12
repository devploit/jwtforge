"use client";

import { useState } from "react";
import type { DecodedJwt } from "@/lib/jwt";
import { generateJwkInjection, type GeneratedToken } from "@/lib/attacks";
import type { ArtifactConfig } from "@/lib/artifacts";
import { GeneratedTokens } from "./GeneratedTokens";
import { CodeBlock } from "@/components/CodeBlock";

export function JwkInjectionPanel({
  decoded,
  config,
}: {
  decoded: DecodedJwt;
  config: ArtifactConfig;
}) {
  const [jkuUrl, setJkuUrl] = useState("https://attacker.example/jwks.json");
  const [tokens, setTokens] = useState<GeneratedToken[]>([]);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [publicJwk, setPublicJwk] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    try {
      const result = await generateJwkInjection(decoded, jkuUrl.trim());
      setTokens(result.tokens);
      setPrivateKey(result.privateKeyPem);
      setPublicJwk(
        JSON.stringify({ keys: [result.publicJwk] }, null, 2),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="jku-url" className="label">
          Attacker-hosted JWKS URL (for the jku variant)
        </label>
        <input
          id="jku-url"
          className="field"
          value={jkuUrl}
          onChange={(e) => setJkuUrl(e.target.value)}
          placeholder="https://attacker.example/jwks.json"
        />
      </div>
      <button
        type="button"
        className="btn btn-accent"
        onClick={run}
        disabled={busy}
      >
        {busy ? "Generating keypair…" : "Generate self-signed tokens + key"}
      </button>

      <GeneratedTokens tokens={tokens} config={config} />

      {publicJwk && (
        <div className="space-y-2">
          <p className="text-xs text-slate-400">
            Host this JWKS at your <code>jku</code> URL (the embedded-jwk token
            needs no hosting — it carries the key itself):
          </p>
          <CodeBlock
            code={publicJwk}
            title="jwks.json (public)"
            language="json"
            filename="jwks.json"
          />
        </div>
      )}
      {privateKey && (
        <div className="space-y-2">
          <p className="text-xs text-sev-med">
            Attacker private key — keep it to re-sign. Generated in your browser,
            never transmitted:
          </p>
          <CodeBlock
            code={privateKey}
            title="attacker private key (PKCS#8 PEM)"
            language="pem"
            filename="attacker-private-key.pem"
          />
        </div>
      )}
    </div>
  );
}
