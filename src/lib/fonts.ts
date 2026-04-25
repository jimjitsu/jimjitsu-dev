import { JetBrains_Mono, Orbitron, Sancreek } from "next/font/google";

/**
 * Display / primary heading face — Sancreek.
 * Carries the retro-bowling-alley personality on large headings (h1, h2).
 * See spec §8.2.
 */
export const sancreek = Sancreek({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

/**
 * Eyebrow / pre-heading face — Orbitron.
 * Used for the small, tracked-out label that sits above a Sancreek heading.
 */
export const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-eyebrow",
  display: "swap",
});

/**
 * Body copy — JetBrains Mono.
 * Monospaced substitute for Consolas (see spec §8.2 / §15).
 */
export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
  display: "swap",
});

/** Combined class string to apply at the root <html> element. */
export const fontVariables = [sancreek.variable, orbitron.variable, jetbrainsMono.variable].join(
  " ",
);
