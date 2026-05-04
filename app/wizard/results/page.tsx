"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Globe2, ArrowRight, Lock } from "lucide-react";
import { CountryMatch, WizardAnswers } from "@/lib/wizard";
import { JOB_ROLES, CountryWithData } from "@/types";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

// ─── constants ───────────────────────────────────────────────────────────────

const LOADING_STEPS = [
  "Ranking 25 countries...",
  "Checking visa routes...",
  "Calculating take-home pay...",
  "Applying your priorities...",
  "Done.",
];

// ─── helpers (unchanged) ─────────────────────────────────────────────────────

function matchPercentColor(pct: number): string {
  if (pct >= 90) return "oklch(0.75 0.18 145)";   // mint-green
  if (pct >= 75) return "oklch(0.82 0.14 80)";    // amber
  return "oklch(0.65 0.10 30)";                    // coral/muted
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

function getVisaLabel(d: number) {
  if (d <= 1) return "Easy";
  if (d <= 2) return "Straightforward";
  if (d <= 3) return "Moderate";
  if (d <= 4) return "Difficult";
  return "Very hard";
}

const TO_USD: Record<string, number> = {
  USD: 1, EUR: 1.08, GBP: 1.27, AUD: 0.65, CAD: 0.74,
  NZD: 0.61, CHF: 1.13, SGD: 0.74, AED: 0.27,
  NOK: 0.093, SEK: 0.096, DKK: 0.145,
  JPY: 0.0067, INR: 0.012, BRL: 0.20, MYR: 0.22,
};

function toUSD(amount: number, currency: string): number {
  return amount * (TO_USD[currency] ?? 1);
}

function normalise(value: number, min: number, max: number): number {
  return Math.max(0, Math.min(10, ((value - min) / (max - min)) * 10));
}

function computeScoreBreakdown(
  country: CountryWithData,
  answers: Partial<WizardAnswers>,
  jobRoleDef: typeof JOB_ROLES[0] | undefined
) {
  const data = country.data;
  const rentUSD = toUSD(data.costRentCityCentre, country.currency);
  const salaryRaw = jobRoleDef
    ? (data[jobRoleDef.salaryKey] as number)
    : data.salarySoftwareEngineer;
  const salaryUSD = toUSD(salaryRaw, country.currency);

  return {
    salary:        { label: "Salary",          value: normalise(salaryUSD, 25000, 200000), desc: `${getCurrencySymbol(country.currency)}${salaryRaw.toLocaleString()}/yr` },
    affordability: { label: "Affordability",   value: 10 - normalise(rentUSD, 300, 4000),  desc: `${getCurrencySymbol(country.currency)}${data.costRentCityCentre.toLocaleString()}/mo rent` },
    tax:           { label: "Tax efficiency",  value: 10 - normalise(data.incomeTaxRateMid, 0, 55), desc: `${data.incomeTaxRateMid}% income tax` },
    safety:        { label: "Safety",          value: data.scoreSafety,                    desc: `${data.scoreSafety}/10` },
    quality:       { label: "Quality of life", value: data.scoreQualityOfLife,             desc: `${data.scoreQualityOfLife}/10` },
    visa:          { label: "Visa access",     value: 10 - data.visaDifficulty * 2,        desc: getVisaLabel(data.visaDifficulty) },
  };
}

function generateSummary(
  match: CountryMatch,
  answers: Partial<WizardAnswers>,
  scores: ReturnType<typeof computeScoreBreakdown>,
  rank: number
): string {
  const cs = getCurrencySymbol(match.country.currency);
  const data = match.country.data;
  const entries = Object.entries(scores).sort((a, b) => b[1].value - a[1].value);
  const weakest = entries[entries.length - 1];
  let s = `Ranks #${rank}. Tax ${data.incomeTaxRateMid}%. Rent ${cs}${data.costRentCityCentre.toLocaleString()}/mo. Visa: ${getVisaLabel(data.visaDifficulty).toLowerCase()}.`;
  if (weakest[1].value < 4) s += ` Trade-off: ${weakest[1].label.toLowerCase()} (${weakest[1].desc}).`;
  return s;
}

function computeExcluded(
  matchSlugs: string[],
  answers: Partial<WizardAnswers>
): { name: string; reason: string }[] {
  const dealBreakers = answers.dealBreakers ?? [];
  const excluded: { name: string; reason: string }[] = [];
  const REASON_MAP: Record<string, string> = {
    lowtax: "high income tax", lowcost: "high cost of living", europe: "not in Europe",
    english: "not English-speaking", warm: "cold climate", lowcrime: "crime rate too high",
    nomadvisa: "no digital nomad visa", healthcare: "weak public healthcare",
  };
  const SLUG_TO_NAME: Record<string, string> = {
    "australia": "Australia", "canada": "Canada", "norway": "Norway", "singapore": "Singapore",
    "switzerland": "Switzerland", "new-zealand": "New Zealand", "sweden": "Sweden", "germany": "Germany",
    "ireland": "Ireland", "united-kingdom": "United Kingdom", "netherlands": "Netherlands",
    "france": "France", "finland": "Finland", "belgium": "Belgium", "denmark": "Denmark",
    "austria": "Austria", "italy": "Italy", "usa": "USA", "japan": "Japan", "india": "India",
    "uae": "UAE", "brazil": "Brazil", "malaysia": "Malaysia", "portugal": "Portugal",
    "spain": "Spain", "poland": "Poland",
  };
  const current = (answers.currentCountry ?? answers.passport)?.toLowerCase().trim();
  if (current && SLUG_TO_NAME[current] && !matchSlugs.includes(current))
    excluded.push({ name: SLUG_TO_NAME[current], reason: "your current country" });
  dealBreakers.forEach((db) => {
    if (db === "none") return;
    const reason = REASON_MAP[db] ?? db;
    if (db === "lowtax") {
      ["australia","canada","norway","sweden","germany","ireland","united-kingdom","netherlands","france","finland","belgium","denmark","austria","italy","new-zealand"]
        .filter((s) => !matchSlugs.includes(s) && SLUG_TO_NAME[s]).slice(0, 3)
        .forEach((s) => excluded.push({ name: SLUG_TO_NAME[s], reason }));
    }
    if (db === "lowcost") {
      ["singapore","switzerland","norway","australia","new-zealand","ireland","united-kingdom","usa","canada"]
        .filter((s) => !matchSlugs.includes(s) && SLUG_TO_NAME[s]).slice(0, 3)
        .forEach((s) => excluded.push({ name: SLUG_TO_NAME[s], reason }));
    }
    if (db === "europe") {
      ["australia","canada","usa","uae","singapore","japan","india","brazil","malaysia"]
        .filter((s) => !matchSlugs.includes(s) && SLUG_TO_NAME[s]).slice(0, 3)
        .forEach((s) => excluded.push({ name: SLUG_TO_NAME[s], reason }));
    }
  });
  const seen = new Set<string>();
  return excluded.filter((e) => { if (seen.has(e.name)) return false; seen.add(e.name); return true; });
}

// ─── design primitives ───────────────────────────────────────────────────────

/** Tick-bar: ||||||||·····  10 chars, mint for filled, faint for empty */
function TickBar({ value, max = 10 }: { value: number; max?: number }) {
  const total = 10;
  const filled = Math.round((value / max) * total);
  return (
    <span className="font-mono text-[11px] tracking-[0.12em]" aria-hidden>
      {Array.from({ length: total }, (_, i) =>
        i < filled
          ? <span key={i} style={{ color: "oklch(0.86 0.18 175)" }}>|</span>
          : <span key={i} style={{ color: "oklch(1 0 0 / 0.18)" }}>·</span>
      )}
    </span>
  );
}

/** Tape chip: dashed border, slight rotation, mint tint */
function TapeLabel({ children, rotate = "-1.2deg" }: { children: React.ReactNode; rotate?: string }) {
  return (
    <span
      className="inline-block font-mono text-[9px] uppercase tracking-[0.2em] px-2 py-0.5"
      style={{
        border: "1.5px dashed oklch(0.86 0.18 175 / 0.7)",
        color: "oklch(0.86 0.18 175)",
        background: "oklch(0.86 0.18 175 / 0.06)",
        transform: `rotate(${rotate})`,
        borderRadius: "2px",
      }}
    >
      {children}
    </span>
  );
}

/** SVG scribble underline (mint, hand-drawn feel) */
function ScribbleUnderline({ width = 120 }: { width?: number }) {
  return (
    <svg
      width={width} height="10" viewBox={`0 0 ${width} 10`}
      fill="none" style={{ display: "block", marginTop: 2 }}
      aria-hidden
    >
      <path
        d={`M2 7 C${width * 0.15} 3, ${width * 0.35} 9, ${width * 0.55} 5 S${width * 0.8} 2, ${width - 2} 6`}
        stroke="oklch(0.86 0.18 175)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Hand-drawn SVG arrow pointing right (used in hero) */
function AnnotationArrow() {
  return (
    <svg
      width="72" height="40" viewBox="0 0 72 40"
      fill="none" className="absolute"
      style={{ top: 12, right: -80, pointerEvents: "none" }}
      aria-hidden
    >
      <path
        d="M4 20 C14 8, 32 4, 54 16"
        stroke="oklch(0.86 0.18 175 / 0.7)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeDasharray="2 3"
      />
      <path
        d="M50 10 L54 16 L46 18"
        stroke="oklch(0.86 0.18 175 / 0.7)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

// ─── receipt score row ────────────────────────────────────────────────────────

function ReceiptRow({
  label, value, desc, border = true,
}: {
  label: string; value: number; desc: string; border?: boolean;
}) {
  const scoreColor =
    value >= 7
      ? "oklch(0.86 0.18 175)"   // mint
      : value >= 5
      ? "oklch(0.82 0.14 80)"    // amber
      : "oklch(0.65 0.16 25)";   // coral

  return (
    <div
      className="grid items-center gap-3 py-2.5"
      style={{
        gridTemplateColumns: "7rem 1fr 2.5rem",
        borderBottom: border ? "1px solid oklch(1 0 0 / 0.08)" : "none",
      }}
    >
      <span
        className="font-mono text-[10px] uppercase tracking-[0.15em]"
        style={{ color: "oklch(0.96 0.012 95 / 0.45)" }}
      >
        {label}
      </span>
      <TickBar value={value} />
      <span
        className="font-mono text-[11px] font-bold text-right"
        style={{ color: scoreColor }}
      >
        {value.toFixed(1)}
      </span>
    </div>
  );
}

// ─── score breakdown (receipt card) ─────────────────────────────────────────

function ReceiptScoreCard({
  match, answers, jobRoleDef, rank, excludedCountries,
}: {
  match: CountryMatch;
  answers: Partial<WizardAnswers>;
  jobRoleDef: typeof JOB_ROLES[0] | undefined;
  rank: number;
  excludedCountries: { name: string; reason: string }[];
}) {
  const scores = computeScoreBreakdown(match.country, answers, jobRoleDef);
  const priorities = [answers.priorities ?? []].flat().filter(Boolean).join(", ") || "your priorities";

  return (
    <div
      style={{
        border: "1px solid oklch(1 0 0 / 0.08)",
        background: "oklch(0.10 0.005 240)",
        borderRadius: "2px",
      }}
    >
      {/* receipt header */}
      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{ borderBottom: "1px solid oklch(1 0 0 / 0.08)" }}
      >
        <span
          className="font-mono text-[9px] uppercase tracking-[0.25em]"
          style={{ color: "oklch(0.96 0.012 95 / 0.35)" }}
        >
          Score breakdown
        </span>
        <span
          className="font-mono text-[9px]"
          style={{ color: "oklch(0.96 0.012 95 / 0.25)" }}
        >
          #{rank}
        </span>
      </div>

      {/* rows */}
      <div className="px-5">
        {Object.values(scores).map((s, i, arr) => (
          <ReceiptRow
            key={s.label}
            label={s.label}
            value={s.value}
            desc={s.desc}
            border={i < arr.length - 1}
          />
        ))}
      </div>

      {/* footnote */}
      <div
        className="px-5 py-3 mt-1"
        style={{ borderTop: "1px solid oklch(1 0 0 / 0.08)" }}
      >
        <p
          className="font-serif italic text-[11px] leading-relaxed"
          style={{ color: "oklch(0.96 0.012 95 / 0.35)" }}
        >
          based on {priorities}
        </p>
      </div>

      {/* excluded */}
      {excludedCountries.length > 0 && (
        <div
          className="px-5 py-3"
          style={{ borderTop: "1px solid oklch(1 0 0 / 0.08)" }}
        >
          <p
            className="font-mono text-[9px] uppercase tracking-[0.2em] mb-2"
            style={{ color: "oklch(0.96 0.012 95 / 0.25)" }}
          >
            Filtered out
          </p>
          <div className="space-y-1.5">
            {excludedCountries.slice(0, 5).map((c) => (
              <div key={c.name} className="flex items-start gap-2">
                <span
                  className="font-mono text-[10px] mt-px"
                  style={{ color: "oklch(0.65 0.16 25)" }}
                >
                  ✕
                </span>
                <span
                  className="font-mono text-[10px]"
                  style={{ color: "oklch(0.96 0.012 95 / 0.45)" }}
                >
                  {c.name}
                  <span style={{ color: "oklch(0.96 0.012 95 / 0.25)" }}> — {c.reason}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── inline score toggle (top-3 + ranking rows) ───────────────────────────────

function ScoreToggle({
  match, answers, jobRoleDef, rank,
}: {
  match: CountryMatch;
  answers: Partial<WizardAnswers>;
  jobRoleDef: typeof JOB_ROLES[0] | undefined;
  rank: number;
}) {
  const [open, setOpen] = useState(false);
  const scores = computeScoreBreakdown(match.country, answers, jobRoleDef);

  return (
    <div className="mt-2">
      <button
        onClick={(e) => { e.preventDefault(); setOpen(!open); }}
        className="font-mono text-[9px] uppercase tracking-[0.2em] transition-colors"
        style={{ color: open ? "oklch(0.86 0.18 175)" : "oklch(1 0 0 / 0.25)" }}
      >
        {open ? "hide scores ↑" : "scores ↓"}
      </button>

      {open && (
        <div
          className="mt-2 pt-2"
          style={{ borderTop: "1px solid oklch(1 0 0 / 0.08)" }}
        >
          {Object.values(scores).map((s, i, arr) => (
            <ReceiptRow
              key={s.label}
              label={s.label}
              value={s.value}
              desc={s.desc}
              border={i < arr.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── take-home card (receipt style) ─────────────────────────────────────────

function TakeHomeCard({
  match, jobRoleDef, isPro,
}: {
  match: CountryMatch;
  jobRoleDef: typeof JOB_ROLES[0] | undefined;
  isPro: boolean;
}) {
  if (!jobRoleDef) return null;
  const cs = getCurrencySymbol(match.country.currency);
  const gross = match.country.data[jobRoleDef.salaryKey] as number;
  const taxRate = match.country.data.incomeTaxRateMid / 100;
  const taxAmount = Math.round(gross * taxRate);
  const netAnnual = gross - taxAmount;
  const netMonthly = Math.round(netAnnual / 12);
  const rent = match.country.data.costRentCityCentre;
  const groceries = match.country.data.costGroceriesMonthly;
  const transport = match.country.data.costTransportMonthly;
  const totalCosts = rent + groceries + transport;
  const disposable = netMonthly - totalCosts;

  type RowProps = { label: string; value: string; color?: string; border?: boolean };
  const Row = ({ label, value, color, border = true }: RowProps) => (
    <div
      className="grid items-center gap-3 py-2.5"
      style={{
        gridTemplateColumns: "1fr auto",
        borderBottom: border ? "1px solid oklch(1 0 0 / 0.08)" : "none",
      }}
    >
      <span
        className="font-mono text-[10px] uppercase tracking-[0.15em]"
        style={{ color: "oklch(0.96 0.012 95 / 0.4)" }}
      >
        {label}
      </span>
      <span
        className="font-mono text-[12px] font-bold"
        style={{ color: color ?? "oklch(0.96 0.012 95)" }}
      >
        {value}
      </span>
    </div>
  );

  return (
    <div
      className="mt-8"
      style={{
        border: "1px solid oklch(1 0 0 / 0.08)",
        borderRadius: "2px",
        background: "oklch(0.10 0.005 240)",
      }}
    >
      {/* header */}
      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{ borderBottom: "1px solid oklch(1 0 0 / 0.08)" }}
      >
        <span
          className="font-mono text-[9px] uppercase tracking-[0.25em]"
          style={{ color: "oklch(0.96 0.012 95 / 0.35)" }}
        >
          Take-home · {jobRoleDef.label} · {match.country.name}
        </span>
        <span
          className="font-mono text-[9px]"
          style={{ color: "oklch(0.96 0.012 95 / 0.25)" }}
        >
          {match.country.data.incomeTaxRateMid}% tax
        </span>
      </div>

      <div className="px-5">
        <Row label="Gross salary" value={`${cs}${gross.toLocaleString()}/yr`} />
        <Row
          label={`Income tax (${match.country.data.incomeTaxRateMid}%)`}
          value={`−${cs}${taxAmount.toLocaleString()}`}
          color="oklch(0.65 0.16 25)"
        />
        <div style={{ height: 1, background: "oklch(0.86 0.18 175 / 0.2)", margin: "2px 0" }} />
        <Row label="Net annual"  value={`${cs}${netAnnual.toLocaleString()}/yr`}  color="oklch(0.86 0.18 175)" />
        <Row label="Net monthly" value={`${cs}${netMonthly.toLocaleString()}/mo`} color="oklch(0.86 0.18 175)" />

        <div className="relative">
          <div className={isPro ? "" : "blur-sm pointer-events-none select-none"}>
            <Row
              label="Rent + groceries + transport"
              value={`−${cs}${totalCosts.toLocaleString()}/mo`}
              color="oklch(0.65 0.16 25)"
            />
            <Row
              label="Disposable income"
              value={`${cs}${disposable.toLocaleString()}/mo`}
              color={disposable > 0 ? "oklch(0.86 0.18 175)" : "oklch(0.65 0.16 25)"}
              border={false}
            />
          </div>
          {!isPro && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: "oklch(0.10 0.005 240 / 0.75)" }}
            >
              <Link
                href="/pro"
                className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] px-4 py-2"
                style={{
                  background: "oklch(0.86 0.18 175)",
                  color: "oklch(0.13 0.005 240)",
                  borderRadius: "2px",
                }}
              >
                <Lock className="w-3 h-3" />
                Full breakdown — Pro
              </Link>
            </div>
          )}
        </div>
      </div>

      <div
        className="px-5 pb-4 pt-2"
        style={{ borderTop: "1px solid oklch(1 0 0 / 0.08)", marginTop: 4 }}
      >
        <p
          className="font-serif italic text-[11px] leading-relaxed"
          style={{ color: "oklch(0.96 0.012 95 / 0.28)" }}
        >
          * Mid-bracket estimate. Social security, local taxes, and deductions vary.
        </p>
      </div>
    </div>
  );
}

// ─── email capture ────────────────────────────────────────────────────────────

function EmailCapture({
  topCountry, topCountryFlag, matchPercent, jobRole,
  grossSalary, netMonthly, taxRate, rentCost, visaLabel, currency,
}: {
  topCountry: string; topCountryFlag: string; matchPercent: number; jobRole: string;
  grossSalary: number; netMonthly: number; taxRate: number; rentCost: number;
  visaLabel: string; currency: string;
}) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!email || !email.includes("@")) { setError("Enter a valid email."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email, source: "quiz_results", topCountry, topCountryFlag, matchPercent,
          jobRole, grossSalary, netMonthly, taxRate, rentCost, visaLabel, currency,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Try again.");
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div
        className="mt-8 px-6 py-5"
        style={{ border: "1px solid oklch(1 0 0 / 0.08)", borderRadius: "2px" }}
      >
        <p
          className="font-mono text-[11px] uppercase tracking-[0.2em]"
          style={{ color: "oklch(0.86 0.18 175)" }}
        >
          ✓ Check your inbox
        </p>
      </div>
    );
  }

  return (
    <div
      className="mt-8 px-6 py-6 space-y-5"
      style={{ border: "1px solid oklch(1 0 0 / 0.08)", borderRadius: "2px" }}
    >
      <div>
        <p
          className="font-mono text-[9px] uppercase tracking-[0.25em] mb-2"
          style={{ color: "oklch(0.96 0.012 95 / 0.35)" }}
        >
          Save your results
        </p>
        <p
          className="font-serif text-[18px] leading-tight"
          style={{ color: "oklch(0.96 0.012 95)" }}
        >
          {topCountryFlag} {topCountry} breakdown by email
        </p>
        <p
          className="font-mono text-[11px] mt-1"
          style={{ color: "oklch(0.96 0.012 95 / 0.35)" }}
        >
          Salary, tax, and cost breakdown. No spam. One email.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="flex-1 px-4 py-3 font-mono text-[12px] placeholder:opacity-30 focus:outline-none"
          style={{
            background: "oklch(0.10 0.005 240)",
            border: "1px solid oklch(1 0 0 / 0.12)",
            borderRadius: "2px",
            color: "oklch(0.96 0.012 95)",
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-3 font-mono text-[9px] uppercase tracking-[0.25em] flex-shrink-0 disabled:opacity-50"
          style={{
            background: "oklch(0.86 0.18 175)",
            color: "oklch(0.13 0.005 240)",
            borderRadius: "2px",
          }}
        >
          {loading ? "Sending..." : "Send it →"}
        </button>
      </div>
      {error && (
        <p className="font-mono text-[11px]" style={{ color: "oklch(0.65 0.16 25)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function WizardResultsPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<CountryMatch[]>([]);
  const [answers, setAnswers] = useState<Partial<WizardAnswers>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isPro, setIsPro] = useState(false);

  // auth (unchanged)
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data } = await supabase
          .from("profiles").select("is_pro").eq("id", session.user.id).single();
        setIsPro(data?.is_pro ?? false);
      }
    });
  }, []);

  // load + animate (unchanged)
  useEffect(() => {
    const raw = sessionStorage.getItem("wizardMatches");
    const answersRaw = sessionStorage.getItem("wizardAnswers");
    if (!raw) { router.push("/wizard"); return; }
    try {
      setMatches(JSON.parse(raw));
      if (answersRaw) setAnswers(JSON.parse(answersRaw));
    } catch { router.push("/wizard"); return; }

    let progress = 0, stepIndex = 0;
    const interval = setInterval(() => {
      progress += 2;
      setLoadingProgress(progress);
      if (progress % 20 === 0 && stepIndex < LOADING_STEPS.length - 1) {
        stepIndex++;
        setLoadingStep(stepIndex);
      }
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsLoading(false);
          setTimeout(() => setRevealed(true), 100);
        }, 400);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [router]);

  // persist results (unchanged)
  useEffect(() => {
    if (!isLoading && matches.length > 0 && user) {
      const save = async () => {
        try {
          const topCountries = matches.slice(0, 25).map((m) => ({
            slug: m.country.slug, name: m.country.name, flagEmoji: m.country.flagEmoji,
            matchPercent: m.matchPercent, reasons: m.reasons,
          }));
          const { data: existing } = await supabase
            .from("wizard_results").select("id").eq("user_id", user.id).maybeSingle();
          if (existing) {
            await supabase.from("wizard_results")
              .update({ top_countries: topCountries, answers, created_at: new Date().toISOString() })
              .eq("id", existing.id);
          } else {
            await supabase.from("wizard_results")
              .insert({ user_id: user.id, top_countries: topCountries, answers, created_at: new Date().toISOString() });
          }
        } catch (err) { console.error("Failed to save:", err); }
      };
      save();
    }
  }, [isLoading, matches, user, answers]);

  const handleViewOnGlobe = () => {
    sessionStorage.setItem("highlightedCountries", JSON.stringify(matches.slice(0, 3).map((m) => m.country.slug)));
    sessionStorage.setItem("wizardMatches", JSON.stringify(matches));
    router.push("/");
  };

  // derived (unchanged)
  const jobRoleDef       = JOB_ROLES.find((r) => r.key === answers.jobRole);
  const visibleMatches   = isPro ? matches.slice(0, 25) : matches.slice(0, 3);
  const compareHref      = matches.length >= 3
    ? `/compare?a=${matches[0].country.slug}&b=${matches[1].country.slug}&c=${matches[2].country.slug}`
    : "/compare";
  const matchSlugs       = matches.map((m) => m.country.slug);
  const excludedCountries = matches.length > 0 ? computeExcluded(matchSlugs, answers) : [];

  // ── loading screen ────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6"
        style={{ background: "oklch(0.13 0.005 240)" }}
      >
        {/* film grain */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23g)' opacity='0.4'/%3E%3C/svg%3E")`,
            opacity: 0.015,
          }}
        />
        <div className="w-full max-w-xs space-y-8 relative">
          <div
            className="w-14 h-14 flex items-center justify-center"
            style={{ border: "1px solid oklch(1 0 0 / 0.08)", borderRadius: "2px" }}
          >
            <Globe2
              className="w-7 h-7"
              style={{ color: "oklch(0.86 0.18 175)", animation: "spin 3s linear infinite" }}
            />
          </div>
          <div className="space-y-2">
            <p
              className="font-mono text-[9px] uppercase tracking-[0.25em]"
              style={{ color: "oklch(0.86 0.18 175)" }}
            >
              Origio · Relocation Engine
            </p>
            <h2
              className="font-serif text-[32px] leading-[0.95]"
              style={{ color: "oklch(0.96 0.012 95)" }}
            >
              Ranking 25 countries
            </h2>
            <p
              key={loadingStep}
              className="font-mono text-[11px]"
              style={{ color: "oklch(0.96 0.012 95 / 0.4)" }}
            >
              {LOADING_STEPS[loadingStep]}
            </p>
          </div>
          <div
            className="w-full h-px"
            style={{ background: "oklch(1 0 0 / 0.08)" }}
          >
            <div
              className="h-full transition-all duration-100"
              style={{ width: loadingProgress + "%", background: "oklch(0.86 0.18 175)" }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (matches.length === 0) return null;

  const top       = matches[0];
  const cs        = getCurrencySymbol(top.country.currency);
  const topSalary = jobRoleDef ? (top.country.data[jobRoleDef.salaryKey] as number) : null;
  const grossSalary = jobRoleDef ? (top.country.data[jobRoleDef.salaryKey] as number) : 0;
  const netMonthly  = Math.round(grossSalary * (1 - top.country.data.incomeTaxRateMid / 100) / 12);
  const answerCount = Object.keys(answers).filter((k) => answers[k as keyof WizardAnswers] !== undefined).length;

  // rank offset helpers for top-3 off-grid
  const CARD_OFFSETS = ["mt-0", "mt-20", "mt-10"] as const;
  const CARD_ROTATES = ["rotate-0", "rotate-[0.4deg]", "rotate-[-0.6deg]"] as const;

  return (
    <div
      className="min-h-screen"
      style={{
        background: "oklch(0.13 0.005 240)",
        color: "oklch(0.96 0.012 95)",
        opacity: revealed ? 1 : 0,
        transform: revealed ? "translateY(0)" : "translateY(14px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}
    >
      {/* ── film grain overlay ─────────────────────────────────────────────── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23g)' opacity='0.4'/%3E%3C/svg%3E")`,
          opacity: 0.015,
        }}
      />

      {/* ── nav ───────────────────────────────────────────────────────────── */}
      <nav
        className="flex items-center justify-between px-6 py-4 relative z-10"
        style={{ borderBottom: "1px solid oklch(1 0 0 / 0.08)" }}
      >
        <button
          onClick={() => router.push("/wizard")}
          className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] transition-colors"
          style={{ color: "oklch(0.96 0.012 95 / 0.4)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "oklch(0.96 0.012 95)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "oklch(0.96 0.012 95 / 0.4)")}
        >
          <ArrowLeft className="w-3 h-3" />
          Retake
        </button>

        <Link href="/" className="flex items-center gap-2 group">
          <div
            className="w-2.5 h-2.5"
            style={{ background: "oklch(0.86 0.18 175)", borderRadius: "1px" }}
          />
          <span
            className="font-serif text-[15px] italic"
            style={{ color: "oklch(0.96 0.012 95)" }}
          >
            Origio
          </span>
        </Link>

        <button
          onClick={handleViewOnGlobe}
          className="font-mono text-[9px] uppercase tracking-[0.2em] transition-colors"
          style={{ color: "oklch(0.96 0.012 95 / 0.4)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "oklch(0.96 0.012 95)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "oklch(0.96 0.012 95 / 0.4)")}
        >
          Globe
        </button>
      </nav>

      <div className="max-w-[1200px] mx-auto px-6 relative z-10">

        {/* ══ SECTION 1 · HERO (asymmetric 7/12 + 5/12) ══════════════════════ */}
        <section
          className="pt-20 pb-16"
          style={{ borderBottom: "1px solid oklch(1 0 0 / 0.08)" }}
        >
          <div className="grid lg:grid-cols-[7fr_5fr] gap-14 items-start">

            {/* left — headline */}
            <div>
              {/* eyebrow */}
              <p
                className="font-mono text-[10px] uppercase tracking-[0.25em] mb-7"
                style={{ color: "oklch(0.96 0.012 95 / 0.4)" }}
              >
                Your Results
                {" · "}
                {answerCount} answers
                {" · "}
                25 countries ranked
                {jobRoleDef && ` · ${jobRoleDef.label}`}
              </p>

              {/* display headline */}
              <div className="relative inline-block mb-2">
                <h1
                  className="font-serif leading-[0.95]"
                  style={{
                    fontSize: "clamp(44px, 6vw, 72px)",
                    color: "oklch(0.96 0.012 95)",
                    fontWeight: 400,
                  }}
                >
                  You belong in{" "}
                  <span style={{ color: "oklch(0.86 0.18 175)", fontStyle: "italic" }}>
                    {top.country.name}.
                  </span>
                </h1>
                {/* hand-drawn scribble under country name */}
                <div className="absolute bottom-[-4px] right-0">
                  <ScribbleUnderline width={Math.min(180, top.country.name.length * 13 + 20)} />
                </div>
                {/* arrow pointing right to winner card */}
                <div className="hidden lg:block">
                  <AnnotationArrow />
                </div>
              </div>

              {/* subhead */}
              <p
                className="font-serif italic text-[18px] mt-6 leading-[1.4]"
                style={{ color: "oklch(0.96 0.012 95 / 0.55)" }}
              >
                {top.matchPercent}% match based on your priorities.
                {top.reasons.length > 0 && ` Strongest signal: ${top.reasons[0].toLowerCase()}.`}
              </p>

              {/* stat row */}
              {topSalary && (
                <div
                  className="flex flex-wrap gap-x-4 gap-y-1 mt-6"
                >
                  {[
                    `${cs}${topSalary.toLocaleString()} / yr`,
                    `Visa: ${getVisaLabel(top.country.data.visaDifficulty)}`,
                    `${cs}${top.country.data.costRentCityCentre.toLocaleString()} / mo rent`,
                    top.country.language,
                    `${top.country.data.incomeTaxRateMid}% tax`,
                  ].map((stat, i) => (
                    <span
                      key={i}
                      className="font-mono text-[11px]"
                      style={{ color: "oklch(0.96 0.012 95 / 0.4)" }}
                    >
                      {stat}
                      {i < 4 && (
                        <span style={{ color: "oklch(1 0 0 / 0.15)", marginLeft: "1rem" }}>·</span>
                      )}
                    </span>
                  ))}
                </div>
              )}

              {/* reason tags */}
              {top.reasons.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-5">
                  {top.reasons.map((r) => (
                    <span
                      key={r}
                      className="font-mono text-[9px] uppercase tracking-[0.2em] px-2.5 py-1"
                      style={{
                        border: "1px solid oklch(0.86 0.18 175 / 0.3)",
                        color: "oklch(0.86 0.18 175 / 0.8)",
                        borderRadius: "2px",
                      }}
                    >
                      {r}
                    </span>
                  ))}
                </div>
              )}

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 mt-8">
                <Link
                  href={`/country/${top.country.slug}/personalised`}
                  className="font-mono text-[9px] uppercase tracking-[0.2em] px-6 py-3 transition-opacity"
                  style={{
                    background: "oklch(0.86 0.18 175)",
                    color: "oklch(0.13 0.005 240)",
                    borderRadius: "2px",
                  }}
                >
                  Full report →
                </Link>
                <button
                  onClick={handleViewOnGlobe}
                  className="font-mono text-[9px] uppercase tracking-[0.2em] px-6 py-3 transition-colors"
                  style={{
                    border: "1px solid oklch(1 0 0 / 0.15)",
                    color: "oklch(0.96 0.012 95 / 0.55)",
                    borderRadius: "2px",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "oklch(0.96 0.012 95)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "oklch(0.96 0.012 95 / 0.55)")}
                >
                  See on globe
                </button>
              </div>

              <TakeHomeCard match={top} jobRoleDef={jobRoleDef} isPro={isPro} />

              {!user && (
                <EmailCapture
                  topCountry={top.country.name}
                  topCountryFlag={top.country.flagEmoji}
                  matchPercent={top.matchPercent}
                  jobRole={jobRoleDef?.label ?? ""}
                  grossSalary={grossSalary}
                  netMonthly={netMonthly}
                  taxRate={top.country.data.incomeTaxRateMid}
                  rentCost={top.country.data.costRentCityCentre}
                  visaLabel={getVisaLabel(top.country.data.visaDifficulty)}
                  currency={cs}
                />
              )}
            </div>

            {/* right — winner card (tilted) */}
            <div className="lg:sticky lg:top-8 mt-4 lg:mt-14">
              <div
                className="relative"
                style={{ transform: "rotate(-0.6deg)" }}
              >
                {/* tape label overlapping top-right */}
                <div className="absolute -top-3 -right-3 z-10">
                  <TapeLabel rotate="-1.5deg">#1 Match</TapeLabel>
                </div>

                <ReceiptScoreCard
                  match={top}
                  answers={answers}
                  jobRoleDef={jobRoleDef}
                  rank={1}
                  excludedCountries={excludedCountries}
                />

                {/* big flag behind the card */}
                <div
                  className="absolute -bottom-4 -right-4 text-[80px] leading-none pointer-events-none select-none"
                  style={{ opacity: 0.08, zIndex: -1 }}
                  aria-hidden
                >
                  {top.country.flagEmoji}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ SECTION 2 · TOP 3 — off-grid ════════════════════════════════════ */}
        <section
          className="py-16"
          style={{ borderBottom: "1px solid oklch(1 0 0 / 0.08)" }}
        >
          {/* eyebrow */}
          <p
            className="font-mono text-[10px] uppercase tracking-[0.25em] mb-2"
            style={{ color: "oklch(0.96 0.012 95 / 0.35)" }}
          >
            Top countries
          </p>
          <h2
            className="font-serif text-[28px] leading-[0.95] mb-12"
            style={{ color: "oklch(0.96 0.012 95)", fontWeight: 400 }}
          >
            Your top three matches
          </h2>

          {/* off-grid 3 cards */}
          <div className="grid sm:grid-cols-3 items-start gap-5">
            {matches.slice(0, 3).map((m, i) => {
              const mcs  = getCurrencySymbol(m.country.currency);
              const sal  = jobRoleDef ? (m.country.data[jobRoleDef.salaryKey] as number) : null;
              const isFirst = i === 0;
              return (
                <div
                  key={m.country.slug}
                  className={`relative ${CARD_OFFSETS[i]} ${CARD_ROTATES[i]}`}
                  style={{ borderRadius: "2px" }}
                >
                  {/* tape label on card #3 only */}
                  {i === 2 && (
                    <div className="absolute -top-3 -right-2 z-10">
                      <TapeLabel rotate="1.2deg">Top Pick</TapeLabel>
                    </div>
                  )}

                  <div
                    style={{
                      border: "1px solid oklch(1 0 0 / 0.1)",
                      borderRadius: "2px",
                      background: isFirst ? "oklch(0.11 0.005 240)" : "oklch(0.10 0.005 240)",
                      padding: "1.5rem",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* huge ghost rank numeral */}
                    <div
                      className="absolute top-2 right-3 font-mono leading-none select-none pointer-events-none"
                      style={{
                        fontSize: "clamp(60px, 8vw, 96px)",
                        color: "oklch(0.96 0.012 95 / 0.05)",
                        fontWeight: 700,
                      }}
                      aria-hidden
                    >
                      {i + 1}
                    </div>

                    {/* rank eyebrow */}
                    <p
                      className="font-mono text-[9px] uppercase tracking-[0.3em] mb-3"
                      style={{ color: "oklch(0.86 0.18 175 / 0.7)" }}
                    >
                      Rank {String(i + 1).padStart(2, "0")}
                    </p>

                    {/* flag + country */}
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-3xl">{m.country.flagEmoji}</span>
                      <h3
                        className="font-serif leading-tight"
                        style={{
                          fontSize: "clamp(20px, 2.5vw, 26px)",
                          color: "oklch(0.96 0.012 95)",
                          fontWeight: 400,
                        }}
                      >
                        {m.country.name}
                      </h3>
                    </div>

                    {/* match % */}
                    <p
                      className="font-mono text-[22px] font-bold mb-4"
                      style={{ color: matchPercentColor(m.matchPercent) }}
                    >
                      {m.matchPercent}%
                      <span
                        className="text-[10px] uppercase tracking-[0.2em] ml-1.5 font-normal"
                        style={{ color: "oklch(0.96 0.012 95 / 0.35)" }}
                      >
                        match
                      </span>
                    </p>

                    {/* salary + visa */}
                    {sal && (
                      <p
                        className="font-mono text-[10px] mb-4"
                        style={{ color: "oklch(0.96 0.012 95 / 0.4)" }}
                      >
                        {mcs}{sal.toLocaleString()}/yr
                        <span style={{ color: "oklch(1 0 0 / 0.15)", margin: "0 8px" }}>·</span>
                        {getVisaLabel(m.country.data.visaDifficulty)} visa
                      </p>
                    )}

                    {/* inline score breakdown (4 key scores as tick bars) */}
                    <div
                      className="space-y-2 py-3"
                      style={{ borderTop: "1px solid oklch(1 0 0 / 0.08)" }}
                    >
                      {(() => {
                        const s = computeScoreBreakdown(m.country, answers, jobRoleDef);
                        const keys = ["salary", "affordability", "tax", "visa"] as const;
                        return keys.map((k) => (
                          <div key={k} className="grid gap-2 items-center" style={{ gridTemplateColumns: "5rem 1fr auto" }}>
                            <span
                              className="font-mono text-[9px] uppercase tracking-[0.12em]"
                              style={{ color: "oklch(0.96 0.012 95 / 0.35)" }}
                            >
                              {s[k].label}
                            </span>
                            <TickBar value={s[k].value} />
                            <span
                              className="font-mono text-[10px]"
                              style={{ color: "oklch(0.96 0.012 95 / 0.5)" }}
                            >
                              {s[k].value.toFixed(0)}
                            </span>
                          </div>
                        ));
                      })()}
                    </div>

                    {/* rent + report link */}
                    <div
                      className="flex items-center justify-between mt-3 pt-3"
                      style={{ borderTop: "1px solid oklch(1 0 0 / 0.08)" }}
                    >
                      <span
                        className="font-mono text-[10px]"
                        style={{ color: "oklch(0.96 0.012 95 / 0.3)" }}
                      >
                        {mcs}{m.country.data.costRentCityCentre.toLocaleString()}/mo rent
                      </span>
                      <Link
                        href={`/country/${m.country.slug}/personalised`}
                        className="font-mono text-[9px] uppercase tracking-[0.2em] transition-colors"
                        style={{ color: "oklch(0.86 0.18 175 / 0.7)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "oklch(0.86 0.18 175)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "oklch(0.86 0.18 175 / 0.7)")}
                      >
                        Report →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* compare CTA */}
          <div className="mt-16 pl-1">
            <p
              className="font-serif italic text-[18px] mb-3"
              style={{ color: "oklch(0.96 0.012 95 / 0.5)", fontWeight: 400 }}
            >
              Want to compare your top 3 side by side?
            </p>
            <div className="flex items-center gap-4">
              <Link
                href={compareHref}
                className="font-mono text-[9px] uppercase tracking-[0.2em] px-6 py-3"
                style={{
                  background: "oklch(0.86 0.18 175)",
                  color: "oklch(0.13 0.005 240)",
                  borderRadius: "2px",
                }}
              >
                Compare →
              </Link>
              <span
                className="font-mono text-[9px] uppercase tracking-[0.15em]"
                style={{ color: "oklch(0.96 0.012 95 / 0.3)" }}
              >
                free · no signup
              </span>
            </div>
          </div>
        </section>

        {/* ══ SECTION 3 · AT A GLANCE ══════════════════════════════════════════ */}
        <section
          className="py-14"
          style={{ borderBottom: "1px solid oklch(1 0 0 / 0.08)" }}
        >
          <p
            className="font-mono text-[10px] uppercase tracking-[0.25em] mb-10"
            style={{ color: "oklch(0.96 0.012 95 / 0.35)" }}
          >
            At a glance
          </p>
          <div
            className="grid sm:grid-cols-2 gap-px"
            style={{ background: "oklch(1 0 0 / 0.06)" }}
          >
            {[
              {
                label: "Best salary · top 3",
                value: (() => {
                  if (!jobRoleDef) return "—";
                  const best = [...matches.slice(0, 3)].sort(
                    (a, b) => (b.country.data[jobRoleDef.salaryKey] as number) - (a.country.data[jobRoleDef.salaryKey] as number)
                  )[0];
                  const bcs = getCurrencySymbol(best.country.currency);
                  return `${best.country.flagEmoji} ${best.country.name} · ${bcs}${(best.country.data[jobRoleDef.salaryKey] as number).toLocaleString()}/yr`;
                })(),
              },
              {
                label: "Easiest visa · top 3",
                value: (() => {
                  const easiest = [...matches.slice(0, 3)].sort(
                    (a, b) => a.country.data.visaDifficulty - b.country.data.visaDifficulty
                  )[0];
                  return `${easiest.country.flagEmoji} ${easiest.country.name} · ${getVisaLabel(easiest.country.data.visaDifficulty)}`;
                })(),
              },
              {
                label: "Lowest rent · top 3",
                value: (() => {
                  const cheapest = [...matches.slice(0, 3)].sort(
                    (a, b) => a.country.data.costRentCityCentre - b.country.data.costRentCityCentre
                  )[0];
                  const lcs = getCurrencySymbol(cheapest.country.currency);
                  return `${cheapest.country.flagEmoji} ${cheapest.country.name} · ${lcs}${cheapest.country.data.costRentCityCentre.toLocaleString()}/mo`;
                })(),
              },
              {
                label: "Safest · top 3",
                value: (() => {
                  const safest = [...matches.slice(0, 3)].sort(
                    (a, b) => b.country.data.scoreSafety - a.country.data.scoreSafety
                  )[0];
                  return `${safest.country.flagEmoji} ${safest.country.name} · ${safest.country.data.scoreSafety}/10`;
                })(),
              },
            ].map((item) => (
              <div
                key={item.label}
                className="px-6 py-5"
                style={{ background: "oklch(0.13 0.005 240)" }}
              >
                <p
                  className="font-mono text-[9px] uppercase tracking-[0.25em] mb-2"
                  style={{ color: "oklch(0.96 0.012 95 / 0.35)" }}
                >
                  {item.label}
                </p>
                <p
                  className="font-mono text-[13px] font-bold"
                  style={{ color: "oklch(0.96 0.012 95)" }}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ══ SECTION 4 · FULL RANKING (4–25, pro-locked) ═══════════════════ */}
        <section className="py-14 pb-24">
          <div
            className="flex items-baseline justify-between mb-8"
          >
            <div>
              <p
                className="font-mono text-[10px] uppercase tracking-[0.25em] mb-1"
                style={{ color: "oklch(0.96 0.012 95 / 0.35)" }}
              >
                Full ranking{jobRoleDef ? ` · ${jobRoleDef.label}` : ""}
              </p>
              <h2
                className="font-serif text-[24px] leading-[0.95]"
                style={{ color: "oklch(0.96 0.012 95)", fontWeight: 400 }}
              >
                All 25 countries
              </h2>
            </div>
            <span
              className="font-mono text-[11px]"
              style={{ color: "oklch(0.96 0.012 95 / 0.3)" }}
            >
              {visibleMatches.length} / 25
            </span>
          </div>

          <div>
            {visibleMatches.map((match, i) => {
              const mcs    = getCurrencySymbol(match.country.currency);
              const salary = jobRoleDef ? (match.country.data[jobRoleDef.salaryKey] as number) : null;
              const isTop3 = i < 3;

              // progressive fade for 4-8
              const fadeOpacity = i < 3 ? 1 : i < 5 ? 0.9 : i < 6 ? 0.75 : i < 7 ? 0.55 : i < 8 ? 0.35 : 1;

              return (
                <div
                  key={match.country.slug}
                  style={{
                    borderBottom: "1px solid oklch(1 0 0 / 0.07)",
                    opacity: fadeOpacity,
                  }}
                >
                  <Link
                    href={`/country/${match.country.slug}/personalised`}
                    className="flex items-center gap-4 py-3.5 px-3 -mx-3 transition-colors group"
                    style={{ borderRadius: "2px" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "oklch(1 0 0 / 0.03)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* rank */}
                    <span
                      className="font-mono text-[11px] font-bold w-7 text-right flex-shrink-0"
                      style={{
                        color: isTop3
                          ? "oklch(0.86 0.18 175)"
                          : "oklch(1 0 0 / 0.2)",
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    {/* flag */}
                    <span className="text-xl flex-shrink-0">{match.country.flagEmoji}</span>

                    {/* country + meta */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-serif text-[15px] leading-tight truncate"
                        style={{ color: "oklch(0.96 0.012 95)", fontWeight: 400 }}
                      >
                        {match.country.name}
                      </p>
                      {salary && (
                        <p
                          className="font-mono text-[10px] mt-0.5 truncate"
                          style={{ color: "oklch(0.96 0.012 95 / 0.3)" }}
                        >
                          {mcs}{salary.toLocaleString()}/yr
                          <span style={{ margin: "0 6px", color: "oklch(1 0 0 / 0.12)" }}>·</span>
                          {getVisaLabel(match.country.data.visaDifficulty)} visa
                          <span style={{ margin: "0 6px", color: "oklch(1 0 0 / 0.12)" }}>·</span>
                          {mcs}{match.country.data.costRentCityCentre.toLocaleString()}/mo rent
                        </p>
                      )}
                    </div>

                    {/* match % */}
                    <span
                      className="font-mono text-[13px] font-bold flex-shrink-0"
                      style={{ color: matchPercentColor(match.matchPercent) }}
                    >
                      {match.matchPercent}%
                    </span>
                  </Link>

                  {/* score toggle for non-top-3 */}
                  {i >= 3 && (
                    <div className="px-3 pb-3 -mt-1">
                      <ScoreToggle
                        match={match}
                        answers={answers}
                        jobRoleDef={jobRoleDef}
                        rank={i + 1}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* pro lock — tilted card */}
          {!isPro && (
            <div className="mt-0">
              {/* fade-out ghost rows */}
              <div className="relative overflow-hidden" style={{ height: 90 }}>
                {[visibleMatches.length + 1, visibleMatches.length + 2].map((n, i) => (
                  <div
                    key={n}
                    className="flex items-center gap-4 py-4 px-3"
                    style={{
                      borderBottom: "1px solid oklch(1 0 0 / 0.07)",
                      opacity: i === 0 ? 0.3 : 0.12,
                    }}
                  >
                    <span className="font-mono text-[11px] font-bold w-7 text-right" style={{ color: "oklch(1 0 0 / 0.2)" }}>
                      {String(n).padStart(2, "0")}
                    </span>
                    <span className="text-xl">🌍</span>
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-28 rounded-sm" style={{ background: "oklch(1 0 0 / 0.08)" }} />
                      <div className="h-2 w-40 rounded-sm" style={{ background: "oklch(1 0 0 / 0.05)" }} />
                    </div>
                    <div className="h-3 w-8 rounded-sm" style={{ background: "oklch(1 0 0 / 0.08)" }} />
                  </div>
                ))}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: "linear-gradient(to bottom, transparent 0%, oklch(0.13 0.005 240) 85%)" }}
                />
              </div>

              {/* unlock card — slight tilt */}
              <div
                className="mt-6"
                style={{ transform: "rotate(0.3deg)" }}
              >
                <div
                  className="flex items-center justify-between p-5"
                  style={{
                    border: "1px solid oklch(1 0 0 / 0.1)",
                    borderRadius: "2px",
                  }}
                >
                  <div>
                    <p
                      className="font-mono text-[9px] uppercase tracking-[0.25em] mb-1"
                      style={{ color: "oklch(0.96 0.012 95 / 0.35)" }}
                    >
                      Locked
                    </p>
                    <p
                      className="font-serif text-[20px] leading-tight"
                      style={{ color: "oklch(0.96 0.012 95)", fontWeight: 400 }}
                    >
                      Unlock {25 - visibleMatches.length} more countries
                    </p>
                    <p
                      className="font-mono text-[10px] mt-1"
                      style={{ color: "oklch(0.96 0.012 95 / 0.35)" }}
                    >
                      Full ranking · €19.99 once
                    </p>
                  </div>
                  <Link
                    href="/pro"
                    className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] px-5 py-3"
                    style={{
                      background: "oklch(0.86 0.18 175)",
                      color: "oklch(0.13 0.005 240)",
                      borderRadius: "2px",
                    }}
                  >
                    <Lock className="w-3 h-3" />
                    Get Pro
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* pro footer */}
          {isPro && matches.length >= 3 && (
            <div
              className="mt-8 pt-6 flex items-center justify-between"
              style={{ borderTop: "1px solid oklch(1 0 0 / 0.08)" }}
            >
              <p
                className="font-mono text-[10px] uppercase tracking-[0.2em]"
                style={{ color: "oklch(0.96 0.012 95 / 0.3)" }}
              >
                All 25 countries ranked
              </p>
              <Link
                href={compareHref}
                className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] transition-colors"
                style={{ color: "oklch(0.96 0.012 95 / 0.45)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "oklch(0.86 0.18 175)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "oklch(0.96 0.012 95 / 0.45)")}
              >
                Compare top 3 <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}