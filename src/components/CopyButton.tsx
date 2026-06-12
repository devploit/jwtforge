"use client";

import { useCallback, useState } from "react";

export function CopyButton({
  text,
  label = "Copy",
  className = "",
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API may be blocked; fail quietly with a visible hint.
      setCopied(false);
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={onCopy}
      className={`btn ${copied ? "btn-accent" : ""} ${className}`}
      aria-label={copied ? "Copied" : label}
    >
      {copied ? "Copied ✓" : label}
    </button>
  );
}
