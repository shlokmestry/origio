"use client";

import React, { useState, useCallback, useEffect } from "react";
import { ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { CountryMatch, WizardAnswers } from "@/lib/wizard";
import { CountryWithData, JOB_ROLES } from "@/types";

const MONO  = "'Cabinet Grotesk', 'Satoshi', sans-serif";
const SANS  = "'Satoshi', system-ui, sans-serif";
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

export function applyCustomWeights(
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
    const salaryScore = norm(salaryUSD, 25000, 200000);
    const affordScore = 10 - norm(rentUSD, 300, 4000);
    const taxScore    = 10 - norm(d.incomeTaxRateMid, 0, 55);
    const safetyScore = d.scoreSafety;
    const qualScore   = d.scoreQualityOfLife;
    const visaScore   = Math.max(0, Math.min(10, 10 - d.visaDifficulty * 2));
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

export function WeightingModal({
  open,
  onClose,
  onReanalyse,
  originalMatches,
  allCountries,
  answers,
  isPro,
}: {
  open: boolean;
  onClose: () => void;
  onReanalyse: (newMatches: CountryMatch[]) => void;
  originalMatches: CountryMatch[];
  allCountries: CountryWithData[];
  answers: Partial<WizardAnswers>;
  isPro: boolean;
}) {
  const [weights, setWeights] = useState<Record<WeightKey, number>>(DEFAULT_WEIGHTS);
  const normalized = normalizeWeights(weights);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleApply = useCallback(() => {
    if (!allCountries.length) return;
    const result = applyCustomWeights(allCountries, answers, normalized, originalMatches);
    onReanalyse(result);
  }, [allCountries, answers, normalized, originalMatches, onReanalyse]);

  if (!open) return null;

  if (!isPro) {
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center",
      }} onClick={onClose}>
        <div style={{
          background: "#111", border: `1px solid #2a2a2a`, padding: "40px 36px",
          maxWidth: 440, width: "90%", boxShadow: "6px 6px 0 #000",
        }} onClick={e => e.stopPropagation()}>
          <button onClick={onClose} style={{ position: "absolute" as const, top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: DIM }}>
            <X size={16} />
          </button>
          <p style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: DIM, marginBottom: 12 }}>Custom ranking weights</p>
          <p style={{ fontFamily: SANS, fontSize: 15, color: FG, marginBottom: 20 }}>Re-rank all countries by your own formula. Pro feature.</p>
          <Link href="/pro" style={{
            fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase",
            padding: "12px 24px", background: MINT, color: BG, textDecoration: "none",
            display: "inline-flex", alignItems: "center", gap: 8,
            boxShadow: "3px 3px 0 #00aa90",
          }}>
            Unlock Pro →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.88)", display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px",
    }} onClick={onClose}>
      <div style={{
        background: "#0f0f0f", border: `1px solid #2a2a2a`,
        width: "100%", maxWidth: 520,
        boxShadow: "6px 6px 0 #000",
        position: "relative",
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: `1px solid ${LINE}` }}>
          <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: DIM }}>Custom ranking weights</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: DIM, display: "flex", alignItems: "center" }}>
            <X size={15} />
          </button>
        </div>

        {/* Sliders */}
        <div style={{ padding: "24px 24px 20px" }}>
          <p style={{ fontFamily: SANS, fontSize: 13, color: DIM, margin: "0 0 20px", lineHeight: 1.5 }}>
            Drag to weight what matters. Hit Reanalyse to rebuild the ranking.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {(Object.keys(weights) as WeightKey[]).map(key => (
              <div key={key}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                  <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: DIM }}>{WEIGHT_LABELS[key]}</span>
                  <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: MINT }}>{normalized[key]}%</span>
                </div>
                <input
                  type="range" min={0} max={100} value={weights[key]}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setWeights(prev => ({ ...prev, [key]: Number(e.target.value) }))
                  }
                  style={{ width: "100%", accentColor: MINT, cursor: "pointer", height: 2 }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: `1px solid ${LINE}`, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button
            onClick={() => setWeights(DEFAULT_WEIGHTS)}
            style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "#444", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2 }}
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            style={{
              fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase",
              padding: "12px 28px", background: MINT, color: BG, border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8,
              boxShadow: "3px 3px 0 #00aa90", transition: "transform .1s, box-shadow .1s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translate(-1px,-1px)"; e.currentTarget.style.boxShadow = "4px 4px 0 #00aa90"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "3px 3px 0 #00aa90"; }}
          >
            Reanalyse <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Legacy export kept for any remaining imports
export function WeightingPanel(props: {
  originalMatches: CountryMatch[];
  allCountries: CountryWithData[];
  answers: Partial<WizardAnswers>;
  isPro: boolean;
}) {
  return null;
}
