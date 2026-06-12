import type { JwtPayload } from "./jwt";

export interface TimeClaim {
  name: "exp" | "nbf" | "iat";
  raw: number;
  date: Date;
  absolute: string;
  relative: string;
}

export type ValidityState =
  | { kind: "valid" }
  | { kind: "expired"; since: string }
  | { kind: "not-yet-valid"; until: string }
  | { kind: "no-exp" };

const RELATIVE = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

export function relativeTime(target: Date, now: Date): string {
  const diffMs = target.getTime() - now.getTime();
  const abs = Math.abs(diffMs);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 365 * 24 * 3600e3],
    ["month", 30 * 24 * 3600e3],
    ["day", 24 * 3600e3],
    ["hour", 3600e3],
    ["minute", 60e3],
    ["second", 1e3],
  ];
  for (const [unit, ms] of units) {
    if (abs >= ms || unit === "second") {
      return RELATIVE.format(Math.round(diffMs / ms), unit);
    }
  }
  return RELATIVE.format(0, "second");
}

export function parseTimeClaim(
  name: TimeClaim["name"],
  value: unknown,
  now: Date,
): TimeClaim | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const date = new Date(value * 1000);
  return {
    name,
    raw: value,
    date,
    absolute: date.toUTCString(),
    relative: relativeTime(date, now),
  };
}

export function getTimeClaims(payload: JwtPayload, now: Date): TimeClaim[] {
  const claims: TimeClaim[] = [];
  for (const name of ["iat", "nbf", "exp"] as const) {
    const claim = parseTimeClaim(name, payload[name], now);
    if (claim) claims.push(claim);
  }
  return claims;
}

export function getValidity(payload: JwtPayload, now: Date): ValidityState {
  const nowSec = now.getTime() / 1000;
  if (typeof payload.nbf === "number" && nowSec < payload.nbf) {
    return {
      kind: "not-yet-valid",
      until: relativeTime(new Date(payload.nbf * 1000), now),
    };
  }
  if (typeof payload.exp !== "number") {
    return { kind: "no-exp" };
  }
  if (nowSec >= payload.exp) {
    return {
      kind: "expired",
      since: relativeTime(new Date(payload.exp * 1000), now),
    };
  }
  return { kind: "valid" };
}
