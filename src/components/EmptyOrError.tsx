export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="panel flex flex-col items-center gap-2 p-8 text-center text-slate-400">
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-slate-600"
        aria-hidden="true"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
      </svg>
      <div className="text-sm">{children}</div>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="panel border-sev-high/40 bg-sev-high/5 p-4 text-sm text-sev-high"
    >
      <span className="font-semibold">Can&apos;t parse this token. </span>
      {message}
    </div>
  );
}
