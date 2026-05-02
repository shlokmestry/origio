import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Origio ~ Find Where You Belong";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a0a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow — teal */}
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,255,213,0.10) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
          }}
        />

        {/* Logo lockup — teal square + ORIGIO */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 48 }}>
          <div style={{
            width: 36,
            height: 36,
            background: "#00ffd5",
            border: "3px solid #f0f0e8",
            display: "flex",
            flexShrink: 0,
          }} />
          <span style={{
            fontSize: 52,
            fontWeight: 800,
            color: "#f0f0e8",
            letterSpacing: "-2px",
            display: "flex",
            lineHeight: 1,
          }}>
            ORIGIO
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 40,
            fontWeight: 800,
            color: "#f0f0e8",
            letterSpacing: "-1px",
            marginBottom: 12,
            display: "flex",
          }}
        >
          Find Where You Belong
        </div>

        <div
          style={{
            fontSize: 22,
            color: "#666660",
            marginBottom: 48,
            display: "flex",
          }}
        >
          Salaries · Visas · Cost of Living · Quality of Life
        </div>

        {/* Divider — teal, sharp */}
        <div
          style={{
            width: 48,
            height: 4,
            background: "#00ffd5",
            marginBottom: 48,
            display: "flex",
          }}
        />

        {/* Pills */}
        <div style={{ display: "flex", gap: 12 }}>
          {["🌐 25 Countries", "💰 Salaries", "✈️ Visas", "🏠 Cost of Living"].map((label) => (
            <div
              key={label}
              style={{
                background: "rgba(0,255,213,0.08)",
                border: "1px solid rgba(0,255,213,0.25)",
                padding: "10px 22px",
                fontSize: 18,
                color: "#00ffd5",
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
            fontSize: 16,
            color: "#444440",
            display: "flex",
            letterSpacing: "0.05em",
          }}
        >
          findorigio.com
        </div>
      </div>
    ),
    { ...size }
  );
}