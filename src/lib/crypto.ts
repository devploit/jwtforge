import { base64UrlToBytes, bytesToBase64Url } from "./base64url";
import { algFamily } from "./jwt";

/**
 * Thin WebCrypto wrappers for the JWS algorithms this tool supports.
 * Everything runs in the browser; no key material leaves the page.
 */

const enc = new TextEncoder();

function hashForAlg(alg: string): string {
  const bits = alg.slice(2); // HS256 -> 256
  switch (bits) {
    case "256":
      return "SHA-256";
    case "384":
      return "SHA-384";
    case "512":
      return "SHA-512";
    default:
      throw new Error(`Unsupported hash size in algorithm "${alg}".`);
  }
}

const ecNamedCurve: Record<string, string> = {
  ES256: "P-256",
  ES384: "P-384",
  ES512: "P-521",
};

// ── HMAC (HS256/384/512) ────────────────────────────────────────────────

export async function hmacSign(
  alg: string,
  secret: Uint8Array | string,
  signingInput: string,
): Promise<string> {
  const keyData = typeof secret === "string" ? enc.encode(secret) : secret;
  const key = await crypto.subtle.importKey(
    "raw",
    toArrayBuffer(keyData),
    { name: "HMAC", hash: hashForAlg(alg) },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(signingInput),
  );
  return bytesToBase64Url(new Uint8Array(sig));
}

// ── PEM / key import ──────────────────────────────────────────────────────

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const cleaned = pem
    .replace(/-----BEGIN [^-]+-----/g, "")
    .replace(/-----END [^-]+-----/g, "")
    .replace(/\s+/g, "");
  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
}

function detectKeyFormat(key: string): "pem" | "jwk" {
  return key.trim().startsWith("{") ? "jwk" : "pem";
}

function importParams(
  alg: string,
): RsaHashedImportParams | EcKeyImportParams {
  const family = algFamily(alg);
  if (family === "RSA") {
    return { name: "RSASSA-PKCS1-v1_5", hash: hashForAlg(alg) };
  }
  if (family === "RSA-PSS") {
    return { name: "RSA-PSS", hash: hashForAlg(alg) };
  }
  if (family === "ECDSA") {
    return { name: "ECDSA", namedCurve: ecNamedCurve[alg] };
  }
  throw new Error(`No asymmetric import params for "${alg}".`);
}

export async function importPublicKey(
  alg: string,
  key: string,
): Promise<CryptoKey> {
  const params = importParams(alg);
  if (detectKeyFormat(key) === "jwk") {
    const jwk = JSON.parse(key) as JsonWebKey;
    return crypto.subtle.importKey("jwk", jwk, params, false, ["verify"]);
  }
  return crypto.subtle.importKey(
    "spki",
    pemToArrayBuffer(key),
    params,
    false,
    ["verify"],
  );
}

export async function importPrivateKey(
  alg: string,
  key: string,
): Promise<CryptoKey> {
  const params = importParams(alg);
  if (detectKeyFormat(key) === "jwk") {
    const jwk = JSON.parse(key) as JsonWebKey;
    return crypto.subtle.importKey("jwk", jwk, params, false, ["sign"]);
  }
  return crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(key),
    params,
    false,
    ["sign"],
  );
}

// ── Asymmetric verify / sign ──────────────────────────────────────────────

function verifyAlgorithm(alg: string): AlgorithmIdentifier | RsaPssParams | EcdsaParams {
  const family = algFamily(alg);
  if (family === "RSA") return { name: "RSASSA-PKCS1-v1_5" };
  if (family === "RSA-PSS") {
    return { name: "RSA-PSS", saltLength: Number(alg.slice(2)) / 8 };
  }
  if (family === "ECDSA") return { name: "ECDSA", hash: hashForAlg(alg) };
  throw new Error(`No verify algorithm for "${alg}".`);
}

async function asymmetricVerify(
  alg: string,
  publicKeyPem: string,
  signingInput: string,
  signatureB64: string,
): Promise<boolean> {
  const key = await importPublicKey(alg, publicKeyPem);
  return crypto.subtle.verify(
    verifyAlgorithm(alg),
    key,
    toArrayBuffer(base64UrlToBytes(signatureB64)),
    enc.encode(signingInput),
  );
}

export async function asymmetricSign(
  alg: string,
  privateKeyPem: string,
  signingInput: string,
): Promise<string> {
  const key = await importPrivateKey(alg, privateKeyPem);
  const sig = await crypto.subtle.sign(
    verifyAlgorithm(alg),
    key,
    enc.encode(signingInput),
  );
  return bytesToBase64Url(new Uint8Array(sig));
}

// ── Public verify entrypoint ──────────────────────────────────────────────

export type VerifyResult =
  | { status: "verified" }
  | { status: "failed" }
  | { status: "unsupported"; reason: string }
  | { status: "error"; reason: string };

/**
 * Verify a token's signature using the supplied secret (HS) or
 * public key / JWK (RS, PS, ES).
 */
export async function verifySignature(
  alg: string,
  signingInput: string,
  signatureB64: string,
  keyMaterial: string,
  opts: { secretBase64Url?: boolean } = {},
): Promise<VerifyResult> {
  const family = algFamily(alg);
  try {
    if (family === "none") {
      return {
        status: "unsupported",
        reason: "Algorithm is 'none' — there is no signature to verify.",
      };
    }
    if (family === "HMAC") {
      const secret = opts.secretBase64Url
        ? base64UrlToBytes(keyMaterial)
        : keyMaterial;
      const expected = await hmacSign(alg, secret, signingInput);
      const ok = constantTimeEqual(expected, signatureB64);
      return { status: ok ? "verified" : "failed" };
    }
    if (family === "RSA" || family === "RSA-PSS" || family === "ECDSA") {
      const ok = await asymmetricVerify(
        alg,
        keyMaterial,
        signingInput,
        signatureB64,
      );
      return { status: ok ? "verified" : "failed" };
    }
    return {
      status: "unsupported",
      reason: `Algorithm "${alg}" is not supported for verification.`,
    };
  } catch (err) {
    return {
      status: "error",
      reason: err instanceof Error ? err.message : "Unknown verification error.",
    };
  }
}

// ── RSA keypair generation (for jwk/jku self-signed attacks) ──────────────

export interface GeneratedKeyPair {
  publicJwk: JsonWebKey;
  privatePkcs8Pem: string;
  privateKey: CryptoKey;
}

export async function generateRsaKeyPair(): Promise<GeneratedKeyPair> {
  const pair = await crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"],
  );
  const publicJwk = await crypto.subtle.exportKey("jwk", pair.publicKey);
  const pkcs8 = await crypto.subtle.exportKey("pkcs8", pair.privateKey);
  return {
    publicJwk,
    privatePkcs8Pem: derToPem(new Uint8Array(pkcs8), "PRIVATE KEY"),
    privateKey: pair.privateKey,
  };
}

function derToPem(der: Uint8Array, label: string): string {
  let binary = "";
  for (let i = 0; i < der.length; i++) binary += String.fromCharCode(der[i]);
  const b64 = btoa(binary);
  const lines = b64.match(/.{1,64}/g) ?? [];
  return `-----BEGIN ${label}-----\n${lines.join("\n")}\n-----END ${label}-----`;
}

// ── helpers ────────────────────────────────────────────────────────────────

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
