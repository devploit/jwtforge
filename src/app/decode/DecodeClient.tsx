"use client";

import { TokenInput } from "@/components/TokenInput";
import { SegmentPanels } from "@/components/decode/SegmentPanels";
import { ClaimsSummary } from "@/components/decode/ClaimsSummary";
import { VerifyPanel } from "@/components/decode/VerifyPanel";
import { EmptyState, ErrorState } from "@/components/EmptyOrError";
import { useDecoded } from "@/lib/use-decoded";

export function DecodeClient() {
  const { decoded, error, isEmpty } = useDecoded();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <TokenInput />
        {decoded && (
          <div className="space-y-4">
            <ClaimsSummary payload={decoded.payload} />
            <VerifyPanel decoded={decoded} />
          </div>
        )}
      </div>

      <div>
        {isEmpty && (
          <EmptyState>
            Paste a token (or click an example) to see the decoded header,
            payload, and signature here.
          </EmptyState>
        )}
        {error && <ErrorState message={error} />}
        {decoded && <SegmentPanels decoded={decoded} />}
      </div>
    </div>
  );
}
