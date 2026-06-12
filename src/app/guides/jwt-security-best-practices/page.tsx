import type { Metadata } from "next";
import Link from "next/link";
import { GuideShell } from "@/components/GuideShell";
import { GUIDES } from "@/lib/seo";

const meta = GUIDES.find((g) => g.slug === "jwt-security-best-practices")!;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  alternates: { canonical: `/guides/${meta.slug}` },
  openGraph: {
    title: `${meta.title} — JWTForge`,
    description: meta.description,
    url: `/guides/${meta.slug}`,
    images: ["/og.png"],
    type: "article",
  },
};

export default function Page() {
  return (
    <GuideShell
      slug={meta.slug}
      title={meta.title}
      description={meta.description}
      updated="2026-06-12"
      lead="JWTs are easy to issue and easy to get wrong. This is a practical checklist for using them safely — most incidents trace back to one of these items."
    >
      <h2>Signing &amp; verification</h2>
      <ul>
        <li>
          <strong>Pin the algorithm.</strong> Accept an explicit allow-list;
          never derive it from the token header. See{" "}
          <Link href="/guides/how-to-verify-a-jwt">how to verify a JWT</Link>.
        </li>
        <li>
          <strong>Use strong keys.</strong> For HMAC, a long random secret (≥256
          bits); for RSA/EC, properly generated keys. Weak HMAC secrets are{" "}
          <Link href="/attack#bruteforce">brute-forceable offline</Link>.
        </li>
        <li>
          <strong>Reject <code>alg:none</code></strong> and empty signatures
          outright.
        </li>
        <li>
          Validate <code>kid</code> against an allow-list; never use it for
          file/DB/shell lookups (
          <Link href="/guides/jwt-kid-injection">kid injection</Link>).
        </li>
        <li>
          Ignore token-supplied key sources (<code>jwk</code>, <code>jku</code>,{" "}
          <code>x5u</code>) unless strictly pinned to trusted origins.
        </li>
      </ul>

      <h2>Claims &amp; lifetime</h2>
      <ul>
        <li>
          Always set and check <code>exp</code>; keep access-token lifetimes
          short (minutes). Use refresh tokens for longevity.
        </li>
        <li>
          Set and validate <code>iss</code> and <code>aud</code> so a token for
          one service can&apos;t be replayed at another.
        </li>
        <li>
          <strong>Don&apos;t put secrets or PII in the payload.</strong> JWT
          claims are base64url-encoded, not encrypted — anyone with the token
          reads them.
        </li>
      </ul>

      <h2>Key management</h2>
      <ul>
        <li>Rotate signing keys periodically; publish public keys via JWKS with stable <code>kid</code>s.</li>
        <li>Have a revocation strategy (short lifetimes, deny-lists, or a token version claim) — plain JWTs can&apos;t be un-issued.</li>
      </ul>

      <h2>Transport &amp; storage</h2>
      <ul>
        <li>Only send tokens over HTTPS.</li>
        <li>
          In browsers, prefer <code>HttpOnly</code>, <code>Secure</code>,{" "}
          <code>SameSite</code> cookies over <code>localStorage</code> to reduce
          XSS token theft.
        </li>
      </ul>

      <p>
        Want to check a specific token against these? Paste it into the{" "}
        <Link href="/audit">Audit tab</Link> — it flags weak algorithms, missing
        <code>exp</code>, sensitive claims, and injection surface, each with how
        to test it.
      </p>
    </GuideShell>
  );
}
