"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type FormEvent,
  type UIEvent,
} from "react";
import { extractJwt } from "@/lib/jwt";

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const selectionRef = useRef(selection);
  const selectionFrameRef = useRef<number | null>(null);

  function stopSelectionLoop() {
    if (selectionFrameRef.current === null) return;
    cancelAnimationFrame(selectionFrameRef.current);
    selectionFrameRef.current = null;
  }

  function syncScroll(e: UIEvent<HTMLTextAreaElement>) {
    if (preRef.current) {
      preRef.current.scrollTop = e.currentTarget.scrollTop;
      preRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  }

  // Smart paste: if the pasted text wraps a JWT in an Authorization header,
  // curl command, JSON, or quotes, drop the noise and keep just the token.
  function onPaste(e: ClipboardEvent<HTMLTextAreaElement>) {
    const pasted = e.clipboardData.getData("text");
    const jwt = extractJwt(pasted);
    if (jwt && jwt !== pasted.trim()) {
      e.preventDefault();
      onChange(jwt);
    }
  }

  function syncSelection(target: HTMLTextAreaElement) {
    const start = Math.min(target.selectionStart, target.selectionEnd);
    const end = Math.max(target.selectionStart, target.selectionEnd);
    const current = selectionRef.current;
    if (current.start === start && current.end === end) return;

    const next = { start, end };
    selectionRef.current = next;
    setSelection(next);
  }

  function startSelectionLoop() {
    if (selectionFrameRef.current !== null) return;

    const tick = () => {
      const target = textareaRef.current;
      if (!target || document.activeElement !== target) {
        stopSelectionLoop();
        return;
      }

      syncSelection(target);
      selectionFrameRef.current = requestAnimationFrame(tick);
    };

    selectionFrameRef.current = requestAnimationFrame(tick);
  }

  function onInput(e: FormEvent<HTMLTextAreaElement>) {
    syncSelection(e.currentTarget);
  }

  useEffect(() => stopSelectionLoop, []);

  // Shared box model so the overlay and textarea align exactly. Use
  // `break-words` (overflow-wrap: break-word), NOT `break-all`: a <textarea>
  // soft-wraps long tokens with break-word semantics, so the highlight <pre>
  // must wrap the same way or the two layers drift apart line by line.
  const boxClasses =
    "m-0 w-full whitespace-pre-wrap break-words rounded-lg border px-4 py-3 font-mono text-base leading-relaxed";

  return (
    <div className="relative">
      <pre
        ref={preRef}
        aria-hidden="true"
        className={`${boxClasses} jwt-highlight-layer pointer-events-none absolute inset-0 overflow-auto border-transparent bg-bg-inset/80`}
      >
        {/* No leading newline here: a newline as the first child of <pre> is
            stripped by the HTML parser and would cause a hydration mismatch. */}
        {value ? <Highlight value={value} selection={selection} /> : null}
      </pre>
      <textarea
        ref={textareaRef}
        id={id}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        value={value}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
        onPaste={onPaste}
        onFocus={(e) => {
          syncSelection(e.currentTarget);
          startSelectionLoop();
        }}
        onSelect={(e) => syncSelection(e.currentTarget)}
        onInput={onInput}
        onBlur={() => {
          stopSelectionLoop();
          selectionRef.current = { start: 0, end: 0 };
          setSelection(selectionRef.current);
        }}
        onScroll={syncScroll}
        rows={rows}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        placeholder={placeholder}
        className={`${boxClasses} jwt-input relative resize-y border-line bg-transparent text-transparent caret-accent transition-colors placeholder:text-slate-600 focus:border-accent/60`}
      />
    </div>
  );
}

const SEGMENT_CLASSES = ["text-seg-header", "text-seg-payload", "text-seg-sig"];

function Highlight({
  value,
  selection,
}: {
  value: string;
  selection: { start: number; end: number };
}) {
  return (
    <>
      {getHighlightTokens(value).map((token, i) => (
        <SelectedText
          key={`${token.offset}-${i}`}
          text={token.text}
          className={token.className}
          offset={token.offset}
          selection={selection}
        />
      ))}
    </>
  );
}

interface HighlightToken {
  text: string;
  className: string;
  offset: number;
}

function getHighlightTokens(value: string): HighlightToken[] {
  const tokens: HighlightToken[] = [];
  let offset = 0;

  for (const [i, part] of value.split(".").entries()) {
    if (i > 0) {
      tokens.push({ text: ".", className: "text-slate-600", offset });
      offset += 1;
    }

    tokens.push({
      text: part,
      className:
        i < 3
          ? SEGMENT_CLASSES[i]
          : "text-sev-high underline decoration-sev-high/50",
      offset,
    });
    offset += part.length;
  }

  return tokens;
}

function SelectedText({
  text,
  className,
  offset,
  selection,
}: {
  text: string;
  className: string;
  offset: number;
  selection: { start: number; end: number };
}) {
  if (!text) return null;

  const selectedStart = Math.max(selection.start, offset);
  const selectedEnd = Math.min(selection.end, offset + text.length);
  if (selectedStart >= selectedEnd) {
    return <span className={className}>{text}</span>;
  }

  const start = selectedStart - offset;
  const end = selectedEnd - offset;

  return (
    <span className={className}>
      {text.slice(0, start)}
      <span className="jwt-selected">{text.slice(start, end)}</span>
      {text.slice(end)}
    </span>
  );
}
