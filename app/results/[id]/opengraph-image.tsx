import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";
export const alt = "Origio ~ Shared Results";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface TopCountry {
  slug: string;
  name: string;
  flagEmoji: string;
  matchPercent: number;
}

async function getTopCountries(id: string): Promise<TopCountry[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("wizard_results")
    .select("top_countries")
    .eq("id", id)
    .eq("is_public", true)
    .maybeSingle();

  return (data?.top_countries as TopCountry[] | undefined)?.slice(0, 3) ?? [];
}

export default async function OgImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const countries = await getTopCountries(id);
  const top = countries[0];

  const RANK_COLORS = ["#00ffd5", "#facc15", "#a78bfa"];

  return new ImageResponse(
    (
      <div style={{
        background: "#0a0a0a", width: "100%", height: "100%",
        display: "flex", flexDirection: "column", justifyContent: "center",
        fontFamily: "sans-serif", position: "relative", overflow: "hidden",
        padding: "0 80px",
      }}>
        {/* Background glow */}
        <div style={{
          position: "absolute", width: 700, height: 700, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,255,213,0.10) 0%, transparent 70%)",
          top: "50%", left: "20%", transform: "translate(-50%, -50%)", display: "flex",
        }} />

        <p style={{
          fontSize: 20, letterSpacing: 4, textTransform: "uppercase",
          color: "#00ffd5", marginBottom: 20, display: "flex",
        }}>
          ● Origio Match
        </p>

        {top ? (
          <>
            <div style={{ display: "flex", alignItems: "baseline", gap: 20, marginBottom: 24 }}>
              <span style={{ fontSize: 88, fontWeight: 800, color: "#f0f0e8", letterSpacing: "-2px", display: "flex" }}>
                {top.flagEmoji} {top.name}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 48 }}>
              <div style={{
                background: "rgba(0,255,213,0.1)", border: "1px solid rgba(0,255,213,0.35)",
                padding: "10px 24px", fontSize: 28, color: "#00ffd5", fontWeight: 700, display: "flex",
              }}>
                {top.matchPercent != null ? `${top.matchPercent}% match` : "Top match"}
              </div>
              <span style={{ fontSize: 22, color: "#888880", display: "flex" }}>Top-ranked country for this profile</span>
            </div>
          </>
        ) : (
          <div style={{ fontSize: 56, fontWeight: 800, color: "#f0f0e8", marginBottom: 48, display: "flex" }}>
            See their top country matches
          </div>
        )}

        {countries.length > 1 && (
          <div style={{ display: "flex", gap: 14 }}>
            {countries.map((c, i) => (
              <div key={c.slug} style={{
                background: "rgba(255,255,255,0.03)", border: `1px solid ${RANK_COLORS[i]}55`,
                padding: "10px 20px", fontSize: 18, color: "#f0f0e8", display: "flex", alignItems: "center", gap: 8,
              }}>
                <span style={{ color: RANK_COLORS[i], fontWeight: 700 }}>#{i + 1}</span>
                {c.flagEmoji} {c.name}
              </div>
            ))}
          </div>
        )}

        <div style={{ position: "absolute", bottom: 36, right: 80, fontSize: 16, color: "#444440", display: "flex", letterSpacing: "0.05em" }}>
          findorigio.com
        </div>
      </div>
    ),
    { ...size }
  );
}
