import { headers } from "next/headers";

/**
 * Renders a JSON-LD structured-data script, carrying the per-request CSP nonce
 * so it is allowed under the nonce-based Content-Security-Policy. Server-
 * rendered into the HTML so crawlers see it without executing JS.
 */
export async function JsonLd({ data }: { data: Record<string, unknown> }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      suppressHydrationWarning
      // Structured data is trusted, app-generated content (not user input).
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
