"use client";

import React, { useState, useCallback } from "react";
import { ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import { CountryMatch, WizardAnswers, scoreCountriesForWizard } from "@/lib/wizard";
import { CountryWithData, JOB_ROLES } from "@/types";
import { FlagIcon } from "@/components/FlagIcon";
import { slugToIso } from "@/lib/flagCodes";

const MONO  = "'Cabinet Grotesk', 'Satoshi', sans-serif";
const SANS  = "'Satoshi', system-ui, sans-serif";
const SERIF = "'Cabinet Grotesk', sans-serif";
const BG    = "#0e0d0c";
const FG    = "#f0f0e8";
const MINT  = "#00ffd5";
const DIM   = "#888880";
const LINE  = "#1f1f1f";

type WeightKey = "salary" | "affordability" | "tax" | "safety" | "quality" | "visa";

const WEIGHT_LABELS: Record<WeightKey, string> = {
  salary:        "Salary",
  affordability: "Low cost",
  tax:           "Low tax",
  safety:        "Safety",
  quality:       "Quality of life",
  visa:          "Easy visa",
};

const DEFAULT_WEIGHTS: Record<WeightKey, number> = {
  salary: 25, affordability: 20, tax: 10, safety: 12, quality: 18, visa: 15,
};

function normalizeWeights(w: Record<WeightKey, number>): Record<WeightKey, number> {
  const total = Object.values(w).reduce((a, b) => a + b, 0);
  if (total === 0) return w;
  const result = {} as Record<WeightKey, number>;
  (Object.keys(w) as WeightKey[]).forEach(k => { result[k] = Math.round((w[k] / total) * 100); });
  return result;
}

// Applies custom weights directly to scoring metrics — bypasses the full wizard algorithm
// to keep it snappy and predictable for the user
function applyCustomWeights(
  countries: CountryWithData[],
  answers: Partial<WizardAnswers>,
  weights: Record<WeightKey, number>,
  originalMatches: CountryMatch[]
): CountryMatch[] {
  const TO_USD: Record<string, number> = {
    USD:1, EUR:1.08, GBP:1.27, AUD:0.65, CAD:0.74, NZD:0.61, CHF:1.13,
    SGD:0.74, AED:0.27, NOK:0.093, SEK:0.096, DKK:0.145, JPY:0.0067,
    INR:0.012, BRL:0.20, MYR:0.22, MXN:0.058, THB:0.028, COP:0.00024,
    KRW:0.00074, CZK:0.044, GEL:0.37, VND:0.000039, CRC:0.0019, PLN:0.25,
  };
  function norm(v: number, min: number, max: number) { return Math.max(0, Math.min(10, ((v - min) / (max - min)) * 10)); }
  function toUSD(amount: number, currency: string) { return amount * (TO_USD[currency] ?? 1); }

  // Only re-rank countries that made it into the original results (already passed hard filters)
  const slugSet = new Set(originalMatches.map(m => m.country.slug));
  const eligible = countries.filter(c => slugSet.has(c.slug));

  const w = {
    salary:        weights.salary / 100,
    affordability: weights.affordability / 100,
    tax:           weights.tax / 100,
    safety:        weights.safety / 100,
    quality:       weights.quality / 100,
    visa:          weights.visa / 100,
  };

  const results = eligible.map(country => {
    const d = country.data;
    const rentUSD = toUSD(d.costRentCityCentre, country.currency);
    const orig = originalMatches.find(m => m.country.slug === country.slug);

    let salaryUSD = 0;
    if (answers.jobRole) {
      const roleDef = JOB_ROLES.find(r => r.key === answers.jobRole);
      if (roleDef) salaryUSD = toUSD(d[roleDef.salaryKey as keyof typeof d] as number, country.currency);
    }

    const salaryScore  = norm(salaryUSD, 25000, 200000);
    const affordScore  = 10 - norm(rentUSD, 300, 4000);
    const taxScore     = 10 - norm(d.incomeTaxRateMid, 0, 55);
    const safetyScore  = d.scoreSafety;
    const qualScore    = d.scoreQualityOfLife;
    const visaScore    = Math.max(0, Math.min(10, 10 - d.visaDifficulty * 2));

    const score = salaryScore * w.salary + affordScore * w.affordability +
                  taxScore * w.tax + safetyScore * w.safety +
                  qualScore * w.quality + visaScore * w.visa;

    return { country, matchScore: score, matchPercent: 0, reasons: orig?.reasons ?? [] };
  });

  results.sort((a, b) => b.matchScore - a.matchScore);

  const top = results[0]?.matchScore ?? 10;
  const bot = results[results.length - 1]?.matchScore ?? 0;
  const span = Math.max(top - bot, 0.1);
  results.forEach(r => {
    const rel = (r.matchScore - bot) / span;
    r.matchPercent = Math.min(95, Math.max(20, Math.round(30 + rel * 65)));
  });

  return results;
}

export function WeightingPanel({
  originalMatches,
  allCountries,
  answers,
  isPro,
}: {
  originalMatches: CountryMatch[];
  allCountries: CountryWithData[];
  answers: Partial<WizardAnswers>;
  isPro: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [weights, setWeights] = useState<Record<WeightKey, number>>(DEFAULT_WEIGHTS);
  const [reranked, setReranked] = useState<CountryMatch[] | null>(null);
  const [computing, setComputing] = useState(false);

  const normalized = normalizeWeights(weights);
  const totalPct = Object.values(normalized).reduce((a, b) => a + b, 0);

  const handleSlider = useCallback((key: WeightKey, val: number) => {
    setWeights((prev: Record<WeightKey, number>) => ({ ...prev, [key]: val }));
    setReranked(null);
  }, []);

  const handleApply = useCallback(() => {
    if (!allCountries.length) return;
    setComputing(true);
    setTimeout(() => {
      const result = applyCustomWeights(allCountries, answers, normalized, originalMatches);
      setReranked(result);
      setComputing(false);
    }, 80);
  }, [allCountries, answers, normalized, originalMatches]);

  if (!isPro) {
    return (
      <div style={{ border: `1px solid #1a1a1a`, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: DIM, marginBottom: 4 }}>Custom ranking weights</p>
          <p style={{ fontFamily: SANS, fontSize: 14, color: "#444", margin: 0 }}>Re-rank all countries by your own formula — salary 50%, rent 30%, visa 20%.</p>
        </div>
        <Link href="/pro" style={{
          fontFamily: MONO, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase",
          color: MINT, textDecoration: "none", display: "flex", alignItems: "center", gap: 4,
        }}>
          Unlock with Pro →
        </Link>
      </div>
    );
  }

  return (
    <div style={{ border: `1px solid #1a1a1a` }}>
      <button
        onClick={() => setOpen((o: boolean) => !o)}
        style={{
          width: "100%", background: "none", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: DIM }}>Custom ranking weights</span>
          {reranked && <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: MINT, padding: "2px 6px", border: `1px solid rgba(0,255,213,0.3)` }}>Active</span>}
        </div>
        {open ? <ChevronUp size={14} color={DIM} /> : <ChevronDown size={14} color={DIM} />}
      </button>

      {open && (
        <div style={{ padding: "0 24px 24px", borderTop: `1px solid ${LINE}` }}>
          <p style={{ fontFamily: SANS, fontSize: 13, color: DIM, lineHeight: 1.6, margin: "16px 0 20px" }}>
            Drag the sliders to weight what matters to you. Hit Apply to re-rank.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 20 }}>
            {(Object.keys(weights) as WeightKey[]).map(key => (
              <div key={key}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: DIM }}>{WEIGHT_LABELS[key]}</span>
                  <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: MINT }}>{normalized[key]}%</span>
                </div>
                <input
                  type="range" min={0} max={100} value={weights[key]}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSlider(key, Number(e.target.value))}
                  style={{ width: "100%", accentColor: MINT, cursor: "pointer" }}
                />
              </div>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <span style={{ fontFamily: MONO, fontSize: 9, color: "#333", letterSpacing: "0.12em" }}>
              Total: {totalPct}% {totalPct !== 100 && <span style={{ color: "#666" }}>(auto-normalised)</span>}
            </span>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button
                onClick={() => { setWeights(DEFAULT_WEIGHTS); setReranked(null); }}
                style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "#444", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2 }}
              >
                Reset
              </button>
              <button
                onClick={handleApply}
                disabled={computing}
                style={{
                  fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase",
                  padding: "10px 20px", background: MINT, color: BG, border: "none", cursor: computing ? "default" : "pointer",
                  display: "flex", alignItems: "center", gap: 6, opacity: computing ? 0.7 : 1,
                  boxShadow: "2px 2px 0 #00aa90",
                }}
              >
                {computing ? "Computing…" : "Apply weights"} {!computing && <ArrowRight size={12} />}
              </button>
            </div>
          </div>

          {reranked && reranked.length > 0 && (
            <div style={{ marginTop: 24, borderTop: `1px solid ${LINE}`, paddingTop: 20 }}>
              <p style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: MINT, marginBottom: 14 }}>
                ◆ Re-ranked by your weights
              </p>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {reranked.slice(0, 10).map((m: CountryMatch, i: number) => (
                  <div key={m.country.slug} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
                    borderBottom: `1px solid #0f0f0f`,
                  }}>
                    <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: i < 3 ? MINT : "#2a2a2a", width: 24, textAlign: "right", flexShrink: 0 }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {slugToIso(m.country.slug)
                      ? <FlagIcon code={slugToIso(m.country.slug)!} size="sm" />
                      : <span style={{ fontSize: 18 }}>{m.country.flagEmoji}</span>
                    }
                    <span style={{ fontFamily: SERIF, fontSize: 14, color: FG, flex: 1 }}>{m.country.name}</span>
                    <span style={{ fontFamily: MONO, fontSize: 12, color: i === 0 ? MINT : DIM }}>{m.matchPercent}%</span>
                  </div>
                ))}
              </div>
              {reranked.length > 10 && (
                <p style={{ fontFamily: MONO, fontSize: 9, color: "#333", marginTop: 10, letterSpacing: "0.12em" }}>
                  +{reranked.length - 10} more countries ranked
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
