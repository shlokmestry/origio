"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { Lock, Sparkles, Zap } from "lucide-react";
import { supabase } from "@/lib/supabase";

// ─── Constants ────────────────────────────────────────────────────────────────

const FREE_SALARY_CAP = 60000;
const FREE_COUNTRY_LIMIT = 2;

// ─── Tax Data ────────────────────────────────────────────────────────────────

const TAX_DATA = {
  UK: {
    currency: "GBP",
    symbol: "£",
    personalAllowance: 12570,
    bands: [
      { min: 0,      max: 12570,  rate: 0.00 },
      { min: 12570,  max: 50270,  rate: 0.20 },
      { min: 50270,  max: 125140, rate: 0.40 },
      { min: 125140, max: Infinity, rate: 0.45 },
    ],
    ni: {
      threshold: 12570,
      upperLimit: 50270,
      lowerRate: 0.08,
      upperRate: 0.02,
    },
    label: "🇬🇧 UK",
  },
  US: {
    currency: "USD",
    symbol: "$",
    standardDeduction: 14600,
    bands: [
      { min: 0,       max: 11925,  rate: 0.10 },
      { min: 11925,   max: 48475,  rate: 0.12 },
      { min: 48475,   max: 103350, rate: 0.22 },
      { min: 103350,  max: 197300, rate: 0.24 },
      { min: 197300,  max: 250525, rate: 0.32 },
      { min: 250525,  max: 626350, rate: 0.35 },
      { min: 626350,  max: Infinity, rate: 0.37 },
    ],
    fica: {
      socialSecurityRate: 0.062,
      socialSecurityCap: 168600,
      medicareRate: 0.0145,
      additionalMedicareRate: 0.009,
      additionalMedicareThreshold: 200000,
    },
    label: "🇺🇸 US",
  },
  CA: {
    currency: "CAD",
    symbol: "CA$",
    personalAmount: 15705,
    bands: [
      { min: 0,       max: 57375,  rate: 0.145 },
      { min: 57375,   max: 114750, rate: 0.205 },
      { min: 114750,  max: 158519, rate: 0.26  },
      { min: 158519,  max: 220000, rate: 0.29  },
      { min: 220000,  max: Infinity, rate: 0.33 },
    ],
    provincialRate: 0.11,
    cpp: {
      exemption: 3500,
      ceiling: 68500,
      rate: 0.0595,
    },
    label: "🇨🇦 Canada",
  },
  AU: {
    currency: "AUD",
    symbol: "A$",
    bands: [
      { min: 0,       max: 18200,  rate: 0.00 },
      { min: 18200,   max: 45000,  rate: 0.19 },
      { min: 45000,   max: 120000, rate: 0.325 },
      { min: 120000,  max: 180000, rate: 0.37 },
      { min: 180000,  max: Infinity, rate: 0.45 },
    ],
    medicare: 0.02,
    medicareThreshold: 26000,
    label: "🇦🇺 Australia",
  },
  DE: {
    currency: "EUR",
    symbol: "€",
    bands: [
      { min: 0,       max: 11604,  rate: 0.00 },
      { min: 11604,   max: 66761,  rate: 0.14 },
      { min: 66761,   max: 277826, rate: 0.42 },
      { min: 277826,  max: Infinity, rate: 0.45 },
    ],
    socialSecurity: {
      health: 0.0735,
      pension: 0.093,
      unemployment: 0.013,
      nursing: 0.0170,
    },
    solidaritySurcharge: 0.055,
    label: "🇩🇪 Germany",
  },
  IE: {
    currency: "EUR",
    symbol: "€",
    bands: [
      { min: 0,      max: 42000,  rate: 0.20 },
      { min: 42000,  max: Infinity, rate: 0.40 },
    ],
    usc: [
      { min: 0,      max: 12012,  rate: 0.005 },
      { min: 12012,  max: 25760,  rate: 0.02  },
      { min: 25760,  max: 70044,  rate: 0.04  },
      { min: 70044,  max: Infinity, rate: 0.08 },
    ],
    prsi: 0.04,
    taxCredit: 3550,
    label: "🇮🇪 Ireland",
  },
  NL: {
    currency: "EUR",
    symbol: "€",
    bands: [
      { min: 0,      max: 75518,  rate: 0.3693 },
      { min: 75518,  max: Infinity, rate: 0.495 },
    ],
    generalCredit: 3070,
    label: "🇳🇱 Netherlands",
  },
  SG: {
    currency: "SGD",
    symbol: "S$",
    bands: [
      { min: 0,       max: 20000,  rate: 0.00  },
      { min: 20000,   max: 30000,  rate: 0.02  },
      { min: 30000,   max: 40000,  rate: 0.035 },
      { min: 40000,   max: 80000,  rate: 0.07  },
      { min: 80000,   max: 120000, rate: 0.115 },
      { min: 120000,  max: 160000, rate: 0.15  },
      { min: 160000,  max: 200000, rate: 0.18  },
      { min: 200000,  max: 240000, rate: 0.19  },
      { min: 240000,  max: 280000, rate: 0.195 },
      { min: 280000,  max: 320000, rate: 0.20  },
      { min: 320000,  max: Infinity, rate: 0.22 },
    ],
    cpf: 0.20,
    label: "🇸🇬 Singapore",
  },
  AE: {
    currency: "AED",
    symbol: "AED",
    bands: [],
    label: "🇦🇪 UAE",
  },
  PT: {
    currency: "EUR",
    symbol: "€",
    bands: [
      { min: 0,       max: 7703,   rate: 0.1325 },
      { min: 7703,    max: 11623,  rate: 0.18   },
      { min: 11623,   max: 16472,  rate: 0.23   },
      { min: 16472,   max: 21321,  rate: 0.26   },
      { min: 21321,   max: 27146,  rate: 0.3275 },
      { min: 27146,   max: 39791,  rate: 0.37   },
      { min: 39791,   max: 51997,  rate: 0.435  },
      { min: 51997,   max: 81199,  rate: 0.45   },
      { min: 81199,   max: Infinity, rate: 0.48  },
    ],
    socialSecurity: 0.11,
    label: "🇵🇹 Portugal",
  },
};

// ─── Free countries (first 2 keys) ───────────────────────────────────────────
const ALL_COUNTRY_KEYS = Object.keys(TAX_DATA) as (keyof typeof TAX_DATA)[];
const FREE_COUNTRIES = ALL_COUNTRY_KEYS.slice(0, FREE_COUNTRY_LIMIT);

const ROLES = [
  "Software Engineer",
  "Product Manager",
  "UX/UI Designer",
  "Data Scientist",
  "DevOps Engineer",
  "Marketing Manager",
  "Financial Analyst",
  "Cybersecurity Analyst",
  "Sales Manager",
  "HR Manager",
  "Custom",
];

const GUIDES = [
  { label: "Software Engineers", slug: "software-engineers" },
  { label: "Product Managers",   slug: "product-managers"   },
  { label: "Designers",          slug: "designers"          },
];

// ─── Tax Calculation Functions ────────────────────────────────────────────────

function calcBandedTax(gross: number, bands: { min: number; max: number; rate: number }[]) {
  let tax = 0;
  for (const band of bands) {
    if (gross <= band.min) break;
    const taxable = Math.min(gross, band.max) - band.min;
    tax += taxable * band.rate;
  }
  return tax;
}

function calcUK(gross: number) {
  const d = TAX_DATA.UK;
  let pa = d.personalAllowance;
  if (gross > 100000) pa = Math.max(0, pa - (gross - 100000) / 2);
  const taxable = Math.max(0, gross - pa);
  const incomeTax = calcBandedTax(taxable, [
    { min: 0,      max: 37700,    rate: 0.20 },
    { min: 37700,  max: 112570,   rate: 0.40 },
    { min: 112570, max: Infinity, rate: 0.45 },
  ]);
  const ni =
    Math.max(0, Math.min(gross, d.ni.upperLimit) - d.ni.threshold) * d.ni.lowerRate +
    Math.max(0, gross - d.ni.upperLimit) * d.ni.upperRate;
  const total = incomeTax + ni;
  return { incomeTax, ni, total, net: gross - total, effectiveRate: total / gross };
}

function calcUS(gross: number) {
  const d = TAX_DATA.US;
  const taxable = Math.max(0, gross - d.standardDeduction);
  const incomeTax = calcBandedTax(taxable, d.bands);
  const ss = Math.min(gross, d.fica.socialSecurityCap) * d.fica.socialSecurityRate;
  const medicare =
    gross * d.fica.medicareRate +
    Math.max(0, gross - d.fica.additionalMedicareThreshold) * d.fica.additionalMedicareRate;
  const fica = ss + medicare;
  const stateTax = gross * 0.05;
  const total = incomeTax + fica + stateTax;
  return { incomeTax, fica, stateTax, total, net: gross - total, effectiveRate: total / gross };
}

function calcCA(gross: number) {
  const d = TAX_DATA.CA;
  const taxable = Math.max(0, gross - d.personalAmount);
  const federalTax = calcBandedTax(taxable, d.bands);
  const provincialTax = gross * d.provincialRate;
  const cpp = Math.max(0, Math.min(gross, d.cpp.ceiling) - d.cpp.exemption) * d.cpp.rate;
  const ei = Math.min(gross, 63200) * 0.0166;
  const total = federalTax + provincialTax + cpp + ei;
  return { federalTax, provincialTax, cpp, ei, total, net: gross - total, effectiveRate: total / gross };
}

function calcAU(gross: number) {
  const d = TAX_DATA.AU;
  const incomeTaxRaw = calcBandedTax(gross, d.bands);
  const lito =
    gross <= 37500 ? 700 :
    gross <= 45000 ? 700 - (gross - 37500) * 0.05 :
    gross <= 66667 ? 325 - (gross - 45000) * 0.015 : 0;
  const incomeTax = Math.max(0, incomeTaxRaw - lito);
  const medicare = gross > d.medicareThreshold ? gross * d.medicare : 0;
  const superannuation = gross * 0.11;
  const total = incomeTax + medicare;
  return { incomeTax, medicare, superannuation, total, net: gross - total, effectiveRate: total / gross };
}

function calcDE(gross: number) {
  const d = TAX_DATA.DE;
  let incomeTax = 0;
  if (gross <= 11604) incomeTax = 0;
  else if (gross <= 17006) {
    const y = (gross - 11604) / 10000;
    incomeTax = (979.18 * y + 1400) * y;
  } else if (gross <= 66761) {
    const z = (gross - 17005) / 10000;
    incomeTax = (192.59 * z + 2397) * z + 966;
  } else if (gross <= 277826) {
    incomeTax = 0.42 * gross - 10602;
  } else {
    incomeTax = 0.45 * gross - 18936;
  }
  const solidarity = gross > 18130 ? incomeTax * d.solidaritySurcharge : 0;
  const ss = d.socialSecurity;
  const socialInsurance = (ss.health + ss.pension + ss.unemployment + ss.nursing) * gross;
  const total = incomeTax + solidarity + socialInsurance;
  return { incomeTax, solidarity, socialInsurance, total, net: gross - total, effectiveRate: total / gross };
}

function calcIE(gross: number) {
  const d = TAX_DATA.IE;
  const incomeTaxRaw = calcBandedTax(gross, d.bands);
  const incomeTax = Math.max(0, incomeTaxRaw - d.taxCredit);
  const usc = calcBandedTax(gross, d.usc);
  const prsi = gross * d.prsi;
  const total = incomeTax + usc + prsi;
  return { incomeTax, usc, prsi, total, net: gross - total, effectiveRate: total / gross };
}

function calcNL(gross: number) {
  const d = TAX_DATA.NL;
  const incomeTaxRaw = calcBandedTax(gross, d.bands);
  const incomeTax = Math.max(0, incomeTaxRaw - d.generalCredit);
  const total = incomeTax;
  return { incomeTax, total, net: gross - total, effectiveRate: total / gross };
}

function calcSG(gross: number) {
  const d = TAX_DATA.SG;
  const incomeTax = calcBandedTax(gross, d.bands);
  const cpf = Math.min(gross * d.cpf, 37740);
  const total = incomeTax + cpf;
  return { incomeTax, cpf, total, net: gross - total, effectiveRate: total / gross };
}

function calcAE(gross: number) {
  return { incomeTax: 0, total: 0, net: gross, effectiveRate: 0 };
}

function calcPT(gross: number) {
  const d = TAX_DATA.PT;
  const incomeTax = calcBandedTax(gross, d.bands);
  const socialSecurity = gross * d.socialSecurity;
  const total = incomeTax + socialSecurity;
  return { incomeTax, socialSecurity, total, net: gross - total, effectiveRate: total / gross };
}

function calcCountry(country: keyof typeof TAX_DATA, gross: number) {
  switch (country) {
    case "UK": return calcUK(gross);
    case "US": return calcUS(gross);
    case "CA": return calcCA(gross);
    case "AU": return calcAU(gross);
    case "DE": return calcDE(gross);
    case "IE": return calcIE(gross);
    case "NL": return calcNL(gross);
    case "SG": return calcSG(gross);
    case "AE": return calcAE(gross);
    case "PT": return calcPT(gross);
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SalaryCalculator() {
  const [country, setCountry] = useState<keyof typeof TAX_DATA>("UK");
  const [role, setRole] = useState("Software Engineer");
  const [salary, setSalary] = useState(50000);
  const [inputVal, setInputVal] = useState("50,000");
  const [isPro, setIsPro] = useState(false);
  const [authLoaded, setAuthLoaded] = useState(false);

  // ─── Auth / pro check ────────────────────────────────────────────────────
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

  // ─── Derived ─────────────────────────────────────────────────────────────
  const availableCountries = isPro ? ALL_COUNTRY_KEYS : FREE_COUNTRIES;
  const effectiveSalary = !isPro && salary > FREE_SALARY_CAP ? FREE_SALARY_CAP : salary;
  const sym = TAX_DATA[country].symbol;

  const result = useMemo(() => calcCountry(country, effectiveSalary), [country, effectiveSalary]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(n));

  const handleSalaryInput = (val: string) => {
    const clean = val.replace(/[^0-9]/g, "");
    const num = parseInt(clean, 10) || 0;
    setInputVal(new Intl.NumberFormat("en").format(num));
    setSalary(num);
  };

  const breakdown = result
    ? Object.entries(result)
        .filter(([k]) => !["total", "net", "effectiveRate"].includes(k))
        .map(([k, v]) => ({
          label:
            k === "incomeTax"      ? "Income Tax" :
            k === "ni"             ? "National Insurance" :
            k === "fica"           ? "FICA (SS + Medicare)" :
            k === "stateTax"       ? "State Tax (avg)" :
            k === "federalTax"     ? "Federal Tax" :
            k === "provincialTax"  ? "Provincial Tax" :
            k === "cpp"            ? "CPP" :
            k === "ei"             ? "EI" :
            k === "medicare"       ? "Medicare Levy" :
            k === "superannuation" ? "Superannuation (employer)" :
            k === "socialInsurance"? "Social Insurance" :
            k === "solidarity"     ? "Solidarity Surcharge" :
            k === "usc"            ? "Universal Social Charge" :
            k === "prsi"           ? "PRSI" :
            k === "cpf"            ? "CPF (Pension)" :
            k,
          value: v as number,
        }))
        .filter((b) => b.value > 0)
    : [];

  const pct = (n: number) => salary > 0 ? ((n / effectiveSalary) * 100).toFixed(1) + "%" : "0%";

  const salaryCapped = !isPro && salary > FREE_SALARY_CAP;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0a] border-b-2 border-[#2a2a2a]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-4 h-4 bg-[#00ffd5] border-2 border-[#f0f0e8] flex-shrink-0" />
            <span className="font-heading text-lg font-extrabold tracking-tight text-[#f0f0e8] uppercase">Origio</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/guides" className="hidden sm:block text-xs font-bold text-[#888880] hover:text-[#f0f0e8] uppercase tracking-wide transition-colors">
              Guides
            </Link>
            <Link href="/compare" className="hidden sm:block text-xs font-bold text-[#888880] hover:text-[#f0f0e8] uppercase tracking-wide transition-colors">
              Compare
            </Link>
            {!isPro && (
              <Link href="/pro" className="flex items-center gap-1.5 text-xs font-bold text-[#00ffd5] hover:opacity-80 transition-opacity uppercase tracking-wide">
                <Sparkles className="w-3 h-3" />
                Pro
              </Link>
            )}
            <Link href="/" className="border-2 border-[#2a2a2a] px-3 py-1.5 text-xs font-bold text-[#f0f0e8] uppercase tracking-wide hover:border-[#f0f0e8] transition-colors">
              ← Globe
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Main ── */}
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-12">

          {/* Header */}
          <div className="mb-8">
            <p className="text-xs font-bold text-[#00ffd5] uppercase tracking-widest mb-2">Take-Home Calculator</p>
            <h1 className="font-heading text-3xl font-extrabold text-[#f0f0e8] uppercase tracking-tight mb-2">
              What will you actually earn?
            </h1>
            <p className="text-[#888880] text-sm">
              Net salary after tax and deductions. Estimates based on 2025/26 rates.
            </p>
          </div>

          {/* Inputs */}
          <div className="border-2 border-[#2a2a2a] p-6 mb-6 space-y-6" style={{ boxShadow: "3px 3px 0 #2a2a2a" }}>

            {/* Country selector */}
            <div>
              <label className="block text-xs font-bold text-[#888880] uppercase tracking-widest mb-3">
                Country
                {!isPro && (
                  <span className="ml-2 text-[#00ffd5]">— {FREE_COUNTRY_LIMIT} free · <Link href="/pro" className="underline">Pro unlocks {ALL_COUNTRY_KEYS.length}</Link></span>
                )}
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {ALL_COUNTRY_KEYS.map((c) => {
                  const locked = !isPro && !FREE_COUNTRIES.includes(c);
                  const active = country === c;
                  return (
                    <button
                      key={c}
                      onClick={() => !locked && setCountry(c)}
                      className={`relative px-2 py-2.5 text-xs font-bold uppercase tracking-wide border-2 transition-all ${
                        locked
                          ? "border-[#1a1a1a] text-[#333] cursor-not-allowed"
                          : active
                          ? "border-[#00ffd5] text-[#00ffd5] bg-[#00ffd5]/10"
                          : "border-[#2a2a2a] text-[#888880] hover:border-[#f0f0e8] hover:text-[#f0f0e8]"
                      }`}
                      style={active ? { boxShadow: "2px 2px 0 #00ffd5" } : {}}
                      title={locked ? "Upgrade to Pro to unlock" : TAX_DATA[c].label}
                    >
                      {locked && (
                        <Lock className="w-2.5 h-2.5 absolute top-1 right-1 text-[#333]" />
                      )}
                      <div className="text-base leading-none mb-0.5">{TAX_DATA[c].label.split(" ")[0]}</div>
                      <div className="text-[10px] opacity-70">{c}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-bold text-[#888880] uppercase tracking-widest mb-3">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#111] border-2 border-[#2a2a2a] px-4 py-3 text-sm text-[#f0f0e8] focus:outline-none focus:border-[#00ffd5] uppercase font-bold tracking-wide"
              >
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Salary Input */}
            <div>
              <label className="block text-xs font-bold text-[#888880] uppercase tracking-widest mb-3">
                Gross Annual Salary
                {!isPro && (
                  <span className="ml-2 text-[#888880]">— capped at {sym}{formatCurrency(FREE_SALARY_CAP)} free</span>
                )}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888880] font-bold text-sm">
                  {sym}
                </span>
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => handleSalaryInput(e.target.value)}
                  className="w-full bg-[#111] border-2 border-[#2a2a2a] pl-10 pr-4 py-3 text-sm text-[#f0f0e8] font-mono focus:outline-none focus:border-[#00ffd5] transition-colors"
                  placeholder="50,000"
                />
              </div>
              {salaryCapped && (
                <div className="mt-2 flex items-center justify-between border border-[#00ffd5]/30 bg-[#00ffd5]/5 px-3 py-2">
                  <p className="text-xs text-[#00ffd5] font-bold">
                    <Lock className="w-3 h-3 inline mr-1" />
                    Showing result for {sym}{formatCurrency(FREE_SALARY_CAP)} — Pro unlocks any salary
                  </p>
                  <Link href="/pro" className="text-xs font-bold text-[#00ffd5] underline whitespace-nowrap ml-3">
                    Upgrade →
                  </Link>
                </div>
              )}
            </div>

            {/* Quick picks */}
            <div className="flex gap-2 flex-wrap">
              {(isPro ? [30000, 50000, 75000, 100000, 150000] : [20000, 35000, 50000, 60000]).map((v) => (
                <button
                  key={v}
                  onClick={() => { setSalary(v); setInputVal(new Intl.NumberFormat("en").format(v)); }}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wide border-2 transition-all ${
                    salary === v
                      ? "border-[#00ffd5] text-[#00ffd5] bg-[#00ffd5]/10"
                      : "border-[#2a2a2a] text-[#888880] hover:border-[#f0f0e8] hover:text-[#f0f0e8]"
                  }`}
                >
                  {sym}{new Intl.NumberFormat("en", { notation: "compact" }).format(v)}
                </button>
              ))}
              {!isPro && (
                <Link
                  href="/pro"
                  className="px-3 py-1.5 text-xs font-bold uppercase tracking-wide border-2 border-[#00ffd5]/40 text-[#00ffd5]/60 hover:border-[#00ffd5] hover:text-[#00ffd5] transition-all flex items-center gap-1"
                >
                  <Lock className="w-2.5 h-2.5" /> 150k+
                </Link>
              )}
            </div>
          </div>

          {/* Results */}
          {result && effectiveSalary > 0 && (
            <div className="border-2 border-[#2a2a2a] overflow-hidden" style={{ boxShadow: "3px 3px 0 #2a2a2a" }}>

              {/* Take-home hero */}
              <div className="bg-[#00ffd5]/10 border-b-2 border-[#2a2a2a] px-6 py-5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#00ffd5] uppercase tracking-widest mb-1">
                    Monthly Take-Home
                  </div>
                  <div className="font-heading text-4xl font-extrabold text-[#f0f0e8]">
                    {sym}{formatCurrency(result.net / 12)}
                  </div>
                  <div className="text-[#888880] text-sm mt-1">
                    {sym}{formatCurrency(result.net)} / year
                    {salaryCapped && (
                      <span className="ml-2 text-[#00ffd5] text-xs font-bold">
                        (capped — <Link href="/pro" className="underline">unlock full</Link>)
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-[#888880] uppercase tracking-widest mb-1">
                    Effective Rate
                  </div>
                  <div className="font-heading text-3xl font-extrabold text-[#f0f0e8]">
                    {(result.effectiveRate * 100).toFixed(1)}%
                  </div>
                  <div className="text-[#888880] text-sm mt-1">of gross</div>
                </div>
              </div>

              {/* Breakdown — PRO only */}
              {isPro ? (
                <div className="px-6 py-4">
                  <div className="text-xs font-bold text-[#888880] uppercase tracking-widest mb-3">
                    Deductions Breakdown
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm font-bold text-[#f0f0e8] uppercase">Gross Salary</span>
                      <span className="font-mono font-bold text-sm text-[#f0f0e8]">
                        {sym}{formatCurrency(effectiveSalary)}
                      </span>
                    </div>
                    <div className="border-t-2 border-[#1a1a1a]" />
                    {breakdown.map((b) => (
                      <div key={b.label} className="flex items-center justify-between">
                        <div>
                          <span className="text-sm text-[#f0f0e8]">{b.label}</span>
                          <span className="ml-2 text-xs text-[#888880]">({pct(b.value)})</span>
                        </div>
                        <span className="font-mono text-sm text-red-400">
                          −{sym}{formatCurrency(b.value)}
                        </span>
                      </div>
                    ))}
                    <div className="border-t-2 border-[#1a1a1a] pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[#f0f0e8] uppercase">Total Deductions</span>
                        <span className="font-mono font-bold text-sm text-red-400">
                          −{sym}{formatCurrency(result.total)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Visual bar */}
                  <div className="pt-4 pb-1">
                    <div className="flex overflow-hidden h-2.5 border border-[#2a2a2a]">
                      <div className="bg-[#00ffd5] transition-all" style={{ width: `${100 - result.effectiveRate * 100}%` }} />
                      <div className="bg-red-500/60 transition-all" style={{ width: `${result.effectiveRate * 100}%` }} />
                    </div>
                    <div className="flex justify-between mt-1.5 text-xs text-[#888880]">
                      <span>Take-home {(100 - result.effectiveRate * 100).toFixed(1)}%</span>
                      <span>Deductions {(result.effectiveRate * 100).toFixed(1)}%</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#888880] border-t-2 border-[#1a1a1a] pt-3 mt-4">
                    Estimates only. {
                      country === "US" ? "Includes ~5% avg state tax, standard deduction applied." :
                      country === "CA" ? "Includes avg provincial rate ~11%. CPP + EI included." :
                      country === "AU" ? "LITO applied. Superannuation shown separately." :
                      country === "DE" ? "Social insurance at standard employee rates." :
                      country === "IE" ? "Standard tax credits applied. USC bands 2025." :
                      country === "SG" ? "CPF employee contribution at 20%." :
                      country === "AE" ? "No income tax in UAE." :
                      "2025/26 rates applied."
                    }
                  </p>
                </div>
              ) : (
                /* ── FREE gate: blurred breakdown + upgrade CTA ── */
                <div className="relative">
                  <div className="px-6 py-4 select-none pointer-events-none" style={{ filter: "blur(4px)", opacity: 0.4 }}>
                    <div className="text-xs font-bold text-[#888880] uppercase tracking-widest mb-3">Deductions Breakdown</div>
                    <div className="space-y-3">
                      {[["Income Tax", "12,400"], ["National Insurance", "4,200"], ["Total Deductions", "16,600"]].map(([label, val]) => (
                        <div key={label} className="flex items-center justify-between">
                          <span className="text-sm text-[#f0f0e8]">{label}</span>
                          <span className="font-mono text-sm text-red-400">−{sym}{val}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex overflow-hidden h-2.5 border border-[#2a2a2a] mt-4">
                      <div className="bg-[#00ffd5]" style={{ width: "68%" }} />
                      <div className="bg-red-500/60" style={{ width: "32%" }} />
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]/85">
                    <div className="text-center px-6 py-5 border-2 border-[#2a2a2a] bg-[#0f0f0f] max-w-xs mx-4" style={{ boxShadow: "4px 4px 0 #00ffd5" }}>
                      <Lock className="w-5 h-5 text-[#00ffd5] mx-auto mb-2" />
                      <p className="font-heading font-extrabold text-[#f0f0e8] uppercase text-sm tracking-tight mb-1">
                        Full breakdown is Pro
                      </p>
                      <p className="text-xs text-[#888880] mb-4">
                        See every deduction, visual split, and compare all {ALL_COUNTRY_KEYS.length} countries.
                      </p>
                      <Link
                        href="/pro"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00ffd5] text-[#0a0a0a] text-xs font-extrabold uppercase tracking-wide border-2 border-[#00ffd5] hover:bg-transparent hover:text-[#00ffd5] transition-colors"
                      >
                        <Sparkles className="w-3 h-3" />
                        Upgrade to Pro — €19.99
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pro upgrade strip */}
          {!isPro && authLoaded && (
            <div className="mt-4 border-2 border-[#00ffd5]/30 p-4 flex items-center justify-between gap-4 flex-wrap" style={{ boxShadow: "3px 3px 0 #00ffd5" }}>
              <div className="flex items-center gap-3">
                <Zap className="w-4 h-4 text-[#00ffd5] flex-shrink-0" />
                <div>
                  <p className="text-xs font-extrabold text-[#f0f0e8] uppercase tracking-wide">Pro unlocks everything</p>
                  <p className="text-xs text-[#888880]">All {ALL_COUNTRY_KEYS.length} countries · any salary · full breakdown</p>
                </div>
              </div>
              <Link
                href="/pro"
                className="px-4 py-2 bg-[#00ffd5] text-[#0a0a0a] text-xs font-extrabold uppercase tracking-wide border-2 border-[#00ffd5] hover:bg-transparent hover:text-[#00ffd5] transition-colors whitespace-nowrap flex-shrink-0"
              >
                €19.99 one-time →
              </Link>
            </div>
          )}

          {/* Guides CTA */}
          <div className="mt-6 border-2 border-[#2a2a2a] p-5">
            <p className="text-xs font-bold text-[#888880] uppercase tracking-widest mb-1">Also explore</p>
            <h2 className="font-heading text-lg font-extrabold text-[#f0f0e8] uppercase tracking-tight mb-1">
              Best countries by role
            </h2>
            <p className="text-sm text-[#888880] mb-4">Not sure where to move? Start with role-based guides.</p>
            <div className="flex flex-wrap gap-2">
              {GUIDES.map((g) => (
                <Link
                  key={g.slug}
                  href={`/best-countries-for/${g.slug}`}
                  className="border-2 border-[#2a2a2a] px-3 py-2 text-sm text-[#888880] hover:text-[#f0f0e8] hover:border-[#f0f0e8] transition-all font-bold uppercase tracking-wide"
                >
                  {g.label}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t-2 border-[#2a2a2a] mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#00ffd5] border-2 border-[#f0f0e8]" />
            <span className="font-heading text-sm font-extrabold uppercase tracking-tight text-[#f0f0e8]">Origio</span>
            <span className="text-[#888880] text-xs ml-2">© 2026</span>
          </div>
          <div className="flex items-center gap-5 text-xs font-bold text-[#888880] uppercase tracking-wide">
            <Link href="/about" className="hover:text-[#f0f0e8] transition-colors">About</Link>
            <Link href="/faq" className="hover:text-[#f0f0e8] transition-colors">FAQ</Link>
            <Link href="/privacy" className="hover:text-[#f0f0e8] transition-colors">Privacy</Link>
            <Link href="/contact" className="hover:text-[#f0f0e8] transition-colors">Contact</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}