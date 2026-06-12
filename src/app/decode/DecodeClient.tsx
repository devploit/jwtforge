"use client";

import { useState } from "react";
import { TokenInput } from "@/components/TokenInput";
import { SegmentPanels } from "@/components/decode/SegmentPanels";
import { ClaimsSummary } from "@/components/decode/ClaimsSummary";
import { VerifyPanel } from "@/components/decode/VerifyPanel";
import { EmptyState, ErrorState } from "@/components/EmptyOrError";
import { useDecoded } from "@/lib/use-decoded";

export function DecodeClient() {
  const { decoded, error, isEmpty } = useDecoded();
  // Shared verification key, lifted so the verify banner AND the live editor
  // (for re-signing edited claims) use the same secret/key.
  const [keyMaterial, setKeyMaterial] = useState("");
  const [secretBase64Url, setSecretBase64Url] = useState(false);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      {/* Encoded column */}
      <div className="space-y-4">
        <TokenInput />
        {decoded && (
          <>
            <VerifyPanel
              decoded={decoded}
              keyMaterial={keyMaterial}
              onKeyChange={setKeyMaterial}
              secretBase64Url={secretBase64Url}
              onSecretBase64UrlChange={setSecretBase64Url}
            />
            <ClaimsSummary payload={decoded.payload} />
          </>
        )}
      </div>

      {/* Decoded column */}
      <div>
        {isEmpty && (
          <EmptyState>
            Paste a token (or click an example) to see the decoded header,
            payload, and signature here — then edit any field to re-encode it
            live.
          </EmptyState>
        )}
        {error && <ErrorState message={error} />}
        {decoded && (
          <SegmentPanels
            decoded={decoded}
            keyMaterial={keyMaterial}
            secretBase64Url={secretBase64Url}
          />
        )}
      </div>
    </div>
  );
}
