"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

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
    label: "🇬🇧 United Kingdom",
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
    label: "🇺🇸 United States",
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
};

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

// ─── Component ────────────────────────────────────────────────────────────────

export default function SalaryCalculator() {
  const [country, setCountry] = useState<keyof typeof TAX_DATA>("UK");
  const [role, setRole] = useState("Software Engineer");
  const [salary, setSalary] = useState(65000);
  const [inputVal, setInputVal] = useState("65,000");

  const sym = TAX_DATA[country].symbol;

  const result = useMemo(() => {
    switch (country) {
      case "UK": return calcUK(salary);
      case "US": return calcUS(salary);
      case "CA": return calcCA(salary);
      case "AU": return calcAU(salary);
      case "DE": return calcDE(salary);
    }
  }, [country, salary]);

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
            k,
          value: v as number,
        }))
        .filter((b) => b.value > 0)
    : [];

  const pct = (n: number) => ((n / salary) * 100).toFixed(1) + "%";

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-2xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="mb-10">
          <h1 className="font-heading text-3xl font-bold text-text-primary mb-2">
            Take-Home Calculator
          </h1>
          <p className="text-text-muted text-sm">
            Estimate your net salary after tax and deductions.
          </p>
        </div>

        {/* Inputs */}
        <div className="bg-bg-elevated rounded-2xl border border-border p-6 mb-6 space-y-5">

          {/* Country */}
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Country
            </label>
            <div className="grid grid-cols-5 gap-2">
              {(Object.keys(TAX_DATA) as (keyof typeof TAX_DATA)[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCountry(c)}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                    country === c
                      ? "bg-accent text-white"
                      : "bg-bg-elevated text-text-muted hover:bg-bg-elevated-hover border border-transparent"
                  }`}
                >
                  {TAX_DATA[c].label.split(" ")[0]}
                  <div className="text-[10px] font-normal opacity-70">{c}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Salary Input */}
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Gross Annual Salary
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-semibold text-sm">
                {sym}
              </span>
              <input
                type="text"
                value={inputVal}
                onChange={(e) => handleSalaryInput(e.target.value)}
                className="w-full bg-bg-elevated border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary font-mono focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="65,000"
              />
            </div>
          </div>

          {/* Quick picks */}
          <div className="flex gap-2 flex-wrap">
            {[30000, 50000, 75000, 100000, 150000].map((v) => (
              <button
                key={v}
                onClick={() => { setSalary(v); setInputVal(new Intl.NumberFormat("en").format(v)); }}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all border ${
                  salary === v
                    ? "bg-accent/20 text-accent border-accent/30"
                    : "bg-bg-elevated text-text-muted hover:bg-bg-elevated-hover border-transparent"
                }`}
              >
                {sym}{new Intl.NumberFormat("en", { notation: "compact" }).format(v)}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {result && salary > 0 && (
          <div className="bg-bg-elevated rounded-2xl border border-border overflow-hidden">

            {/* Take-home hero */}
            <div className="bg-accent/10 border-b border-border px-6 py-5 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-accent uppercase tracking-wider mb-1">
                  Monthly Take-Home
                </div>
                <div className="font-heading text-4xl font-bold text-text-primary">
                  {sym}{formatCurrency(result.net / 12)}
                </div>
                <div className="text-text-muted text-sm mt-1">
                  {sym}{formatCurrency(result.net)} / year
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                  Effective Rate
                </div>
                <div className="font-heading text-3xl font-bold text-text-primary">
                  {(result.effectiveRate * 100).toFixed(1)}%
                </div>
                <div className="text-text-muted text-sm mt-1">of gross</div>
              </div>
            </div>

            {/* Breakdown */}
            <div className="px-6 py-4">
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                Deductions Breakdown
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-semibold text-text-primary">Gross Salary</span>
                  <span className="font-mono font-semibold text-sm text-text-primary">
                    {sym}{formatCurrency(salary)}
                  </span>
                </div>
                <div className="border-t border-border" />

                {breakdown.map((b) => (
                  <div key={b.label} className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-text-primary">{b.label}</span>
                      <span className="ml-2 text-xs text-text-muted">({pct(b.value)})</span>
                    </div>
                    <span className="font-mono text-sm text-notification">
                      −{sym}{formatCurrency(b.value)}
                    </span>
                  </div>
                ))}

                <div className="border-t border-border pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-text-primary">Total Deductions</span>
                    <span className="font-mono font-bold text-sm text-notification">
                      −{sym}{formatCurrency(result.total)}
                    </span>
                  </div>
                </div>

                {/* Visual bar */}
                <div className="pt-2 pb-1">
                  <div className="flex rounded-full overflow-hidden h-2.5">
                    <div
                      className="bg-accent transition-all"
                      style={{ width: `${100 - result.effectiveRate * 100}%` }}
                    />
                    <div
                      className="bg-notification/60 transition-all"
                      style={{ width: `${result.effectiveRate * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5 text-xs text-text-muted">
                    <span>Take-home {(100 - result.effectiveRate * 100).toFixed(1)}%</span>
                    <span>Deductions {(result.effectiveRate * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="px-6 pb-5">
              <p className="text-xs text-text-muted border-t border-border pt-3">
                Estimates only.{" "}
                {country === "US"
                  ? "Includes ~5% avg state tax, standard deduction applied."
                  : country === "CA"
                  ? "Includes avg provincial rate ~11%. CPP + EI included."
                  : country === "AU"
                  ? "LITO applied. Superannuation shown separately (employer contribution)."
                  : country === "DE"
                  ? "Social insurance contributions included at standard employee rates."
                  : "2025/26 rates. NI Class 1 employee rates applied."}
              </p>
            </div>
          </div>
        )}

        {/* ── Guides CTA ───────────────────────────────────────────────── */}
        <div className="mt-6 rounded-2xl border border-border bg-bg-elevated p-5">
          <p className="text-xs uppercase tracking-wider text-text-muted mb-1">
            Also explore
          </p>
          <h2 className="font-heading text-lg font-bold text-text-primary mb-1">
            Best countries by role
          </h2>
          <p className="text-sm text-text-muted mb-4">
            Not sure where to move yet? Start with the role-based guides first.
          </p>
          <div className="flex flex-wrap gap-2">
            {GUIDES.map((g) => (
              <Link
                key={g.slug}
                href={`/best-countries-for/${g.slug}`}
                className="rounded-lg bg-bg-elevated border border-border px-3 py-2 text-sm text-text-muted hover:text-text-primary hover:border-accent/30 transition-all"
              >
                {g.label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}