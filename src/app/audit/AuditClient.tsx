"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TokenInput } from "@/components/TokenInput";
import { EmptyState, ErrorState } from "@/components/EmptyOrError";
import { SeverityBadge } from "@/components/SeverityBadge";
import { useDecoded } from "@/lib/use-decoded";
import { auditToken, type AuditSignal, type Severity } from "@/lib/audit";

const SEVERITY_ORDER: Record<Severity, number> = {
  high: 0,
  medium: 1,
  low: 2,
  info: 3,
};

export function AuditClient() {
  const { decoded, error, isEmpty } = useDecoded();
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);

  let signals: AuditSignal[] = [];
  if (decoded && now) {
    signals = auditToken(decoded, now).sort(
      (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
    );
  }

  return (
    <div className="space-y-5">
      <TokenInput rows={4} />

      <div
        role="note"
        className="panel border-accent/30 bg-accent/5 p-3 text-xs text-slate-300"
      >
        <strong className="text-accent">How to read this:</strong> every card
        below is a signal to investigate. JWTForge cannot confirm a server is
        vulnerable — it can only flag what is worth testing. Each card links to
        the Attack-tab generator that proves (or disproves) it against a system
        you are authorized to test.
      </div>

      {isEmpty && (
        <EmptyState>
          Paste a token to see heuristic security signals.
        </EmptyState>
      )}
      {error && <ErrorState message={error} />}

      {signals.length > 0 && (
        <ul className="space-y-3">
          {signals.map((s) => (
            <li key={s.id} className="panel p-4">
              <div className="mb-2 flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-100">
                  {s.title}
                </h3>
                <SeverityBadge severity={s.severity} />
              </div>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Why it matters
                  </dt>
                  <dd className="text-slate-300">{s.why}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    How to actually test it
                  </dt>
                  <dd className="text-slate-300">{s.howToTest}</dd>
                </div>
              </dl>
              {s.attackLink && (
                <Link
                  href={`/attack#${s.attackLink}`}
                  className="mt-3 inline-flex text-sm text-accent hover:underline"
                >
                  → Generate the attack token in the Attack tab
                </Link>
              )}
              <p className="mt-3 border-t border-line pt-2 text-xs italic text-slate-500">
                Hypothesis to verify — not a confirmed finding.
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
