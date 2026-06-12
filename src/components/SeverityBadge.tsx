import type { Severity } from "@/lib/audit";

const STYLES: Record<Severity, string> = {
  high: "border-sev-high/40 bg-sev-high/10 text-sev-high",
  medium: "border-sev-med/40 bg-sev-med/10 text-sev-med",
  low: "border-sev-low/40 bg-sev-low/10 text-sev-low",
  info: "border-sev-info/40 bg-sev-info/10 text-sev-info",
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${STYLES[severity]}`}
    >
      {severity}
    </span>
  );
}
