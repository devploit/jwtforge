"use client";

import { useState } from "react";
import type { DecodedJwt } from "@/lib/jwt";
import {
  DEFAULT_KID_PAYLOADS,
  generateKidInjection,
  type GeneratedToken,
  type KidPayloads,
} from "@/lib/attacks";
import type { ArtifactConfig } from "@/lib/artifacts";
import { GeneratedTokens } from "./GeneratedTokens";

export function KidInjectionPanel({
  decoded,
  config,
}: {
  decoded: DecodedJwt;
  config: ArtifactConfig;
}) {
  const [payloads, setPayloads] = useState<KidPayloads>(DEFAULT_KID_PAYLOADS);
  const [tokens, setTokens] = useState<GeneratedToken[]>([]);
  const [busy, setBusy] = useState(false);

  function set<K extends keyof KidPayloads>(key: K, value: string) {
    setPayloads((p) => ({ ...p, [key]: value }));
  }

  async function run() {
    setBusy(true);
    try {
      setTokens(await generateKidInjection(decoded, payloads));
    } finally {
      setBusy(false);
    }
  }

  const fields: { key: keyof KidPayloads; label: string }[] = [
    { key: "pathTraversal", label: "Path traversal" },
    { key: "sqli", label: "SQL injection" },
    { key: "commandInjection", label: "Command injection" },
  ];

  return (
    <div className="space-y-3">
      {fields.map((f) => (
        <div key={f.key}>
          <label htmlFor={`kid-${f.key}`} className="label">
            {f.label}
          </label>
          <input
            id={`kid-${f.key}`}
            className="field"
            value={payloads[f.key]}
            onChange={(e) => set(f.key, e.target.value)}
            spellCheck={false}
          />
        </div>
      ))}
      <button
        type="button"
        className="btn btn-accent"
        onClick={run}
        disabled={busy}
      >
        {busy ? "Generating…" : "Generate kid-injection tokens"}
      </button>
      <GeneratedTokens tokens={tokens} config={config} />
    </div>
  );
}
