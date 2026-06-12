/**
 * JWTForge brand mark — a broken ring (violet → electric blue) split by a
 * double diagonal slash, recreated as a transparent, scalable SVG so it stays
 * crisp at any size and matches the PNG logo/favicon.
 */
export function Logo({
  size = 32,
  className = "",
  glow = true,
}: {
  size?: number;
  className?: string;
  glow?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      role="img"
      aria-label="JWTForge logo"
      className={className}
    >
      <defs>
        <linearGradient id="jf-ring-a" x1="50" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#60a5fa" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="jf-ring-b" x1="20" y1="80" x2="60" y2="15" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6d28d9" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
        {glow && (
          <filter id="jf-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      <g filter={glow ? "url(#jf-glow)" : undefined} strokeLinecap="round">
        {/* right + bottom arc (blue) */}
        <path d="M79.9 36.1 A33 33 0 0 1 36.1 79.9" stroke="url(#jf-ring-a)" strokeWidth="8.5" />
        {/* left + top arc (violet) */}
        <path d="M20.1 63.9 A33 33 0 0 1 63.9 20.1" stroke="url(#jf-ring-b)" strokeWidth="8.5" />
        {/* double diagonal slash */}
        <line x1="63.4" y1="33.7" x2="42.2" y2="54.95" stroke="#fff" strokeWidth="8.5" />
        <line x1="57.8" y1="45.05" x2="36.6" y2="66.25" stroke="#fff" strokeWidth="8.5" />
      </g>
    </svg>
  );
}
