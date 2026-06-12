"use client";

import { useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { CodeBlock } from "@/components/CodeBlock";
import {
  buildArtifacts,
  type ArtifactConfig,
} from "@/lib/artifacts";
import type { GeneratedToken } from "@/lib/attacks";

type ArtifactKind = "curl" | "http" | "burp" | "nuclei" | "jwtTool";

const ARTIFACT_TABS: { key: ArtifactKind; label: string; lang: string }[] = [
  { key: "curl", label: "curl", lang: "bash" },
  { key: "http", label: ".http", lang: "http" },
  { key: "burp", label: "Burp Intruder", lang: "text" },
  { key: "nuclei", label: "nuclei", lang: "yaml" },
  { key: "jwtTool", label: "jwt_tool", lang: "bash" },
];

export function GeneratedTokens({
  tokens,
  config,
}: {
  tokens: GeneratedToken[];
  config: ArtifactConfig;
}) {
  const [tab, setTab] = useState<ArtifactKind>("curl");
  if (tokens.length === 0) return null;

  const bare = tokens.map((t) => t.token);
  const artifacts = buildArtifacts(config, bare);
  const current = artifacts[tab];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {tokens.map((t, i) => (
          <div key={i} className="rounded-md border border-line bg-bg-inset p-3">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-300">
                {t.label}
              </span>
              <CopyButton text={t.token} label="Copy token" />
            </div>
            <p className="break-all font-mono text-xs text-slate-200">
              {t.token}
            </p>
            {t.note && (
              <p className="mt-1 text-xs text-slate-500">{t.note}</p>
            )}
          </div>
        ))}
      </div>

      <div>
        <div
          role="tablist"
          aria-label="Export artifacts"
          className="flex flex-wrap gap-1 border-b border-line"
        >
          {ARTIFACT_TABS.map((a) => (
            <button
              key={a.key}
              role="tab"
              aria-selected={tab === a.key}
              type="button"
              onClick={() => setTab(a.key)}
              className={`rounded-t-md px-3 py-1.5 text-xs font-medium transition-colors ${
                tab === a.key
                  ? "bg-bg-raised text-accent"
                  : "text-slate-400 hover:text-slate-100"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
        <div className="pt-3">
          <CodeBlock
            code={current}
            title={ARTIFACT_TABS.find((a) => a.key === tab)?.label}
            language={ARTIFACT_TABS.find((a) => a.key === tab)?.lang}
          />
        </div>
      </div>
    </div>
  );
}
