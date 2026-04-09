import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Origio — Find Where You Belong";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a0f",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
          }}
        />

        {/* Globe emoji */}
        <div style={{ fontSize: 64, marginBottom: 16, display: "flex" }}>🌍</div>

        {/* Title */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-3px",
            marginBottom: 12,
            display: "flex",
          }}
        >
          Origio
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: "#a0a0b0",
            marginBottom: 40,
            display: "flex",
          }}
        >
          Find Where You Belong
        </div>

        {/* Divider */}
        <div
          style={{
            width: 48,
            height: 3,
            background: "#6366f1",
            borderRadius: 99,
            marginBottom: 40,
            display: "flex",
          }}
        />

        {/* Pills */}
        <div style={{ display: "flex", gap: 12 }}>
          {["🌐 25 Countries", "💰 Salaries", "✈️ Visas", "🏠 Cost of Living"].map((label) => (
            <div
              key={label}
              style={{
                background: "rgba(99,102,241,0.12)",
                border: "1px solid rgba(99,102,241,0.35)",
                borderRadius: 999,
                padding: "8px 20px",
                fontSize: 19,
                color: "#818cf8",
                display: "flex",
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: "absolute",
            bottom: 36,
            fontSize: 18,
            color: "#44445a",
            display: "flex",
          }}
        >
          origio-one.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}