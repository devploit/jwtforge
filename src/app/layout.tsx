import type { Metadata, Viewport } from "next";
import { Chakra_Petch, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { TokenProvider } from "@/lib/token-context";

// Distinctive, on-brand type system (not Inter/system):
// — Chakra Petch: angular, technical display for headings & wordmark.
// — IBM Plex Sans: refined humanist body with engineering pedigree.
// — JetBrains Mono: code / tokens / numerics.
const display = Chakra_Petch({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});
const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
  display: "swap",
});
import { SiteNav } from "@/components/SiteNav";
import { PrivacyBadge } from "@/components/PrivacyBadge";
import { Logo } from "@/components/Logo";
import { JsonLd } from "@/components/JsonLd";
import { AnalyticsClient } from "@/components/AnalyticsClient";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { appJsonLd, websiteJsonLd } from "@/lib/seo";
import Link from "next/link";

const SITE_URL = "https://jwtforge.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "JWTForge — JWT Security Scanner & Attack Toolkit",
    template: "%s · JWTForge",
  },
  description:
    "Free, fully client-side JWT security toolkit for pentesters: decode and verify tokens, scan for vulnerabilities, and forge attack tokens. Nothing ever leaves your browser.",
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
  authors: [{ name: "devploit", url: "https://x.com/devploit" }],
  creator: "devploit",
  category: "technology",
  alternates: { canonical: "/" },
  openGraph: {
    title: "JWTForge — JWT Security Scanner & Attack Toolkit",
    description:
      "Attacker-minded, fully client-side JWT toolkit. Decode, audit, and forge attack tokens with export artifacts. Nothing ever leaves your browser.",
    url: SITE_URL,
    siteName: "JWTForge",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "JWTForge" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "JWTForge — JWT Security Scanner & Attack Toolkit",
    description:
      "Attacker-minded, fully client-side JWT toolkit. Nothing ever leaves your browser.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#070912",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`scroll-smooth ${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body className="min-h-screen font-sans antialiased">
        <JsonLd data={appJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
        <TokenProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-accent focus:px-3 focus:py-2 focus:text-bg"
          >
            Skip to content
          </a>
          <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/70 backdrop-blur-xl">
            <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Link href="/" className="flex items-center gap-2.5">
                  <Logo size={30} />
                  <span className="font-display text-lg font-bold tracking-tight text-slate-100">
                    JWT<span className="text-accent">Forge</span>
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
            <p className="mt-3 font-mono text-[11px] text-slate-600">
              <span className="text-accent/70">$</span> crafted by{" "}
              <a
                href="https://x.com/devploit"
                target="_blank"
                rel="noopener noreferrer me"
                className="text-slate-400 transition-colors hover:text-accent"
              >
                @devploit
              </a>{" "}
              <span className="text-slate-700">— built in the browser, for the browser</span>
            </p>
          </footer>
          <AnalyticsClient />
          <SpeedInsights />
          <ServiceWorkerRegister />
        </TokenProvider>
      </body>
    </html>
  );
}
