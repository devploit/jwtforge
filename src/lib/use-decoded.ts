"use client";

import { decodeJwt, JwtParseError, type DecodedJwt } from "./jwt";
import { useToken } from "./token-context";

export interface DecodeState {
  token: string;
  decoded: DecodedJwt | null;
  error: string | null;
  isEmpty: boolean;
}

/**
 * Decode the currently-loaded token, with a friendly error. Decoding is cheap
 * and the React Compiler memoizes the render, so no manual useMemo is needed.
 */
export function useDecoded(): DecodeState {
  const { token } = useToken();
  const trimmed = token.trim();
  if (!trimmed) {
    return { token, decoded: null, error: null, isEmpty: true };
  }
  try {
    return { token, decoded: decodeJwt(trimmed), error: null, isEmpty: false };
  } catch (err) {
    const message =
      err instanceof JwtParseError
        ? err.message
        : "Could not decode this token.";
    return { token, decoded: null, error: message, isEmpty: false };
  }
}
