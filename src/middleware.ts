import { NextResponse, type NextRequest } from "next/server";

/**
 * Per-request nonce-based Content-Security-Policy. Replaces the static
 * 'unsafe-inline' script policy with a fresh nonce + 'strict-dynamic' so the
 * only scripts that run are Next's own (which inherit the nonce) — no inline
 * script injection. This is what earns an A on securityheaders.com.
 *
 * connect-src intentionally allows https: — that is the deliberate trade-off
 * for the opt-in "verify against a JWKS URL" feature, which fetches a key set
 * from a URL the user types. The app makes no automatic outbound calls; see the
 * About page. style-src keeps 'unsafe-inline' for React inline style attributes
 * (not a script-execution vector).
 */
export function middleware(request: NextRequest) {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  const nonce = btoa(bin);

  const isDev = process.env.NODE_ENV === "development";
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self' https:",
    "worker-src 'self' blob:",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; ");

  // Next reads the nonce from the request's CSP header and applies it to the
  // scripts it emits.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("content-security-policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("content-security-policy", csp);
  return response;
}

export const config = {
  // Run on documents only; skip static assets and metadata files so they stay
  // cacheable and don't need a nonce.
  matcher: [
    {
      source:
        "/((?!_next/static|_next/image|sw.js|manifest.webmanifest|robots.txt|sitemap.xml|icon.png|apple-icon.png|og.png|logo.png).*)",
    },
  ],
};
