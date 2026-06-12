import type { Metadata } from "next";
import Link from "next/link";
import { GuideShell } from "@/components/GuideShell";
import { GUIDES } from "@/lib/seo";

const meta = GUIDES.find((g) => g.slug === "jwt-none-algorithm-attack")!;

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
      lead="The alg:none attack removes a JWT's signature and declares the algorithm as 'none'. If a server honours it, signatures are no longer checked — and anyone can forge any token."
    >
      <h2>How it works</h2>
      <p>
        The JWT spec defines an <code>none</code> algorithm for{" "}
        <em>unsecured</em> tokens — a JWT with no signature. The attack is
        simple: take a valid token, set the header&apos;s <code>alg</code> to{" "}
        <code>none</code>, and drop the signature so the token ends with a
        trailing dot (<code>header.payload.</code>). If the server accepts it,
        you can change any claim — <code>role</code>, <code>sub</code>,{" "}
        <code>admin</code> — and it will be trusted.
      </p>
      <p>
        Because some servers only blocklist the exact string <code>none</code>,
        case variants are used to slip past naive filters:{" "}
        <code>None</code>, <code>NONE</code>, <code>nOnE</code>. A correct
        implementation rejects all of them when an unsecured token is not
        expected.
      </p>

      <h2>Why it matters</h2>
      <p>
        This is a complete authentication bypass. No key, no secret, no
        cracking required — if the server trusts <code>alg:none</code>, forging
        an admin token is trivial.
      </p>

      <h2>How to test for it</h2>
      <ul>
        <li>
          Open the{" "}
          <Link href="/attack#alg-none">Attack tab&apos;s alg:none generator</Link>
          . It strips the signature and produces the <code>none</code> /{" "}
          <code>None</code> / <code>nOnE</code> / <code>NONE</code> variants,
          plus ready-to-run curl, Burp, nuclei and jwt_tool artifacts.
        </li>
        <li>Tamper a claim that affects authorization (e.g. set a role to admin).</li>
        <li>
          Replay each variant against an endpoint you are authorized to test. If
          any is accepted, the server does not enforce signatures.
        </li>
      </ul>

      <h2>How to fix it</h2>
      <ul>
        <li>
          <strong>Never accept <code>alg:none</code></strong> in production.
          Configure the verifier with an explicit algorithm allow-list that does
          not include <code>none</code>.
        </li>
        <li>Reject tokens whose signature segment is empty.</li>
        <li>
          Keep libraries up to date — several historical CVEs were exactly this
          bug in popular JWT libraries.
        </li>
      </ul>

      <p>
        Related: <Link href="/guides/jwt-algorithm-confusion">algorithm confusion (RS256 → HS256)</Link>{" "}
        is another header-driven bypass. You can also paste a token into the{" "}
        <Link href="/audit">Audit tab</Link> to surface these signals
        automatically.
      </p>
    </GuideShell>
  );
}
