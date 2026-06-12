import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How It Works & Privacy",
  description:
    "JWTForge runs entirely in your browser via WebCrypto — no token, secret or key ever leaves the page. The privacy model, threat model and honest scope of Audit.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "How JWTForge Works & Privacy",
    description:
      "100% client-side JWT toolkit. The privacy model, threat model, and why Audit signals are hypotheses to verify — not confirmed vulnerabilities.",
    url: "/about",
    images: ["/og.png"],
  },
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="panel space-y-2 p-5">
      <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-slate-300">
        {children}
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-50">
          How JWTForge works &amp; privacy
        </h1>
        <p className="text-sm text-slate-400">
          The short version: everything runs in your browser, and the Audit tab
          shows signals to verify — never confirmed vulnerabilities.
        </p>
      </header>

      <Section title="The client-side guarantee">
        <p>
          Every operation — decoding, claim parsing, signature verification,
          key generation, signing, and the HS256 brute-force — runs in
          JavaScript in your browser tab using the native{" "}
          <a
            href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            WebCrypto API
          </a>
          . Your token, secrets, and keys never leave the page.
        </p>
        <p>
          You can verify this yourself: open your browser&apos;s DevTools →
          Network tab, paste a token, and exercise every feature. You will see
          no outbound request carrying your token, secret, or keys.
        </p>
      </Section>

      <Section title="The one exception: JWKS fetch">
        <p>
          The Decode tab has an optional, opt-in feature to fetch a JWKS from a
          URL you type, so you can verify a signature against a published key
          set. This is the only outbound request the app makes with your input,
          it is clearly labeled, and it sends only the URL you provide — never
          your token. It runs client-side and may be blocked by the remote
          server&apos;s CORS policy.
        </p>
      </Section>

      <Section title="Analytics">
        <p>
          JWTForge uses Vercel Web Analytics for aggregate visit counts only. It
          is cookieless, stores no personal data, and never reads form or input
          values — so it cannot see your token, secret, or keys. As an extra
          safeguard, the URL reported to analytics is stripped of the{" "}
          <code>#t=</code> token fragment before any event is sent, so a token
          in a shared link is never transmitted.
        </p>
      </Section>

      <Section title="Why there is no built-in request sender">
        <p>
          The Attack tab deliberately does <strong>not</strong> fire requests at
          targets. A hosted proxy that relays attacker-supplied requests would
          turn this site into an SSRF / open-proxy liability and would break the
          privacy guarantee. Instead, JWTForge generates the forged tokens and{" "}
          <strong>ready-to-run artifacts</strong> (curl, .http, Burp Intruder
          payloads, a nuclei template, and the equivalent jwt_tool command) that
          you run from your own authorized environment.
        </p>
      </Section>

      <Section title="Audit ≠ confirmed vulnerability (read this)">
        <p>
          A purely client-side tool <strong>cannot</strong> tell you whether a
          server is actually vulnerable. Whether a server accepts{" "}
          <code>alg:none</code>, mishandles algorithm selection, or uses a weak
          secret is a property of the server&apos;s code — invisible from the
          token alone.
        </p>
        <p>
          So the Audit tab never says a token &ldquo;is vulnerable.&rdquo; Each
          signal is a <strong>hypothesis to verify</strong>, paired with how to
          actually test it. The proof comes from running the matching{" "}
          <Link href="/attack" className="text-accent hover:underline">
            Attack-tab
          </Link>{" "}
          artifact against a system you are authorized to test.
        </p>
      </Section>

      <Section title="Threat model & responsible use">
        <p>
          JWTForge is built for pentesters, bug bounty hunters, and AppSec
          engineers doing authorized work. Forging tokens and testing them
          against systems you do not own or lack written permission to test is
          illegal in most jurisdictions. You are solely responsible for how you
          use the generated artifacts.
        </p>
      </Section>

      <Section title="Supported algorithms">
        <p>
          Verification and signing support HS256/384/512 (HMAC), RS256/384/512
          (RSASSA-PKCS1-v1_5), PS256/384/512 (RSA-PSS), and ES256/384/512
          (ECDSA), all via WebCrypto. Encrypted tokens (JWE, 5-segment) are not
          decoded.
        </p>
      </Section>

      <div className="flex flex-wrap gap-3">
        <Link href="/decode" className="btn btn-accent">
          Start decoding →
        </Link>
        <Link href="/attack" className="btn">
          Generate attack tokens
        </Link>
      </div>
    </div>
  );
}
