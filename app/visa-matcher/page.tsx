"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { FlagIcon } from "@/components/FlagIcon";
import { slugToIso } from "@/lib/flagCodes";
import { getPassportStrength, PASSPORT_TIER_LABEL } from "@/lib/wizard";
import { CountryWithData } from "@/types";

const MONO  = "'Cabinet Grotesk', 'Satoshi', sans-serif";
const SANS  = "'Satoshi', system-ui, sans-serif";
const SERIF = "'Cabinet Grotesk', sans-serif";
const BG    = "#0e0d0c";
const FG    = "#f0f0e8";
const MINT  = "#00ffd5";
const DIM   = "#888880";
const LINE  = "#1f1f1f";

const PASSPORTS = [
  { label: "Australia",      slug: "australia" },
  { label: "Austria",        slug: "austria" },
  { label: "Belgium",        slug: "belgium" },
  { label: "Brazil",         slug: "brazil" },
  { label: "Canada",         slug: "canada" },
  { label: "China",          slug: "china" },
  { label: "Denmark",        slug: "denmark" },
  { label: "Finland",        slug: "finland" },
  { label: "France",         slug: "france" },
  { label: "Germany",        slug: "germany" },
  { label: "Ghana",          slug: "ghana" },
  { label: "India",          slug: "india" },
  { label: "Indonesia",      slug: "indonesia" },
  { label: "Ireland",        slug: "ireland" },
  { label: "Italy",          slug: "italy" },
  { label: "Japan",          slug: "japan" },
  { label: "Malaysia",       slug: "malaysia" },
  { label: "Mexico",         slug: "mexico" },
  { label: "Netherlands",    slug: "netherlands" },
  { label: "New Zealand",    slug: "new-zealand" },
  { label: "Nigeria",        slug: "nigeria" },
  { label: "Norway",         slug: "norway" },
  { label: "Pakistan",       slug: "pakistan" },
  { label: "Philippines",    slug: "philippines" },
  { label: "Poland",         slug: "poland" },
  { label: "Portugal",       slug: "portugal" },
  { label: "Romania",        slug: "romania" },
  { label: "Singapore",      slug: "singapore" },
  { label: "South Africa",   slug: "south-africa" },
  { label: "South Korea",    slug: "south-korea" },
  { label: "Spain",          slug: "spain" },
  { label: "Sweden",         slug: "sweden" },
  { label: "Switzerland",    slug: "switzerland" },
  { label: "Thailand",       slug: "thailand" },
  { label: "Turkey",         slug: "turkey" },
  { label: "UAE",            slug: "uae" },
  { label: "United Kingdom", slug: "united-kingdom" },
  { label: "USA",            slug: "usa" },
  { label: "Vietnam",        slug: "vietnam" },
];

const VISA_DIFFICULTY_LABEL: Record<number, { label: string; color: string; short: string }> = {
  1: { label: "Visa-free or visa on arrival",  color: "#4ade80", short: "Visa-free" },
  2: { label: "Simple application, fast approval", color: "#a3e635", short: "Easy" },
  3: { label: "Moderate — sponsored or employer required", color: "#facc15", short: "Moderate" },
  4: { label: "Difficult — restricted access",  color: "#ef4444", short: "Restricted" },
};

const TIER_COLORS: Record<1 | 2 | 3 | 4, string> = {
  1: "#4ade80", 2: "#a3e635", 3: "#facc15", 4: "#ef4444",
};

// Adjusts difficulty based on passport strength (mirrors wizard.ts logic)
function effectiveDifficulty(passportSlug: string, visaDifficulty: number): number {
  const strength = getPassportStrength(passportSlug);
  const reductions: Record<1 | 2 | 3 | 4, number> = { 1: 2.0, 2: 1.0, 3: 0, 4: -1.0 };
  return Math.max(1, Math.min(4, Math.round(visaDifficulty - reductions[strength])));
}

export default function VisaMatcherPage() {
  const [passportSlug, setPassportSlug]   = useState("");
  const [search, setSearch]               = useState("");
  const [countries, setCountries]         = useState<CountryWithData[]>([]);
  const [loadingData, setLoadingData]     = useState(true);
  const [showDropdown, setShowDropdown]   = useState(false);

  useEffect(() => {
    fetch("/api/countries")
      .then(r => r.json())
      .then((data: CountryWithData[]) => {
        setCountries(Array.isArray(data) ? data : []);
        setLoadingData(false);
      })
      .catch(() => setLoadingData(false));
  }, []);

  const filteredPassports = PASSPORTS.filter(p =>
    p.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedPassport = PASSPORTS.find(p => p.slug === passportSlug);
  const tier = passportSlug ? getPassportStrength(passportSlug) as 1 | 2 | 3 | 4 : null;

  const categorized = passportSlug && countries.length > 0
    ? (() => {
        const groups: Record<1 | 2 | 3 | 4, CountryWithData[]> = { 1: [], 2: [], 3: [], 4: [] };
        countries.forEach((c: CountryWithData) => {
          const d = effectiveDifficulty(passportSlug, c.data.visaDifficulty);
          groups[d as 1 | 2 | 3 | 4].push(c);
        });
        return groups;
      })()
    : null;

  return (
    <div style={{ minHeight: "100vh", background: BG, color: FG, fontFamily: SANS }}>
      <Nav countries={[]} onCountrySelect={() => {}} />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "88px 32px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: DIM, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: MINT }}>●</span> Visa matcher
          </p>
          <h1 style={{ fontFamily: SERIF, fontSize: "clamp(36px,6vw,64px)", fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 0.95, margin: "0 0 16px", color: FG }}>
            Where can you<br /><em style={{ fontStyle: "normal", color: MINT }}>actually move?</em>
          </h1>
          <p style={{ fontFamily: SANS, fontSize: 15, color: DIM, lineHeight: 1.7, maxWidth: 480, margin: 0 }}>
            Select your passport. See which of 37 countries are visa-free, easy, moderate, or restricted — adjusted for your specific passport strength.
          </p>
        </div>

        {/* Passport selector */}
        <div style={{ marginBottom: 40, maxWidth: 420, position: "relative" }}>
          <label style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: DIM, display: "block", marginBottom: 10 }}>
            Your passport
          </label>
          <input
            type="text"
            placeholder={selectedPassport ? selectedPassport.label : "Type your country…"}
            value={selectedPassport && !showDropdown ? selectedPassport.label : search}
            onFocus={() => { setShowDropdown(true); setSearch(""); }}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSearch(e.target.value); setShowDropdown(true); }}
            style={{
              width: "100%", fontFamily: SANS, fontSize: 15, color: FG,
              background: "#0f0f0f", border: `1px solid ${passportSlug ? MINT : "#2a2a2a"}`,
              padding: "12px 16px", outline: "none", boxSizing: "border-box",
              transition: "border-color 0.15s",
            }}
          />
          {showDropdown && filteredPassports.length > 0 && (
            <div style={{
              position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50,
              background: "#111", border: `1px solid #2a2a2a`, borderTop: "none",
              maxHeight: 240, overflowY: "auto",
            }}>
              {filteredPassports.map(p => (
                <button
                  key={p.slug}
                  onMouseDown={() => { setPassportSlug(p.slug); setSearch(""); setShowDropdown(false); }}
                  style={{
                    width: "100%", background: p.slug === passportSlug ? "rgba(0,255,213,0.08)" : "none",
                    border: "none", padding: "10px 16px", textAlign: "left",
                    fontFamily: SANS, fontSize: 14, color: p.slug === passportSlug ? MINT : FG,
                    cursor: "pointer", borderBottom: `1px solid #0f0f0f`,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                  onMouseLeave={e => (e.currentTarget.style.background = p.slug === passportSlug ? "rgba(0,255,213,0.08)" : "none")}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Passport tier badge */}
        {tier && selectedPassport && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 12, padding: "10px 18px",
            border: `1px solid rgba(0,255,213,0.2)`, marginBottom: 36,
          }}>
            <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: DIM }}>
              {selectedPassport.label} passport
            </span>
            <span style={{ width: 1, height: 12, background: "#2a2a2a" }} />
            <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: TIER_COLORS[tier] }}>
              TIER {tier}
            </span>
            <span style={{ fontFamily: MONO, fontSize: 10, color: DIM }}>
              {PASSPORT_TIER_LABEL[tier].split("—")[1]?.trim()}
            </span>
          </div>
        )}

        {loadingData && (
          <p style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: DIM }}>
            Loading data…
          </p>
        )}

        {/* Results */}
        {categorized && !loadingData && (
          <div>
            {([1, 2, 3, 4] as const).map(diff => {
              const group = categorized[diff];
              if (!group.length) return null;
              const meta = VISA_DIFFICULTY_LABEL[diff];
              return (
                <section key={diff} style={{ marginBottom: 40 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <span style={{ width: 8, height: 8, background: meta.color, flexShrink: 0 }} />
                    <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: meta.color }}>
                      {meta.short} — {group.length} {group.length === 1 ? "country" : "countries"}
                    </span>
                    <span style={{ fontFamily: MONO, fontSize: 9, color: "#333" }}>· {meta.label}</span>
                  </div>
                  <div style={{ borderTop: `1px solid ${LINE}` }}>
                    {group.map(c => (
                      <Link
                        key={c.slug}
                        href={`/country/${c.slug}`}
                        style={{
                          display: "flex", alignItems: "center", gap: 14,
                          padding: "12px 4px", borderBottom: `1px solid #0f0f0f`,
                          textDecoration: "none", transition: "background 0.1s",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.015)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        {slugToIso(c.slug)
                          ? <FlagIcon code={slugToIso(c.slug)!} size="sm" />
                          : <span style={{ fontSize: 18 }}>{c.flagEmoji}</span>
                        }
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: SERIF, fontSize: 14, color: FG, marginBottom: 2 }}>{c.name}</div>
                          {c.data.visaPopularRoutes?.[0] && (
                            <div style={{ fontFamily: MONO, fontSize: 9, color: "#333", letterSpacing: "0.1em" }}>
                              {c.data.visaPopularRoutes[0]}
                            </div>
                          )}
                        </div>
                        <span style={{
                          fontFamily: MONO, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase",
                          padding: "3px 8px", border: `1px solid ${meta.color}22`, color: meta.color,
                          flexShrink: 0,
                        }}>
                          {meta.short}
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}

            <div style={{ marginTop: 16, padding: "16px 0", borderTop: `1px solid ${LINE}` }}>
              <p style={{ fontFamily: MONO, fontSize: 9, color: "#2a2a2a", lineHeight: 1.7, margin: 0 }}>
                * Visa access is adjusted for your passport tier. Difficulty is based on standard immigration pathways — long-stay visas, residency routes, and nomad visas. Entry requirements vary by purpose and change over time. Verify with official sources before travelling.
              </p>
            </div>

            <div style={{ marginTop: 28, padding: "20px 24px", border: `1px solid #1a1a1a`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <p style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: DIM, marginBottom: 4 }}>Want a personalised ranking?</p>
                <p style={{ fontFamily: SANS, fontSize: 14, color: FG, margin: 0 }}>
                  The wizard matches countries to your specific priorities, salary, and budget — not just visa access.
                </p>
              </div>
              <Link href="/wizard" style={{
                fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase",
                padding: "11px 24px", background: MINT, color: BG, textDecoration: "none",
                display: "inline-flex", alignItems: "center", gap: 8,
                boxShadow: "3px 3px 0 #00aa90", flexShrink: 0,
              }}>
                Take the quiz →
              </Link>
            </div>
          </div>
        )}

        {!passportSlug && !loadingData && (
          <div style={{ padding: "40px 0", borderTop: `1px solid ${LINE}` }}>
            <p style={{ fontFamily: SANS, fontSize: 14, color: DIM, lineHeight: 1.7 }}>
              Select your passport above to see a breakdown across all 37 countries.
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
