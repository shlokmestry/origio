import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const roleLabels: Record<string, { title: string; emoji: string }> = {
  "software-engineers": { title: "Software Engineers", emoji: "💻" },
  "product-managers": { title: "Product Managers", emoji: "📋" },
  "designers": { title: "Designers", emoji: "🎨" },
  "data-scientists": { title: "Data Scientists", emoji: "📊" },
  "devops-engineers": { title: "DevOps Engineers", emoji: "⚙️" },
  "marketing-managers": { title: "Marketing Managers", emoji: "📣" },
  "financial-analysts": { title: "Financial Analysts", emoji: "💹" },
  "cybersecurity-analysts": { title: "Cybersecurity Analysts", emoji: "🔐" },
  "sales-managers": { title: "Sales Managers", emoji: "🤝" },
  "hr-managers": { title: "HR Managers", emoji: "👥" },
};

export default async function OgImage({ params }: { params: { role: string } }) {
  const role = roleLabels[params.role] ?? { title: "Professionals", emoji: "🌍" };
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
        <div style={{
          position: "absolute", width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,255,213,0.10) 0%, transparent 70%)",
          top: "50%", left: "50%", transform: "translate(-50%, -50%)", display: "flex",
        }} />

        {/* Logo top-left */}
        <img src={logoBase64} style={{ position: "absolute", top: 36, left: 48, height: 36, width: "auto" }} />

        <div style={{ fontSize: 64, marginBottom: 16, display: "flex" }}>{role.emoji}</div>
        <div style={{ fontSize: 18, color: "#00ffd5", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16, display: "flex" }}>
          Best Countries for
        </div>
        <div style={{ fontSize: 72, fontWeight: 800, color: "#f0f0e8", letterSpacing: "-2px", marginBottom: 20, display: "flex", textAlign: "center" }}>
          {role.title}
        </div>
        <div style={{ width: 48, height: 4, background: "#00ffd5", marginBottom: 32, display: "flex" }} />
        <div style={{ display: "flex", gap: 12 }}>
          {["💰 Salaries", "🏛️ Tax Rates", "✈️ Visas", "🏠 Cost of Living"].map((label) => (
            <div key={label} style={{
              background: "rgba(0,255,213,0.08)", border: "1px solid rgba(0,255,213,0.25)",
              padding: "10px 22px", fontSize: 18, color: "#00ffd5", display: "flex",
            }}>{label}</div>
          ))}
        </div>
        <div style={{ position: "absolute", bottom: 36, display: "flex" }}>
          <div style={{ fontSize: 16, color: "#444440", display: "flex", letterSpacing: "0.05em" }}>findorigio.com</div>
        </div>
      </div>
    ),
    { ...size }
  );
}