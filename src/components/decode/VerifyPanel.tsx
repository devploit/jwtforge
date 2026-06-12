"use client";

import { useState } from "react";
import { algFamily, type DecodedJwt } from "@/lib/jwt";
import { verifySignature, type VerifyResult } from "@/lib/crypto";

export function VerifyPanel({ decoded }: { decoded: DecodedJwt }) {
  const alg = typeof decoded.header.alg === "string" ? decoded.header.alg : "";
  const family = algFamily(alg);
  const [keyMaterial, setKeyMaterial] = useState("");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [jwksUrl, setJwksUrl] = useState("");
  const [jwksStatus, setJwksStatus] = useState<string | null>(null);

  const isHmac = family === "HMAC";
  const placeholder = isHmac
    ? "HMAC secret (e.g. your-256-bit-secret)"
    : "Public key (PEM -----BEGIN PUBLIC KEY-----) or JWK JSON";

  async function runVerify(material: string) {
    setBusy(true);
    setResult(null);
    const res = await verifySignature(
      alg,
      decoded.raw.signingInput,
      decoded.raw.signature,
      material,
    );
    setResult(res);
    setBusy(false);
  }

  async function fetchJwks() {
    setJwksStatus(null);
    if (!jwksUrl.trim()) return;
    try {
      setJwksStatus("Fetching…");
      const res = await fetch(jwksUrl.trim(), { mode: "cors" });
      if (!res.ok) {
        setJwksStatus(`Fetch failed: HTTP ${res.status}`);
        return;
      }
      const json = (await res.json()) as {
        keys?: (JsonWebKey & { kid?: string })[];
      };
      const keys = json.keys ?? [];
      const kid = decoded.header.kid;
      const match =
        (typeof kid === "string" && keys.find((k) => k.kid === kid)) ||
        keys[0];
      if (!match) {
        setJwksStatus("No keys found in JWKS response.");
        return;
      }
      const jwkStr = JSON.stringify(match, null, 2);
      setKeyMaterial(jwkStr);
      setJwksStatus(
        `Loaded JWK (kid=${match.kid ?? "n/a"}). Now click Verify.`,
      );
    } catch (err) {
      setJwksStatus(
        `Fetch error (often CORS): ${
          err instanceof Error ? err.message : "unknown"
        }`,
      );
    }
  }

  return (
    <section className="panel space-y-3 p-4">
      <h3 className="text-sm font-semibold text-slate-100">
        Verify signature{" "}
        <span className="font-normal text-slate-500">
          ({alg || "no alg"})
        </span>
      </h3>

      {family === "none" ? (
        <p className="text-sm text-sev-med">
          Algorithm is <code>none</code> — there is no signature to verify.
        </p>
      ) : (
        <>
          <div>
            <label htmlFor="verify-key" className="label">
              {isHmac ? "Secret" : "Public key / JWK"}
            </label>
            <textarea
              id="verify-key"
              value={keyMaterial}
              onChange={(e) => setKeyMaterial(e.target.value)}
              rows={isHmac ? 2 : 5}
              spellCheck={false}
              placeholder={placeholder}
              className="field resize-y"
            />
          </div>

          {!isHmac && (
            <div className="rounded-md border border-line bg-bg-inset p-3">
              <label htmlFor="jwks-url" className="label">
                Or fetch from a JWKS URL
                <span className="ml-2 normal-case text-sev-med">
                  ⚠ leaves your browser
                </span>
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  id="jwks-url"
                  type="url"
                  value={jwksUrl}
                  onChange={(e) => setJwksUrl(e.target.value)}
                  placeholder="https://issuer.example/.well-known/jwks.json"
                  className="field flex-1"
                />
                <button
                  type="button"
                  className="btn"
                  onClick={fetchJwks}
                  disabled={!jwksUrl.trim()}
                >
                  Fetch keys
                </button>
              </div>
              <p className="mt-1.5 text-xs text-slate-500">
                This is the one optional outbound request in JWTForge. It fetches
                the JWKS from the URL you provide (client-side; may be blocked by
                CORS). Your token is never sent.
              </p>
              {jwksStatus && (
                <p className="mt-1.5 text-xs text-slate-300">{jwksStatus}</p>
              )}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="btn btn-accent"
              onClick={() => runVerify(keyMaterial)}
              disabled={busy || !keyMaterial.trim()}
            >
              {busy ? "Verifying…" : "Verify"}
            </button>
            {result && <ResultBadge result={result} />}
          </div>
        </>
      )}
    </section>
  );
}

function ResultBadge({ result }: { result: VerifyResult }) {
  const map = {
    verified: {
      text: "Signature verified ✓",
      cls: "border-green-500/40 bg-green-500/10 text-green-400",
    },
    failed: {
      text: "Signature does NOT match ✗",
      cls: "border-sev-high/40 bg-sev-high/10 text-sev-high",
    },
    unsupported: {
      text: "Can't verify",
      cls: "border-sev-info/40 bg-sev-info/10 text-sev-info",
    },
    error: {
      text: "Verification error",
      cls: "border-sev-med/40 bg-sev-med/10 text-sev-med",
    },
  } as const;
  const info = map[result.status];
  return (
    <span
      className={`inline-flex items-center rounded border px-2.5 py-1 text-sm font-semibold ${info.cls}`}
      title={"reason" in result ? result.reason : undefined}
    >
      {info.text}
      {"reason" in result ? `: ${result.reason}` : ""}
    </span>
  );
}
