"use client";

import { useRef, type ChangeEvent, type UIEvent } from "react";

/**
 * An editable JSON field with full syntax highlighting (keys, strings, numbers,
 * booleans, null, punctuation each colored) — like jwt.io's decoded panels, but
 * editable. Uses the same aligned-overlay technique as JwtEditor: a colored
 * <pre> behind a transparent-text <textarea>, so editing/caret/selection stay
 * native while the content is colorized.
 */
export function JsonEditor({
  value,
  onChange,
  ariaLabel,
  minHeightClass = "min-h-[120px]",
  error = false,
}: {
  value: string;
  onChange: (v: string) => void;
  ariaLabel: string;
  minHeightClass?: string;
  error?: boolean;
}) {
  const preRef = useRef<HTMLPreElement>(null);

  function syncScroll(e: UIEvent<HTMLTextAreaElement>) {
    if (preRef.current) {
      preRef.current.scrollTop = e.currentTarget.scrollTop;
      preRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  }

  const box =
    "m-0 w-full whitespace-pre-wrap break-words rounded font-mono text-sm leading-relaxed";

  return (
    <div className="relative">
      <pre
        ref={preRef}
        aria-hidden="true"
        className={`${box} pointer-events-none absolute inset-0 overflow-hidden`}
      >
        {value ? <Highlight value={value} /> : null}
      </pre>
      <textarea
        aria-label={ariaLabel}
        value={value}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
        onScroll={syncScroll}
        spellCheck={false}
        className={`${box} relative resize-y bg-transparent text-transparent caret-accent outline-none ${minHeightClass} ${
          error ? "ring-1 ring-sev-high/40" : ""
        }`}
      />
    </div>
  );
}

const COLORS: Record<string, string> = {
  key: "text-seg-header",
  string: "text-emerald-300",
  number: "text-amber-300",
  boolean: "text-accent-violet",
  null: "text-slate-500",
  plain: "text-slate-500",
};

interface Tok {
  v: string;
  c: keyof typeof COLORS;
}

/** Tokenize JSON text into colored spans covering the whole string verbatim. */
function tokenize(s: string): Tok[] {
  const toks: Tok[] = [];
  const re = /"(?:\\.|[^"\\])*"|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) {
    if (m.index > last) toks.push({ v: s.slice(last, m.index), c: "plain" });
    const val = m[0];
    let c: keyof typeof COLORS;
    if (val[0] === '"') {
      c = /^\s*:/.test(s.slice(re.lastIndex)) ? "key" : "string";
    } else if (val === "true" || val === "false") {
      c = "boolean";
    } else if (val === "null") {
      c = "null";
    } else {
      c = "number";
    }
    toks.push({ v: val, c });
    last = re.lastIndex;
  }
  if (last < s.length) toks.push({ v: s.slice(last), c: "plain" });
  return toks;
}

function Highlight({ value }: { value: string }) {
  return (
    <>
      {tokenize(value).map((t, i) => (
        <span key={i} className={COLORS[t.c]}>
          {t.v}
        </span>
      ))}
    </>
  );
}
