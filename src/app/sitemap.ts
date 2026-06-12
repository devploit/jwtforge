import type { MetadataRoute } from "next";
import { GUIDES } from "@/lib/seo";

const SITE_URL = "https://jwtforge.com";

// Static build date; bump on meaningful content changes. Avoids Date.now()
// churn that would change the sitemap on every build.
const LAST_MODIFIED = "2026-06-12";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1.0, freq: "monthly" },
    { path: "/decode", priority: 0.9, freq: "monthly" },
    { path: "/attack", priority: 0.9, freq: "monthly" },
    { path: "/audit", priority: 0.8, freq: "monthly" },
    { path: "/guides", priority: 0.7, freq: "monthly" },
    { path: "/about", priority: 0.6, freq: "yearly" },
    ...GUIDES.map((g) => ({
      path: `/guides/${g.slug}`,
      priority: 0.7,
      freq: "monthly" as const,
    })),
  ];
  return routes.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: LAST_MODIFIED,
    changeFrequency: r.freq,
    priority: r.priority,
  }));
}
