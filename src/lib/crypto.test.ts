import { describe, it, expect } from "vitest";
import {
  hmacSign,
  verifySignature,
  asymmetricSign,
  generateRsaKeyPair,
} from "./crypto";

const INPUT = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ4In0";

describe("hmacSign", () => {
  it("treats an empty secret as a block-sized zero key (well-defined HMAC)", async () => {
    const a = await hmacSign("HS256", "", INPUT);
    const b = await hmacSign("HS256", new Uint8Array(64), INPUT);
    expect(a).toBe(b);
    expect(a.length).toBeGreaterThan(0);
  });

  it("is deterministic and key-dependent", async () => {
    expect(await hmacSign("HS256", "k", INPUT)).toBe(
      await hmacSign("HS256", "k", INPUT),
    );
    expect(await hmacSign("HS256", "k", INPUT)).not.toBe(
      await hmacSign("HS256", "other", INPUT),
    );
  });
});

describe("verifySignature (HMAC)", () => {
  it("verifies a correct secret and rejects a wrong one", async () => {
    const sig = await hmacSign("HS256", "secret", INPUT);
    expect(
      (await verifySignature("HS256", INPUT, sig, "secret")).status,
    ).toBe("verified");
    expect(
      (await verifySignature("HS256", INPUT, sig, "wrong")).status,
    ).toBe("failed");
  });

  it("supports base64url-encoded secrets", async () => {
    // secret bytes [1,2,3] => base64url "AQID"
    const secretBytes = new Uint8Array([1, 2, 3]);
    const sig = await hmacSign("HS256", secretBytes, INPUT);
    const res = await verifySignature("HS256", INPUT, sig, "AQID", {
      secretBase64Url: true,
    });
    expect(res.status).toBe("verified");
  });

  it("reports 'none' as unsupported", async () => {
    expect((await verifySignature("none", INPUT, "", "x")).status).toBe(
      "unsupported",
    );
  });
});

describe("asymmetric sign + verify", () => {
  it("RS256 round-trips against the public JWK", async () => {
    const { publicJwk, privatePkcs8Pem } = await generateRsaKeyPair();
    const sig = await asymmetricSign("RS256", privatePkcs8Pem, INPUT);
    const res = await verifySignature(
      "RS256",
      INPUT,
      sig,
      JSON.stringify(publicJwk),
    );
    expect(res.status).toBe("verified");
  });
});
