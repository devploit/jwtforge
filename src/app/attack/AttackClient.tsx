"use client";

import { useState } from "react";
import { TokenInput } from "@/components/TokenInput";
import { EmptyState, ErrorState } from "@/components/EmptyOrError";
import { useDecoded } from "@/lib/use-decoded";
import {
  DEFAULT_ARTIFACT_CONFIG,
  type ArtifactConfig,
} from "@/lib/artifacts";
import { EthicalGate } from "@/components/attack/EthicalGate";
import { ArtifactConfigForm } from "@/components/attack/ArtifactConfigForm";
import { AttackSection } from "@/components/attack/AttackSection";
import { AlgNonePanel } from "@/components/attack/AlgNonePanel";
import { AlgConfusionPanel } from "@/components/attack/AlgConfusionPanel";
import { KidInjectionPanel } from "@/components/attack/KidInjectionPanel";
import { JwkInjectionPanel } from "@/components/attack/JwkInjectionPanel";
import { TamperPanel } from "@/components/attack/TamperPanel";
import { BruteForcePanel } from "@/components/attack/BruteForcePanel";

export function AttackClient() {
  const { decoded, error, isEmpty } = useDecoded();
  const [config, setConfig] = useState<ArtifactConfig>(DEFAULT_ARTIFACT_CONFIG);

  return (
    <div className="space-y-5">
      <TokenInput rows={4} />

      <EthicalGate>
        {isEmpty && (
          <EmptyState>
            Paste a token (or pick an example) to generate attack variants and
            export artifacts.
          </EmptyState>
        )}
        {error && <ErrorState message={error} />}

        {decoded && (
          <div className="space-y-5">
            <JumpNav />
            <ArtifactConfigForm config={config} onChange={setConfig} />

            <AttackSection
              id="alg-none"
              title="alg:none family"
              description="Strips the signature and emits none / None / nOnE / NONE variants to bypass naive case-sensitive filters."
            >
              <AlgNonePanel decoded={decoded} config={config} />
            </AttackSection>

            <AttackSection
              id="alg-confusion"
              title="Algorithm confusion (RS256 → HS256)"
              description="Re-signs the token with HMAC using the server's RSA public key as the secret. Works when the server picks the verify algorithm from the token header."
            >
              <AlgConfusionPanel decoded={decoded} config={config} />
            </AttackSection>

            <AttackSection
              id="kid-injection"
              title="kid injection"
              description="Injects path-traversal, SQLi and command-injection payloads into the kid header. The /dev/null variant is signed with an empty key — a working forgery if the server resolves kid to a file."
            >
              <KidInjectionPanel decoded={decoded} config={config} />
            </AttackSection>

            <AttackSection
              id="jwk-injection"
              title="jwk / jku / x5u self-signed injection"
              description="Generates an attacker keypair in your browser and embeds the public key (jwk) or points to an attacker-hosted JWKS (jku), then self-signs the token."
            >
              <JwkInjectionPanel decoded={decoded} config={config} />
            </AttackSection>

            <AttackSection
              id="bruteforce"
              title="HS256 secret brute-force"
              description="Dictionary attack against the token's HMAC secret, run in a Web Worker. Built-in wordlist plus your own."
            >
              <BruteForcePanel decoded={decoded} />
            </AttackSection>

            <AttackSection
              id="tamper"
              title="Claim tampering"
              description="Edit any claim (escalate role/admin, change iss/aud/sub, extend exp) and re-sign with a chosen secret or key — or leave it unsigned."
            >
              <TamperPanel decoded={decoded} config={config} />
            </AttackSection>
          </div>
        )}
      </EthicalGate>
    </div>
  );
}

const JUMP_LINKS = [
  ["alg-none", "alg:none"],
  ["alg-confusion", "confusion"],
  ["kid-injection", "kid"],
  ["jwk-injection", "jwk/jku"],
  ["bruteforce", "brute-force"],
  ["tamper", "tamper"],
];

function JumpNav() {
  return (
    <nav
      aria-label="Jump to attack generator"
      className="sticky top-[57px] z-30 -mx-4 overflow-x-auto border-y border-line/70 bg-bg/80 px-4 py-2 backdrop-blur-xl"
    >
      <ul className="flex gap-2">
        {JUMP_LINKS.map(([id, label]) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className="inline-block whitespace-nowrap rounded-md border border-line bg-bg-raised/60 px-2.5 py-1 font-mono text-xs text-slate-300 transition-colors hover:border-accent/50 hover:text-accent"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
