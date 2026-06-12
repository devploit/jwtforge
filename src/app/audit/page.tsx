import type { Metadata } from "next";
import { AuditClient } from "./AuditClient";

export const metadata: Metadata = {
  title: "JWT Vulnerability Checker & Security Scanner",
  description:
    "Free JWT vulnerability checker: scan a token for alg:none, weak/symmetric algorithms, RS→HS algorithm-confusion risk, kid/jku/x5u injection surface, sensitive claims and more. Each signal explains why it matters and how to test it against the server.",
  alternates: { canonical: "/audit" },
  openGraph: {
    title: "JWT Vulnerability Checker & Security Scanner — JWTForge",
    description:
      "Scan a JWT for security signals — alg:none, weak algorithms, kid/jku injection, sensitive claims — with honest, how-to-test guidance.",
    url: "/audit",
    images: ["/og.png"],
  },
};

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-bold text-slate-50">Audit</h1>
        <p className="text-sm text-slate-400">
          Static heuristic signals from the token alone. These are{" "}
          <span className="text-slate-200">hypotheses to verify</span>, not
          confirmed vulnerabilities — a client-side tool cannot observe how the
          server behaves.
        </p>
      </header>
      <AuditClient />
    </div>
  );
}
