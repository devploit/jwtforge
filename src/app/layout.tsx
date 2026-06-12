import type { Metadata } from "next";
import "./globals.css";
import { TokenProvider } from "@/lib/token-context";
import { SiteNav } from "@/components/SiteNav";
import { PrivacyBadge } from "@/components/PrivacyBadge";
import Link from "next/link";

const SITE_URL = "https://jwtforge.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "JWTForge — JWT Security Scanner & Attack Toolkit",
    template: "%s · JWTForge",
  },
  description:
    "Client-side JWT security toolkit for pentesters: decode, audit for vulnerabilities, and generate attack tokens (alg:none, RS→HS confusion, kid injection, HS256 brute-force) with ready-to-run curl, Burp, nuclei and jwt_tool artifacts. Nothing leaves your browser.",
  keywords: [
    "jwt security scanner",
    "jwt vulnerability checker",
    "jwt attack tool online",
    "jwt_tool online",
    "jwt penetration testing",
    "jwt none algorithm attack",
    "jwt algorithm confusion",
    "jwt brute force",
  ],
  applicationName: "JWTForge",
  authors: [{ name: "JWTForge" }],
  openGraph: {
    title: "JWTForge — JWT Security Scanner & Attack Toolkit",
    description:
      "Attacker-minded, fully client-side JWT toolkit. Decode, audit, and forge attack tokens with export artifacts. Nothing ever leaves your browser.",
    url: SITE_URL,
    siteName: "JWTForge",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JWTForge — JWT Security Scanner & Attack Toolkit",
    description:
      "Attacker-minded, fully client-side JWT toolkit. Nothing ever leaves your browser.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <TokenProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-accent focus:px-3 focus:py-2 focus:text-bg"
          >
            Skip to content
          </a>
          <header className="border-b border-line bg-bg-raised/60 backdrop-blur">
            <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Link href="/" className="flex items-center gap-2">
                  <span className="font-mono text-lg font-bold text-accent">
                    JWT<span className="text-slate-100">Forge</span>
                  </span>
                </Link>
                <PrivacyBadge />
              </div>
              <SiteNav />
            </div>
          </header>
          <main id="main" className="mx-auto max-w-6xl px-4 py-6">
            {children}
          </main>
          <footer className="border-t border-line px-4 py-6 text-center text-xs text-slate-500">
            <p>
              JWTForge runs entirely in your browser. No token, secret, or key
              is ever sent to a server.{" "}
              <Link href="/about" className="text-accent hover:underline">
                How this works &amp; privacy
              </Link>
            </p>
            <p className="mt-1">
              For authorized security testing only. Audit signals are
              hypotheses to verify, not confirmed vulnerabilities.
            </p>
          </footer>
        </TokenProvider>
      </body>
    </html>
  );
}
