import { algFamily, type DecodedJwt } from "./jwt";

export type Severity = "high" | "medium" | "low" | "info";

export interface AuditSignal {
  id: string;
  title: string;
  severity: Severity;
  /** Why this matters, in plain English. */
  why: string;
  /** How to actually confirm it against a live server. */
  howToTest: string;
  /** Anchor id of the related Attack-tab generator, if any. */
  attackLink?: string;
  /** Slug of an in-depth /guides/<slug> article, if any. */
  guide?: string;
}

const SECRET_KEY_HINTS =
  /(password|passwd|pwd|secret|api[_-]?key|token|priv|ssn|credit|card|cvv)/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// 30+ days, expressed in seconds.
const LONG_LIVED_SECONDS = 30 * 24 * 3600;

function looksSensitive(key: string, value: unknown): boolean {
  if (SECRET_KEY_HINTS.test(key)) return true;
  if (typeof value === "string" && EMAIL_RE.test(value)) return true;
  return false;
}

/**
 * Static heuristic analysis of a decoded token. Every signal is a HYPOTHESIS
 * to verify against the server — never a confirmed finding. A purely
 * client-side tool cannot observe server behavior.
 */
export function auditToken(decoded: DecodedJwt, now: Date): AuditSignal[] {
  const signals: AuditSignal[] = [];
  const { header, payload, raw } = decoded;
  const alg = typeof header.alg === "string" ? header.alg : undefined;
  const family = algFamily(alg);
  const nowSec = now.getTime() / 1000;

  // alg:none
  if (family === "none") {
    signals.push({
      id: "alg-none",
      title: `Algorithm declared as "${alg}"`,
      severity: "high",
      why: "The token claims no signature algorithm. If the server accepts 'none', anyone can forge arbitrary tokens with no key at all.",
      howToTest:
        "Send a token with alg set to 'none' (and case variants) and an empty signature segment. If the server accepts it, authentication is fully bypassable.",
      attackLink: "alg-none",
      guide: "jwt-none-algorithm-attack",
    });
  }

  // Empty signature on a non-none alg
  if (family !== "none" && raw.signature === "") {
    signals.push({
      id: "empty-sig",
      title: "Signature segment is empty",
      severity: "high",
      why: "A non-'none' algorithm is declared but the signature is empty. Some libraries skip verification when the signature is blank.",
      howToTest:
        "Strip the signature from a valid token and replay it. If accepted, the server is not verifying signatures.",
      attackLink: "alg-none",
    });
  }

  // HMAC — brute-force surface
  if (family === "HMAC") {
    signals.push({
      id: "hmac-bruteforce",
      title: `Symmetric algorithm (${alg}) — secret may be brute-forceable`,
      severity: "medium",
      why: "HS256/384/512 are keyed with a shared secret. If that secret is weak or a common default, it can be recovered offline, letting you mint valid tokens.",
      howToTest:
        "Run the HS256 brute-force in the Attack tab against this token. If a secret is found, you can forge tokens accepted by the server.",
      attackLink: "bruteforce",
    });
  }

  // Algorithm-confusion (asymmetric)
  if (family === "RSA" || family === "RSA-PSS" || family === "ECDSA") {
    signals.push({
      id: "alg-confusion",
      title: `Asymmetric algorithm (${alg}) — RS→HS confusion risk`,
      severity: "medium",
      why: "If the server's verify routine picks the algorithm from the token header, an attacker can switch RS256→HS256 and sign with the PUBLIC key (which is not secret) used as an HMAC key.",
      howToTest:
        "Obtain the server's RSA public key, then use the Attack tab to re-sign the token as HS256 with that key as the HMAC secret. If accepted, the server trusts the header alg.",
      attackLink: "alg-confusion",
      guide: "jwt-algorithm-confusion",
    });
  }

  // Header injection surfaces
  for (const h of ["kid", "jku", "x5u"] as const) {
    if (header[h] != null) {
      signals.push({
        id: `header-${h}`,
        title: `"${h}" header present`,
        severity: h === "kid" ? "medium" : "high",
        why:
          h === "kid"
            ? "The 'kid' (key id) is often used to look up a key by path or DB query. Unsanitized, it is an injection vector (path traversal, SQLi, command injection)."
            : `"${h}" tells the server where to fetch the verification key. If attacker-controlled, you can point it at your own key (SSRF + key injection) and self-sign tokens.`,
        howToTest:
          h === "kid"
            ? "Use the Attack tab to inject path-traversal / SQLi / command-injection payloads into 'kid' and observe server behavior."
            : `Use the Attack tab to set "${h}" to an attacker-hosted key and sign with the matching private key. If verified, the server trusts attacker-supplied key sources.`,
        attackLink: h === "kid" ? "kid-injection" : "jwk-injection",
      });
    }
  }

  // Embedded jwk
  if (header.jwk != null) {
    signals.push({
      id: "header-jwk",
      title: '"jwk" header present (embedded public key)',
      severity: "high",
      why: "An embedded 'jwk' lets the token carry its own verification key. If the server trusts it, an attacker can embed their own key and self-sign any token.",
      howToTest:
        "Use the Attack tab to embed an attacker-generated key in the 'jwk' header and sign with the matching private key. If verified, signature checks are meaningless.",
      attackLink: "jwk-injection",
    });
  }

  // Missing exp
  if (typeof payload.exp !== "number") {
    signals.push({
      id: "no-exp",
      title: "No 'exp' (expiration) claim",
      severity: "medium",
      why: "Without an expiration, a leaked token is valid forever. Combined with no revocation, that is a long-lived credential.",
      howToTest:
        "Replay the token after a long delay. If still accepted, it does not expire server-side either.",
    });
  } else if (payload.exp - nowSec > LONG_LIVED_SECONDS) {
    signals.push({
      id: "long-lived",
      title: "Very long-lived token",
      severity: "low",
      why: "The token is valid for more than 30 days. Long lifetimes widen the window of abuse for a stolen token.",
      howToTest:
        "Note the exp date in the Decode tab. Long windows increase impact of any token leak.",
    });
  }

  // Missing nbf is informational only
  if (typeof payload.nbf !== "number") {
    signals.push({
      id: "no-nbf",
      title: "No 'nbf' (not-before) claim",
      severity: "info",
      why: "Not a vulnerability by itself, but its absence means the token is valid immediately on issue.",
      howToTest: "Informational — no server test needed.",
    });
  }

  // iat in the future
  if (typeof payload.iat === "number" && payload.iat > nowSec + 60) {
    signals.push({
      id: "iat-future",
      title: "'iat' (issued-at) is in the future",
      severity: "low",
      why: "A future issued-at can indicate clock skew, tampering, or a forged token.",
      howToTest:
        "Check whether the server validates iat. Some reject future-dated tokens; many ignore iat entirely.",
    });
  }

  // Sensitive data in payload
  const sensitiveKeys: string[] = [];
  for (const [k, v] of Object.entries(payload)) {
    if (looksSensitive(k, v)) sensitiveKeys.push(k);
  }
  if (sensitiveKeys.length > 0) {
    signals.push({
      id: "sensitive-data",
      title: `Possible sensitive data in payload (${sensitiveKeys.join(", ")})`,
      severity: "medium",
      why: "JWT payloads are only base64url-encoded, NOT encrypted. Anyone who sees the token reads every claim. PII, secrets, or internal IDs here are disclosed to the client and any intermediary.",
      howToTest:
        "Decode the token (anyone can). If it carries PII or secrets, that is an information-disclosure issue regardless of server behavior.",
    });
  }

  // Privilege-bearing claims worth tampering with
  const privKeys = Object.keys(payload).filter((k) =>
    /(role|admin|is_?admin|scope|scopes|perm|permission|group|tier|plan)/i.test(k),
  );
  if (privKeys.length > 0) {
    signals.push({
      id: "priv-claims",
      title: `Privilege claims present (${privKeys.join(", ")})`,
      severity: "low",
      why: "Authorization decisions may be driven by these claims. If the signature can be forged or stripped, escalating them is the payoff.",
      howToTest:
        "Use the Attack tab's claim-tampering generator to escalate these, then test whichever forging vector (none/confusion/weak-secret) applies.",
      attackLink: "tamper",
    });
  }

  if (signals.length === 0) {
    signals.push({
      id: "clean",
      title: "No obvious static red flags",
      severity: "info",
      why: "Static analysis surfaced nothing notable. That does NOT mean the server-side implementation is secure.",
      howToTest:
        "Server-side properties (key handling, alg enforcement, revocation) can't be observed from the token. Use the Attack tab to probe them.",
    });
  }

  return signals;
}
