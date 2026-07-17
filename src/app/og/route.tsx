import { ImageResponse } from "next/og";

export const dynamic = "force-static";

/**
 * Default Open Graph image (1200×630) for pages without a CMS-provided one.
 * Strike Lane palette values are hard-coded because this renders via Satori,
 * outside the CSS custom-property pipeline.
 */
export async function GET() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        backgroundColor: "#F5EFE0",
        border: "10px solid #1A1A1A",
        padding: "72px",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: 18,
          backgroundColor: "#E89923",
        }}
      />
      <div
        style={{
          display: "flex",
          fontSize: 40,
          fontWeight: 700,
          letterSpacing: "0.08em",
          color: "#C8392F",
        }}
      >
        JIM TIERNEY
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 96,
          fontWeight: 900,
          color: "#1A1A1A",
          marginTop: 8,
        }}
      >
        Frontend Engineer
      </div>
      <div style={{ display: "flex", fontSize: 36, color: "#4A4A4A", marginTop: 28 }}>
        jimjitsu.dev
      </div>
      <div
        style={{
          display: "flex",
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: 18,
          backgroundColor: "#0E7C7B",
        }}
      />
    </div>,
    { width: 1200, height: 630 },
  );
}
