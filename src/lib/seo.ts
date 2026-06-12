export const SITE_URL = "https://jwtforge.com";

export interface GuideMeta {
  slug: string;
  title: string;
  description: string;
  blurb: string;
}

/** Long-tail guide articles. Source of truth for the index + sitemap. */
export const GUIDES: GuideMeta[] = [
  {
    slug: "jwt-algorithm-confusion",
    title: "JWT Algorithm Confusion (RS256 → HS256)",
    description:
      "How the JWT algorithm-confusion attack works, how to test for it, and how to fix it: forcing a server to verify an RS256 token as HS256 using its public key as the HMAC secret.",
    blurb:
      "Force a server to verify an RS256 token as HS256 using its public key as the HMAC secret — and how to fix it.",
  },
  {
    slug: "jwt-none-algorithm-attack",
    title: "The JWT alg:none Attack",
    description:
      "How the JWT 'alg:none' attack bypasses signature verification, the case-variant filter bypasses, how to test for it, and how to remediate it.",
    blurb:
      "Strip the signature and set alg to none to bypass verification — variants, testing, and remediation.",
  },
];

export interface Faq {
  q: string;
  a: string;
}

/**
 * FAQ content — rendered VISIBLY on the homepage AND emitted as FAQPage
 * JSON-LD from this same source, so the structured data always matches the
 * visible content (a Google rich-results requirement). Answers are written to
 * be genuinely useful and to read naturally, not to keyword-stuff.
 */
export const FAQS: Faq[] = [
  {
    q: "Does JWTForge send my token, secret, or keys to a server?",
    a: "No. JWTForge is 100% client-side. Decoding, signature verification, key generation, signing, and the HS256 brute-force all run in your browser via the WebCrypto API. You can confirm it by opening your browser's DevTools Network tab — no request carries your data. The only optional outbound request is the JWKS-URL fetch on the Decode tab, which sends only the URL you type, never your token.",
  },
  {
    q: "What is a JWT security scanner and how is JWTForge different from a decoder?",
    a: "A JWT security scanner looks beyond decoding to flag implementation weaknesses an attacker could exploit — things like the alg:none bypass, weak HMAC secrets, RS256-to-HS256 algorithm confusion, and kid/jku/jwk header injection. JWTForge's Audit tab surfaces those signals, and its Attack tab generates the forged tokens and ready-to-run artifacts you use to actually test them.",
  },
  {
    q: "How do I test a JWT for the alg:none vulnerability?",
    a: "Open the Attack tab and use the alg:none generator. It strips the signature and produces none, None, nOnE and NONE header variants to defeat naive case-sensitive filters, then exports curl, .http, Burp, nuclei and jwt_tool artifacts. Send them to a system you are authorized to test; if the server accepts an unsigned token, authentication is bypassable.",
  },
  {
    q: "What is JWT algorithm confusion (RS256 to HS256)?",
    a: "If a server picks the verification algorithm from the token header, an attacker can switch RS256 to HS256 and sign the token with the server's RSA public key — which is not secret — used as the HMAC key. JWTForge's algorithm-confusion generator re-signs your token this way so you can check whether the server trusts the header's algorithm.",
  },
  {
    q: "Can I brute-force a JWT secret in the browser?",
    a: "Yes. The Attack tab includes an HS256/384/512 dictionary brute-forcer that runs in a Web Worker so the UI never blocks. It ships with a wordlist of common leaked secrets and accepts your own. If a weak secret is recovered, you can forge tokens the server will accept. It is entirely client-side — nothing is uploaded.",
  },
  {
    q: "Is JWTForge a jwt_tool alternative I can use online?",
    a: "JWTForge covers much of the same JWT attack surface as jwt_tool — alg:none, algorithm confusion, kid/jwk/jku injection, claim tampering and secret brute-force — directly in the browser with no install. For each attack it also emits the equivalent jwt_tool command, so you can pivot to the CLI when you want to fire requests at a target yourself.",
  },
  {
    q: "Does the Audit tab confirm that my server is vulnerable?",
    a: "No, and it never claims to. Whether a server accepts alg:none, mishandles algorithm selection, or uses a weak secret is a server-side property that cannot be observed from the token alone. Every Audit signal is a hypothesis to verify, paired with how to test it. The proof comes from running the matching Attack artifact against a system you are authorized to test.",
  },
];

/** Sitewide SoftwareApplication / WebApplication structured data. */
export function appJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "JWTForge",
    alternateName: "JWTForge — JWT Security Toolkit",
    url: SITE_URL,
    description:
      "Privacy-first, fully client-side JWT security toolkit: decode and verify, audit for vulnerability signals, and generate attack tokens (alg:none, RS→HS confusion, kid/jwk injection, HS256 brute-force) with ready-to-run curl, Burp, nuclei and jwt_tool artifacts.",
    applicationCategory: "SecurityApplication",
    operatingSystem: "Any (web browser)",
    browserRequirements: "Requires JavaScript and the WebCrypto API.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    isAccessibleForFree: true,
    inLanguage: "en",
    image: `${SITE_URL}/og.png`,
    featureList: [
      "JWT decoder and signature verifier (HS/RS/PS/ES)",
      "JWT vulnerability checker / security scanner",
      "alg:none attack token generator",
      "RS256 to HS256 algorithm-confusion generator",
      "kid / jwk / jku injection generator",
      "HS256 secret brute-force (in-browser Web Worker)",
      "Claim tampering and re-signing",
      "Export to curl, .http, Burp Intruder, nuclei and jwt_tool",
    ],
  };
}

/** WebSite structured data. */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "JWTForge",
    url: SITE_URL,
    inLanguage: "en",
  };
}

/** FAQPage structured data built from the visible FAQ list. */
export function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
