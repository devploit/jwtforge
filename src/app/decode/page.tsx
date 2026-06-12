import type { Metadata } from "next";
import { DecodeClient } from "./DecodeClient";

export const metadata: Metadata = {
  title: "JWT Decoder & Signature Verifier (HS/RS/ES/PS)",
  description:
    "Decode a JWT into header, payload and signature, read claims in human-readable form with expiry badges, and verify the signature with a secret, public key, or JWKS URL — all client-side in your browser. Supports HS256/384/512, RS, PS and ES algorithms.",
  alternates: { canonical: "/decode" },
  openGraph: {
    title: "JWT Decoder & Signature Verifier — JWTForge",
    description:
      "Decode and verify any JWT in your browser. Claims, expiry, and HS/RS/PS/ES signature verification. Nothing leaves the page.",
    url: "/decode",
    images: ["/og.png"],
  },
};

export default function DecodePage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-bold text-slate-50">Decode &amp; verify</h1>
        <p className="text-sm text-slate-400">
          Paste a JWT to break it down, inspect claims, and verify its
          signature. Everything stays in your browser.
        </p>
      </header>
      <DecodeClient />
    </div>
  );
}
