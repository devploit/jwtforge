# JWTForge — JWT Security Toolkit

A privacy-first, **fully client-side** JWT tooling site for security
professionals (pentesters, bug bounty hunters, AppSec engineers). It is the
"attacker-minded" alternative to jwt.io: decode and verify tokens, audit them
for security signals, and generate forged attack tokens with ready-to-run
artifacts.

**Nothing ever leaves your browser.** No token, secret, or key is sent to a
server. The app makes no backend calls for any core feature.

Live at **[jwtforge.com](https://jwtforge.com)**.

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
```

Requires Node 18+ (developed on Node 22/26). No environment variables, no
database, no secrets — deploys to Vercel as-is with the **Next.js** preset.

## The three tabs

1. **Decode** — Breaks a JWT into header / payload / signature (color-coded like
   jwt.io). Renders `exp` / `nbf` / `iat` as absolute + relative time with an
   explicit valid / expired / not-yet-valid badge. Verifies the signature with a
   pasted secret (HS\*), public key / JWK (RS\*/PS\*/ES\*), or an opt-in JWKS
   URL fetch. Editing the decoded header/payload re-encodes the token live.

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

   For each, copy-to-clipboard **curl**, **.http** (VS Code REST Client /
   IntelliJ), **Burp Intruder** payload list, **nuclei** template, and the
   equivalent **jwt_tool** command — with placeholders for your target URL and
   header. The app never fires requests; you run the artifacts yourself.

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
- Dependencies are limited to the framework itself (`next`, `react`,
  `react-dom`) and standard dev tooling (TypeScript, Tailwind, ESLint,
  PostCSS/Autoprefixer). No runtime dependency processes your token.

## Project layout

```
src/
  app/            # routes: / decode audit attack about (App Router)
  components/     # UI: shared + decode/ and attack/ panels
  lib/            # base64url, jwt, crypto, claims, audit, attacks, artifacts
  workers/        # HS256 brute-force Web Worker
```

## Deploy to Vercel

Import the repo, choose the **Next.js** preset (not "Other"), leave build /
output / install commands at their defaults, and set **no** environment
variables. That's it.
