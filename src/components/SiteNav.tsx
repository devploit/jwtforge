"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/decode", label: "Decode" },
  { href: "/audit", label: "Audit" },
  { href: "/attack", label: "Attack" },
  { href: "/guides", label: "Guides" },
  { href: "/about", label: "About" },
];

export function SiteNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="flex items-center gap-1">
      {TABS.map((tab) => {
        // The logo is "home"; on the landing page no tab is active. Section
        // pages (e.g. /guides/<slug>) keep their parent tab active.
        const active =
          pathname === tab.href ||
          (tab.href !== "/" && pathname.startsWith(`${tab.href}/`));
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "bg-accent/15 text-accent"
                : "text-slate-400 hover:bg-bg-raised hover:text-slate-100"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
