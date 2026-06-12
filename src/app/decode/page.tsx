import type { Metadata } from "next";
import { DecodeClient } from "./DecodeClient";

export const metadata: Metadata = {
  title: "JWT Decoder & Signature Verifier (HS/RS/ES/PS)",
  description:
    "Decode any JWT into header, payload and signature, read claims with expiry badges, and verify HS/RS/PS/ES signatures with a secret, key or JWKS URL — all in your browser.",
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
        <h1 className="text-2xl font-bold text-slate-50">
          JWT decoder &amp; verifier
        </h1>
        <p className="text-sm text-slate-400">
          Paste a JWT to break it down, inspect claims, and verify its
          signature. Everything stays in your browser.
        </p>
      </header>
      <DecodeClient />
    </div>
  );
}
