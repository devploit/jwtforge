"use client";

import type { ArtifactConfig } from "@/lib/artifacts";

export function ArtifactConfigForm({
  config,
  onChange,
}: {
  config: ArtifactConfig;
  onChange: (c: ArtifactConfig) => void;
}) {
  function set<K extends keyof ArtifactConfig>(key: K, value: ArtifactConfig[K]) {
    onChange({ ...config, [key]: value });
  }

  return (
    <fieldset className="panel space-y-3 p-4">
      <legend className="px-1 text-sm font-semibold text-slate-100">
        Export target (used in artifacts only — no request is sent)
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="cfg-url" className="label">
            Target URL
          </label>
          <input
            id="cfg-url"
            className="field"
            value={config.targetUrl}
            onChange={(e) => set("targetUrl", e.target.value)}
            placeholder="https://target.example/api/me"
          />
        </div>
        <div>
          <label htmlFor="cfg-method" className="label">
            Method
          </label>
          <select
            id="cfg-method"
            className="field"
            value={config.method}
            onChange={(e) => set("method", e.target.value)}
          >
            {["GET", "POST", "PUT", "DELETE", "PATCH"].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="cfg-header" className="label">
            Header name
          </label>
          <input
            id="cfg-header"
            className="field"
            value={config.headerName}
            onChange={(e) => set("headerName", e.target.value)}
            placeholder="Authorization"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="cfg-prefix" className="label">
            Token prefix
          </label>
          <input
            id="cfg-prefix"
            className="field"
            value={config.headerPrefix}
            onChange={(e) => set("headerPrefix", e.target.value)}
            placeholder="Bearer "
          />
        </div>
      </div>
    </fieldset>
  );
}
