import type { Metadata } from "next";
import Link from "next/link";
import { GuideShell } from "@/components/GuideShell";
import { GUIDES } from "@/lib/seo";

const meta = GUIDES.find((g) => g.slug === "jwt-algorithm-confusion")!;

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
      lead="Algorithm confusion tricks a server into verifying an asymmetric (RS256) token with a symmetric (HS256) algorithm, using the server's own public key — which is not secret — as the HMAC key. If it works, an attacker can mint valid tokens without the private key."
    >
      <h2>How it works</h2>
      <p>
        An RS256 token is signed with an RSA <strong>private</strong> key and
        verified with the matching <strong>public</strong> key. The public key
        is, by design, not secret — it is often published at a JWKS endpoint.
      </p>
      <p>
        Many libraries expose a single <code>verify(token, key)</code> call and
        choose the algorithm from the token&apos;s own <code>alg</code> header.
        An attacker changes <code>alg</code> from <code>RS256</code> to{" "}
        <code>HS256</code> and signs the token with HMAC, using the{" "}
        <strong>public key bytes as the HMAC secret</strong>. If the server
        passes that same public key into the verify call, it now computes an
        HMAC with a key the attacker also has — so the forged token verifies.
      </p>

      <h2>Why it matters</h2>
      <p>
        The whole point of asymmetric signing is that only the holder of the
        private key can issue tokens. Algorithm confusion collapses that
        guarantee: anyone with the public key (i.e. anyone) can forge tokens,
        escalate roles, impersonate users, and bypass authentication.
      </p>

      <h2>How to test for it</h2>
      <p>
        You cannot confirm this from the token alone — whether a server is
        vulnerable depends on its verification code. To test it for real:
      </p>
      <ul>
        <li>Obtain the server&apos;s RSA public key (often at its JWKS URL).</li>
        <li>
          In the{" "}
          <Link href="/attack#alg-confusion">Attack tab&apos;s confusion generator</Link>
          , paste that public key. It re-signs your token as HS256 with the key
          as the HMAC secret (it also tries a trailing-newline variant, which
          matches how many servers load key files).
        </li>
        <li>
          Send the forged token to an endpoint you are authorized to test. If it
          is accepted, the server trusts the header&apos;s algorithm and is
          vulnerable.
        </li>
      </ul>

      <h2>How to fix it</h2>
      <ul>
        <li>
          <strong>Pin the algorithm.</strong> Configure the verifier to accept
          only the exact algorithm you expect (e.g. allow-list{" "}
          <code>RS256</code> only) — never derive it from the token header.
        </li>
        <li>
          Use a key type that matches the algorithm so an RSA key can never be
          fed to an HMAC verifier.
        </li>
        <li>
          Prefer libraries whose verify API takes an explicit algorithm
          parameter and rejects mismatches.
        </li>
      </ul>

      <p>
        Related: the{" "}
        <Link href="/guides/jwt-none-algorithm-attack">alg:none attack</Link> is
        another header-driven bypass worth checking at the same time.
      </p>
    </GuideShell>
  );
}
