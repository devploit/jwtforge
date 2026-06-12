"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Shared client state: the currently-loaded token, available to every tab.
 * Persisted to localStorage so navigating between routes (Decode/Audit/Attack)
 * keeps the token. Never leaves the browser.
 */

interface TokenContextValue {
  token: string;
  setToken: (t: string) => void;
}

const TokenContext = createContext<TokenContextValue | null>(null);
const STORAGE_KEY = "jwtforge:token";

export function TokenProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState("");
  const [hydrated, setHydrated] = useState(false);

  // Hydrate after mount (avoids SSR mismatch). A `#t=<jwt>` URL fragment wins
  // over the stored token so decode links are shareable; the fragment never
  // hits the network (fragments are not sent to servers).
  useEffect(() => {
    try {
      const hash = window.location.hash;
      const match = /[#&]t=([^&]+)/.exec(hash);
      if (match) {
        setTokenState(decodeURIComponent(match[1]));
        return;
      }
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setTokenState(saved);
    } catch {
      // localStorage / location may be unavailable; ignore.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (token) localStorage.setItem(STORAGE_KEY, token);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore persistence failures
    }
  }, [token, hydrated]);

  const value = useMemo<TokenContextValue>(
    () => ({ token, setToken: setTokenState }),
    [token],
  );

  return <TokenContext.Provider value={value}>{children}</TokenContext.Provider>;
}

export function useToken(): TokenContextValue {
  const ctx = useContext(TokenContext);
  if (!ctx) {
    throw new Error("useToken must be used within a TokenProvider.");
  }
  return ctx;
}
