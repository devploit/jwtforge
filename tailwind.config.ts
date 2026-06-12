import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Deep space-black base with a cool blue undertone (matches logo bg).
        bg: {
          DEFAULT: "#070912",
          raised: "#0e1220",
          inset: "#05060d",
        },
        line: "#1b2236",
        // Electric brand accents from the logo: violet → blue, white glow.
        accent: {
          DEFAULT: "#7c9bff", // calm interactive accent (readable on dark)
          violet: "#8b5cf6",
          blue: "#3b82f6",
          glow: "#a5b8ff",
        },
        // JWT segment colors, harmonized to the neon brand.
        seg: {
          header: "#c084fc", // violet
          payload: "#5ea9ff", // electric blue
          sig: "#e2e8f0", // white slash
        },
        sev: {
          high: "#fb7185",
          med: "#fbbf24",
          low: "#5ea9ff",
          info: "#94a3b8",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(124,155,255,0.15), 0 0 24px -4px rgba(124,155,255,0.25)",
        "glow-lg": "0 0 40px -8px rgba(139,92,246,0.35)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fade-in 0.4s ease both",
      },
    },
  },
  plugins: [],
};

export default config;
