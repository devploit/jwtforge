import { Logo } from "./Logo";

/**
 * Decorative hero visual: the brand mark inside layered glow rings with a
 * faux color-coded JWT underneath. Purely presentational (aria-hidden).
 */
export function TokenGlyph() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto flex aspect-square w-full max-w-sm items-center justify-center"
    >
      {/* Glow halo */}
      <div className="absolute inset-0 rounded-full bg-accent-violet/20 blur-3xl" />
      <div className="absolute inset-8 rounded-full bg-accent-blue/20 blur-2xl" />

      {/* Concentric rings */}
      <div className="absolute inset-0 rounded-full border border-line/60" />
      <div className="absolute inset-[12%] rounded-full border border-line/40" />
      <div className="absolute inset-[24%] rounded-full border border-line/30" />

      <div className="relative animate-fade-in">
        <Logo size={184} />
      </div>

      {/* Color-coded JWT segments */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[11px] tracking-tight">
        <span className="text-seg-header">eyJhbGci…</span>
        <span className="text-slate-600">.</span>
        <span className="text-seg-payload">eyJzdWIi…</span>
        <span className="text-slate-600">.</span>
        <span className="text-seg-sig">SflKxw…</span>
      </div>
    </div>
  );
}
