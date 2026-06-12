/**
 * Renders a JSON-LD structured-data script. Server-rendered into the static
 * HTML so crawlers see it without executing JS.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Structured data is trusted, app-generated content (not user input).
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
