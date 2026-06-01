"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { FlagIcon } from "@/components/FlagIcon";
import { slugToIso } from "@/lib/flagCodes";
import { TO_USD } from "@/lib/wizard";
import { CountryWithData } from "@/types";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthProvider";

const MONO  = "'Cabinet Grotesk', 'Satoshi', sans-serif";
const SANS  = "'Satoshi', system-ui, sans-serif";
const SERIF = "'Cabinet Grotesk', sans-serif";
const BG    = "#0e0d0c";
const FG    = "#f0f0e8";
const MINT  = "#00ffd5";
const DIM   = "#888880";
const LINE  = "#1f1f1f";
const PANEL = "#0f0f0f";

type FamilySize = "solo" | "couple" | "family";

const FAMILY_MULTIPLIERS: Record<FamilySize, number> = {
  solo:   1.0,
  couple: 1.6,
  family: 2.2,
};

const FAMILY_LABELS: Record<FamilySize, string> = {
  solo:   "Solo",
  couple: "Couple",
  family: "Family (2 adults + kids)",
};

function toUSD(amount: number, currency: string): number {
  return amount * (TO_USD[currency] ?? 1);
}

function getCurrencySymbol(currency: string): string {
  const s: Record<string, string> = {
    USD: "$", EUR: "€", GBP: "£", AUD: "A$", CAD: "C$",
    NZD: "NZ$", CHF: "CHF ", SGD: "S$", AED: "AED ",
    NOK: "kr ", SEK: "kr ", JPY: "¥", INR: "₹", BRL: "R$",
    MYR: "RM ", DKK: "kr ",
  };
  return s[currency] ?? currency + " ";
}

interface CountryBudget {
  country: CountryWithData;
  monthlyCostUSD: number;
  marginUSD: number;
  canAfford: boolean;
  isTight: boolean;
}

function computeBudgets(countries: CountryWithData[], budgetUSD: number, familyMult: number): CountryBudget[] {
  return countries.map(c => {
    const d = c.data;
    const rent      = toUSD(d.costRentCityCentre, c.currency);
    const groceries = toUSD(d.costGroceriesMonthly, c.currency);
    const transport = toUSD(d.costTransportMonthly, c.currency);
    const base      = rent + groceries + transport;
    const monthlyCostUSD = base * familyMult;
    const marginUSD = budgetUSD - monthlyCostUSD;
    const canAfford = marginUSD >= 0;
    const isTight   = marginUSD >= 0 && marginUSD < budgetUSD * 0.15;
    return { country: c, monthlyCostUSD, marginUSD, canAfford, isTight };
  }).sort((a, b) => b.marginUSD - a.marginUSD);
}

export default function BudgetCheckPage() {
  const { user, loading: authLoading } = useAuth();
  const [isPro, setIsPro]         = useState<boolean>(false);
  const [countries, setCountries] = useState<CountryWithData[]>([]);
  const [budget, setBudget]       = useState<number>(2500);
  const [familySize, setFamilySize] = useState<FamilySize>("solo");
  const [results, setResults]     = useState<CountryBudget[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!user) { setIsPro(false); return; }
    supabase.from("profiles").select("is_pro").eq("id", user.id).single()
      .then(({ data }: { data: { is_pro: boolean } | null }) => { setIsPro(data?.is_pro ?? false); });
  }, [user]);

  useEffect(() => {
    fetch("/api/countries")
      .then(r => r.json())
      .then((data: CountryWithData[]) => {
        setCountries(Array.isArray(data) ? data : []);
        setLoadingData(false);
      })
      .catch(() => setLoadingData(false));
  }, []);

  useEffect(() => {
    if (!countries.length) return;
    const budgetUSD = budget;
    const mult = FAMILY_MULTIPLIERS[familySize as FamilySize];
    setResults(computeBudgets(countries, budgetUSD, mult));
  }, [countries, budget, familySize]);

  const affordable    = results.filter((r: CountryBudget) => r.canAfford && !r.isTight);
  const tight         = results.filter((r: CountryBudget) => r.isTight);
  const cantAfford    = results.filter((r: CountryBudget) => !r.canAfford);
  const visibleCant   = isPro ? cantAfford : cantAfford.slice(0, 3);

  return (
    <div style={{ minHeight: "100vh", background: BG, color: FG, fontFamily: SANS }}>
      <Nav countries={[]} onCountrySelect={() => {}} />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "88px 32px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: DIM, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: MINT }}>●</span> Budget check
          </p>
          <h1 style={{ fontFamily: SERIF, fontSize: "clamp(36px,6vw,64px)", fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 0.95, margin: "0 0 16px", color: FG }}>
            Can you afford<br /><em style={{ fontStyle: "normal", color: MINT }}>to live there?</em>
          </h1>
          <p style={{ fontFamily: SANS, fontSize: 15, color: DIM, lineHeight: 1.7, maxWidth: 480, margin: 0 }}>
            Enter your monthly budget. See which countries are affordable, which are tight, and exactly how much margin you have.
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: LINE, marginBottom: 40 }}>
          {/* Budget input */}
          <div style={{ background: BG, padding: "24px 28px" }}>
            <label style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: DIM, display: "block", marginBottom: 10 }}>
              Monthly budget (USD)
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontFamily: SERIF, fontSize: 28, color: MINT }}>$</span>
              <input
                type="number"
                min={500}
                max={20000}
                step={100}
                value={budget}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBudget(Math.max(0, Number(e.target.value)))}
                style={{
                  fontFamily: SERIF, fontSize: 28, color: FG, background: "none", border: "none",
                  outline: "none", width: "100%", borderBottom: `1px solid #2a2a2a`,
                  paddingBottom: 4,
                }}
              />
            </div>
            <input
              type="range" min={500} max={10000} step={100} value={budget}
              onChange={e => setBudget(Number(e.target.value))}
              style={{ width: "100%", marginTop: 12, accentColor: MINT }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ fontFamily: MONO, fontSize: 9, color: "#333" }}>$500</span>
              <span style={{ fontFamily: MONO, fontSize: 9, color: "#333" }}>$10,000</span>
            </div>
          </div>

          {/* Family size */}
          <div style={{ background: BG, padding: "24px 28px" }}>
            <label style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: DIM, display: "block", marginBottom: 10 }}>
              Household size
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(["solo", "couple", "family"] as FamilySize[]).map(size => (
                <button
                  key={size}
                  onClick={() => setFamilySize(size)}
                  style={{
                    fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase",
                    padding: "8px 12px", background: familySize === size ? MINT : "none",
                    color: familySize === size ? BG : DIM,
                    border: `1px solid ${familySize === size ? MINT : "#1a1a1a"}`,
                    cursor: "pointer", textAlign: "left", transition: "all 0.12s",
                  }}
                >
                  {FAMILY_LABELS[size]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loadingData || authLoading ? (
          <p style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: DIM }}>Loading data…</p>
        ) : (
          <>
            {/* Affordable */}
            {affordable.length > 0 && (
              <section style={{ marginBottom: 40 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <span style={{ width: 8, height: 8, background: "#4ade80", flexShrink: 0 }} />
                  <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#4ade80" }}>
                    {affordable.length} countries you can afford
                  </span>
                </div>
                <div style={{ borderTop: `1px solid ${LINE}` }}>
                  {affordable.map((row: CountryBudget) => (
                    <BudgetRow key={row.country.slug} r={row} budget={budget as number} isPro={isPro as boolean} />
                  ))}
                </div>
              </section>
            )}

            {/* Tight */}
            {tight.length > 0 && (
              <section style={{ marginBottom: 40 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <span style={{ width: 8, height: 8, background: "#facc15", flexShrink: 0 }} />
                  <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#facc15" }}>
                    {tight.length} tight — under 15% margin
                  </span>
                </div>
                <div style={{ borderTop: `1px solid ${LINE}` }}>
                  {tight.map((row: CountryBudget) => (
                    <BudgetRow key={row.country.slug} r={row} budget={budget as number} isPro={isPro as boolean} />
                  ))}
                </div>
              </section>
            )}

            {/* Can't afford */}
            {cantAfford.length > 0 && (
              <section style={{ marginBottom: 40 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <span style={{ width: 8, height: 8, background: "#ef4444", flexShrink: 0 }} />
                  <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#ef4444" }}>
                    {cantAfford.length} over budget
                  </span>
                </div>
                <div style={{ borderTop: `1px solid ${LINE}` }}>
                  {visibleCant.map((row: CountryBudget) => (
                    <BudgetRow key={row.country.slug} r={row} budget={budget as number} isPro={isPro as boolean} />
                  ))}
                </div>
                {!isPro && cantAfford.length > 3 && (
                  <div style={{
                    padding: "16px 20px", borderTop: `1px solid #1a1a1a`,
                    display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
                  }}>
                    <p style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#333", margin: 0 }}>
                      <Lock size={10} style={{ display: "inline", marginRight: 6 }} />
                      {cantAfford.length - 3} more countries hidden
                    </p>
                    <Link href="/pro" style={{
                      fontFamily: MONO, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase",
                      color: MINT, textDecoration: "none", display: "flex", alignItems: "center", gap: 4,
                    }}>
                      Unlock Pro →
                    </Link>
                  </div>
                )}
              </section>
            )}

            {/* Pro upsell if not pro */}
            {!isPro && (
              <div style={{
                border: `1px solid rgba(0,255,213,0.2)`, padding: "20px 24px",
                display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
                marginTop: 8,
              }}>
                <div>
                  <p style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: DIM, marginBottom: 4 }}>Pro includes</p>
                  <p style={{ fontFamily: SANS, fontSize: 14, color: FG, margin: 0 }}>
                    Full breakdown for every country · take-home pay · 3-country comparison · custom weights
                  </p>
                </div>
                <Link href="/pro" style={{
                  fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase",
                  padding: "11px 24px", background: MINT, color: BG, textDecoration: "none",
                  display: "inline-flex", alignItems: "center", gap: 8,
                  boxShadow: "3px 3px 0 #00aa90",
                }}>
                  Get Pro — €4.99
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

function BudgetRow({ r, budget, isPro }: { r: CountryBudget; budget: number; isPro: boolean }) {
  const cs       = getCurrencySymbol(r.country.currency);
  const costLocal = r.country.data.costRentCityCentre + r.country.data.costGroceriesMonthly + r.country.data.costTransportMonthly;
  const marginColor = r.marginUSD >= 0
    ? (r.isTight ? "#facc15" : "#4ade80")
    : "#ef4444";
  const pct = Math.min(100, Math.max(0, (r.marginUSD / budget) * 100));

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "28px 1fr auto",
      alignItems: "center", gap: 14, padding: "13px 4px",
      borderBottom: `1px solid #0f0f0f`,
    }}>
      {slugToIso(r.country.slug)
        ? <FlagIcon code={slugToIso(r.country.slug)!} size="sm" />
        : <span style={{ fontSize: 18 }}>{r.country.flagEmoji}</span>
      }
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontFamily: SERIF, fontSize: 14, color: "#f0f0e8" }}>{r.country.name}</span>
          {isPro && (
            <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.12em", color: DIM }}>
              {cs}{costLocal.toLocaleString()}/mo · rent + food + transport
            </span>
          )}
        </div>
        <div style={{ height: 2, background: "#111", width: "100%", maxWidth: 200 }}>
          <div style={{ height: "100%", width: `${Math.abs(pct)}%`, background: marginColor, maxWidth: "100%" }} />
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        {isPro ? (
          <>
            <div style={{ fontFamily: SERIF, fontSize: 15, color: marginColor }}>
              {r.marginUSD >= 0 ? "+" : ""}${Math.round(r.marginUSD).toLocaleString()}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 9, color: "#333", letterSpacing: "0.1em" }}>
              {r.marginUSD >= 0 ? "margin" : "over budget"}
            </div>
          </>
        ) : (
          <Link href="/pro" style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "#333", textDecoration: "none", display: "flex", alignItems: "center", gap: 3 }}>
            <Lock size={9} /> margin
          </Link>
        )}
      </div>
    </div>
  );
}
