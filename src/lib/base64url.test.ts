import { describe, it, expect } from "vitest";
import {
  base64UrlToBytes,
  bytesToBase64Url,
  base64UrlToString,
  stringToBase64Url,
  isBase64Url,
} from "./base64url";

describe("base64url", () => {
  it("round-trips strings (incl. unicode)", () => {
    for (const s of ["", "hello", '{"a":1}', "José 🚀 café", "日本語"]) {
      expect(base64UrlToString(stringToBase64Url(s))).toBe(s);
    }
  });

  it("round-trips bytes", () => {
    const bytes = new Uint8Array([0, 1, 2, 250, 255, 128]);
    expect([...base64UrlToBytes(bytesToBase64Url(bytes))]).toEqual([...bytes]);
  });

  it("produces url-safe output (no +/= chars)", () => {
    const out = stringToBase64Url("???>>>???");
    expect(out).not.toMatch(/[+/=]/);
  });

  it("validates base64url charset", () => {
    expect(isBase64Url("aZ09-_")).toBe(true);
    expect(isBase64Url("a+b")).toBe(false);
    expect(isBase64Url("a=b")).toBe(false);
  });
});
