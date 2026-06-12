"use client";

import { useCallback } from "react";

/** Triggers a client-side file download of `text` as `filename`. No upload. */
export function DownloadButton({
  text,
  filename,
  label = "Download",
  className = "",
}: {
  text: string;
  filename: string;
  label?: string;
  className?: string;
}) {
  const onDownload = useCallback(() => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [text, filename]);

  return (
    <button
      type="button"
      onClick={onDownload}
      className={`btn px-2.5 py-1 text-xs ${className}`}
      aria-label={`${label} ${filename}`}
      title={`Download ${filename}`}
    >
      ↓ {label}
    </button>
  );
}
