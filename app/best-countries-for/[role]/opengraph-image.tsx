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

export default function OgImage({ params }: { params: { role: string } }) {
  const role = roleLabels[params.role] ?? { title: "Professionals", emoji: "🌍" };

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
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,212,200,0.12) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
          }}
        />

        {/* Role emoji */}
        <div style={{ fontSize: 64, marginBottom: 16, display: "flex" }}>
          {role.emoji}
        </div>

        {/* Eyebrow */}
        <div
          style={{
            fontSize: 20,
            color: "#00d4c8",
            fontWeight: 600,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: 16,
            display: "flex",
          }}
        >
          Best Countries for
        </div>

        {/* Role title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-2px",
            marginBottom: 20,
            display: "flex",
            textAlign: "center",
          }}
        >
          {role.title}
        </div>

        {/* Divider */}
        <div
          style={{
            width: 48,
            height: 3,
            background: "#00d4c8",
            borderRadius: 99,
            marginBottom: 32,
            display: "flex",
          }}
        />

        {/* Pills */}
        <div style={{ display: "flex", gap: 12 }}>
          {["💰 Salaries", "🏛️ Tax Rates", "✈️ Visas", "🏠 Cost of Living"].map((label) => (
            <div
              key={label}
              style={{
                background: "rgba(0,212,200,0.08)",
                border: "1px solid rgba(0,212,200,0.25)",
                borderRadius: 999,
                padding: "8px 20px",
                fontSize: 19,
                color: "#00d4c8",
                display: "flex",
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Origio branding bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 36,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div style={{ fontSize: 18, color: "#44445a", display: "flex" }}>
            findorigio.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}