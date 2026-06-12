import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0a0e14",
          raised: "#10151f",
          inset: "#070a0f",
        },
        line: "#1d2633",
        accent: {
          DEFAULT: "#5eead4",
          dim: "#2dd4bf",
        },
        // JWT segment colors (mirror the familiar jwt.io palette)
        seg: {
          header: "#fb7185",
          payload: "#c084fc",
          sig: "#38bdf8",
        },
        sev: {
          high: "#f87171",
          med: "#fbbf24",
          low: "#60a5fa",
          info: "#94a3b8",
        },
      },
      fontFamily: {
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
