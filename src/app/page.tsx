import Link from "next/link";
import { TokenGlyph } from "@/components/TokenGlyph";
import { JsonLd } from "@/components/JsonLd";
import { FAQS, faqJsonLd } from "@/lib/seo";

const FEATURES = [
  {
    href: "/decode",
    title: "Decode",
    blurb:
      "Live header / payload / signature breakdown, human-readable claims with expiry badges, and signature verification with your secret, public key, or a JWKS URL.",
    accent: "text-seg-header",
    ring: "hover:border-seg-header/50",
  },
  {
    href: "/audit",
    title: "Audit",
    blurb:
      "Heuristic security signals — alg:none, weak algorithms, kid/jku/x5u injection surface, sensitive claims — each framed honestly as a hypothesis to verify, with how to test it.",
    accent: "text-seg-payload",
    ring: "hover:border-seg-payload/50",
  },
  {
    href: "/attack",
    title: "Attack",
    blurb:
      "The differentiator. Generate malicious token variants and ready-to-run curl, .http, Burp, nuclei and jwt_tool artifacts. Includes an in-browser HS256 brute-forcer.",
    accent: "text-accent",
    ring: "hover:border-accent/50",
  },
];

const STEPS = [
  ["none", "alg:none family"],
  ["RS→HS", "algorithm confusion"],
  ["kid", "header injection"],
  ["jwk/jku", "key injection"],
  ["HS256", "secret brute-force"],
  ["claims", "tampering"],
];

export default function HomePage() {
  return (
    <div className="space-y-20 pb-10">
      {/* Hero */}
      <section className="grid items-center gap-10 pt-6 lg:grid-cols-[1.15fr_0.85fr] lg:pt-12">
        <div className="space-y-6">
          <p className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            The attacker-minded alternative to jwt.io
          </p>
          <h1 className="animate-fade-up text-4xl font-bold leading-[1.05] tracking-tight text-slate-50 [animation-delay:60ms] sm:text-5xl lg:text-6xl">
            Forge, audit &amp; break{" "}
            <span className="text-brand-gradient">JSON Web Tokens</span> — all in
            your browser
          </h1>
          <p className="max-w-xl animate-fade-up text-lg leading-relaxed text-slate-300 [animation-delay:120ms]">
            A privacy-first JWT security toolkit for pentesters. Decode and
            verify, surface vulnerability signals, and generate attack tokens
            with ready-to-run artifacts. Your token, secret, and keys never
            leave the page.
          </p>
          <div className="flex animate-fade-up flex-wrap gap-3 [animation-delay:180ms]">
            <Link href="/decode" className="btn btn-accent px-5 py-2.5 text-base">
              Start decoding →
            </Link>
            <Link href="/attack" className="btn px-5 py-2.5 text-base">
              Generate attack tokens
            </Link>
          </div>
          <div className="flex animate-fade-up items-center gap-5 pt-2 text-xs text-slate-500 [animation-delay:240ms]">
            <span className="inline-flex items-center gap-1.5">
              <Dot /> No backend
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Dot /> No tracking
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Dot /> WebCrypto only
            </span>
          </div>
        </div>
        <div className="animate-fade-up [animation-delay:160ms]">
          <TokenGlyph />
        </div>
      </section>

      {/* Attack matrix strip */}
      <section className="animate-fade-up">
        <p className="mb-4 text-center text-xs font-medium uppercase tracking-widest text-slate-500">
          Six attack generators, zero requests sent
        </p>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line/80 bg-line/40 sm:grid-cols-3 lg:grid-cols-6">
          {STEPS.map(([k, label]) => (
            <div
              key={k}
              className="flex flex-col items-center gap-1 bg-bg-raised/70 px-3 py-5 text-center"
            >
              <span className="font-mono text-sm font-bold text-accent">
                {k}
              </span>
              <span className="text-xs text-slate-400">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Feature cards */}
      <section className="grid gap-5 sm:grid-cols-3">
        {FEATURES.map((f, i) => (
          <Link
            key={f.href}
            href={f.href}
            style={{ animationDelay: `${i * 80}ms` }}
            className={`panel group flex animate-fade-up flex-col gap-3 p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-glow-lg ${f.ring}`}
          >
            <h2 className={`text-xl font-bold ${f.accent}`}>{f.title}</h2>
            <p className="text-sm leading-relaxed text-slate-400">{f.blurb}</p>
            <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium text-accent transition-transform group-hover:translate-x-1">
              Open {f.title} →
            </span>
          </Link>
        ))}
      </section>

      {/* Honest-by-design */}
      <section className="relative overflow-hidden rounded-2xl border border-line/80 bg-bg-raised/50 p-8 sm:p-10">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent-violet/10 blur-3xl" />
        <div className="relative max-w-3xl space-y-3">
          <h2 className="text-2xl font-bold text-slate-100">
            Honest by design
          </h2>
          <p className="text-base leading-relaxed text-slate-300">
            A purely client-side tool cannot tell you whether a server is
            actually vulnerable — that is a server-side property. JWTForge never
            claims a token{" "}
            <span className="text-slate-100">&ldquo;is vulnerable.&rdquo;</span>{" "}
            The Audit tab surfaces signals to review; the Attack tab gives you
            the artifacts to prove it yourself, against systems you are
            authorized to test.
          </p>
          <Link
            href="/about"
            className="inline-flex items-center gap-1 pt-1 text-sm font-medium text-accent hover:underline"
          >
            How this works &amp; privacy →
          </Link>
        </div>
      </section>

      {/* FAQ — visible content that also powers FAQPage structured data */}
      <section aria-labelledby="faq-heading" className="space-y-5">
        <h2 id="faq-heading" className="text-2xl font-bold text-slate-100">
          Frequently asked questions
        </h2>
        <div className="divide-y divide-line/70 overflow-hidden rounded-xl border border-line/80 bg-bg-raised/50">
          {FAQS.map((f) => (
            <details key={f.q} className="group px-5 py-4 open:bg-bg-raised/60">
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-medium text-slate-100 marker:content-none">
                {f.q}
                <span className="shrink-0 text-accent transition-transform duration-200 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      <JsonLd data={faqJsonLd()} />
    </div>
  );
}

function Dot() {
  return <span className="h-1.5 w-1.5 rounded-full bg-accent/70" />;
}
