import Link from "next/link";

const FEATURES = [
  {
    href: "/decode",
    title: "Decode",
    blurb:
      "Live header / payload / signature breakdown, human-readable claims, expiry badges, and signature verification with your secret, public key, or a JWKS URL.",
    accent: "text-seg-payload",
  },
  {
    href: "/audit",
    title: "Audit",
    blurb:
      "Heuristic security signals — alg:none, weak algorithms, kid/jku/x5u injection surface, sensitive claims — each framed honestly as a hypothesis to verify, with how to test it.",
    accent: "text-seg-header",
  },
  {
    href: "/attack",
    title: "Attack",
    blurb:
      "The differentiator. Generate malicious token variants and ready-to-run curl, .http, Burp, nuclei and jwt_tool artifacts. Includes an in-browser HS256 brute-forcer.",
    accent: "text-seg-sig",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4 py-6">
        <p className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
          The attacker-minded alternative to jwt.io
        </p>
        <h1 className="max-w-3xl text-3xl font-bold leading-tight text-slate-50 sm:text-4xl">
          JWT security scanner &amp; attack toolkit that runs entirely in your
          browser
        </h1>
        <p className="max-w-2xl text-slate-300">
          Decode, audit, and forge JWT attack tokens for authorized security
          testing. JWTForge never sends your token, secret, or key anywhere —
          every operation runs client-side, and the Attack tab hands you
          ready-to-run artifacts to fire from your own environment.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/decode" className="btn btn-accent">
            Start decoding →
          </Link>
          <Link href="/attack" className="btn">
            Generate attack tokens
          </Link>
          <Link href="/about" className="btn">
            How this works &amp; privacy
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className="panel group flex flex-col gap-2 p-5 transition-colors hover:border-accent/50"
          >
            <h2 className={`text-lg font-semibold ${f.accent}`}>{f.title}</h2>
            <p className="text-sm text-slate-400">{f.blurb}</p>
            <span className="mt-auto pt-2 text-sm text-accent opacity-0 transition-opacity group-hover:opacity-100">
              Open {f.title} →
            </span>
          </Link>
        ))}
      </section>

      <section className="panel space-y-2 p-5">
        <h2 className="text-base font-semibold text-slate-100">
          Honest by design
        </h2>
        <p className="text-sm text-slate-400">
          A purely client-side tool cannot tell you whether a server is actually
          vulnerable — that is a server-side property. JWTForge never claims a
          token &ldquo;is vulnerable.&rdquo; The Audit tab surfaces{" "}
          <span className="text-slate-200">signals to review</span>; the Attack
          tab gives you the artifacts to{" "}
          <span className="text-slate-200">prove it yourself</span> against
          systems you are authorized to test.
        </p>
      </section>
    </div>
  );
}
