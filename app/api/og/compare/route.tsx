import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

export const runtime = "edge";

interface CityRow {
  slug: string;
  name: string;
  country_name: string;
  flag_emoji: string;
  city_data: Array<{ cost_rent_city_centre: number | null }>;
}

async function getCities(slugs: string[]): Promise<CityRow[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("cities")
    .select("slug, name, country_name, flag_emoji, city_data(cost_rent_city_centre)")
    .in("slug", slugs);

  if (!data) return [];
  const bySlug = new Map((data as CityRow[]).map((c) => [c.slug, c]));
  return slugs.map((s) => bySlug.get(s)).filter((c): c is CityRow => Boolean(c));
}

export async function GET(req: NextRequest) {
  const slugs = (req.nextUrl.searchParams.get("cities") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 2);

  const cities = await getCities(slugs);
  const size = { width: 1200, height: 630 };
  const headers = { "Cache-Control": "public, immutable, no-transform, max-age=86400" };

  if (cities.length < 2) {
    return new ImageResponse(
      (
        <div style={{
          background: "#0a0a0a", width: "100%", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 48, color: "#f0f0e8", fontFamily: "sans-serif",
        }}>
          Compare Cities · Origio
        </div>
      ),
      { ...size, headers }
    );
  }

  const [a, b] = cities;
  const rentA = a.city_data?.[0]?.cost_rent_city_centre;
  const rentB = b.city_data?.[0]?.cost_rent_city_centre;

  return new ImageResponse(
    (
      <div style={{
        background: "#0a0a0a", width: "100%", height: "100%",
        display: "flex", flexDirection: "column",
        fontFamily: "sans-serif", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", width: 700, height: 700, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,255,213,0.08) 0%, transparent 70%)",
          top: "50%", left: "50%", transform: "translate(-50%, -50%)", display: "flex",
        }} />

        <p style={{
          fontSize: 18, letterSpacing: 4, textTransform: "uppercase",
          color: "#00ffd5", margin: "56px 0 0 64px", display: "flex",
        }}>
          ● City vs City
        </p>

        <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "0 64px" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 15, color: "#666660", marginBottom: 8, display: "flex" }}>
              {a.flag_emoji} {a.country_name}
            </span>
            <span style={{ fontSize: 58, fontWeight: 800, color: "#f0f0e8", letterSpacing: "-1px", marginBottom: 16, display: "flex" }}>
              {a.name}
            </span>
            {rentA != null && (
              <div style={{
                alignSelf: "flex-start", background: "rgba(0,255,213,0.08)", border: "1px solid rgba(0,255,213,0.25)",
                padding: "8px 18px", fontSize: 20, color: "#00ffd5", display: "flex",
              }}>
                €{rentA.toLocaleString()}/mo rent
              </div>
            )}
          </div>

          <div style={{ fontSize: 40, color: "#333330", padding: "0 24px", display: "flex" }}>vs</div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 15, color: "#666660", marginBottom: 8, display: "flex" }}>
              {b.flag_emoji} {b.country_name}
            </span>
            <span style={{ fontSize: 58, fontWeight: 800, color: "#f0f0e8", letterSpacing: "-1px", marginBottom: 16, display: "flex" }}>
              {b.name}
            </span>
            {rentB != null && (
              <div style={{
                alignSelf: "flex-start", background: "rgba(0,255,213,0.08)", border: "1px solid rgba(0,255,213,0.25)",
                padding: "8px 18px", fontSize: 20, color: "#00ffd5", display: "flex",
              }}>
                €{rentB.toLocaleString()}/mo rent
              </div>
            )}
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 36, right: 64, fontSize: 16, color: "#444440", display: "flex", letterSpacing: "0.05em" }}>
          findorigio.com
        </div>
      </div>
    ),
    { ...size, headers }
  );
}
