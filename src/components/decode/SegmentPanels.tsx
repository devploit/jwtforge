"use client";

import { useEffect, useRef, useState } from "react";
import { algFamily, type DecodedJwt } from "@/lib/jwt";
import { base64UrlToBytes, stringToBase64Url } from "@/lib/base64url";
import { hmacSign } from "@/lib/crypto";
import { useToken } from "@/lib/token-context";
import { CopyButton } from "@/components/CopyButton";
import { JsonEditor } from "@/components/JsonEditor";

/**
 * The familiar three-panel JWT view, color-coded like jwt.io — but the header
 * and payload are ALWAYS live-editable. Editing a claim re-encodes the token
 * instantly and (when the algorithm is HMAC and a secret is present in the
 * verify box) re-signs it, so the highlighted token and the signature status
 * update in real time. Two-way binding without a mode toggle.
 */
export function SegmentPanels({
  decoded,
  keyMaterial,
  secretBase64Url,
}: {
  decoded: DecodedJwt;
  keyMaterial: string;
  secretBase64Url: boolean;
}) {
  const { token, setToken } = useToken();
  const [headerText, setHeaderText] = useState(decoded.headerJson);
  const [payloadText, setPayloadText] = useState(decoded.payloadJson);
  const [errors, setErrors] = useState<{ header?: boolean; payload?: boolean }>({});
  const lastEmitted = useRef<string | null>(null);

  const alg = typeof decoded.header.alg === "string" ? decoded.header.alg : "";

  // Re-seed the editors only when the token changes from OUTSIDE this component
  // (paste, example, brute-force fill) — never from our own re-encode, so the
  // caret never jumps while typing a claim.
  useEffect(() => {
    if (token === lastEmitted.current) return;
    setHeaderText(decoded.headerJson);
    setPayloadText(decoded.payloadJson);
    setErrors({});
  }, [token, decoded.headerJson, decoded.payloadJson]);

  async function reEncode(nextHeader: string, nextPayload: string) {
    let headerObj: Record<string, unknown> | undefined;
    let payloadObj: Record<string, unknown> | undefined;
    const nextErrors: { header?: boolean; payload?: boolean } = {};
    try {
      headerObj = JSON.parse(nextHeader);
    } catch {
      nextErrors.header = true;
    }
    try {
      payloadObj = JSON.parse(nextPayload);
    } catch {
      nextErrors.payload = true;
    }
    setErrors(nextErrors);
    if (!headerObj || !payloadObj) return;

    const signingInput = `${stringToBase64Url(
      JSON.stringify(headerObj),
    )}.${stringToBase64Url(JSON.stringify(payloadObj))}`;
    const headerAlg = typeof headerObj.alg === "string" ? headerObj.alg : "";
    const family = algFamily(headerAlg);

    let signature = decoded.raw.signature; // keep current unless we can re-sign
    if (family === "none") {
      signature = "";
    } else if (family === "HMAC" && keyMaterial.trim()) {
      const secret = secretBase64Url
        ? base64UrlToBytes(keyMaterial)
        : keyMaterial;
      signature = await hmacSign(headerAlg, secret, signingInput);
    }

    const newToken = `${signingInput}.${signature}`;
    lastEmitted.current = newToken;
    setToken(newToken);
  }

  function onHeaderChange(v: string) {
    setHeaderText(v);
    void reEncode(v, payloadText);
  }
  function onPayloadChange(v: string) {
    setPayloadText(v);
    void reEncode(headerText, v);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-100">Decoded</h2>
        <span className="text-xs text-slate-500">edit any field to re-encode</span>
      </div>

      <EditablePanel
        title="HEADER"
        subtitle="ALGORITHM & TOKEN TYPE"
        color="text-seg-header"
        ring="border-seg-header/40"
        value={headerText}
        onChange={onHeaderChange}
        error={errors.header}
        minH="min-h-[110px]"
      />

      <EditablePanel
        title="PAYLOAD"
        subtitle="DATA / CLAIMS"
        color="text-seg-payload"
        ring="border-seg-payload/40"
        value={payloadText}
        onChange={onPayloadChange}
        error={errors.payload}
        minH="min-h-[170px]"
        toolbar={
          <ClaimQuickTools
            payloadText={payloadText}
            onChange={onPayloadChange}
          />
        }
      />

      <section className="panel border-l-2 border-seg-sig/40 p-4">
        <div className="mb-2 flex items-baseline justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-seg-sig">
            SIGNATURE
          </h3>
          <span className="text-[10px] uppercase tracking-wider text-slate-500">
            {alg || "—"}
          </span>
        </div>
        <p className="break-all font-mono text-sm text-seg-sig">
          {decoded.raw.signature || (
            <span className="text-slate-500">(empty — unsigned)</span>
          )}
        </p>
      </section>
    </div>
  );
}

function EditablePanel({
  title,
  subtitle,
  color,
  ring,
  value,
  onChange,
  error,
  minH,
  toolbar,
}: {
  title: string;
  subtitle: string;
  color: string;
  ring: string;
  value: string;
  onChange: (v: string) => void;
  error?: boolean;
  minH: string;
  toolbar?: React.ReactNode;
}) {
  return (
    <section className={`panel border-l-2 ${ring} p-4`}>
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className={`text-xs font-bold uppercase tracking-wider ${color}`}>
          {title}
        </h3>
        <div className="flex items-center gap-2">
          {error && (
            <span className="text-[10px] font-medium uppercase text-sev-high">
              invalid JSON
            </span>
          )}
          <span className="text-[10px] uppercase tracking-wider text-slate-500">
            {subtitle}
          </span>
          <CopyButton text={value} />
        </div>
      </div>
      <JsonEditor
        ariaLabel={`Edit ${title.toLowerCase()} JSON`}
        value={value}
        onChange={onChange}
        minHeightClass={minH}
        error={error}
      />
      {toolbar}
    </section>
  );
}

const HOUR = 3600;
const DAY = 86400;

/** Quick-set buttons for time claims — edits the payload JSON in place. */
function ClaimQuickTools({
  payloadText,
  onChange,
}: {
  payloadText: string;
  onChange: (v: string) => void;
}) {
  function patch(mut: (p: Record<string, unknown>, nowSec: number) => void) {
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(payloadText);
    } catch {
      return; // invalid JSON — ignore until it parses
    }
    const nowSec = Math.floor(Date.now() / 1000);
    mut(payload, nowSec);
    onChange(JSON.stringify(payload, null, 2));
  }

  const tools: { label: string; title: string; run: () => void }[] = [
    { label: "iat = now", title: "Set issued-at to now", run: () => patch((p, n) => (p.iat = n)) },
    { label: "exp +1h", title: "Set expiry to 1 hour from now", run: () => patch((p, n) => (p.exp = n + HOUR)) },
    { label: "exp +1d", title: "Set expiry to 1 day from now", run: () => patch((p, n) => (p.exp = n + DAY)) },
    { label: "exp +30d", title: "Set expiry to 30 days from now", run: () => patch((p, n) => (p.exp = n + 30 * DAY)) },
    { label: "nbf = now", title: "Set not-before to now", run: () => patch((p, n) => (p.nbf = n)) },
    { label: "− exp", title: "Remove the exp claim", run: () => patch((p) => delete p.exp) },
  ];

  return (
    <div className="mt-2 flex flex-wrap gap-1.5 border-t border-line/60 pt-2">
      {tools.map((t) => (
        <button
          key={t.label}
          type="button"
          title={t.title}
          onClick={t.run}
          className="rounded border border-line bg-bg-inset/60 px-2 py-1 font-mono text-[11px] text-slate-300 transition-colors hover:border-accent/50 hover:text-white"
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
