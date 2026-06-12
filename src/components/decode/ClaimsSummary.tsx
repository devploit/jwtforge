"use client";

import { useEffect, useState } from "react";
import { getTimeClaims, getValidity, REGISTERED_CLAIMS } from "@/lib/claims";
import type { JwtPayload } from "@/lib/jwt";

const NON_TIME_REGISTERED = ["iss", "sub", "aud", "jti"] as const;

export function ClaimsSummary({ payload }: { payload: JwtPayload }) {
  // Compute against a live clock, mounted client-side to avoid SSR mismatch.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;

  const timeClaims = getTimeClaims(payload, now);
  const validity = getValidity(payload, now);
  const otherClaims = NON_TIME_REGISTERED.filter((k) => payload[k] != null).map(
    (k) => ({
      key: k,
      value: Array.isArray(payload[k])
        ? (payload[k] as unknown[]).join(", ")
        : String(payload[k]),
    }),
  );

  const hasRegistered = timeClaims.length > 0 || otherClaims.length > 0;

  return (
    <div className="space-y-3">
      <ValidityBadge validity={validity} />
      {hasRegistered && (
        <div className="panel divide-y divide-line">
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Registered claims
          </p>
          {timeClaims.map((c) => (
            <ClaimRow
              key={c.name}
              name={c.name}
              label={REGISTERED_CLAIMS[c.name]?.name}
              desc={REGISTERED_CLAIMS[c.name]?.desc}
              value={
                <>
                  {c.absolute}
                  <span className="ml-2 text-slate-500">({c.relative})</span>
                </>
              }
            />
          ))}
          {otherClaims.map((c) => (
            <ClaimRow
              key={c.key}
              name={c.key}
              label={REGISTERED_CLAIMS[c.key]?.name}
              desc={REGISTERED_CLAIMS[c.key]?.desc}
              value={c.value}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ClaimRow({
  name,
  label,
  desc,
  value,
}: {
  name: string;
  label?: string;
  desc?: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 px-3 py-2 text-sm">
      <span className="font-mono font-semibold text-slate-200" title={desc}>
        {name}
        {label && (
          <span className="ml-2 cursor-help text-xs font-normal text-slate-500 underline decoration-dotted underline-offset-2">
            {label}
          </span>
        )}
      </span>
      <span className="break-all text-right text-slate-300">{value}</span>
    </div>
  );
}

function ValidityBadge({
  validity,
}: {
  validity: ReturnType<typeof getValidity>;
}) {
  const map = {
    valid: {
      text: "Valid (not expired)",
      cls: "border-green-500/40 bg-green-500/10 text-green-400",
    },
    expired: {
      text: "Expired",
      cls: "border-sev-high/40 bg-sev-high/10 text-sev-high",
    },
    "not-yet-valid": {
      text: "Not yet valid",
      cls: "border-sev-med/40 bg-sev-med/10 text-sev-med",
    },
    "no-exp": {
      text: "No expiry claim",
      cls: "border-sev-info/40 bg-sev-info/10 text-sev-info",
    },
  } as const;

  const info = map[validity.kind];
  const detail =
    validity.kind === "expired"
      ? ` ${validity.since}`
      : validity.kind === "not-yet-valid"
        ? ` — valid ${validity.until}`
        : "";

  return (
    <span
      className={`inline-flex items-center rounded border px-2.5 py-1 text-sm font-semibold ${info.cls}`}
    >
      {info.text}
      {detail}
    </span>
  );
}
