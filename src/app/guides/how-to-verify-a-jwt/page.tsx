import type { Metadata } from "next";
import Link from "next/link";
import { GuideShell } from "@/components/GuideShell";
import { GUIDES } from "@/lib/seo";

const meta = GUIDES.find((g) => g.slug === "how-to-verify-a-jwt")!;

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
      lead="Verifying a JWT is more than checking the signature. A correct verification pins the algorithm, validates the signature with the right key, and then checks the claims. Skipping any step is how real-world bypasses happen."
    >
      <h2>1. Pin the algorithm</h2>
      <p>
        Decide which algorithm(s) you accept and enforce them explicitly. Never
        let the token&apos;s <code>alg</code> header decide — that is the root of
        the <Link href="/guides/jwt-none-algorithm-attack">alg:none</Link> and{" "}
        <Link href="/guides/jwt-algorithm-confusion">RS256→HS256 confusion</Link>{" "}
        bypasses. Pass an explicit allow-list (e.g. <code>[&quot;RS256&quot;]</code>) to
        your verifier.
      </p>

      <h2>2. Verify the signature with the right key</h2>
      <ul>
        <li>
          <strong>HS256/384/512:</strong> a shared secret. Keep it long and
          random — weak secrets are{" "}
          <Link href="/attack#bruteforce">brute-forceable</Link>.
        </li>
        <li>
          <strong>RS/PS/ES:</strong> verify with the issuer&apos;s public key,
          typically fetched from a JWKS endpoint and selected by <code>kid</code>
          {" "}— but only against a trusted key set, never a key the token points
          to itself.
        </li>
      </ul>
      <p>
        You can try this interactively in the{" "}
        <Link href="/decode">Decode tab</Link>: paste a token, paste the secret
        or public key (or a JWKS URL), and the verification banner updates live.
      </p>

      <h2>3. Validate the claims</h2>
      <p>Even a perfectly-signed token can be invalid for your use. Check:</p>
      <ul>
        <li>
          <code>exp</code> — reject expired tokens; <code>nbf</code> — reject
          not-yet-valid ones.
        </li>
        <li>
          <code>iss</code> — the issuer is one you trust; <code>aud</code> — the
          audience includes your service.
        </li>
        <li>
          <code>sub</code> and any authorization claims (<code>role</code>,{" "}
          <code>scope</code>) — but treat them as inputs to your own checks, not
          gospel.
        </li>
      </ul>

      <h2>Common mistakes</h2>
      <ul>
        <li>Trusting the header <code>alg</code> (enables alg:none / confusion).</li>
        <li>Accepting an empty signature segment.</li>
        <li>Not checking <code>exp</code> / <code>aud</code> / <code>iss</code>.</li>
        <li>Fetching the verification key from a URL inside the token (<code>jku</code>/<code>x5u</code>).</li>
      </ul>

      <p>
        Paste any token into the <Link href="/audit">Audit tab</Link> to surface
        these risks automatically, framed as hypotheses to verify.
      </p>
    </GuideShell>
  );
}
