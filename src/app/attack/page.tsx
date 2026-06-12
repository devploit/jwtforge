import type { Metadata } from "next";
import { AttackClient } from "./AttackClient";

export const metadata: Metadata = {
  title: "Generate JWT attack tokens & artifacts",
  description:
    "JWT attack tool: generate alg:none, RS→HS algorithm-confusion, kid injection, jwk/jku self-signed and tampered tokens, plus an in-browser HS256 brute-forcer. Export ready-to-run curl, .http, Burp, nuclei and jwt_tool artifacts. No requests sent from the app.",
};

export default function AttackPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-bold text-slate-50">Attack</h1>
        <p className="text-sm text-slate-400">
          Generate malicious token variants and ready-to-run artifacts. JWTForge
          never fires requests — you run the output from your own authorized
          environment.
        </p>
      </header>
      <AttackClient />
    </div>
  );
}
