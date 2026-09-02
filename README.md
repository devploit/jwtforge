<div align="center">

<img src="public/logo.png" alt="JWTForge logo" width="120" height="120" />

# JWTForge — JWT Security Toolkit

**The attacker-minded, fully client-side alternative to jwt.io.**
Decode &amp; verify JWTs, audit them for vulnerability signals, and forge
attack tokens with ready-to-run artifacts — entirely in your browser.

[**jwtforge.com**](https://jwtforge.com) · MIT licensed · built with Next.js + WebCrypto

</div>

---

**Nothing ever leaves your browser.** No token, secret, or key is sent to a
server; the app makes no backend calls for any core feature. The one optional
outbound request is the JWKS-URL fetch on the Decode tab, which sends only the
URL you type — never your token. Verify it yourself in DevTools → Network.

### Why it exists

jwt.io is great at decoding. JWTForge is built for the **security** side of
JWTs that general decoders ignore: it surfaces vulnerability signals
(`alg:none`, weak/symmetric algorithms, RS→HS algorithm confusion,
`kid`/`jku`/`jwk` injection, sensitive claims) and generates working forged
tokens plus copy/download artifacts (curl, `.http`, Burp Intruder, nuclei,
`jwt_tool`) that you run from your own authorized environment.

## Local development

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run build    # production build (also runs the TypeScript type-check)
npm run start    # serve the production build
npm run lint     # eslint
npm test         # vitest — unit tests for the crypto/decode/audit/attack logic
```

Tests focus on the security-critical core: base64url round-trips, decode edge
cases, signature verification, and — crucially — that every attack generator
emits a **cryptographically valid forgery** (alg:none, kid `/dev/null`
empty-key, algorithm confusion, and a jwk-injection token that verifies against
its own embedded key). CI (GitHub Actions) runs lint + tests + build on every
push and PR.

Requires Node 18+ (developed on Node 22/26). No database, no secrets — deploys
to Cloudflare Workers via the OpenNext adapter (see below).

## The three tabs

1. **Decode** — Breaks a JWT into header / payload / signature (color-coded like
   jwt.io). Renders `exp` / `nbf` / `iat` as absolute + relative time with an
   explicit valid / expired / not-yet-valid badge. Verifies the signature with a
   pasted secret (HS\*), public key / JWK (RS\*/PS\*/ES\*), or an opt-in JWKS
   URL fetch. Editing the decoded header/payload re-encodes the token live.
   Tokens are shareable via a `#t=<jwt>` URL fragment (which never reaches a
   server) using the **Copy link** button.

2. **Audit** — Static heuristic signals: `alg:none`, weak/symmetric algorithms,
   algorithm-confusion risk, missing/over-long `exp`, future `iat`, sensitive
   data in the payload, and `kid`/`jku`/`x5u`/`jwk` injection surface. Each card
   explains **why it matters** and **how to actually test it**, and links to the
   matching Attack generator.

3. **Attack** — The differentiator. Generates malicious token variants and
   export artifacts:
   - `alg:none` family (`none`/`None`/`nOnE`/`NONE` variants)
   - Algorithm confusion (RS256 → HS256, signing with the RSA public key)
   - `kid` injection (path traversal, SQLi, command injection)
   - `jwk`/`jku`/`x5u` self-signed injection (generates an attacker keypair)
   - HS256 secret brute-force (dictionary attack in a **Web Worker**)
   - Claim tampering (escalate roles, change claims, re-sign or leave unsigned)

   For each, copy- or download-to-file **curl**, **.http** (VS Code REST Client /
   IntelliJ), **Burp Intruder** payload list, **nuclei** template, and the
   equivalent **jwt_tool** command — with placeholders for your target URL and
   header. The generated JWKS and attacker private key are downloadable too. The
   app never fires requests; you run the artifacts yourself.

## Privacy & threat model

- **Client-side only.** Decoding, verification, key generation, signing, and the
  brute-force all run in your browser via the native
  [WebCrypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API).
  Verify it yourself: open DevTools → Network and exercise every feature — no
  request carries your data.
- **One opt-in exception:** the Decode tab can fetch a JWKS from a URL *you*
  type, to verify against a published key set. It sends only that URL (never
  your token), is clearly labeled, and may be blocked by CORS.
- **No request sender by design.** A hosted proxy that relayed attacker-supplied
  requests would make this an SSRF/open-proxy liability and break the privacy
  guarantee. So the Attack tab emits artifacts you run from your own authorized
  environment instead.
- The currently-loaded token is kept in `localStorage` so it persists across
  tabs; clearing the input removes it.

## Honest scope of the Audit feature

A purely client-side tool **cannot** confirm a server is vulnerable — that is a
server-side property invisible from the token alone. JWTForge therefore **never
claims a token "is vulnerable."** Every Audit signal is a *hypothesis to verify*,
paired with how to test it. Proof comes from running the matching Attack-tab
artifact against a system you are authorized to test.

**Authorized testing only.** Forging tokens and testing them against systems you
do not own or lack written permission to test is illegal in most jurisdictions.
You are solely responsible for how you use the generated artifacts. The Attack
tab is gated behind a non-skippable acknowledgement.

## Supported algorithms

HS256/384/512 (HMAC), RS256/384/512 (RSASSA-PKCS1-v1_5), PS256/384/512
(RSA-PSS), and ES256/384/512 (ECDSA) — all via WebCrypto. Encrypted tokens (JWE,
5-segment) are not decoded.

## Tech stack & dependencies

- **Next.js (App Router) + TypeScript**, **Tailwind CSS**. Static-exportable;
  zero serverless functions for core features.
- **No JWT/crypto libraries.** All cryptography uses the native WebCrypto API,
  and base64url/JSON handling is a few lines of local code (`src/lib/`). This
  keeps the dependency surface minimal and auditable — appropriate for a
  security tool. The HS256 brute-force loop runs in a Web Worker
  (`src/workers/bruteforce.worker.ts`) so the UI never blocks.
- Runtime dependencies are limited to the framework itself (`next`, `react`,
  `react-dom`) plus `@opennextjs/cloudflare` (the build adapter that runs
  Next.js on Cloudflare Workers; it does not touch application data). Analytics
  is the Cloudflare Web Analytics beacon (privacy-friendly, cookieless visit
  counts and Core Web Vitals — the reported URL is reduced to origin + path in
  the browser, so the `#t=` token fragment and query string are never sent).
  Standard dev tooling otherwise (TypeScript, Tailwind, ESLint,
  PostCSS/Autoprefixer, Vitest, Wrangler). No dependency ever processes your
  token, secret, or keys.

## Security posture

A security tool should hold itself to its own standard:

- **Nonce-based Content-Security-Policy** (`script-src 'self' 'nonce-…'
  'strict-dynamic'` — no `unsafe-inline`), set per-request in `middleware.ts`,
  plus HSTS (preload), `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`,
  `X-Content-Type-Options: nosniff`, and a locked-down `Permissions-Policy`.
- `connect-src 'self' https:` is the one deliberate allowance — it exists so the
  opt-in JWKS-URL fetch can reach an issuer you specify. The app makes no
  automatic outbound calls.
- No runtime dependency ever processes your token, secret, or keys.
- **Tested:** a Vitest suite asserts the crypto core, including that every
  attack generator emits a cryptographically valid forgery; GitHub Actions runs
  lint + tests + build on every push and PR.

## Project layout

```
src/
  app/            # routes: / decode audit attack guides about (App Router)
  components/     # UI: shared + decode/ and attack/ panels
  lib/            # base64url, jwt, crypto, claims, audit, attacks, artifacts, seo
  workers/        # HS256 brute-force Web Worker
  middleware.ts   # per-request nonce CSP
```

## Deploy to Cloudflare Workers

The app is built with [OpenNext](https://opennext.js.org/cloudflare) and served
from a single Worker plus static assets (`wrangler.jsonc`, `open-next.config.ts`,
`public/_headers`). It fits the Workers Free plan (~1.2 MiB compressed).

- **Local preview on the Workers runtime:** `npm run preview`
- **Manual deploy:** `npm run deploy` (needs `npx wrangler login` once)
- **Git integration (recommended):** in the Cloudflare dashboard, Workers &
  Pages → Create → Import a repository. Build command
  `npx opennextjs-cloudflare build`, deploy command
  `npx opennextjs-cloudflare deploy`. Every push to `main` deploys; other
  branches get preview URLs.

The only optional setting is the `NEXT_PUBLIC_CF_BEACON_TOKEN` build variable
(Cloudflare Web Analytics site token). Without it the analytics beacon is simply
not rendered.
