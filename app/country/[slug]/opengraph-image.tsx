import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";
export const alt = "Origio Country";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: country } = await supabase
    .from("countries")
    .select("name, flag_emoji, continent")
    .eq("slug", params.slug)
    .single();

  const { data: countryData } = await supabase
    .from("country_data")
    .select("score_safety, score_healthcare, move_score")
    .eq("slug", params.slug)
    .single();

  const name = country?.name ?? "Country";
  const flag = country?.flag_emoji ?? "🌍";
  const continent = country?.continent ?? "";
  const moveScore = countryData?.move_score ?? 0;
  const safety = countryData?.score_safety ?? 0;
  const healthcare = countryData?.score_healthcare ?? 0;

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
            background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
          }}
        />

        {/* Origio label top */}
        <div
          style={{
            position: "absolute",
            top: 36,
            fontSize: 20,
            color: "#44445a",
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          🌍 Origio — Relocation Research
        </div>

        {/* Flag */}
        <div style={{ fontSize: 80, marginBottom: 16, display: "flex" }}>{flag}</div>

        {/* Country name */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-2px",
            marginBottom: 6,
            display: "flex",
          }}
        >
          {name}
        </div>

        {/* Continent */}
        <div style={{ fontSize: 22, color: "#a0a0b0", marginBottom: 12, display: "flex" }}>
          {continent}
        </div>

        {/* Divider */}
        <div
          style={{
            width: 40,
            height: 3,
            background: "#6366f1",
            borderRadius: 99,
            marginBottom: 32,
            display: "flex",
          }}
        />

        {/* Score pills */}
        <div style={{ display: "flex", gap: 16 }}>
          {[
            { label: "Move Score", value: moveScore },
            { label: "Safety", value: safety },
            { label: "Healthcare", value: healthcare },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "rgba(99,102,241,0.12)",
                border: "1px solid rgba(99,102,241,0.35)",
                borderRadius: 16,
                padding: "12px 32px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <div style={{ fontSize: 34, fontWeight: 800, color: "#818cf8", display: "flex" }}>
                {s.value}
              </div>
              <div style={{ fontSize: 16, color: "#a0a0b0", display: "flex" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 36,
            fontSize: 18,
            color: "#44445a",
            display: "flex",
          }}
        >
          findorigio.com/country/{params.slug}
        </div>
      </div>
    ),
    { ...size }
  );
}