import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/lib/seo";

export const metadata: Metadata = {
  title: "JWT Security Guides",
  description:
    "Practical guides to common JWT vulnerabilities — algorithm confusion, alg:none and more — with how to test and how to fix each, plus the tool to try them.",
  alternates: { canonical: "/guides" },
  openGraph: {
    title: "JWT Security Guides — JWTForge",
    description:
      "Practical, honest guides to common JWT vulnerabilities, with how to test and how to fix each.",
    url: "/guides",
    images: ["/og.png"],
  },
};

export default function GuidesPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-50">JWT security guides</h1>
        <p className="text-sm text-slate-400">
          Short, practical explainers on common JWT vulnerabilities — what they
          are, how to test for them, and how to fix them. Each links to the tool
          so you can try it on a token you are authorized to test.
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        {GUIDES.map((g) => (
          <li key={g.slug}>
            <Link
              href={`/guides/${g.slug}`}
              className="panel group flex h-full flex-col gap-2 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50"
            >
              <h2 className="text-lg font-bold text-slate-100">{g.title}</h2>
              <p className="text-sm leading-relaxed text-slate-400">{g.blurb}</p>
              <span className="mt-auto pt-2 text-sm font-medium text-accent transition-transform group-hover:translate-x-1">
                Read guide →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
