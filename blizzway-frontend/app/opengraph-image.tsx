import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "linear-gradient(135deg, #f8fbff 0%, #eef4ff 45%, #f6f0ff 100%)",
          color: "#0f172a",
          display: "flex",
          fontFamily: "Arial, sans-serif",
          height: "100%",
          justifyContent: "center",
          padding: 80,
          width: "100%",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: 920 }}>
          <div style={{ color: "#4f46e5", fontSize: 28, fontWeight: 800, letterSpacing: 4 }}>
            THE MAGICAL CAREER PATHWAY
          </div>
          <div style={{ fontSize: 104, fontWeight: 900, lineHeight: 0.95 }}>Blizzway</div>
          <div style={{ color: "#475569", fontSize: 38, lineHeight: 1.25 }}>
            AI-guided career clarity, learning, earning, companions, and progress.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
