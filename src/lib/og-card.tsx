import type { ReactElement } from "react";

// 1200×630 is the standard OG / Twitter summary_large_image size.
export const OG_SIZE = { width: 1200, height: 630 } as const;

function clamp(text: string, max: number): string {
  const t = text.trim();
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
}

/**
 * A branded 1200×630 Open Graph card in the Strike Lane palette. Colors are
 * hard-coded because Satori (next/og) doesn't read CSS custom properties, and
 * every element sets `display: flex` because Satori requires it.
 */
export function OgCard({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}): ReactElement {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#F5EFE0",
        border: "10px solid #1A1A1A",
        padding: "66px 72px",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: 16,
          backgroundColor: "#E89923",
          display: "flex",
        }}
      />
      <div
        style={{
          display: "flex",
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#C0362C",
        }}
      >
        {eyebrow}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div
          style={{
            display: "flex",
            fontSize: 66,
            fontWeight: 900,
            lineHeight: 1.05,
            color: "#1A1A1A",
          }}
        >
          {clamp(title, 78)}
        </div>
        {subtitle ? (
          <div style={{ display: "flex", fontSize: 30, lineHeight: 1.3, color: "#4A4A4A" }}>
            {clamp(subtitle, 120)}
          </div>
        ) : null}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ display: "flex", width: 26, height: 26, backgroundColor: "#0E7C7B" }} />
        <div style={{ display: "flex", fontSize: 30, fontWeight: 700, color: "#1A1A1A" }}>
          jimjitsu.dev
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: 16,
          backgroundColor: "#0E7C7B",
          display: "flex",
        }}
      />
    </div>
  );
}
