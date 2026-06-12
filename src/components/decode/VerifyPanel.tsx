"use client";

import { useEffect, useRef, useState } from "react";
import { algFamily, type DecodedJwt } from "@/lib/jwt";
import { verifySignature, type VerifyResult } from "@/lib/crypto";

export function VerifyPanel({
  decoded,
  keyMaterial,
  onKeyChange,
  secretBase64Url,
  onSecretBase64UrlChange,
}: {
  decoded: DecodedJwt;
  keyMaterial: string;
  onKeyChange: (v: string) => void;
  secretBase64Url: boolean;
  onSecretBase64UrlChange: (v: boolean) => void;
}) {
  const alg = typeof decoded.header.alg === "string" ? decoded.header.alg : "";
  const family = algFamily(alg);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [jwksUrl, setJwksUrl] = useState("");
  const [jwksStatus, setJwksStatus] = useState<string | null>(null);
  const reqId = useRef(0);

  const isHmac = family === "HMAC";
  const placeholder = isHmac
    ? "HMAC secret (e.g. your-256-bit-secret)"
    : "Public key (PEM -----BEGIN PUBLIC KEY-----) or JWK JSON";

  // Live verification: re-runs (debounced) whenever the token, key, or the
  // base64url toggle changes — no button, like jwt.io but immediate.
  useEffect(() => {
    if (family === "none") {
      setResult(null);
      return;
    }
    if (!keyMaterial.trim()) {
      setResult(null);
      return;
    }
    const id = ++reqId.current;
    const handle = setTimeout(async () => {
      const res = await verifySignature(
        alg,
        decoded.raw.signingInput,
        decoded.raw.signature,
        keyMaterial,
        { secretBase64Url: isHmac && secretBase64Url },
      );
      // Ignore stale results from earlier keystrokes.
      if (id === reqId.current) setResult(res);
    }, 180);
    return () => clearTimeout(handle);
  }, [
    alg,
    family,
    isHmac,
    keyMaterial,
    secretBase64Url,
    decoded.raw.signingInput,
    decoded.raw.signature,
  ]);

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
        (typeof kid === "string" && keys.find((k) => k.kid === kid)) || keys[0];
      if (!match) {
        setJwksStatus("No keys found in JWKS response.");
        return;
      }
      onKeyChange(JSON.stringify(match, null, 2));
      setJwksStatus(`Loaded JWK (kid=${match.kid ?? "n/a"}).`);
    } catch (err) {
      setJwksStatus(
        `Fetch error (often CORS): ${err instanceof Error ? err.message : "unknown"}`,
      );
    }
  }

  return (
    <section className="panel space-y-3 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-100">
          Verify signature
        </h3>
        <span className="font-mono text-xs text-slate-500">{alg || "no alg"}</span>
      </div>

      <VerifyBanner family={family} hasKey={!!keyMaterial.trim()} result={result} />

      {family !== "none" && (
        <>
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="verify-key" className="label">
                {isHmac ? "Secret" : "Public key / JWK"}
              </label>
              {isHmac && (
                <label className="mb-1.5 flex cursor-pointer items-center gap-1.5 text-xs text-slate-400">
                  <input
                    type="checkbox"
                    checked={secretBase64Url}
                    onChange={(e) => onSecretBase64UrlChange(e.target.checked)}
                    className="accent-accent"
                  />
                  secret is base64url-encoded
                </label>
              )}
            </div>
            <textarea
              id="verify-key"
              value={keyMaterial}
              onChange={(e) => onKeyChange(e.target.value)}
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
                The one optional outbound request in JWTForge. It fetches the
                JWKS from the URL you provide (client-side; may be blocked by
                CORS). Your token is never sent.
              </p>
              {jwksStatus && (
                <p className="mt-1.5 text-xs text-slate-300">{jwksStatus}</p>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}

function VerifyBanner({
  family,
  hasKey,
  result,
}: {
  family: ReturnType<typeof algFamily>;
  hasKey: boolean;
  result: VerifyResult | null;
}) {
  if (family === "none") {
    return (
      <Banner tone="warn" icon="!">
        Algorithm is <code className="mx-1">none</code> — there is no signature
        to verify.
      </Banner>
    );
  }
  if (!hasKey) {
    return (
      <Banner tone="idle" icon="○">
        Enter a {family === "HMAC" ? "secret" : "public key / JWK"} to verify the
        signature.
      </Banner>
    );
  }
  if (!result) {
    return (
      <Banner tone="idle" icon="…">
        Verifying…
      </Banner>
    );
  }
  if (result.status === "verified") {
    return (
      <Banner tone="ok" icon="✓">
        <strong>Signature verified.</strong> This token is authentic for the
        supplied key.
      </Banner>
    );
  }
  if (result.status === "failed") {
    return (
      <Banner tone="bad" icon="✗">
        <strong>Invalid signature.</strong> The token does not match this key.
      </Banner>
    );
  }
  return (
    <Banner tone="warn" icon="!">
      {"reason" in result ? result.reason : "Can't verify with this input."}
    </Banner>
  );
}

const TONES = {
  ok: "border-green-500/40 bg-green-500/10 text-green-300",
  bad: "border-sev-high/40 bg-sev-high/10 text-sev-high",
  warn: "border-sev-med/40 bg-sev-med/10 text-sev-med",
  idle: "border-line bg-bg-inset/60 text-slate-400",
} as const;

function Banner({
  tone,
  icon,
  children,
}: {
  tone: keyof typeof TONES;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="status"
      className={`flex items-center gap-2.5 rounded-lg border px-3.5 py-3 text-[15px] ${TONES[tone]}`}
    >
      <span className="font-mono text-base leading-none" aria-hidden="true">
        {icon}
      </span>
      <span>{children}</span>
    </div>
  );
}
