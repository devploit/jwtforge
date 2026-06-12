"use client";

import { useRef, type ChangeEvent, type UIEvent } from "react";

/**
 * A JWT text editor with inline, segment color-coded syntax highlighting —
 * the signature jwt.io affordance, done with an aligned highlight layer behind
 * a transparent-text textarea so the caret, selection, and editing all work
 * natively. header = violet, payload = blue, signature = light, dots dim,
 * anything past the third segment = error red.
 */
export function JwtEditor({
  value,
  onChange,
  id,
  ariaLabel = "JWT",
  ariaDescribedBy,
  rows = 5,
  placeholder = "Paste a JWT here — eyJhbGciOi…",
}: {
  value: string;
  onChange: (v: string) => void;
  id?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  rows?: number;
  placeholder?: string;
}) {
  const preRef = useRef<HTMLPreElement>(null);

  function syncScroll(e: UIEvent<HTMLTextAreaElement>) {
    if (preRef.current) {
      preRef.current.scrollTop = e.currentTarget.scrollTop;
      preRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  }

  // Shared box model so the overlay and textarea align exactly.
  const boxClasses =
    "m-0 w-full whitespace-pre-wrap break-all rounded-lg border px-3.5 py-2.5 font-mono text-sm leading-relaxed";

  return (
    <div className="relative">
      <pre
        ref={preRef}
        aria-hidden="true"
        className={`${boxClasses} pointer-events-none absolute inset-0 overflow-hidden border-transparent`}
      >
        {value ? <Highlight value={value} /> : null}
        {/* trailing newline keeps the last line height stable */}
        {"\n"}
      </pre>
      <textarea
        id={id}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        value={value}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
        onScroll={syncScroll}
        rows={rows}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        placeholder={placeholder}
        className={`${boxClasses} relative resize-y border-line bg-bg-inset/80 text-transparent caret-accent transition-colors placeholder:text-slate-600 focus:border-accent/60 focus:bg-bg-inset`}
      />
    </div>
  );
}

const SEGMENT_CLASSES = ["text-seg-header", "text-seg-payload", "text-seg-sig"];

function Highlight({ value }: { value: string }) {
  const parts = value.split(".");
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {i > 0 && <span className="text-slate-600">.</span>}
          <span
            className={i < 3 ? SEGMENT_CLASSES[i] : "text-sev-high underline decoration-sev-high/50"}
          >
            {part}
          </span>
        </span>
      ))}
    </>
  );
}
