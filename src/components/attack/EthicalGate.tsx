"use client";

import { useEffect, useState } from "react";

const KEY = "jwtforge:ethics-ack";

/**
 * Non-skippable ethical-use gate. The attack generators are hidden until the
 * user explicitly acknowledges they will only test systems they are
 * authorized to test. Acknowledgement is remembered for the session.
 */
export function EthicalGate({ children }: { children: React.ReactNode }) {
  const [ack, setAck] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      setAck(sessionStorage.getItem(KEY) === "1");
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  function accept() {
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setAck(true);
  }

  if (!hydrated) return null;

  if (!ack) {
    return (
      <div className="panel border-sev-high/40 bg-sev-high/5 p-6">
        <h2 className="text-lg font-semibold text-sev-high">
          Authorized testing only
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          The Attack tab generates forged JWTs and attack artifacts. Using them
          against systems you do not own or have explicit written permission to
          test is illegal in most jurisdictions and unethical.
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-400">
          <li>Only target systems within an authorized engagement scope.</li>
          <li>JWTForge never sends requests — you run the artifacts yourself.</li>
          <li>You are solely responsible for how you use the output.</li>
        </ul>
        <button type="button" className="btn btn-accent mt-4" onClick={accept}>
          I understand — I will only test systems I am authorized to test
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
