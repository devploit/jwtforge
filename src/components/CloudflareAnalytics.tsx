import { headers } from "next/headers";

/**
 * Cloudflare Web Analytics beacon — privacy-friendly, cookieless, aggregate
 * page-view counts and Core Web Vitals only. It never reads form/input values.
 *
 * Privacy note for this tool: tokens can live in a `#t=…` URL fragment
 * (shareable decode links). The beacon normalizes the reported URL to
 * origin + pathname and drops the fragment, query string and credentials
 * client-side before anything is sent, so a token never leaves the browser via
 * an analytics event.
 *
 * Server-rendered with the per-request CSP nonce so it is allowed under the
 * nonce + 'strict-dynamic' script policy. Renders nothing when no beacon token
 * is configured (local dev, forks).
 */
const BEACON_TOKEN = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;

export async function CloudflareAnalytics() {
  if (!BEACON_TOKEN) return null;
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <script
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token: BEACON_TOKEN, spa: true })}
      nonce={nonce}
    />
  );
}
