import { ImageResponse } from "next/og";
import { ALL_PASSPORTS, MAX_SCORE } from "../data";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function tierColor(score: number) {
  if (score >= 180) return "#D4AF37";
  if (score >= 140) return "#A8AAAD";
  if (score >= 100) return "#facc15";
  return "#ef4444";
}

function tierLabel(score: number) {
  if (score >= 180) return "ELITE";
  if (score >= 140) return "STRONG";
  if (score >= 100) return "AVERAGE";
  return "WEAK";
}

function rarityLabel(pop: number) {
  const share = (pop / 8000) * 100;
  if (share < 0.1) return "Ultra Rare";
  if (share < 0.5) return "Rare";
  if (share < 2)   return "Uncommon";
  if (share < 8)   return "Common";
  return "Very Common";
}

function rarityColor(pop: number) {
  const share = (pop / 8000) * 100;
  if (share < 0.1) return "#D4AF37";
  if (share < 0.5) return "#a3e635";
  if (share < 2)   return "#facc15";
  if (share < 8)   return "#fb923c";
  return "#ef4444";
}

function formatHolders(pop: number) {
  if (pop >= 1000) return `${(pop / 1000).toFixed(1)}B`;
  if (pop >= 1)    return `${pop % 1 === 0 ? pop : pop.toFixed(1)}M`;
  return `${(pop * 1000).toFixed(0)}K`;
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const passport = ALL_PASSPORTS.find(p => p.slug === slug);

  if (!passport) {
    return new ImageResponse(
      <div style={{ width: 1200, height: 630, background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#555", fontSize: 32 }}>Passport not found</span>
      </div>
    );
  }

  const color      = tierColor(passport.score);
  const label      = tierLabel(passport.score);
  const rLabel     = rarityLabel(passport.population);
  const rColor     = rarityColor(passport.population);
  const holders    = formatHolders(passport.population);
  const barWidth   = Math.round((passport.score / MAX_SCORE) * 100);
  const isElite    = passport.score >= 180;

  return new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        background: isElite ? "#0c0a06" : "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        padding: "0",
        position: "relative",
        fontFamily: "sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Radial glow */}
      <div style={{
        position: "absolute",
        top: -100,
        right: -100,
        width: 500,
        height: 500,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
      }} />

      {/* Border accent top */}
      <div style={{ width: "100%", height: 3, background: color, display: "flex" }} />

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", padding: "48px 64px" }}>

        {/* Left column */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>

          {/* Header */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 13, letterSpacing: "0.2em", color: "#555", textTransform: "uppercase", marginBottom: 32 }}>
              FINDORIGIO.COM · PASSPORT POWER
            </span>

            {/* Flag emoji + name */}
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 16 }}>
              <span style={{ fontSize: 64 }}>{passport.flag}</span>
              <span style={{
                fontSize: 52,
                fontWeight: 800,
                color: "#f0f0e8",
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}>
                {passport.name.toUpperCase()}
              </span>
            </div>

            {/* Rank + tier badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
              <span style={{
                fontSize: 13, fontWeight: 700, letterSpacing: "0.18em",
                color: isElite ? "#0a0a0a" : color,
                background: isElite ? color : "transparent",
                border: `1px solid ${color}`,
                padding: "5px 14px",
              }}>
                RANK #{passport.rank}
              </span>
              <span style={{ fontSize: 13, letterSpacing: "0.18em", color, fontWeight: 700 }}>
                {label}
              </span>
            </div>

            {/* Stats row */}
            <div style={{ display: "flex", gap: 32 }}>
              {[
                { val: String(passport.vf),    label: "VISA-FREE" },
                { val: String(passport.voa),   label: "ON ARRIVAL" },
                { val: String(passport.evisa), label: "EVISA" },
              ].map(s => (
                <div key={s.label} style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: 28, fontWeight: 700, color: "#f0f0e8", lineHeight: 1 }}>{s.val}</span>
                  <span style={{ fontSize: 10, color: "#555", letterSpacing: "0.12em", marginTop: 4 }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rarity */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 11, letterSpacing: "0.2em", color: rColor, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>
              {rLabel}
            </span>
            <span style={{ fontSize: 16, color: "#888", lineHeight: 1.4 }}>
              {holders} holders worldwide
            </span>
          </div>
        </div>

        {/* Right column — score */}
        <div style={{ width: 280, display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <span style={{ fontSize: 11, letterSpacing: "0.2em", color: "#333", marginBottom: 8 }}>
              HENLEY 2026 Q2
            </span>
            <span style={{
              fontSize: 120,
              fontWeight: 800,
              letterSpacing: "-0.05em",
              color,
              lineHeight: 1,
            }}>
              {passport.score}
            </span>
            <span style={{ fontSize: 13, color: "#333", letterSpacing: "0.1em", marginTop: 4 }}>
              DESTINATIONS
            </span>
          </div>

          {/* Bar */}
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ width: "100%", height: 4, background: "#1a1a1a", position: "relative", display: "flex" }}>
              <div style={{ width: `${barWidth}%`, height: "100%", background: color }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 10, color: "#333" }}>#1 of 199 passports</span>
              <span style={{ fontSize: 10, color: "#333" }}>{passport.score}/{MAX_SCORE}</span>
            </div>
          </div>
        </div>
      </div>
    </div>,
    { ...size }
  );
}
