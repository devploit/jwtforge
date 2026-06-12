import {
  base64UrlToString,
  isBase64Url,
  stringToBase64Url,
} from "./base64url";

export interface JwtHeader {
  alg?: string;
  typ?: string;
  kid?: string;
  jku?: string;
  x5u?: string;
  jwk?: unknown;
  [key: string]: unknown;
}

export interface JwtPayload {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  [key: string]: unknown;
}

export interface DecodedJwt {
  /** Raw segments exactly as supplied (base64url strings). */
  raw: {
    header: string;
    payload: string;
    signature: string;
    /** The `header.payload` string that the signature is computed over. */
    signingInput: string;
  };
  header: JwtHeader;
  payload: JwtPayload;
  /** Parsed JSON objects re-serialized for display. */
  headerJson: string;
  payloadJson: string;
}

export class JwtParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JwtParseError";
  }
}

/**
 * Decode a compact JWS/JWT. Does NOT verify the signature.
 * Throws JwtParseError with a human-readable reason on malformed input.
 */
export function decodeJwt(token: string): DecodedJwt {
  const trimmed = token.trim();
  if (!trimmed) {
    throw new JwtParseError("Token is empty.");
  }

  const parts = trimmed.split(".");
  if (parts.length !== 3) {
    throw new JwtParseError(
      `Expected 3 segments (header.payload.signature) but found ${parts.length}. ` +
        (parts.length === 5
          ? "This looks like a JWE (encrypted token), which this tool does not decode."
          : "Check for missing or extra dots."),
    );
  }

  const [headerB64, payloadB64, signatureB64] = parts;

  if (!isBase64Url(headerB64) || !isBase64Url(payloadB64)) {
    throw new JwtParseError(
      "Header or payload contains non-base64url characters (only A-Z a-z 0-9 - _ are allowed).",
    );
  }
  // An empty signature is legal (e.g. alg:none); a non-empty one must be base64url.
  if (signatureB64 && !isBase64Url(signatureB64)) {
    throw new JwtParseError("Signature segment contains non-base64url characters.");
  }

  let header: JwtHeader;
  let headerJson: string;
  try {
    const headerStr = base64UrlToString(headerB64);
    header = JSON.parse(headerStr) as JwtHeader;
    headerJson = JSON.stringify(header, null, 2);
  } catch {
    throw new JwtParseError("Header is not valid base64url-encoded JSON.");
  }

  let payload: JwtPayload;
  let payloadJson: string;
  try {
    const payloadStr = base64UrlToString(payloadB64);
    payload = JSON.parse(payloadStr) as JwtPayload;
    payloadJson = JSON.stringify(payload, null, 2);
  } catch {
    throw new JwtParseError("Payload is not valid base64url-encoded JSON.");
  }

  return {
    raw: {
      header: headerB64,
      payload: payloadB64,
      signature: signatureB64,
      signingInput: `${headerB64}.${payloadB64}`,
    },
    header,
    payload,
    headerJson,
    payloadJson,
  };
}

/** Build the `header.payload` signing input from JSON objects. */
export function buildSigningInput(
  header: Record<string, unknown>,
  payload: Record<string, unknown>,
): string {
  const headerB64 = stringToBase64Url(JSON.stringify(header));
  const payloadB64 = stringToBase64Url(JSON.stringify(payload));
  return `${headerB64}.${payloadB64}`;
}

/** Assemble a compact token from its three parts. */
export function assembleToken(
  signingInput: string,
  signatureB64: string,
): string {
  return `${signingInput}.${signatureB64}`;
}

/**
 * Find a JWT embedded in arbitrary pasted text — an `Authorization: Bearer …`
 * header, a curl command, a JSON blob, or quotes/whitespace. Every JWS starts
 * with `eyJ` (base64url of `{"`), so we match that shape. Returns the first
 * JWT found, or null if the text doesn't obviously contain one.
 */
export function extractJwt(text: string): string | null {
  const match = text.match(
    /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*/,
  );
  return match ? match[0] : null;
}

export type AlgFamily = "HMAC" | "RSA" | "RSA-PSS" | "ECDSA" | "none" | "unknown";

export function algFamily(alg: string | undefined): AlgFamily {
  if (!alg) return "unknown";
  const a = alg.toUpperCase();
  if (a === "NONE") return "none";
  if (a.startsWith("HS")) return "HMAC";
  if (a.startsWith("RS")) return "RSA";
  if (a.startsWith("PS")) return "RSA-PSS";
  if (a.startsWith("ES")) return "ECDSA";
  return "unknown";
}
