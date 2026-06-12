"use client";

import { useEffect, useState } from "react";
import { algFamily, type DecodedJwt } from "@/lib/jwt";
import { generateTamperedToken, type GeneratedToken } from "@/lib/attacks";
import type { ArtifactConfig } from "@/lib/artifacts";
import { GeneratedTokens } from "./GeneratedTokens";

export function TamperPanel({
  decoded,
  config,
}: {
  decoded: DecodedJwt;
  config: ArtifactConfig;
}) {
  const [headerText, setHeaderText] = useState(decoded.headerJson);
  const [payloadText, setPayloadText] = useState(decoded.payloadJson);
  const [keyMaterial, setKeyMaterial] = useState("");
  const [tokens, setTokens] = useState<GeneratedToken[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setHeaderText(decoded.headerJson);
    setPayloadText(decoded.payloadJson);
  }, [decoded.headerJson, decoded.payloadJson]);

  const alg = (() => {
    try {
      const h = JSON.parse(headerText) as { alg?: unknown };
      return typeof h.alg === "string" ? h.alg : "none";
    } catch {
      return "none";
    }
  })();
  const family = algFamily(alg);
  const keyLabel =
    family === "HMAC"
      ? "HMAC secret"
      : family === "none"
        ? "No key needed (alg:none)"
        : "Private key (PEM / JWK)";

  async function run() {
    setError(null);
    setBusy(true);
    try {
      const header = JSON.parse(headerText) as Record<string, unknown>;
      const payload = JSON.parse(payloadText) as Record<string, unknown>;
      const result = await generateTamperedToken(header, payload, keyMaterial);
      setTokens([
        { label: result.signed ? "Re-signed" : "Unsigned", token: result.token, note: result.note },
      ]);
    } catch (err) {
      setError(
        err instanceof SyntaxError
          ? "Header or payload is not valid JSON."
          : err instanceof Error
            ? err.message
            : "Generation failed.",
      );
      setTokens([]);
    } finally {
      setBusy(false);
    }
  }

  function escalate() {
    try {
      const payload = JSON.parse(payloadText) as Record<string, unknown>;
      payload.role = "admin";
      payload.admin = true;
      payload.is_admin = true;
      setPayloadText(JSON.stringify(payload, null, 2));
    } catch {
      setError("Fix the payload JSON before applying escalation.");
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="tamper-header" className="label">
            Header
          </label>
          <textarea
            id="tamper-header"
            className="field min-h-[120px] resize-y text-seg-header"
            value={headerText}
            onChange={(e) => setHeaderText(e.target.value)}
            spellCheck={false}
          />
        </div>
        <div>
          <label htmlFor="tamper-payload" className="label">
            Payload
          </label>
          <textarea
            id="tamper-payload"
            className="field min-h-[120px] resize-y text-seg-payload"
            value={payloadText}
            onChange={(e) => setPayloadText(e.target.value)}
            spellCheck={false}
          />
        </div>
      </div>

      <button type="button" className="btn text-xs" onClick={escalate}>
        Quick-escalate: set role=admin, admin=true
      </button>

      {family !== "none" && (
        <div>
          <label htmlFor="tamper-key" className="label">
            {keyLabel}
          </label>
          <textarea
            id="tamper-key"
            className="field min-h-[60px] resize-y"
            value={keyMaterial}
            onChange={(e) => setKeyMaterial(e.target.value)}
            placeholder={
              family === "HMAC"
                ? "Secret (e.g. one recovered by brute-force)"
                : "Private key to sign with"
            }
            spellCheck={false}
          />
          <p className="mt-1 text-xs text-slate-500">
            Leave blank to emit an unsigned token (useful when the server
            doesn&apos;t verify signatures).
          </p>
        </div>
      )}

      <button
        type="button"
        className="btn btn-accent"
        onClick={run}
        disabled={busy}
      >
        {busy ? "Signing…" : "Generate tampered token"}
      </button>

      {error && <p className="text-sm text-sev-high">{error}</p>}
      <GeneratedTokens tokens={tokens} config={config} />
    </div>
  );
}
