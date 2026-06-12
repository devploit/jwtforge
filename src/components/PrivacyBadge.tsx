export function PrivacyBadge() {
  return (
    <span
      className="hidden items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent sm:inline-flex"
      title="No token, secret, or key is ever sent to a server. Verify it in your browser devtools Network tab."
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        aria-hidden="true"
      >
        <path d="M12 2 4 5v6c0 5 3.4 7.8 8 9 4.6-1.2 8-4 8-9V5l-8-3Z" />
      </svg>
      100% client-side
    </span>
  );
}
