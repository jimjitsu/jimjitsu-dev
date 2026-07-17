import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Strike Lane palette, hard-coded because this renders outside the CSS pipeline.
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1A1A1A",
      }}
    >
      <div style={{ display: "flex", color: "#E89923", fontSize: 84, fontWeight: 900 }}>JT</div>
      <div
        style={{
          display: "flex",
          width: 90,
          height: 12,
          marginTop: 10,
          backgroundColor: "#0E7C7B",
        }}
      />
    </div>,
    { ...size },
  );
}
