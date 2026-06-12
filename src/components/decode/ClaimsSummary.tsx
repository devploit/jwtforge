"use client";

import { useEffect, useState } from "react";
import { getTimeClaims, getValidity } from "@/lib/claims";
import type { JwtPayload } from "@/lib/jwt";

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

  return (
    <div className="space-y-3">
      <ValidityBadge validity={validity} />
      {timeClaims.length > 0 && (
        <div className="panel divide-y divide-line">
          {timeClaims.map((c) => (
            <div
              key={c.name}
              className="flex flex-wrap items-baseline justify-between gap-2 px-3 py-2 text-sm"
            >
              <span className="font-mono font-semibold text-slate-200">
                {c.name}
                <span className="ml-2 text-xs font-normal text-slate-500">
                  {LABELS[c.name]}
                </span>
              </span>
              <span className="text-right text-slate-300">
                {c.absolute}
                <span className="ml-2 text-slate-500">({c.relative})</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const LABELS: Record<string, string> = {
  iat: "issued at",
  nbf: "not before",
  exp: "expires",
};

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
