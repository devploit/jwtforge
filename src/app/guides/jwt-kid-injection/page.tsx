import type { Metadata } from "next";
import Link from "next/link";
import { GuideShell } from "@/components/GuideShell";
import { GUIDES } from "@/lib/seo";

const meta = GUIDES.find((g) => g.slug === "jwt-kid-injection")!;

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
      lead="The kid (key ID) header tells the server which key to use to verify a token. If the server uses that attacker-controlled value to look up a key — by file path, database query, or shell command — without sanitizing it, kid becomes an injection point."
    >
      <h2>How it works</h2>
      <p>
        <code>kid</code> is a hint in the JWT header that selects a verification
        key. Servers resolve it in different ways, and each is an injection
        surface when the value is trusted blindly:
      </p>
      <ul>
        <li>
          <strong>Path traversal.</strong> If <code>kid</code> is used as a file
          path, a value like <code>../../../../dev/null</code> points the key to
          an empty file. The attacker then signs the token with an{" "}
          <strong>empty key</strong>, which the server reproduces — a working
          forgery. (HMAC zero-pads an empty key, so an empty-key MAC is
          well-defined.)
        </li>
        <li>
          <strong>SQL injection.</strong> If <code>kid</code> feeds a query like{" "}
          <code>SELECT key FROM keys WHERE id = &apos;{`{kid}`}&apos;</code>, a
          payload can make the query return an attacker-known value used as the
          signing key.
        </li>
        <li>
          <strong>Command injection.</strong> If <code>kid</code> is passed to a
          shell, classic OS-command-injection payloads apply.
        </li>
      </ul>

      <h2>Why it matters</h2>
      <p>
        Depending on the sink, kid injection ranges from full authentication
        bypass (the <code>/dev/null</code> empty-key trick) to data exfiltration
        or remote code execution on the auth server.
      </p>

      <h2>How to test for it</h2>
      <p>
        Use the{" "}
        <Link href="/attack#kid-injection">Attack tab&apos;s kid-injection generator</Link>
        . It builds the <code>/dev/null</code> variant signed with an empty key
        (a real forgery if the server resolves kid to a file), plus
        SQLi/command-injection payloads in the <code>kid</code> value. Send them
        to a target you are authorized to test and watch for accepted tokens,
        SQL errors, or timing differences.
      </p>

      <h2>How to fix it</h2>
      <ul>
        <li>
          Treat <code>kid</code> as untrusted input: validate it against an
          allow-list of known key IDs, never interpolate it into a path, query,
          or command.
        </li>
        <li>Use parameterized queries and avoid filesystem/shell lookups by kid.</li>
        <li>Reject tokens whose kid is unknown rather than falling back to a default.</li>
      </ul>

      <p>
        Related: <Link href="/guides/jwt-algorithm-confusion">algorithm confusion</Link>{" "}
        and the <Link href="/guides/jwt-none-algorithm-attack">alg:none attack</Link>.
      </p>
    </GuideShell>
  );
}
