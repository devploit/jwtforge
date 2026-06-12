/// <reference lib="webworker" />

/**
 * HS256/384/512 dictionary brute-force, run off the main thread so the UI
 * never blocks. Uses WebCrypto HMAC. Reports progress and the found secret.
 * Pure client-side — no network.
 */

import { bytesToBase64Url } from "@/lib/base64url";

type StartMessage = {
  type: "start";
  alg: string;
  signingInput: string;
  signatureB64: string;
  words: string[];
};

type StopMessage = { type: "stop" };
type InMessage = StartMessage | StopMessage;

export type WorkerOut =
  | { type: "progress"; tried: number; total: number; current: string }
  | { type: "found"; secret: string; tried: number }
  | { type: "exhausted"; tried: number }
  | { type: "stopped"; tried: number }
  | { type: "error"; message: string };

const ctx = self as unknown as DedicatedWorkerGlobalScope;
const enc = new TextEncoder();
let cancelled = false;

function hashForAlg(alg: string): string {
  switch (alg.slice(2)) {
    case "256":
      return "SHA-256";
    case "384":
      return "SHA-384";
    case "512":
      return "SHA-512";
    default:
      throw new Error(`Unsupported HMAC algorithm "${alg}".`);
  }
}

async function hmac(
  hash: string,
  secret: string,
  signingInput: string,
): Promise<string> {
  let keyData: Uint8Array = enc.encode(secret);
  // WebCrypto rejects an empty HMAC key; an empty key is equivalent to a
  // block-sized zero key (HMAC zero-pads short keys), so we can still test for
  // an empty/blank secret — a real misconfiguration.
  if (keyData.length === 0) {
    keyData = new Uint8Array(hash === "SHA-256" ? 64 : 128);
  }
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(signingInput));
  return bytesToBase64Url(new Uint8Array(sig));
}

async function run(msg: StartMessage): Promise<void> {
  const { alg, signingInput, signatureB64, words } = msg;
  const hash = hashForAlg(alg);
  const total = words.length;
  const post = (m: WorkerOut) => ctx.postMessage(m);

  for (let i = 0; i < total; i++) {
    if (cancelled) {
      post({ type: "stopped", tried: i });
      return;
    }
    const candidate = words[i];
    const sig = await hmac(hash, candidate, signingInput);
    if (sig === signatureB64) {
      post({ type: "found", secret: candidate, tried: i + 1 });
      return;
    }
    // Throttle progress messages so we don't flood the main thread.
    if (i % 200 === 0 || i === total - 1) {
      post({ type: "progress", tried: i + 1, total, current: candidate });
    }
  }
  post({ type: "exhausted", tried: total });
}

ctx.addEventListener("message", (event: MessageEvent<InMessage>) => {
  const data = event.data;
  if (data.type === "stop") {
    cancelled = true;
    return;
  }
  if (data.type === "start") {
    cancelled = false;
    run(data).catch((err: unknown) => {
      ctx.postMessage({
        type: "error",
        message: err instanceof Error ? err.message : "Brute-force failed.",
      } satisfies WorkerOut);
    });
  }
});
