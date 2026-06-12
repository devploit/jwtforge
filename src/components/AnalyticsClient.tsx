"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

/**
 * Vercel Web Analytics — privacy-friendly, cookieless, aggregate page-view
 * counts only. It never reads form/input values.
 *
 * Extra safeguard for this tool: tokens can live in a `#t=…` URL fragment
 * (shareable decode links). `beforeSend` strips the fragment and any `t` query
 * param from the reported URL so a token can never leave the browser via an
 * analytics event — preserving the privacy guarantee.
 */
function scrub(event: BeforeSendEvent): BeforeSendEvent | null {
  try {
    const url = new URL(event.url);
    url.hash = "";
    url.searchParams.delete("t");
    return { ...event, url: url.toString() };
  } catch {
    // If the URL can't be parsed, drop the event rather than risk leaking it.
    return null;
  }
}

export function AnalyticsClient() {
  return <Analytics beforeSend={scrub} />;
}
