"use client";

import { useId, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { CodeBlock } from "@/components/CodeBlock";
import {
  buildArtifacts,
  type ArtifactConfig,
} from "@/lib/artifacts";
import type { GeneratedToken } from "@/lib/attacks";

type ArtifactKind = "curl" | "http" | "burp" | "nuclei" | "jwtTool";

const ARTIFACT_TABS: {
  key: ArtifactKind;
  label: string;
  lang: string;
  filename?: string;
}[] = [
  { key: "curl", label: "curl", lang: "bash", filename: "jwt-attack.sh" },
  { key: "http", label: ".http", lang: "http", filename: "jwt-attack.http" },
  { key: "burp", label: "Burp Intruder", lang: "text", filename: "jwt-tokens.txt" },
  { key: "nuclei", label: "nuclei", lang: "yaml", filename: "jwt-forged-token.yaml" },
  { key: "jwtTool", label: "jwt_tool", lang: "bash", filename: "jwt-tool.sh" },
];

export function GeneratedTokens({
  tokens,
  config,
}: {
  tokens: GeneratedToken[];
  config: ArtifactConfig;
}) {
  const [tab, setTab] = useState<ArtifactKind>("curl");
  const uid = useId();
  const tabId = (k: string) => `${uid}-tab-${k}`;
  const panelId = `${uid}-panel`;
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
              id={tabId(a.key)}
              aria-selected={tab === a.key}
              aria-controls={panelId}
              tabIndex={tab === a.key ? 0 : -1}
              type="button"
              onClick={() => setTab(a.key)}
              onKeyDown={(e) => {
                if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                e.preventDefault();
                const i = ARTIFACT_TABS.findIndex((t) => t.key === tab);
                const next =
                  e.key === "ArrowRight"
                    ? (i + 1) % ARTIFACT_TABS.length
                    : (i - 1 + ARTIFACT_TABS.length) % ARTIFACT_TABS.length;
                setTab(ARTIFACT_TABS[next].key);
                document.getElementById(tabId(ARTIFACT_TABS[next].key))?.focus();
              }}
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
        <div
          id={panelId}
          role="tabpanel"
          aria-labelledby={tabId(tab)}
          className="pt-3"
        >
          <CodeBlock
            code={current}
            title={ARTIFACT_TABS.find((a) => a.key === tab)?.label}
            language={ARTIFACT_TABS.find((a) => a.key === tab)?.lang}
            filename={ARTIFACT_TABS.find((a) => a.key === tab)?.filename}
          />
        </div>
      </div>
    </div>
  );
}
