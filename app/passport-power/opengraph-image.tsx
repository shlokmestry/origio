import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Global Passport Index — Origio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        fontFamily: "sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top accent */}
      <div style={{ width: "100%", height: 3, background: "#00ffd5", display: "flex" }} />

      {/* Radial glow */}
      <div style={{
        position: "absolute",
        top: -80,
        right: -80,
        width: 500,
        height: 500,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,255,213,0.08) 0%, transparent 70%)",
      }} />

      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "56px 72px" }}>

        {/* Top label */}
        <span style={{ fontSize: 13, letterSpacing: "0.22em", color: "#555", textTransform: "uppercase" }}>
          FINDORIGIO.COM · PASSPORT POWER
        </span>

        {/* Main headline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 72, fontWeight: 800, color: "#f0f0e8", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 4 }}>
            Not all passports
          </span>
          <span style={{ fontSize: 72, fontWeight: 800, color: "#00ffd5", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 32 }}>
            are equal.
          </span>
          <span style={{ fontSize: 22, color: "#666660", lineHeight: 1.5, maxWidth: 680 }}>
            192 reported destinations or 23. Passport access changes. Check official rules before travel.
          </span>
        </div>

        {/* Bottom stats row */}
        <div style={{ display: "flex", gap: 48, alignItems: "flex-end" }}>
          {[
            { val: "199", label: "PASSPORTS RANKED" },
            { val: "192", label: "TOP SCORE (SINGAPORE)" },
            { val: "23",  label: "BOTTOM SCORE (AFGHANISTAN)" },
            { val: "169", label: "DESTINATION GAP" },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 40, fontWeight: 800, color: "#f0f0e8", letterSpacing: "-0.03em", lineHeight: 1 }}>{s.val}</span>
              <span style={{ fontSize: 10, color: "#444", letterSpacing: "0.14em", marginTop: 6 }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>,
    { ...size }
  );
}
