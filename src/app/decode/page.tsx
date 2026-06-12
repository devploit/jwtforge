import type { Metadata } from "next";
import { DecodeClient } from "./DecodeClient";

export const metadata: Metadata = {
  title: "Decode & verify JWT",
  description:
    "Decode a JWT into header, payload and signature, read claims in human-readable form with expiry badges, and verify the signature with a secret, public key, or JWKS URL — all in your browser.",
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
