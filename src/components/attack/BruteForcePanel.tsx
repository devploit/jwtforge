"use client";

import { useEffect, useRef, useState } from "react";
import { algFamily, type DecodedJwt } from "@/lib/jwt";
import { COMMON_SECRETS } from "@/lib/wordlist";
import type { WorkerOut } from "@/workers/bruteforce.worker";

type Status =
  | { kind: "idle" }
  | { kind: "running"; tried: number; total: number; current: string }
  | { kind: "found"; secret: string; tried: number }
  | { kind: "exhausted"; tried: number }
  | { kind: "stopped"; tried: number }
  | { kind: "error"; message: string };

export function BruteForcePanel({ decoded }: { decoded: DecodedJwt }) {
  const alg = typeof decoded.header.alg === "string" ? decoded.header.alg : "";
  const isHmac = algFamily(alg) === "HMAC";
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [userWords, setUserWords] = useState("");
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    return () => workerRef.current?.terminate();
  }, []);

  function start() {
    if (!isHmac) return;
    workerRef.current?.terminate();

    const extra = userWords
      .split("\n")
      .map((w) => w.replace(/\r$/, ""))
      .filter((w) => w.length > 0);
    // De-dupe while preserving order (built-in list first).
    const words = Array.from(new Set([...COMMON_SECRETS, ...extra]));

    const worker = new Worker(
      new URL("../../workers/bruteforce.worker.ts", import.meta.url),
    );
    workerRef.current = worker;
    setStatus({ kind: "running", tried: 0, total: words.length, current: "" });

    worker.onmessage = (e: MessageEvent<WorkerOut>) => {
      const msg = e.data;
      switch (msg.type) {
        case "progress":
          setStatus({
            kind: "running",
            tried: msg.tried,
            total: msg.total,
            current: msg.current,
          });
          break;
        case "found":
          setStatus({ kind: "found", secret: msg.secret, tried: msg.tried });
          worker.terminate();
          break;
        case "exhausted":
          setStatus({ kind: "exhausted", tried: msg.tried });
          worker.terminate();
          break;
        case "stopped":
          setStatus({ kind: "stopped", tried: msg.tried });
          worker.terminate();
          break;
        case "error":
          setStatus({ kind: "error", message: msg.message });
          worker.terminate();
          break;
      }
    };

    worker.postMessage({
      type: "start",
      alg,
      signingInput: decoded.raw.signingInput,
      signatureB64: decoded.raw.signature,
      words,
    });
  }

  function stop() {
    workerRef.current?.postMessage({ type: "stop" });
  }

  if (!isHmac) {
    return (
      <p className="text-sm text-slate-400">
        Brute-force applies to symmetric (HS256/384/512) tokens. This token uses{" "}
        <code className="text-slate-200">{alg || "an unknown alg"}</code>, so
        there is no shared secret to recover.
      </p>
    );
  }

  const running = status.kind === "running";

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-400">
        Runs a dictionary attack against this token in a Web Worker (off the
        main thread). The built-in wordlist has {COMMON_SECRETS.length} common
        secrets; add your own below, one per line.
      </p>

      <div>
        <label htmlFor="user-wordlist" className="label">
          Additional wordlist (optional)
        </label>
        <textarea
          id="user-wordlist"
          className="field min-h-[80px] resize-y"
          value={userWords}
          onChange={(e) => setUserWords(e.target.value)}
          placeholder={"custom-secret-1\ncompany-name-2024\n…"}
          disabled={running}
          spellCheck={false}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="btn btn-accent"
          onClick={start}
          disabled={running}
        >
          {running ? "Running…" : "Start brute-force"}
        </button>
        {running && (
          <button type="button" className="btn" onClick={stop}>
            Stop
          </button>
        )}
      </div>

      <StatusView status={status} />
    </div>
  );
}

function StatusView({ status }: { status: Status }) {
  if (status.kind === "idle") return null;

  if (status.kind === "running") {
    const pct =
      status.total > 0 ? Math.round((status.tried / status.total) * 100) : 0;
    return (
      <div className="space-y-1">
        <div className="h-2 overflow-hidden rounded bg-bg-inset">
          <div
            className="h-full bg-accent transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="font-mono text-xs text-slate-400">
          {status.tried}/{status.total} — trying “{status.current}”
        </p>
      </div>
    );
  }

  if (status.kind === "found") {
    return (
      <div className="panel border-green-500/40 bg-green-500/10 p-3">
        <p className="text-sm font-semibold text-green-400">
          Secret found after {status.tried} tries:
        </p>
        <p className="mt-1 break-all font-mono text-base text-green-300">
          {status.secret}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          You can now forge tokens: use this secret in the Decode tab&apos;s
          re-sign field or the claim-tampering generator above.
        </p>
      </div>
    );
  }

  if (status.kind === "exhausted") {
    return (
      <p className="text-sm text-sev-med">
        Wordlist exhausted after {status.tried} tries — no secret found. Try a
        larger wordlist; the secret may be strong.
      </p>
    );
  }

  if (status.kind === "stopped") {
    return (
      <p className="text-sm text-slate-400">
        Stopped after {status.tried} tries.
      </p>
    );
  }

  return <p className="text-sm text-sev-high">Error: {status.message}</p>;
}
