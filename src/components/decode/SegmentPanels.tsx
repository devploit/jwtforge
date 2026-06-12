"use client";

import { useEffect, useMemo, useState } from "react";
import {
  algFamily,
  assembleToken,
  type DecodedJwt,
} from "@/lib/jwt";
import { stringToBase64Url } from "@/lib/base64url";
import { hmacSign } from "@/lib/crypto";
import { useToken } from "@/lib/token-context";

/**
 * The familiar three-panel JWT view, color-coded like jwt.io. Header and
 * payload are editable JSON; valid edits re-encode the token live. If the
 * algorithm is HMAC and a re-sign secret is supplied the token is re-signed,
 * otherwise the signature is dropped (and clearly labeled as unsigned).
 */
export function SegmentPanels({ decoded }: { decoded: DecodedJwt }) {
  const { setToken } = useToken();
  const [editing, setEditing] = useState(false);
  const [headerText, setHeaderText] = useState(decoded.headerJson);
  const [payloadText, setPayloadText] = useState(decoded.payloadJson);
  const [resignSecret, setResignSecret] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [reEncoded, setReEncoded] = useState<string | null>(null);

  // Reset editor buffers when a new token is decoded externally.
  useEffect(() => {
    setHeaderText(decoded.headerJson);
    setPayloadText(decoded.payloadJson);
    setReEncoded(null);
    setJsonError(null);
  }, [decoded.headerJson, decoded.payloadJson]);

  const alg = useMemo(
    () => (typeof decoded.header.alg === "string" ? decoded.header.alg : ""),
    [decoded.header.alg],
  );
  const isHmac = algFamily(alg) === "HMAC";

  async function reEncode(nextHeader: string, nextPayload: string, secret: string) {
    let headerObj: Record<string, unknown>;
    let payloadObj: Record<string, unknown>;
    try {
      headerObj = JSON.parse(nextHeader);
    } catch {
      setJsonError("Header is not valid JSON.");
      return;
    }
    try {
      payloadObj = JSON.parse(nextPayload);
    } catch {
      setJsonError("Payload is not valid JSON.");
      return;
    }
    setJsonError(null);
    const signingInput = `${stringToBase64Url(
      JSON.stringify(headerObj),
    )}.${stringToBase64Url(JSON.stringify(payloadObj))}`;

    const headerAlg =
      typeof headerObj.alg === "string" ? headerObj.alg : "";
    if (algFamily(headerAlg) === "HMAC" && secret) {
      const sig = await hmacSign(headerAlg, secret, signingInput);
      setReEncoded(assembleToken(signingInput, sig));
    } else {
      setReEncoded(assembleToken(signingInput, ""));
    }
  }

  function applyToToken() {
    if (reEncoded) setToken(reEncoded);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-100">Decoded</h2>
        <button
          type="button"
          className={`btn px-2 py-1 text-xs ${editing ? "btn-accent" : ""}`}
          onClick={() => setEditing((v) => !v)}
          aria-pressed={editing}
        >
          {editing ? "Editing — done" : "Edit & re-encode"}
        </button>
      </div>

      <Panel
        title="HEADER"
        subtitle="ALGORITHM & TOKEN TYPE"
        color="text-seg-header"
        ring="border-seg-header/30"
      >
        {editing ? (
          <textarea
            aria-label="Edit header JSON"
            className="field min-h-[120px] resize-y"
            value={headerText}
            onChange={(e) => {
              setHeaderText(e.target.value);
              void reEncode(e.target.value, payloadText, resignSecret);
            }}
            spellCheck={false}
          />
        ) : (
          <Json text={decoded.headerJson} color="text-seg-header" />
        )}
      </Panel>

      <Panel
        title="PAYLOAD"
        subtitle="DATA / CLAIMS"
        color="text-seg-payload"
        ring="border-seg-payload/30"
      >
        {editing ? (
          <textarea
            aria-label="Edit payload JSON"
            className="field min-h-[160px] resize-y"
            value={payloadText}
            onChange={(e) => {
              setPayloadText(e.target.value);
              void reEncode(headerText, e.target.value, resignSecret);
            }}
            spellCheck={false}
          />
        ) : (
          <Json text={decoded.payloadJson} color="text-seg-payload" />
        )}
      </Panel>

      <Panel
        title="SIGNATURE"
        subtitle={alg ? `${alg}` : "—"}
        color="text-seg-sig"
        ring="border-seg-sig/30"
      >
        <p className="break-all font-mono text-xs text-seg-sig">
          {decoded.raw.signature || (
            <span className="text-slate-500">(empty — unsigned)</span>
          )}
        </p>
      </Panel>

      {editing && (
        <div className="panel space-y-3 p-4">
          {isHmac && (
            <div>
              <label htmlFor="resign-secret" className="label">
                Re-sign secret (HMAC) — optional
              </label>
              <input
                id="resign-secret"
                className="field"
                value={resignSecret}
                placeholder="Leave blank to produce an unsigned token"
                onChange={(e) => {
                  setResignSecret(e.target.value);
                  void reEncode(headerText, payloadText, e.target.value);
                }}
              />
            </div>
          )}
          {jsonError && <p className="text-sm text-sev-high">{jsonError}</p>}
          {reEncoded && !jsonError && (
            <div className="space-y-2">
              <p className="text-xs text-slate-400">
                Re-encoded token{" "}
                {reEncoded.endsWith(".") ? (
                  <span className="text-sev-med">(unsigned)</span>
                ) : (
                  <span className="text-green-400">(re-signed)</span>
                )}
                :
              </p>
              <p className="break-all rounded-md border border-line bg-bg-inset p-2 font-mono text-xs text-slate-200">
                {reEncoded}
              </p>
              <button type="button" className="btn btn-accent" onClick={applyToToken}>
                Load this token
              </button>
              {!isHmac && (
                <p className="text-xs text-slate-500">
                  {alg} is asymmetric — re-signing needs a private key. Use the{" "}
                  <a href="/attack" className="text-accent hover:underline">
                    Attack tab&apos;s claim-tampering
                  </a>{" "}
                  generator to re-sign with a key.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Panel({
  title,
  subtitle,
  color,
  ring,
  children,
}: {
  title: string;
  subtitle: string;
  color: string;
  ring: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`panel border-l-2 ${ring} p-4`}>
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className={`text-xs font-bold uppercase tracking-wider ${color}`}>
          {title}
        </h3>
        <span className="text-[10px] uppercase tracking-wider text-slate-500">
          {subtitle}
        </span>
      </div>
      {children}
    </section>
  );
}

function Json({ text, color }: { text: string; color: string }) {
  return (
    <pre className={`overflow-x-auto font-mono text-xs leading-relaxed ${color}`}>
      <code>{text}</code>
    </pre>
  );
}
