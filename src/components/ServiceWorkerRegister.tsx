"use client";

import { useEffect } from "react";

/**
 * Registers the offline service worker in production only. Kept out of dev so
 * it never interferes with hot-reload, and guarded so a failure is silent.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    const register = () =>
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* registration failures are non-fatal */
      });
    // If the page already finished loading before this effect ran (fast loads),
    // the 'load' event won't fire again — register immediately in that case.
    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register);
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
