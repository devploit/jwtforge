import type { Metadata } from "next";
import { AttackClient } from "./AttackClient";

export const metadata: Metadata = {
  title: "JWT Attack Tool Online — Forge Tokens & Artifacts",
  description:
    "JWT attack tool online: forge alg:none, RS256→HS256 confusion, kid/jwk injection, tampered and brute-forced tokens, then export curl, Burp, nuclei and jwt_tool artifacts.",
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
        <h1 className="text-2xl font-bold text-slate-50">
          JWT attack tool
        </h1>
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
