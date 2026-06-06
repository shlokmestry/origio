"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { FlagIcon } from "@/components/FlagIcon";
import { slugToIso } from "@/lib/flagCodes";

interface CityPanelData {
  slug: string;
  name: string;
  country_name: string;
  country_slug: string;
  flag_emoji: string;
  continent: string;
  language: string;
  currency: string;
  tagline: string | null;
  city_data: Array<{
    move_score: number | null;
    cost_rent_city_centre: number | null;
    cost_eating_out: number | null;
    cost_transport_monthly: number | null;
    cost_groceries_monthly: number | null;
    salary_software_engineer: number | null;
    score_quality_of_life: number | null;
    score_safety: number | null;
    score_internet_speed: number | null;
    score_walkability: number | null;
    income_tax_rate_mid: number | null;
  }>;
}

interface CityPanelProps {
  slug: string | null;
  onClose: () => void;
}

function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: "$", EUR: "€", GBP: "£", AUD: "A$", CAD: "C$",
    NZD: "NZ$", CHF: "CHF ", SGD: "S$", AED: "AED ",
    NOK: "kr ", SEK: "kr ", JPY: "¥", INR: "₹", BRL: "R$",
    MYR: "RM ", DKK: "kr ", THB: "฿", MXN: "$", VND: "₫",
    GEL: "₾", COP: "$",
  };
  return symbols[currency] ?? currency + " ";
}

const SCORE_BARS = [
  { key: "score_quality_of_life", label: "Quality of Life", color: "#a78bfa" },
  { key: "score_safety",          label: "Safety",          color: "#60a5fa" },
  { key: "score_internet_speed",  label: "Internet",        color: "#00ffd5" },
  { key: "score_walkability",     label: "Walkability",     color: "#fbbf24" },
];

export default function CityPanel({ slug, onClose }: CityPanelProps) {
  const router = useRouter();
  const [city, setCity] = useState<CityPanelData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!slug) { setIsVisible(false); setCity(null); return; }
    setLoading(true);
    fetch(`/api/city?slug=${encodeURIComponent(slug)}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { setCity(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (city) requestAnimationFrame(() => setIsVisible(true));
    else setIsVisible(false);
  }, [city]);

  const handleClose = () => { setIsVisible(false); setTimeout(onClose, 300); };

  if (!slug) return null;

  const d = city?.city_data?.[0];
  const currencySymbol = city ? getCurrencySymbol(city.currency) : "";
  const moveScore = d?.move_score ?? null;

  return (
    <>
      <style>{`
        @media (max-width: 560px) {
          .cp-cost-grid  { grid-template-columns: 1fr 1fr !important; }
          .cp-cta-grid   { grid-template-columns: 1fr !important; }
          .cp-modal      { max-height: calc(100vh - 64px) !important; border-radius: 16px 16px 0 0 !important; }
          .cp-wrap       { padding: 64px 0 0 !important; align-items: flex-end !important; }
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: "fixed", inset: 0, zIndex: 50,
          background: "rgba(0,0,0,0.75)", backdropFilter: "blur(2px)",
          transition: "opacity 0.3s ease",
          opacity: isVisible ? 1 : 0,
          pointerEvents: isVisible ? "auto" : "none",
        }}
      />

      {/* Modal wrapper */}
      <div
        className="cp-wrap"
        style={{
          position: "fixed", inset: 0, zIndex: 51,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "80px 1rem 1rem", pointerEvents: "none",
        }}
      >
        <div
          className="cp-modal"
          style={{
            pointerEvents: "auto", width: "100%",
            maxWidth: "clamp(300px, 95vw, 680px)",
            maxHeight: "calc(100vh - 96px)", overflowY: "auto",
            overscrollBehavior: "contain",
            background: "#111111", border: "1px solid #2a2a2a",
            boxShadow: "0 0 0 1px #1a1a1a, 8px 8px 0 #000000",
            transition: "opacity 0.3s ease, transform 0.3s ease",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "scale(1) translateY(0)" : "scale(0.97) translateY(8px)",
          }}
        >
          {/* HEADER */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "20px 24px 16px", borderBottom: "1px solid #2a2a2a",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              {city && slugToIso(city.country_slug)
                ? <FlagIcon code={slugToIso(city.country_slug)!} size="md" />
                : <span style={{ fontSize: "2rem", lineHeight: 1 }}>{city?.flag_emoji ?? "🏙️"}</span>
              }
              <div>
                <h2 style={{
                  margin: 0, fontFamily: "var(--font-heading, 'Cabinet Grotesk', sans-serif)",
                  fontSize: "1.5rem", fontWeight: 800, color: "#f0f0e8",
                  textTransform: "uppercase", letterSpacing: "-0.02em", lineHeight: 1,
                }}>
                  {city?.name ?? slug}
                </h2>
                <p style={{
                  margin: "4px 0 0", fontSize: "10px", fontWeight: 700,
                  color: "#666", textTransform: "uppercase", letterSpacing: "0.12em",
                }}>
                  {city ? `${city.country_name} · ${city.continent}` : "Loading..."}
                </p>
              </div>
            </div>

            {/* Score pill + close */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {moveScore != null && (
                <div style={{
                  width: "64px", height: "64px", borderRadius: "50%",
                  border: "2px solid #2a2a2a", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", background: "#0f0f0f",
                }}>
                  <span style={{
                    fontFamily: "var(--font-heading, 'Cabinet Grotesk', sans-serif)",
                    fontSize: "1.25rem", fontWeight: 800, color: "#f0f0e8", lineHeight: 1,
                  }}>
                    {moveScore}
                  </span>
                  <span style={{ fontSize: "9px", color: "#666", fontWeight: 700, marginTop: "2px" }}>/10</span>
                </div>
              )}
              <button
                onClick={handleClose}
                style={{
                  background: "none", border: "1px solid #2a2a2a", color: "#666",
                  cursor: "pointer", padding: "6px", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  transition: "color 0.15s, border-color 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.color = "#f0f0e8"; e.currentTarget.style.borderColor = "#f0f0e8"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "#666"; e.currentTarget.style.borderColor = "#2a2a2a"; }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* BODY */}
          {loading && (
            <div style={{ padding: "40px 24px", textAlign: "center", color: "#555", fontSize: "12px" }}>
              Loading...
            </div>
          )}

          {city && d && (
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "20px" }}>

              {/* Move Score bar + Score Breakdown */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="cp-body-grid">

                {/* Left: Move Score + Salary */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {moveScore != null && (
                    <div>
                      <p style={{ margin: "0 0 6px", fontSize: "10px", fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                        Move Score
                      </p>
                      <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", marginBottom: "8px" }}>
                        <span style={{
                          fontFamily: "var(--font-heading, 'Cabinet Grotesk', sans-serif)",
                          fontSize: "2.5rem", fontWeight: 800, color: "#f0f0e8", lineHeight: 1,
                        }}>
                          {moveScore}
                        </span>
                        <span style={{ fontSize: "12px", color: "#555", fontWeight: 700, marginBottom: "4px" }}>/10</span>
                      </div>
                      <div style={{ height: "4px", background: "#1a1a1a", width: "100%" }}>
                        <div style={{
                          height: "100%", width: `${(moveScore / 10) * 100}%`,
                          background: "#00ffd5", transition: "width 0.6s ease",
                        }} />
                      </div>
                    </div>
                  )}

                  {d.salary_software_engineer != null && (
                    <div>
                      <p style={{ margin: "0 0 4px", fontSize: "10px", fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                        Software Eng. Salary
                      </p>
                      <p style={{
                        margin: 0, fontFamily: "var(--font-heading, 'Cabinet Grotesk', sans-serif)",
                        fontSize: "1.6rem", fontWeight: 800, color: "#f0f0e8", lineHeight: 1,
                      }}>
                        {currencySymbol}{d.salary_software_engineer.toLocaleString()}
                      </p>
                      <p style={{ margin: "3px 0 0", fontSize: "10px", color: "#555", fontWeight: 600 }}>
                        per year · {city.currency}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right: Score Breakdown */}
                <div>
                  <p style={{ margin: "0 0 10px", fontSize: "10px", fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Score Breakdown
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {SCORE_BARS.map(({ key, label, color }) => {
                      const val = d[key as keyof typeof d] as number | null;
                      if (val == null) return null;
                      return (
                        <div key={key} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "10px", fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em", width: "90px", flexShrink: 0 }}>
                            {label}
                          </span>
                          <div style={{ flex: 1, height: "3px", background: "#1a1a1a" }}>
                            <div style={{ height: "100%", width: `${(val / 10) * 100}%`, background: color }} />
                          </div>
                          <span style={{ fontSize: "11px", fontWeight: 700, color, width: "24px", textAlign: "right", flexShrink: 0 }}>
                            {Math.round(val * 10) / 10}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Cost of Living */}
              <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: "16px" }}>
                <p style={{ margin: "0 0 10px", fontSize: "10px", fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Cost of Living
                </p>
                <div className="cp-cost-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {[
                    { label: "Rent (1BR)", value: d.cost_rent_city_centre != null ? `${currencySymbol}${d.cost_rent_city_centre.toLocaleString()}/mo` : null },
                    { label: "Meal Out",   value: d.cost_eating_out != null       ? `${currencySymbol}${d.cost_eating_out.toLocaleString()}`         : null },
                    { label: "Transport",  value: d.cost_transport_monthly != null ? `${currencySymbol}${d.cost_transport_monthly.toLocaleString()}/mo` : null },
                    { label: "Groceries",  value: d.cost_groceries_monthly != null ? `${currencySymbol}${d.cost_groceries_monthly.toLocaleString()}/mo` : null },
                  ].filter(item => item.value != null).map((item) => (
                    <div key={item.label} style={{
                      background: "#0f0f0f", border: "1px solid #1a1a1a", padding: "12px 14px",
                    }}>
                      <p style={{ margin: "0 0 4px", fontSize: "9px", fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                        {item.label}
                      </p>
                      <p style={{
                        margin: 0, fontFamily: "var(--font-heading, 'Cabinet Grotesk', sans-serif)",
                        fontSize: "1.1rem", fontWeight: 800, color: "#f0f0e8",
                      }}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTAs */}
              <div className="cp-cta-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", borderTop: "1px solid #1a1a1a", paddingTop: "16px" }}>
                <button
                  onClick={() => { handleClose(); setTimeout(() => router.push(`/city/${city.slug}`), 310); }}
                  style={{
                    padding: "14px 0", background: "#f0f0e8", border: "none",
                    color: "#0a0a0a", fontSize: "12px", fontWeight: 800,
                    textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer",
                    fontFamily: "var(--font-heading, 'Cabinet Grotesk', sans-serif)",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#00ffd5")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#f0f0e8")}
                >
                  View City Page
                </button>
                <button
                  onClick={() => { handleClose(); setTimeout(() => router.push(`/country/${city.country_slug}`), 310); }}
                  style={{
                    padding: "14px 0", background: "transparent", border: "1px solid #2a2a2a",
                    color: "#f0f0e8", fontSize: "12px", fontWeight: 800,
                    textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer",
                    fontFamily: "var(--font-heading, 'Cabinet Grotesk', sans-serif)",
                    transition: "border-color 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#f0f0e8"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a2a2a"; }}
                >
                  View Country
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  );
}
