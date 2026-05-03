import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";
export const alt = "Origio Country";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({ params }: { params: { slug: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: country } = await supabase
    .from("countries").select("name, flag_emoji, continent").eq("slug", params.slug).single();
  const { data: countryData } = await supabase
    .from("country_data").select("score_safety, score_healthcare, move_score").eq("slug", params.slug).single();

  const name = country?.name ?? "Country";
  const flag = country?.flag_emoji ?? "🌍";
  const continent = country?.continent ?? "";
  const moveScore = countryData?.move_score ?? 0;
  const safety = countryData?.score_safety ?? 0;
  const healthcare = countryData?.score_healthcare ?? 0;

  const logoData = await fetch(new URL("/origio_logo_dark_final.png", "https://findorigio.com")).then(r => r.arrayBuffer());
  const logoBase64 = `data:image/png;base64,${Buffer.from(logoData).toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{
        background: "#0a0a0a", width: "100%", height: "100%",
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", fontFamily: "sans-serif",
        position: "relative",
      }}>
        <div style={{
          position: "absolute", width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,255,213,0.10) 0%, transparent 70%)",
          top: "50%", left: "50%", transform: "translate(-50%, -50%)", display: "flex",
        }} />

        {/* Logo top-left */}
        <img src={logoBase64} style={{ position: "absolute", top: 36, left: 48, height: 36, width: "auto" }} />

        <div style={{ fontSize: 80, marginBottom: 16, display: "flex" }}>{flag}</div>
        <div style={{ fontSize: 72, fontWeight: 800, color: "#f0f0e8", letterSpacing: "-2px", marginBottom: 6, display: "flex" }}>{name}</div>
        <div style={{ fontSize: 20, color: "#666660", marginBottom: 16, display: "flex", letterSpacing: "0.05em" }}>{continent}</div>
        <div style={{ width: 40, height: 4, background: "#00ffd5", marginBottom: 32, display: "flex" }} />

        <div style={{ display: "flex", gap: 16 }}>
          {[
            { label: "Move Score", value: moveScore },
            { label: "Safety", value: safety },
            { label: "Healthcare", value: healthcare },
          ].map((s) => (
            <div key={s.label} style={{
              background: "rgba(0,255,213,0.08)", border: "1px solid rgba(0,255,213,0.25)",
              padding: "12px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            }}>
              <div style={{ fontSize: 34, fontWeight: 800, color: "#00ffd5", display: "flex" }}>{s.value}</div>
              <div style={{ fontSize: 15, color: "#666660", display: "flex" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ position: "absolute", bottom: 36, fontSize: 16, color: "#444440", display: "flex", letterSpacing: "0.05em" }}>
          findorigio.com/country/{params.slug}
        </div>
      </div>
    ),
    { ...size }
  );
}