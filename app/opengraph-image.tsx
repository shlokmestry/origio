import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Origio ~ Find Where You Belong";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  const logoData = await fetch(new URL("/origio_logo_dark_final.png", "https://findorigio.com")).then(r => r.arrayBuffer());
  const logoBase64 = `data:image/png;base64,${Buffer.from(logoData).toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{
        background: "#0a0a0a", width: "100%", height: "100%",
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", fontFamily: "sans-serif",
        position: "relative", overflow: "hidden",
      }}>
        {/* Background glow */}
        <div style={{
          position: "absolute", width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,255,213,0.10) 0%, transparent 70%)",
          top: "50%", left: "50%", transform: "translate(-50%, -50%)", display: "flex",
        }} />

        {/* Logo image */}
        <img src={logoBase64} style={{ height: 64, width: "auto", marginBottom: 48 }} />

        {/* Tagline */}
        <div style={{ fontSize: 40, fontWeight: 800, color: "#f0f0e8", letterSpacing: "-1px", marginBottom: 12, display: "flex" }}>
          Find Where You Belong
        </div>
        <div style={{ fontSize: 22, color: "#666660", marginBottom: 48, display: "flex" }}>
          Salaries · Visas · Cost of Living · Quality of Life
        </div>

        {/* Divider */}
        <div style={{ width: 48, height: 4, background: "#00ffd5", marginBottom: 48, display: "flex" }} />

        {/* Pills */}
        <div style={{ display: "flex", gap: 12 }}>
          {["🌐 25 Countries", "💰 Salaries", "✈️ Visas", "🏠 Cost of Living"].map((label) => (
            <div key={label} style={{
              background: "rgba(0,255,213,0.08)", border: "1px solid rgba(0,255,213,0.25)",
              padding: "10px 22px", fontSize: 18, color: "#00ffd5", display: "flex",
            }}>{label}</div>
          ))}
        </div>

        <div style={{ position: "absolute", bottom: 36, fontSize: 16, color: "#444440", display: "flex", letterSpacing: "0.05em" }}>
          findorigio.com
        </div>
      </div>
    ),
    { ...size }
  );
}