import { describe, it, expect } from "vitest";
import { decodeJwt } from "./jwt";
import { auditToken } from "./audit";

const NOW = new Date("2024-01-01T00:00:00Z");
const ids = (token: string) =>
  auditToken(decodeJwt(token), NOW).map((s) => s.id);

// {"alg":"none"}.{"sub":"admin","role":"admin"}.
const NONE = "eyJhbGciOiJub25lIn0.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiJ9.";
// {"alg":"HS256"}.{"sub":"x"}.sig
const HS = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ4In0.sig";
// {"alg":"RS256","kid":"k"}.{"email":"a@b.com"}.sig
const RS_KID =
  "eyJhbGciOiJSUzI1NiIsImtpZCI6ImsifQ.eyJlbWFpbCI6ImFAYi5jb20ifQ.sig";

describe("auditToken", () => {
  it("flags alg:none and privilege claims", () => {
    const i = ids(NONE);
    expect(i).toContain("alg-none");
    expect(i).toContain("priv-claims");
  });

  it("flags HMAC brute-force surface and missing exp", () => {
    const i = ids(HS);
    expect(i).toContain("hmac-bruteforce");
    expect(i).toContain("no-exp");
  });

  it("flags algorithm confusion, kid surface, and sensitive data", () => {
    const i = ids(RS_KID);
    expect(i).toContain("alg-confusion");
    expect(i).toContain("header-kid");
    expect(i).toContain("sensitive-data");
  });

  it("every signal is framed with why + how-to-test", () => {
    for (const s of auditToken(decodeJwt(RS_KID), NOW)) {
      expect(s.why.length).toBeGreaterThan(0);
      expect(s.howToTest.length).toBeGreaterThan(0);
    }
  });
});
