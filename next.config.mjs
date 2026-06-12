/** @type {import('next').NextConfig} */

// Security headers. A JWT security tool should model good hygiene: lock down
// framing, sniffing and referrer leakage, and constrain what the page may load
// or connect to. The CSP allows only same-origin code/styles (plus the inline
// bootstrap Next emits), the brute-force Web Worker, and outbound fetches over
// HTTPS — which covers the one opt-in JWKS-URL fetch while blocking cleartext
// or unexpected exfiltration paths.
// Next's dev server (Turbopack / React Refresh) relies on eval(); production
// builds do not. So 'unsafe-eval' is allowed only in development.
const scriptSrc =
  process.env.NODE_ENV === "development"
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'";

const csp = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self' https:",
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "no-referrer" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
