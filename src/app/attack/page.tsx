import type { Metadata } from "next";
import { AttackClient } from "./AttackClient";

export const metadata: Metadata = {
  title: "JWT Attack Tool Online — Forge Tokens & Artifacts",
  description:
    "JWT attack tool online: generate alg:none, RS256→HS256 algorithm-confusion, kid injection, jwk/jku self-signed and tampered tokens, plus an in-browser HS256 brute-forcer. Export ready-to-run curl, .http, Burp Intruder, nuclei and jwt_tool artifacts. No requests sent from the app.",
  alternates: { canonical: "/attack" },
  openGraph: {
    title: "JWT Attack Tool Online — JWTForge",
    description:
      "Forge alg:none, algorithm-confusion, kid/jwk injection and brute-forced JWTs, then export curl/Burp/nuclei/jwt_tool artifacts. Client-side only.",
    url: "/attack",
    images: ["/og.png"],
  },
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
