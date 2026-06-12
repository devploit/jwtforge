import type { Metadata } from "next";
import { AuditClient } from "./AuditClient";

export const metadata: Metadata = {
  title: "Audit JWT for security signals",
  description:
    "Heuristic JWT vulnerability checker: flags alg:none, weak algorithms, algorithm-confusion risk, kid/jku/x5u injection surface, sensitive claims and more — each framed as a hypothesis to verify, with how to test it against the server.",
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
