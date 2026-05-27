"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

// ─── Constants ────────────────────────────────────────────────────────────────
const NAV_H = 64; // fixed nav height + buffer

// ─── FX rates to USD ──────────────────────────────────────────────────────────
const FX_TO_USD: Record<string, number> = {
  UK: 1.27, US: 1.0, CA: 0.74, AU: 0.66,
  DE: 1.09, IE: 1.09, NL: 1.09, SG: 0.74,
  AE: 0.27, PT: 1.09,
};

// ─── Tax Data ─────────────────────────────────────────────────────────────────
const TAX_DATA = {
  UK: { currency:"GBP", symbol:"£",   usdSymbol:"$", name:"United Kingdom",       flag:"🇬🇧",
    personalAllowance:12570,
    bands:[{min:0,max:12570,rate:0},{min:12570,max:50270,rate:.20},{min:50270,max:125140,rate:.40},{min:125140,max:Infinity,rate:.45}],
    ni:{threshold:12570,upperLimit:50270,lowerRate:.08,upperRate:.02} },
  US: { currency:"USD", symbol:"$",   usdSymbol:"$", name:"United States",        flag:"🇺🇸",
    standardDeduction:14600,
    bands:[{min:0,max:11925,rate:.10},{min:11925,max:48475,rate:.12},{min:48475,max:103350,rate:.22},{min:103350,max:197300,rate:.24},{min:197300,max:250525,rate:.32},{min:250525,max:626350,rate:.35},{min:626350,max:Infinity,rate:.37}],
    fica:{socialSecurityRate:.062,socialSecurityCap:168600,medicareRate:.0145,additionalMedicareRate:.009,additionalMedicareThreshold:200000} },
  CA: { currency:"CAD", symbol:"CA$", usdSymbol:"$", name:"Canada",               flag:"🇨🇦",
    personalAmount:15705,
    bands:[{min:0,max:57375,rate:.145},{min:57375,max:114750,rate:.205},{min:114750,max:158519,rate:.26},{min:158519,max:220000,rate:.29},{min:220000,max:Infinity,rate:.33}],
    provincialRate:.11, cpp:{exemption:3500,ceiling:68500,rate:.0595} },
  AU: { currency:"AUD", symbol:"A$",  usdSymbol:"$", name:"Australia",            flag:"🇦🇺",
    bands:[{min:0,max:18200,rate:0},{min:18200,max:45000,rate:.19},{min:45000,max:120000,rate:.325},{min:120000,max:180000,rate:.37},{min:180000,max:Infinity,rate:.45}],
    medicare:.02, medicareThreshold:26000 },
  DE: { currency:"EUR", symbol:"€",   usdSymbol:"$", name:"Germany",              flag:"🇩🇪",
    bands:[{min:0,max:11604,rate:0},{min:11604,max:66761,rate:.14},{min:66761,max:277826,rate:.42},{min:277826,max:Infinity,rate:.45}],
    socialSecurity:{health:.0735,pension:.093,unemployment:.013,nursing:.017}, solidaritySurcharge:.055 },
  IE: { currency:"EUR", symbol:"€",   usdSymbol:"$", name:"Ireland",              flag:"🇮🇪",
    bands:[{min:0,max:42000,rate:.20},{min:42000,max:Infinity,rate:.40}],
    usc:[{min:0,max:12012,rate:.005},{min:12012,max:25760,rate:.02},{min:25760,max:70044,rate:.04},{min:70044,max:Infinity,rate:.08}],
    prsi:.04, taxCredit:3550 },
  NL: { currency:"EUR", symbol:"€",   usdSymbol:"$", name:"Netherlands",          flag:"🇳🇱",
    bands:[{min:0,max:75518,rate:.3693},{min:75518,max:Infinity,rate:.495}],
    generalCredit:3070 },
  SG: { currency:"SGD", symbol:"S$",  usdSymbol:"$", name:"Singapore",            flag:"🇸🇬",
    bands:[{min:0,max:20000,rate:0},{min:20000,max:30000,rate:.02},{min:30000,max:40000,rate:.035},{min:40000,max:80000,rate:.07},{min:80000,max:120000,rate:.115},{min:120000,max:160000,rate:.15},{min:160000,max:200000,rate:.18},{min:200000,max:240000,rate:.19},{min:240000,max:280000,rate:.195},{min:280000,max:320000,rate:.20},{min:320000,max:Infinity,rate:.22}],
    cpf:.20 },
  AE: { currency:"AED", symbol:"AED ",usdSymbol:"$", name:"United Arab Emirates", flag:"🇦🇪", bands:[] },
  PT: { currency:"EUR", symbol:"€",   usdSymbol:"$", name:"Portugal",             flag:"🇵🇹",
    bands:[{min:0,max:7703,rate:.1325},{min:7703,max:11623,rate:.18},{min:11623,max:16472,rate:.23},{min:16472,max:21321,rate:.26},{min:21321,max:27146,rate:.3275},{min:27146,max:39791,rate:.37},{min:39791,max:51997,rate:.435},{min:51997,max:81199,rate:.45},{min:81199,max:Infinity,rate:.48}],
    socialSecurity:.11 },
};

const ALL_COUNTRY_KEYS = Object.keys(TAX_DATA) as (keyof typeof TAX_DATA)[];

// ─── Salary data (median gross, local currency, 2025 market rates) ────────────
const ROLE_SALARIES: Record<string, Record<string, number>> = {
  "Software Engineer":         { UK:75000,  US:130000, CA:110000, AU:120000, DE:72000,  IE:80000,  NL:75000,  SG:95000,  AE:280000, PT:35000  },
  "Product Manager":           { UK:85000,  US:145000, CA:120000, AU:130000, DE:80000,  IE:90000,  NL:85000,  SG:110000, AE:320000, PT:40000  },
  "UX/UI Designer":            { UK:55000,  US:95000,  CA:85000,  AU:90000,  DE:58000,  IE:60000,  NL:60000,  SG:72000,  AE:200000, PT:28000  },
  "Data Scientist":            { UK:70000,  US:125000, CA:105000, AU:110000, DE:70000,  IE:75000,  NL:72000,  SG:90000,  AE:260000, PT:32000  },
  "DevOps Engineer":           { UK:72000,  US:128000, CA:108000, AU:115000, DE:74000,  IE:78000,  NL:76000,  SG:92000,  AE:270000, PT:33000  },
  "Marketing Manager":         { UK:52000,  US:85000,  CA:75000,  AU:85000,  DE:55000,  IE:58000,  NL:58000,  SG:75000,  AE:200000, PT:25000  },
  "Financial Analyst":         { UK:58000,  US:90000,  CA:78000,  AU:88000,  DE:60000,  IE:62000,  NL:62000,  SG:78000,  AE:220000, PT:26000  },
  "Cybersecurity Analyst":     { UK:68000,  US:115000, CA:95000,  AU:105000, DE:68000,  IE:72000,  NL:70000,  SG:85000,  AE:250000, PT:30000  },
  "Sales Manager":             { UK:65000,  US:110000, CA:90000,  AU:100000, DE:65000,  IE:68000,  NL:65000,  SG:85000,  AE:240000, PT:28000  },
  "HR Manager":                { UK:50000,  US:80000,  CA:72000,  AU:80000,  DE:52000,  IE:55000,  NL:55000,  SG:70000,  AE:190000, PT:24000  },
  "AI / ML Engineer":          { UK:90000,  US:185000, CA:150000, AU:155000, DE:95000,  IE:100000, NL:92000,  SG:150000, AE:350000, PT:42000  },
  "Cloud Architect":           { UK:85000,  US:170000, CA:140000, AU:148000, DE:90000,  IE:95000,  NL:88000,  SG:135000, AE:325000, PT:38000  },
  "Dentist":                   { UK:82000,  US:180000, CA:165000, AU:175000, DE:80000,  IE:100000, NL:100000, SG:160000, AE:330000, PT:40000  },
  "Physiotherapist":           { UK:43000,  US:82000,  CA:85000,  AU:90000,  DE:47000,  IE:52000,  NL:52000,  SG:68000,  AE:160000, PT:24000  },
  "Psychologist":              { UK:46000,  US:95000,  CA:85000,  AU:95000,  DE:52000,  IE:57000,  NL:56000,  SG:70000,  AE:185000, PT:28000  },
  "Renewable Energy Engineer": { UK:68000,  US:112000, CA:108000, AU:122000, DE:73000,  IE:67000,  NL:72000,  SG:92000,  AE:255000, PT:37000  },
  "Pilot":                     { UK:90000,  US:170000, CA:145000, AU:150000, DE:95000,  IE:85000,  NL:100000, SG:165000, AE:450000, PT:65000  },
  "Graphic Designer":          { UK:41000,  US:72000,  CA:63000,  AU:70000,  DE:46000,  IE:45000,  NL:49000,  SG:56000,  AE:128000, PT:21000  },
  "Biomedical Engineer":       { UK:55000,  US:112000, CA:98000,  AU:105000, DE:68000,  IE:68000,  NL:67000,  SG:90000,  AE:215000, PT:30000  },
  "Supply Chain Manager":      { UK:64000,  US:110000, CA:110000, AU:118000, DE:80000,  IE:80000,  NL:80000,  SG:102000, AE:260000, PT:38000  },
};

const ROLES = Object.keys(ROLE_SALARIES);
const LEVEL_MULTIPLIERS: Record<string, number> = { Junior: 0.65, Mid: 1.0, Senior: 1.45 };
const LEVELS = ["Junior", "Mid", "Senior"] as const;
type Level = typeof LEVELS[number];

function getSalaryForRole(role: string, country: string): number {
  return ROLE_SALARIES[role]?.[country] ?? 50000;
}

// ─── Benchmark data ───────────────────────────────────────────────────────────
const PPP_INDEX: Record<string, number> = { UK:88, US:100, CA:92, AU:95, DE:97, IE:90, NL:96, SG:104, AE:115, PT:78 };
const AVG_RENT_MONTHLY: Record<string, number> = { UK:1850, US:2400, CA:2100, AU:2300, DE:1300, IE:2000, NL:1800, SG:3200, AE:6500, PT:1100 };

function computeBenchmark(role: string, country: string, salary: number) {
  const salaryUSD = salary * (FX_TO_USD[country] ?? 1);
  let aboveCount = 0, totalCount = 0;
  for (const r of ROLES) {
    for (const c of ALL_COUNTRY_KEYS) {
      const sUSD = (ROLE_SALARIES[r]?.[c] ?? 50000) * (FX_TO_USD[c] ?? 1);
      totalCount++;
      if (salaryUSD >= sUSD) aboveCount++;
    }
  }
  const percentile = Math.round((aboveCount / totalCount) * 100);
  const topPct = 100 - percentile;
  return {
    globalRank: topPct <= 50 ? `Top ${Math.max(1, topPct)}%` : `Bottom ${percentile}%`,
    pppIndex: PPP_INDEX[country] ?? 100,
    rentMonthly: AVG_RENT_MONTHLY[country] ?? 1500,
  };
}

// ─── Tax Calculators ──────────────────────────────────────────────────────────
function calcBanded(gross: number, bands: {min:number;max:number;rate:number}[]) {
  let tax = 0;
  for (const b of bands) {
    if (gross <= b.min) break;
    tax += (Math.min(gross, b.max) - b.min) * b.rate;
  }
  return tax;
}

function calcUK(g: number) {
  const d = TAX_DATA.UK;
  // Personal allowance tapers £1 per £2 over £100k
  let pa = d.personalAllowance;
  if (g > 100000) pa = Math.max(0, pa - (g - 100000) / 2);
  const taxable = Math.max(0, g - pa);
  // Income tax on taxable income (bands relative to taxable, not gross)
  const it = calcBanded(taxable, [
    { min: 0,      max: 37700,    rate: 0.20 },
    { min: 37700,  max: 125140,   rate: 0.40 },
    { min: 125140, max: Infinity, rate: 0.45 },
  ]);
  // NI on gross: 8% on £12,570–£50,270, 2% above
  const ni =
    Math.max(0, Math.min(g, d.ni.upperLimit) - d.ni.threshold) * d.ni.lowerRate +
    Math.max(0, g - d.ni.upperLimit) * d.ni.upperRate;
  const total = it + ni;
  return { items: [{ label: "Income Tax", v: it }, { label: "National Insurance", v: ni }], total, net: g - total, rate: total / g };
}

function calcUS(g: number) {
  const d = TAX_DATA.US;
  const taxable = Math.max(0, g - d.standardDeduction);
  const it = calcBanded(taxable, d.bands);
  const ss = Math.min(g, d.fica.socialSecurityCap) * d.fica.socialSecurityRate;
  const med = g * d.fica.medicareRate + Math.max(0, g - d.fica.additionalMedicareThreshold) * d.fica.additionalMedicareRate;
  const state = g * 0.05; // ~5% avg state income tax
  const total = it + ss + med + state;
  return { items: [{ label: "Federal Income Tax", v: it }, { label: "Social Security", v: ss }, { label: "Medicare", v: med }, { label: "State Tax (avg)", v: state }], total, net: g - total, rate: total / g };
}

function calcCA(g: number) {
  const d = TAX_DATA.CA;
  const fed = calcBanded(Math.max(0, g - d.personalAmount), d.bands);
  const prov = g * d.provincialRate; // ~11% avg provincial
  const cpp = Math.max(0, Math.min(g, d.cpp.ceiling) - d.cpp.exemption) * d.cpp.rate;
  const ei = Math.min(g, 63200) * 0.0166; // EI premium 2025
  const total = fed + prov + cpp + ei;
  return { items: [{ label: "Federal Tax", v: fed }, { label: "Provincial Tax", v: prov }, { label: "CPP", v: cpp }, { label: "EI", v: ei }], total, net: g - total, rate: total / g };
}

function calcAU(g: number) {
  const d = TAX_DATA.AU;
  const raw = calcBanded(g, d.bands);
  // Low Income Tax Offset (LITO) 2025
  const lito = g <= 37500 ? 700 : g <= 45000 ? 700 - (g - 37500) * 0.05 : g <= 66667 ? 325 - (g - 45000) * 0.015 : 0;
  const it = Math.max(0, raw - lito);
  const med = g > d.medicareThreshold ? g * d.medicare : 0;
  const total = it + med;
  return { items: [{ label: "Income Tax", v: it }, { label: "Medicare Levy", v: med }], total, net: g - total, rate: total / g };
}

function calcDE(g: number) {
  const d = TAX_DATA.DE;
  // Progressive German income tax formula
  let it = 0;
  if (g <= 11604) {
    it = 0;
  } else if (g <= 17006) {
    const y = (g - 11604) / 10000;
    it = (979.18 * y + 1400) * y;
  } else if (g <= 66761) {
    const z = (g - 17005) / 10000;
    it = (192.59 * z + 2397) * z + 966;
  } else if (g <= 277826) {
    it = 0.42 * g - 10602;
  } else {
    it = 0.45 * g - 18936;
  }
  // Solidarity surcharge: only applies if income tax > €18,130
  const sol = it > 18130 ? it * d.solidaritySurcharge : 0;
  const ss = (d.socialSecurity.health + d.socialSecurity.pension + d.socialSecurity.unemployment + d.socialSecurity.nursing) * g;
  const total = it + sol + ss;
  return { items: [{ label: "Income Tax", v: it }, { label: "Solidarity Surcharge", v: sol }, { label: "Social Insurance", v: ss }], total, net: g - total, rate: total / g };
}

function calcIE(g: number) {
  const d = TAX_DATA.IE;
  const it = Math.max(0, calcBanded(g, d.bands) - d.taxCredit);
  const usc = calcBanded(g, d.usc);
  const prsi = g * d.prsi;
  const total = it + usc + prsi;
  return { items: [{ label: "Income Tax", v: it }, { label: "USC", v: usc }, { label: "PRSI", v: prsi }], total, net: g - total, rate: total / g };
}

function calcNL(g: number) {
  const d = TAX_DATA.NL;
  const raw = calcBanded(g, d.bands);
  // General tax credit (arbeidskorting excluded for simplicity — affects lower incomes)
  const it = Math.max(0, raw - d.generalCredit);
  return { items: [{ label: "Income Tax / Social Premiums", v: it }], total: it, net: g - it, rate: it / g };
}

function calcSG(g: number) {
  const d = TAX_DATA.SG;
  const it = calcBanded(g, d.bands);
  // CPF capped at OW ceiling $6,800/mo * 12 = $81,600; employee rate 20% below 55
  const cpf = Math.min(g * d.cpf, 16320); // OW ceiling $68k * 20% + AW contribution cap
  const total = it + cpf;
  return { items: [{ label: "Income Tax", v: it }, { label: "CPF (Employee)", v: cpf }], total, net: g - total, rate: total / g };
}

function calcAE(_g: number) {
  return { items: [{ label: "Income Tax", v: 0 }], total: 0, net: _g, rate: 0 };
}

function calcPT(g: number) {
  const d = TAX_DATA.PT;
  const it = calcBanded(g, d.bands);
  const ss = g * d.socialSecurity;
  const total = it + ss;
  return { items: [{ label: "Income Tax", v: it }, { label: "Social Security", v: ss }], total, net: g - total, rate: total / g };
}

function calcCountry(c: keyof typeof TAX_DATA, g: number) {
  switch (c) {
    case "UK": return calcUK(g);
    case "US": return calcUS(g);
    case "CA": return calcCA(g);
    case "AU": return calcAU(g);
    case "DE": return calcDE(g);
    case "IE": return calcIE(g);
    case "NL": return calcNL(g);
    case "SG": return calcSG(g);
    case "AE": return calcAE(g);
    case "PT": return calcPT(g);
  }
}

// ─── Animated Number ──────────────────────────────────────────────────────────
function AnimatedNumber({ value, format = (n: number) => Math.round(n).toLocaleString("en"), durationMs = 380, style }: {
  value: number;
  format?: (n: number) => string;
  durationMs?: number;
  style?: React.CSSProperties;
}) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const startRef = useRef(0);
  const targetRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    fromRef.current = display;
    targetRef.current = value;
    startRef.current = performance.now();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const tick = (t: number) => {
      const elapsed = t - startRef.current;
      const p = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      const next = fromRef.current + (targetRef.current - fromRef.current) * eased;
      setDisplay(next);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <span style={style}>{format(display)}</span>;
}

// ─── Currency Toggle ──────────────────────────────────────────────────────────
function CurrencyToggle({ showUSD, onToggle, localCurrency }: { showUSD: boolean; onToggle: () => void; localCurrency: string }) {
  return (
    <button
      onClick={onToggle}
      title={showUSD ? "Switch to local currency" : "Switch to USD equivalent"}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "5px 10px 5px 7px",
        background: showUSD ? "rgba(77,230,204,0.1)" : "rgba(255,255,255,0.05)",
        border: `1px solid ${showUSD ? "rgba(77,230,204,0.3)" : "rgba(255,255,255,0.1)"}`,
        borderRadius: 100, cursor: "pointer",
        transition: "all 180ms ease",
        outline: "none",
      }}
    >
      {/* Track */}
      <span style={{
        display: "flex", alignItems: "center",
        width: 28, height: 14, background: showUSD ? "#4de6cc" : "rgba(255,255,255,0.15)",
        borderRadius: 100, position: "relative", transition: "background 180ms ease",
        flexShrink: 0,
      }}>
        <span style={{
          position: "absolute",
          left: showUSD ? 16 : 2,
          width: 10, height: 10,
          background: "#ffffff",
          borderRadius: "50%",
          transition: "left 180ms ease",
        }} />
      </span>
      <span style={{
        fontFamily: "Satoshi, sans-serif", fontSize: 11, fontWeight: 600,
        letterSpacing: "0.08em", textTransform: "uppercase",
        color: showUSD ? "#4de6cc" : "rgba(255,255,255,0.4)",
        transition: "color 180ms ease",
        whiteSpace: "nowrap",
      }}>
        {showUSD ? "USD" : localCurrency}
      </span>
    </button>
  );
}

// ─── Stat Tile ────────────────────────────────────────────────────────────────
function StatTile({ label, value, sub, blurred, format }: {
  label: string; value: number; sub?: string; blurred?: boolean; format: (n: number) => string;
}) {
  return (
    <div style={{
      flex: 1, minWidth: 0, padding: "18px 20px",
      background: "#111111", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 14, position: "relative", overflow: "hidden",
    }}>
      <div style={{
        fontFamily: "Satoshi, sans-serif", fontSize: 10, fontWeight: 500,
        letterSpacing: "0.14em", textTransform: "uppercase",
        color: "rgba(255,255,255,0.45)", marginBottom: 12,
      }}>{label}</div>
      <div style={{ filter: blurred ? "blur(10px)" : "none", userSelect: blurred ? "none" : "auto", transition: "filter 200ms ease" }}>
        <div style={{
          fontFamily: "Cabinet Grotesk, sans-serif", fontWeight: 700,
          fontSize: "clamp(22px, 2.6vw, 32px)", color: "#ffffff",
          lineHeight: 1.05, letterSpacing: "-0.01em",
        }}>
          <AnimatedNumber value={value} format={format} />
        </div>
        {sub && (
          <div style={{ fontFamily: "Satoshi, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 6 }}>{sub}</div>
        )}
      </div>
      {blurred && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(17,17,17,0.55)", backdropFilter: "blur(2px)",
        }}>
          <Link href="/pro" style={{
            fontFamily: "Satoshi, sans-serif", fontSize: 11, fontWeight: 500,
            letterSpacing: "0.14em", textTransform: "uppercase", color: "#4de6cc",
            padding: "8px 14px", border: "1px solid rgba(77,230,204,0.25)",
            borderRadius: 100, background: "#0a0a0a", textDecoration: "none",
          }}>Unlock with Pro</Link>
        </div>
      )}
    </div>
  );
}

// ─── Comparison Chart ─────────────────────────────────────────────────────────
function ComparisonChart({ role, selectedCountry, level, showUSD }: {
  role: string; selectedCountry: keyof typeof TAX_DATA; level: Level; showUSD: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const [chartMode, setChartMode] = useState<"gross" | "net">("gross");

  useEffect(() => {
    setMounted(false);
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, [role, level]);

  const rows = useMemo(() => {
    const arr = ALL_COUNTRY_KEYS.map(c => {
      const local = Math.round(getSalaryForRole(role, c) * LEVEL_MULTIPLIERS[level]);
      const usd = Math.round(local * (FX_TO_USD[c] ?? 1));
      const netLocal = calcCountry(c, local)?.net ?? Math.round(local * 0.7);
      const netUSD = Math.round(netLocal * (FX_TO_USD[c] ?? 1));
      return { code: c, local, usd, netLocal, netUSD, d: TAX_DATA[c] };
    });
    arr.sort((a, b) => b.usd - a.usd);
    const maxGrossUSD = Math.max(...arr.map(r => r.usd));
    const maxNetUSD = Math.max(...arr.map(r => r.netUSD));
    return arr.map(r => ({
      ...r,
      grossWidthPct: (r.usd / maxGrossUSD) * 100,
      netWidthPct: (r.netUSD / maxNetUSD) * 100,
    }));
  }, [role, level]);

  return (
    <section style={{
      padding: "22px 24px", background: "#111111",
      border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14,
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 16, gap: 12, flexWrap: "wrap",
      }}>
        <div>
          <div style={{
            fontFamily: "Satoshi, sans-serif", fontSize: 10, fontWeight: 800,
            letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)",
          }}>Across countries · {role} · {level}</div>
          <div style={{
            fontFamily: "Satoshi, sans-serif", fontSize: 10, fontWeight: 500,
            letterSpacing: "0.06em", color: "rgba(255,255,255,0.3)", marginTop: 3,
          }}>{showUSD ? "USD equivalent · ranked by USD" : "local currency · ranked by USD equivalent"}</div>
        </div>
        {/* Gross / Net pill toggle */}
        <div style={{
          display: "inline-flex", borderRadius: 100,
          border: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(255,255,255,0.03)",
          padding: 3, gap: 2,
        }}>
          {(["gross", "net"] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setChartMode(mode)}
              style={{
                padding: "5px 14px",
                borderRadius: 100,
                border: "none",
                cursor: "pointer",
                fontFamily: "Satoshi, sans-serif",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                background: chartMode === mode ? "#222222" : "transparent",
                color: chartMode === mode ? "#ffffff" : "rgba(255,255,255,0.35)",
                transition: "background 150ms ease, color 150ms ease",
              }}
            >
              {mode === "gross" ? "Gross" : "Net"}
            </button>
          ))}
        </div>
      </div>
      <div style={{ overflowX: "auto", marginLeft: -4, marginRight: -4, padding: "0 4px" }}>
        <div style={{ minWidth: 360 }}>
          {rows.map((r, i) => {
            const selected = r.code === selectedCountry;
            const widthPct = chartMode === "gross" ? r.grossWidthPct : r.netWidthPct;
            const localVal = chartMode === "gross" ? r.local : r.netLocal;
            const usdVal = chartMode === "gross" ? r.usd : r.netUSD;
            const displayVal = showUSD
              ? `$${usdVal.toLocaleString("en")}`
              : `${r.d.symbol}${localVal.toLocaleString("en")}`;
            return (
              <div key={r.code} style={{
                display: "grid", gridTemplateColumns: "minmax(0, 140px) 1fr minmax(0, 120px)",
                alignItems: "center", gap: 14, padding: "9px 0",
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(4px)",
                transition: `opacity 280ms ease ${i * 30}ms, transform 280ms ease ${i * 30}ms`,
              }}>
                <div style={{
                  fontFamily: "Satoshi, sans-serif", fontSize: 12, fontWeight: 500,
                  color: selected ? "#ffffff" : "rgba(255,255,255,0.55)",
                  display: "flex", alignItems: "center", gap: 9,
                  overflow: "hidden", minWidth: 0,
                }}>
                  <span style={{ fontSize: 13, lineHeight: 1, width: 16, flexShrink: 0 }}>{r.d.flag}</span>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.d.name}</span>
                </div>
                <div style={{
                  height: 8, background: "rgba(255,255,255,0.04)",
                  borderRadius: 100, overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%", width: mounted ? `${widthPct}%` : "0%",
                    background: selected ? "#4de6cc" : "rgba(255,255,255,0.85)",
                    borderRadius: 100,
                    transition: `width 700ms cubic-bezier(0.22, 1, 0.36, 1) ${i * 30}ms`,
                  }} />
                </div>
                <div style={{
                  fontFamily: "Satoshi, sans-serif", fontSize: 12, fontWeight: 500,
                  color: selected ? "#4de6cc" : "rgba(255,255,255,0.55)",
                  textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap",
                  overflow: "hidden", textOverflow: "ellipsis",
                }}>{displayVal}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Benchmark Row ────────────────────────────────────────────────────────────
function BenchmarkRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ padding: "16px 0", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
      <div style={{
        fontFamily: "Satoshi, sans-serif", fontSize: 10, fontWeight: 800,
        letterSpacing: "0.18em", textTransform: "uppercase",
        color: "rgba(255,255,255,0.35)", marginBottom: 8,
      }}>{label}</div>
      <div style={{
        fontFamily: "Cabinet Grotesk, sans-serif", fontWeight: 700, fontSize: 26,
        lineHeight: 1.05, color: "#ffffff", letterSpacing: "-0.01em",
      }}>{value}</div>
      {sub && (
        <div style={{ fontFamily: "Satoshi, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>{sub}</div>
      )}
    </div>
  );
}

function HowDisclosure({ country }: { country: keyof typeof TAX_DATA }) {
  const [open, setOpen] = useState(false);
  const d = TAX_DATA[country];
  return (
    <div style={{ marginTop: 18, borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 16 }}>
      <button onClick={() => setOpen(v => !v)} style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        width: "100%", padding: 0, background: "none", border: "none",
        cursor: "pointer", color: "rgba(255,255,255,0.55)",
        fontFamily: "Satoshi, sans-serif", fontSize: 12, fontWeight: 500, textAlign: "left",
      }}>
        <span>How we calculate this</span>
        <span style={{
          fontSize: 14, color: "rgba(255,255,255,0.45)",
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 160ms ease", lineHeight: 1, display: "inline-block",
        }}>⌄</span>
      </button>
      {open && (
        <div style={{
          marginTop: 12, fontFamily: "Satoshi, sans-serif", fontSize: 12,
          lineHeight: 1.55, color: "rgba(255,255,255,0.45)",
        }}>
          <p style={{ margin: 0 }}>
            Uses {d.name}&apos;s 2025/26 tax brackets plus mandatory deductions ({d.currency}).
            Salaries reflect median market rates; Junior = 65%, Mid = 100%, Senior = 145% of median.
          </p>
          <p style={{ margin: "8px 0 0" }}>
            Global rank compares USD-equivalent salary across all {ROLES.length} roles × {ALL_COUNTRY_KEYS.length} countries.
            USD conversion uses approximate 2025 FX rates.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SalaryCalculator() {
  const [country, setCountry] = useState<keyof typeof TAX_DATA>("UK");
  const [role, setRole] = useState("Software Engineer");
  const [level, setLevel] = useState<Level>("Mid");
  const [roleOpen, setRoleOpen] = useState(false);
  const [showUSD, setShowUSD] = useState(false);
  const roleRef = useRef<HTMLDivElement>(null);
  const [isPro, setIsPro] = useState(false);
  const [authLoaded, setAuthLoaded] = useState(false);

  // Editable salary state
  const [customSalary, setCustomSalary] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  const fetchPro = useCallback(async (userId: string) => {
    const { data } = await supabase.from("profiles").select("is_pro").eq("id", userId).single();
    setIsPro(data?.is_pro ?? false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) await fetchPro(session.user.id);
      setAuthLoaded(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_e, session) => {
      if (session?.user) await fetchPro(session.user.id);
      else setIsPro(false);
    });
    return () => subscription.unsubscribe();
  }, [fetchPro]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) setRoleOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // Reset custom salary when role or country changes
  useEffect(() => {
    setCustomSalary(null);
  }, [role, country]);

  // Focus input when editing starts
  useEffect(() => {
    if (editing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editing]);

  const baseSalary = useMemo(() =>
    Math.round(getSalaryForRole(role, country) * LEVEL_MULTIPLIERS[level]),
    [role, country, level]
  );

  const grossLocal = customSalary ?? baseSalary;
  const grossUSD = useMemo(() => Math.round(grossLocal * (FX_TO_USD[country] ?? 1)), [grossLocal, country]);

  const result = useMemo(() => calcCountry(country, grossLocal), [country, grossLocal]);
  const d = TAX_DATA[country];

  const takeHomeAnnual = result?.net ?? 0;
  const takeHomeMonthly = takeHomeAnnual / 12;
  const effectiveRate = (result?.rate ?? 0) * 100;

  const takeHomeAnnualUSD = Math.round(takeHomeAnnual * (FX_TO_USD[country] ?? 1));
  const takeHomeMonthlyUSD = Math.round(takeHomeMonthly * (FX_TO_USD[country] ?? 1));

  const bench = useMemo(() => computeBenchmark(role, country, grossLocal), [role, country, grossLocal]);
  const rentPctOfTakeHome = takeHomeMonthly > 0 ? Math.round((bench.rentMonthly / takeHomeMonthly) * 100) : 0;
  const rentMonthlyUSD = Math.round(bench.rentMonthly * (FX_TO_USD[country] ?? 1));

  const localSym = d.symbol;
  const fmtLocal = (n: number) => `${localSym}${Math.round(n).toLocaleString("en")}`;
  const fmtUSD   = (n: number) => `$${Math.round(n).toLocaleString("en")}`;
  const fmtMoney = showUSD ? fmtUSD : fmtLocal;
  const fmtPct   = (n: number) => `${n.toFixed(1)}%`;

  // When showUSD, display gross in USD too
  const displayGross     = showUSD ? grossUSD : grossLocal;
  const displayGrossSym  = showUSD ? "$" : localSym;
  const displayTakeHomeA = showUSD ? takeHomeAnnualUSD : takeHomeAnnual;
  const displayTakeHomeM = showUSD ? takeHomeMonthlyUSD : takeHomeMonthly;

  const stickyTop = NAV_H + 16;

  function startEdit() {
    setEditVal(grossLocal.toLocaleString("en"));
    setEditing(true);
  }

  function commitEdit() {
    const raw = editVal.replace(/[^0-9.]/g, "");
    const parsed = parseFloat(raw);
    if (parsed > 0 && !isNaN(parsed)) {
      setCustomSalary(Math.round(parsed));
    } else {
      setCustomSalary(null);
    }
    setEditing(false);
  }

  function handleEditKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") {
      setEditing(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <Nav countries={[]} onCountrySelect={() => {}} />

      <main className="flex-1" style={{ paddingTop: NAV_H + 24, paddingBottom: 80, paddingLeft: 24, paddingRight: 24 }}>
        <div
          style={{
            maxWidth: 1440, margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "280px 1fr 260px",
            gap: 24,
            alignItems: "start",
          }}
          className="salary-app-shell"
        >

          {/* ══ LEFT: Sidebar ══ */}
          <aside style={{
            display: "flex", flexDirection: "column", gap: 28,
            padding: 24, background: "#0d0d0d",
            border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14,
            alignSelf: "flex-start", position: "sticky", top: stickyTop,
          }}>
            <div>
              <div style={{ fontFamily: "Cabinet Grotesk, sans-serif", fontWeight: 800, fontSize: 16, color: "#ffffff" }}>Origio</div>
              <div style={{ fontFamily: "Satoshi, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>Salary calculator</div>
            </div>

            {/* Country List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontFamily: "Satoshi, sans-serif", fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Country</div>
              <div className="country-list" style={{ display: "flex", flexDirection: "column", gap: 2, maxHeight: 340, overflowY: "auto", paddingRight: 2 }}>
                {ALL_COUNTRY_KEYS.map((c) => {
                  const active = country === c;
                  return (
                    <button key={c} onClick={() => setCountry(c)} style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                      background: active ? "#161616" : "transparent",
                      border: "1px solid", borderColor: active ? "rgba(255,255,255,0.07)" : "transparent",
                      borderLeft: "2px solid", borderLeftColor: active ? "#4de6cc" : "transparent",
                      borderRadius: 10, cursor: "pointer", textAlign: "left",
                      color: active ? "#ffffff" : "rgba(255,255,255,0.55)",
                      fontFamily: "Satoshi, sans-serif", fontSize: 13, fontWeight: 500,
                      transition: "background 120ms ease, color 120ms ease, border-color 120ms ease",
                    }}>
                      <span style={{ fontSize: 16, lineHeight: 1, width: 18, textAlign: "center" }}>{TAX_DATA[c].flag}</span>
                      <span style={{ flex: 1 }}>{TAX_DATA[c].name}</span>
                      <span style={{ fontFamily: "Satoshi, sans-serif", fontSize: 10, fontWeight: 500, letterSpacing: "0.1em", color: active ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.25)" }}>{c}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Role Dropdown */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontFamily: "Satoshi, sans-serif", fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Role</div>
              <div ref={roleRef} style={{ position: "relative" }}>
                <button onClick={() => setRoleOpen(v => !v)} style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                  gap: 12, padding: "12px 14px", background: "#111111",
                  border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10,
                  cursor: "pointer", color: "#ffffff", fontFamily: "Satoshi, sans-serif",
                  fontSize: 13, fontWeight: 500, textAlign: "left", outline: "none",
                  transition: "border-color 120ms ease",
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.14)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = roleOpen ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.07)"}
                >
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{role}</span>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", transform: roleOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 160ms ease", display: "inline-block", lineHeight: 1, flexShrink: 0 }}>⌄</span>
                </button>
                {roleOpen && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
                    background: "#111111", border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 10, maxHeight: 260, overflowY: "auto", zIndex: 20, padding: 4,
                  }}>
                    {ROLES.map(r => {
                      const active = r === role;
                      return (
                        <button key={r} onClick={() => { setRole(r); setRoleOpen(false); }} style={{
                          display: "block", width: "100%", textAlign: "left", padding: "9px 12px",
                          background: active ? "#1c1c1c" : "transparent", border: "none", borderRadius: 7,
                          cursor: "pointer", color: active ? "#ffffff" : "rgba(255,255,255,0.55)",
                          fontFamily: "Satoshi, sans-serif", fontSize: 13, fontWeight: 500,
                          transition: "background 100ms ease, color 100ms ease",
                        }}
                          onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "#161616"; (e.currentTarget as HTMLElement).style.color = "#ffffff"; } }}
                          onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)"; } }}
                        >{r}</button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Level Toggle */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontFamily: "Satoshi, sans-serif", fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Experience</div>
              <div style={{ display: "flex", gap: 6 }}>
                {LEVELS.map(l => {
                  const active = level === l;
                  return (
                    <button key={l} onClick={() => setLevel(l)} style={{
                      flex: 1, padding: "10px 0",
                      background: active ? "#222222" : "transparent",
                      border: "1px solid rgba(255,255,255,0.07)", borderRadius: 100,
                      cursor: "pointer", color: active ? "#ffffff" : "rgba(255,255,255,0.3)",
                      fontFamily: "Satoshi, sans-serif", fontSize: 12, fontWeight: 500,
                      transition: "background 120ms ease, color 120ms ease",
                    }}>{l}</button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* ══ CENTER: Main display ══ */}
          <section style={{ display: "flex", flexDirection: "column", gap: 28, minWidth: 0 }}>

            {/* Gross heading + currency toggle */}
            <div>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                gap: 12, marginBottom: 14, flexWrap: "wrap",
              }}>
                <div style={{
                  fontFamily: "Satoshi, sans-serif", fontSize: 10, fontWeight: 800,
                  letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)",
                }}>
                  Gross annual · {role} · {d.name} · {level}
                  {customSalary !== null && (
                    <span style={{
                      marginLeft: 8, color: "#4de6cc", letterSpacing: "0.08em",
                    }}>· custom</span>
                  )}
                </div>
                <CurrencyToggle
                  showUSD={showUSD}
                  onToggle={() => setShowUSD(v => !v)}
                  localCurrency={d.currency}
                />
              </div>

              {/* Editable gross number */}
              {editing ? (
                <div style={{
                  fontFamily: "Cabinet Grotesk, sans-serif", fontWeight: 800,
                  fontSize: "clamp(52px, 8vw, 96px)", lineHeight: 1,
                  letterSpacing: "-0.035em", color: "#ffffff", fontVariantNumeric: "tabular-nums",
                  display: "flex", alignItems: "baseline", gap: 0,
                }}>
                  <span style={{
                    fontFamily: "Satoshi, sans-serif", fontSize: "0.35em", fontWeight: 500,
                    color: "rgba(255,255,255,0.45)", verticalAlign: "0.55em", marginRight: 8, letterSpacing: 0,
                    flexShrink: 0,
                  }}>{displayGrossSym}</span>
                  <input
                    ref={editInputRef}
                    value={editVal}
                    onChange={e => setEditVal(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={handleEditKeyDown}
                    style={{
                      fontFamily: "Cabinet Grotesk, sans-serif", fontWeight: 800,
                      fontSize: "inherit", lineHeight: 1,
                      letterSpacing: "-0.035em", color: "#ffffff",
                      fontVariantNumeric: "tabular-nums",
                      background: "transparent",
                      border: "none",
                      borderBottom: "2px solid rgba(77,230,204,0.6)",
                      outline: "none",
                      width: "100%",
                      minWidth: 0,
                      padding: 0,
                    }}
                  />
                </div>
              ) : (
                <div
                  onClick={startEdit}
                  title="Click to enter a custom salary"
                  style={{
                    fontFamily: "Cabinet Grotesk, sans-serif", fontWeight: 800,
                    fontSize: "clamp(52px, 8vw, 96px)", lineHeight: 1,
                    letterSpacing: "-0.035em", color: "#ffffff", fontVariantNumeric: "tabular-nums",
                    cursor: "pointer",
                    display: "inline-flex", alignItems: "baseline", gap: 0,
                    borderBottom: "2px solid transparent",
                    transition: "border-color 160ms ease",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderBottomColor = "rgba(255,255,255,0.18)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderBottomColor = "transparent";
                  }}
                >
                  <span style={{
                    fontFamily: "Satoshi, sans-serif", fontSize: "0.35em", fontWeight: 500,
                    color: "rgba(255,255,255,0.45)", verticalAlign: "0.55em", marginRight: 8, letterSpacing: 0,
                    flexShrink: 0,
                  }}>{displayGrossSym}</span>
                  <AnimatedNumber value={displayGross} format={(n) => Math.round(n).toLocaleString("en")} />
                  <span style={{
                    fontSize: "0.22em", marginLeft: 12, color: "rgba(255,255,255,0.25)",
                    fontFamily: "Satoshi, sans-serif", fontWeight: 500, letterSpacing: "0.02em",
                    alignSelf: "center",
                    transition: "color 160ms ease",
                  }}>✏</span>
                </div>
              )}

              {showUSD && country !== "US" && (
                <div style={{
                  fontFamily: "Satoshi, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.35)",
                  marginTop: 6, letterSpacing: "0.02em",
                }}>
                  {localSym}{grossLocal.toLocaleString("en")} {d.currency} at approx. {FX_TO_USD[country]} USD/unit
                </div>
              )}
            </div>

            {/* Stat tiles */}
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <StatTile
                label="Take-home · annual"
                value={displayTakeHomeA}
                sub={showUSD ? "USD after tax" : `${d.currency} after tax`}
                blurred={!isPro && authLoaded}
                format={fmtMoney}
              />
              <StatTile
                label="Take-home · monthly"
                value={displayTakeHomeM}
                sub="per month"
                blurred={!isPro && authLoaded}
                format={fmtMoney}
              />
              <StatTile
                label="Effective tax rate"
                value={effectiveRate}
                sub={result?.items?.filter(i => i.v > 0).map(i => i.label).join(" · ")}
                blurred={false}
                format={fmtPct}
              />
            </div>

            {/* Comparison chart */}
            <ComparisonChart
              selectedCountry={country}
              role={role}
              level={level}
              showUSD={showUSD}
            />
          </section>

          {/* ══ RIGHT: Benchmark ══ */}
          <aside style={{
            padding: "22px 22px 18px", background: "#0d0d0d",
            border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14,
            alignSelf: "flex-start", position: "sticky", top: stickyTop,
          }}>
            <div style={{ fontFamily: "Satoshi, sans-serif", fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>Benchmark</div>
            <div style={{ fontFamily: "Satoshi, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 14 }}>{role} · {d.name}</div>

            <BenchmarkRow
              label="Global rank"
              value={bench.globalRank}
              sub="vs all roles, USD-equivalent"
            />
            <BenchmarkRow
              label="Purchasing power"
              value={String(bench.pppIndex)}
              sub="index · 100 = global median basket"
            />
            <BenchmarkRow
              label="Rent / take-home"
              value={isPro ? `${rentPctOfTakeHome}%` : "—%"}
              sub={isPro
                ? `${showUSD ? `$${rentMonthlyUSD.toLocaleString("en")}` : `${localSym}${bench.rentMonthly.toLocaleString("en")}`} / mo · 1-bed, major city`
                : "Pro · requires take-home"}
            />

            <HowDisclosure country={country} />
          </aside>
        </div>
      </main>

      <style>{`
        @media (max-width: 1100px) {
          .salary-app-shell {
            grid-template-columns: 1fr !important;
          }
          .salary-app-shell > aside,
          .salary-app-shell > section {
            position: static !important;
          }
          .country-list {
            flex-direction: row !important;
            overflow-x: auto !important;
            overflow-y: hidden !important;
            max-height: none !important;
            gap: 6px !important;
            padding-bottom: 4px;
          }
          .country-list::-webkit-scrollbar { height: 4px; }
        }
      `}</style>

      <Footer />
    </div>
  );
}
