import Link from "next/link";
import { JsonLd } from "./JsonLd";
import { SITE_URL } from "@/lib/seo";

/**
 * Shared layout for /guides/* articles: breadcrumb, title, lead, prose body,
 * a CTA back into the tool, and Article + BreadcrumbList structured data.
 * Prose is styled with arbitrary child selectors so we avoid a typography
 * plugin dependency.
 */
export function GuideShell({
  slug,
  title,
  description,
  lead,
  updated,
  children,
}: {
  slug: string;
  title: string;
  description: string;
  lead: string;
  updated: string;
  children: React.ReactNode;
}) {
  const url = `${SITE_URL}/guides/${slug}`;
  return (
    <article className="mx-auto max-w-3xl space-y-6 py-2">
      <nav aria-label="Breadcrumb" className="text-xs text-slate-500">
        <Link href="/" className="hover:text-accent">
          Home
        </Link>
        <span className="mx-1.5">/</span>
        <Link href="/guides" className="hover:text-accent">
          Guides
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-slate-400">{title}</span>
      </nav>

      <header className="space-y-3">
        <h1 className="text-3xl font-bold leading-tight text-slate-50">
          {title}
        </h1>
        <p className="text-lg leading-relaxed text-slate-300">{lead}</p>
        <p className="text-xs text-slate-500">Updated {updated}</p>
      </header>

      <div
        className="space-y-4 text-[15px] leading-relaxed text-slate-300 [&_a]:text-accent [&_a:hover]:underline [&_code]:rounded [&_code]:bg-bg-inset [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[13px] [&_code]:text-accent-glow [&_h2]:mt-9 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-100 [&_li]:my-1 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_ul]:text-slate-300 [&_strong]:text-slate-100"
      >
        {children}
      </div>

      <div className="flex flex-wrap gap-3 border-t border-line pt-6">
        <Link href="/attack" className="btn btn-accent">
          Generate the attack token →
        </Link>
        <Link href="/decode" className="btn">
          Decode a token
        </Link>
        <Link href="/guides" className="btn">
          All guides
        </Link>
      </div>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TechArticle",
          headline: title,
          description,
          dateModified: updated,
          author: { "@type": "Organization", name: "JWTForge" },
          publisher: { "@type": "Organization", name: "JWTForge" },
          mainEntityOfPage: url,
          url,
          inLanguage: "en",
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            {
              "@type": "ListItem",
              position: 2,
              name: "Guides",
              item: `${SITE_URL}/guides`,
            },
            { "@type": "ListItem", position: 3, name: title, item: url },
          ],
        }}
      />
    </article>
  );
}
