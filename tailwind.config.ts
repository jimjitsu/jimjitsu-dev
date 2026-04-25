import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  darkMode: "media",
  theme: {
    extend: {
      fontFamily: {
        // Default prose / body — JetBrains Mono (monospace vibe per spec §8.2).
        mono: ["var(--font-body)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
        // Display face for large headings — Sancreek (Google Fonts).
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
        // Eyebrow / pre-heading — Orbitron (Google Fonts).
        eyebrow: ["var(--font-eyebrow)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [typography],
};

export default config;
