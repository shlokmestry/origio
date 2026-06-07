import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { notFound } from "next/navigation";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export const dynamic = "force-dynamic";

interface TopCountry {
  slug: string;
  name: string;
  flagEmoji: string;
  matchPercent: number;
  reasons: string[];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data } = await supabaseAdmin
    .from("wizard_results")
    .select("top_countries")
    .eq("id", id)
    .eq("is_public", true)
    .maybeSingle();

  if (!data) return { title: "Origio ~ Shared Results" };
  const top = (data.top_countries as TopCountry[])[0];
  return {
    title: `${top?.name ?? "Results"} ~ Origio`,
    description: `${top?.matchPercent ?? ""}% match · See which countries ranked #1 for this profile on Origio.`,
    openGraph: {
      title: `My top match: ${top?.name} (${top?.matchPercent}%) ~ Origio`,
      description: "Find which countries match your job, passport and priorities.",
    },
  };
}

export default async function SharedResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data } = await supabaseAdmin
    .from("wizard_results")
    .select("top_countries, answers")
    .eq("id", id)
    .eq("is_public", true)
    .maybeSingle();

  if (!data) notFound();

  const countries = (data.top_countries as TopCountry[]).slice(0, 3);
  const answers = data.answers as Record<string, unknown>;
  const jobRole = answers?.jobRole as string | undefined;

  const SERIF = "'Cabinet Grotesk', sans-serif";
  const SANS  = "'Satoshi', system-ui, sans-serif";
  const MONO  = "'Cabinet Grotesk', 'Satoshi', sans-serif";
  const BG    = "#0a0a0a";
  const FG    = "#f0f0e8";
  const MINT  = "#00ffd5";
  const DIM   = "#888880";
  const LINE  = "#1f1f1f";

  const RANK_COLORS = [MINT, "#facc15", "#a78bfa"];

  return (
    <div style={{ minHeight: "100vh", background: BG, color: FG, fontFamily: SANS }}>
      {/* Header */}
      <header style={{ borderBottom: `1px solid ${LINE}`, padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: FG }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: MINT, display: "inline-block" }} />
          <span style={{ fontFamily: SERIF, fontSize: 22, letterSpacing: "-0.02em" }}>
            origio<span style={{ color: MINT }}>.</span>
          </span>
        </Link>
        <Link href="/wizard" style={{
          fontFamily: MONO, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
          color: MINT, textDecoration: "none", border: `1px solid rgba(0,255,213,0.3)`,
          padding: "7px 14px", transition: "border-color .15s",
        }}>
          Get my ranking →
        </Link>
      </header>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "clamp(48px,8vh,80px) 32px" }}>

        {/* Eyebrow */}
        <p style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: DIM, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: MINT }}>●</span> Shared results{jobRole ? ` · ${jobRole.replace(/([A-Z])/g, " $1").trim()}` : ""}
        </p>

        <h1 style={{ fontFamily: SERIF, fontSize: "clamp(32px,5vw,56px)", fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.04, margin: "0 0 12px", color: FG }}>
          Their top <em style={{ color: MINT, fontStyle: "normal" }}>3 countries</em>
        </h1>
        <p style={{ fontFamily: SANS, fontSize: 14, color: DIM, lineHeight: 1.65, marginBottom: 48, maxWidth: 440 }}>
          Ranked by the Origio algorithm — salary, visa access, cost of living, taxes and quality of life scored against their profile.
        </p>

        {/* Podium */}
        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: LINE, marginBottom: 48 }}>
          {countries.map((c, i) => (
            <div key={c.slug} style={{
              background: "#0f0f0f", padding: "24px 28px",
              borderLeft: `3px solid ${RANK_COLORS[i]}`,
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <span style={{ fontFamily: MONO, fontSize: 11, color: RANK_COLORS[i], fontWeight: 700, minWidth: 20 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span style={{ fontSize: i === 0 ? 40 : 28, lineHeight: 1 }}>{c.flagEmoji}</span>
                <div>
                  <div style={{ fontFamily: SERIF, fontSize: i === 0 ? 26 : 20, color: FG, marginBottom: 6 }}>{c.name}</div>
                  {c.reasons.length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {c.reasons.slice(0, 2).map(r => (
                        <span key={r} style={{
                          fontFamily: MONO, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase",
                          padding: "3px 8px", borderLeft: `2px solid ${MINT}`,
                          background: "rgba(0,255,213,0.04)", color: MINT,
                        }}>{r}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <span style={{ fontFamily: SERIF, fontSize: i === 0 ? 36 : 24, color: c.matchPercent >= 90 ? "#4ade80" : c.matchPercent >= 75 ? "#facc15" : DIM }}>
                {c.matchPercent}%
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ padding: "32px 28px", border: `1px solid #2a2a2a`, background: "#0f0f0f" }}>
          <p style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: MINT, marginBottom: 10 }}>✦ Find yours</p>
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 400, letterSpacing: "-0.01em", margin: "0 0 12px", color: FG }}>
            Where would you rank?
          </h2>
          <p style={{ fontFamily: SANS, fontSize: 14, color: DIM, lineHeight: 1.65, margin: "0 0 24px", maxWidth: 380 }}>
            Answer 8 questions. The algorithm scores 45 countries against your job, passport, priorities and budget.
          </p>
          <Link href="/wizard" style={{
            fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase",
            padding: "13px 28px", background: MINT, color: BG, textDecoration: "none",
            display: "inline-flex", alignItems: "center", gap: 8,
            boxShadow: "3px 3px 0 #00aa90",
          }}>
            Find my country →
          </Link>
        </div>

      </div>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${LINE}`, padding: "20px 32px", textAlign: "center" }}>
        <Link href="/" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#333", textDecoration: "none" }}>
          findorigio.com
        </Link>
      </footer>
    </div>
  );
}
