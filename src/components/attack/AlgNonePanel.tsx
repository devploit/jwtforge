"use client";

import { useMemo } from "react";
import type { DecodedJwt } from "@/lib/jwt";
import { generateAlgNone } from "@/lib/attacks";
import type { ArtifactConfig } from "@/lib/artifacts";
import { GeneratedTokens } from "./GeneratedTokens";

export function AlgNonePanel({
  decoded,
  config,
}: {
  decoded: DecodedJwt;
  config: ArtifactConfig;
}) {
  const tokens = useMemo(() => generateAlgNone(decoded), [decoded]);
  return <GeneratedTokens tokens={tokens} config={config} />;
}
