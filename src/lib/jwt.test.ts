import { describe, it, expect } from "vitest";
import {
  decodeJwt,
  JwtParseError,
  extractJwt,
  algFamily,
  buildSigningInput,
  assembleToken,
} from "./jwt";

const HS = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMzM3In0.sig";

describe("decodeJwt", () => {
  it("decodes a valid token", () => {
    const d = decodeJwt(HS);
    expect(d.header.alg).toBe("HS256");
    expect(d.payload.sub).toBe("1337");
    expect(d.raw.signingInput).toBe(HS.split(".").slice(0, 2).join("."));
  });

  it("accepts an empty signature (alg:none style)", () => {
    const d = decodeJwt("eyJhbGciOiJub25lIn0.eyJhIjoxfQ.");
    expect(d.header.alg).toBe("none");
    expect(d.raw.signature).toBe("");
  });

  it("rejects wrong segment counts with a helpful message", () => {
    expect(() => decodeJwt("a.b")).toThrow(JwtParseError);
    expect(() => decodeJwt("a.b")).toThrow(/3 segments/);
    expect(() => decodeJwt("a.b.c.d.e")).toThrow(/JWE/);
  });

  it("rejects non-base64url and non-JSON", () => {
    expect(() => decodeJwt("@@@.bbb.ccc")).toThrow(/base64url/);
    expect(() => decodeJwt("YWJj.YWJj.x")).toThrow(/JSON/);
  });

  it("decodes unicode claims", () => {
    const d = decodeJwt(HS.replace(/\..*?\./, ".eyJuYW1lIjoiSm9zw6kifQ."));
    expect(d.payload.name).toBe("José");
  });
});

describe("extractJwt", () => {
  it("pulls a JWT out of an Authorization header", () => {
    expect(extractJwt(`Authorization: Bearer ${HS}`)).toBe(HS);
  });
  it("pulls a JWT out of a curl command", () => {
    expect(extractJwt(`curl -H 'auth: ${HS}' https://x`)).toBe(HS);
  });
  it("returns null when no JWT present", () => {
    expect(extractJwt("just some text")).toBeNull();
  });
});

describe("algFamily", () => {
  it("classifies algorithms", () => {
    expect(algFamily("HS256")).toBe("HMAC");
    expect(algFamily("RS512")).toBe("RSA");
    expect(algFamily("PS384")).toBe("RSA-PSS");
    expect(algFamily("ES256")).toBe("ECDSA");
    expect(algFamily("none")).toBe("none");
    expect(algFamily(undefined)).toBe("unknown");
  });
});

describe("buildSigningInput / assembleToken", () => {
  it("round-trips through decode", () => {
    const si = buildSigningInput({ alg: "HS256" }, { sub: "x" });
    const token = assembleToken(si, "");
    expect(decodeJwt(token).payload.sub).toBe("x");
  });
});
