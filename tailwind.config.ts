import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  darkMode: "media",
  theme: {
    extend: {
      // Strike Lane palette (spec §8.3). Tokens are wired to CSS custom
      // properties so the dark theme can swap them in globals.css without
      // requiring `dark:` variants on every element.
      colors: {
        base: "rgb(var(--color-base) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        "ink-muted": "rgb(var(--color-ink-muted) / <alpha-value>)",
        teal: "rgb(var(--color-teal) / <alpha-value>)",
        amber: "rgb(var(--color-amber) / <alpha-value>)",
        red: "rgb(var(--color-red) / <alpha-value>)",
        pink: "rgb(var(--color-pink) / <alpha-value>)",
      },
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
