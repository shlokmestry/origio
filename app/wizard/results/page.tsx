"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Globe2, Sparkles, ArrowRight, ChevronDown, ChevronUp, X, Lock } from "lucide-react";
import { CountryMatch, WizardAnswers } from "@/lib/wizard";
import { JOB_ROLES, CountryWithData } from "@/types";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

const LOADING_STEPS = [
  "Crunching salary data...",
  "Checking visa routes...",
  "Weighing your priorities...",
  "Ranking 25 countries...",
  "Almost done...",
];

const RANK_COLORS = ["#00ffd5", "#facc15", "#a78bfa"];

function matchPercentColor(pct: number): string {
  if (pct >= 90) return "#4ade80";
  if (pct >= 75) return "#facc15";
  return "#888880";
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

function computeScoreBreakdown(country: CountryWithData, answers: Partial<WizardAnswers>, jobRoleDef: typeof JOB_ROLES[0] | undefined) {
  const data = country.data;
  const rentUSD = toUSD(data.costRentCityCentre, country.currency);
  const salaryRaw = jobRoleDef ? data[jobRoleDef.salaryKey] as number : data.salarySoftwareEngineer;
  const salaryUSD = toUSD(salaryRaw, country.currency);

  const scores = {
    salary:       { label: "Salary",        value: normalise(salaryUSD, 25000, 200000), desc: `${getCurrencySymbol(country.currency)}${salaryRaw.toLocaleString()}/yr` },
    affordability:{ label: "Affordability", value: 10 - normalise(rentUSD, 300, 4000),  desc: `${getCurrencySymbol(country.currency)}${data.costRentCityCentre.toLocaleString()}/mo rent` },
    tax:          { label: "Tax efficiency", value: 10 - normalise(data.incomeTaxRateMid, 0, 55), desc: `${data.incomeTaxRateMid}% income tax` },
    safety:       { label: "Safety",         value: data.scoreSafety,                    desc: `${data.scoreSafety}/10 safety score` },
    quality:      { label: "Quality of life",value: data.scoreQualityOfLife,             desc: `${data.scoreQualityOfLife}/10 QoL score` },
    visa:         { label: "Visa access",    value: 10 - data.visaDifficulty * 2,        desc: getVisaLabel(data.visaDifficulty) + " visa process" },
  };

  return scores;
}

function generateSummary(
  match: CountryMatch,
  answers: Partial<WizardAnswers>,
  scores: ReturnType<typeof computeScoreBreakdown>,
  rank: number
): string {
  const name = match.country.name;
  const entries = Object.entries(scores).sort((a, b) => b[1].value - a[1].value);
  const top2 = entries.slice(0, 2).map(([, v]) => v.label.toLowerCase());
  const bottom1 = entries[entries.length - 1];
  const rankWord = rank === 1 ? "your top match" : rank === 2 ? "your second match" : `#${rank}`;
  let summary = `${name} is ${rankWord} because it scores strongly on ${top2[0]} and ${top2[1]} for your profile.`;
  if (bottom1[1].value < 4) {
    summary += ` The main trade-off is ${bottom1[1].label.toLowerCase()} — ${bottom1[1].desc}.`;
  }
  if (answers.moveReason === "retire") {
    summary += ` Strong fit for retirement given its cost and tax profile.`;
  } else if (answers.moveReason === "remote") {
    summary += ` Internet speeds and nomad visa availability make it a solid remote work base.`;
  }
  return summary;
}

function ScoreBar({ label, value, desc }: { label: string; value: number; desc: string }) {
  const pct = (value / 10) * 100;
  const color = value >= 7 ? "#00ffd5" : value >= 5 ? "#facc15" : "#ef4444";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#888880]">{label}</span>
        <span className="text-[10px] font-bold" style={{ color }}>{value.toFixed(1)}/10</span>
      </div>
      <div className="h-1 bg-[#1a1a1a] w-full">
        <div className="h-full transition-all duration-700 ease-out" style={{ width: pct + "%", backgroundColor: color }} />
      </div>
      <p className="text-[9px] text-[#444] font-medium">{desc}</p>
    </div>
  );
}

// ── Email Capture Component ───────────────────────────────────────────────
function EmailCapture() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!email || !email.includes("@")) {
      setError("Enter a valid email.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "quiz_results" }),
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
      <div className="border border-accent/30 bg-[#0d0d0d] p-5 mt-8">
        <p className="text-[11px] font-bold text-accent uppercase tracking-widest">
          ✓ Saved — check your inbox for the full breakdown
        </p>
      </div>
    );
  }

  return (
    <div className="border border-[#2a2a2a] bg-[#0d0d0d] p-5 mt-8 space-y-3">
      <div>
        <p className="text-[11px] font-bold text-[#f0f0e8] uppercase tracking-widest mb-1">
          Save your results
        </p>
        <p className="text-[10px] text-[#888880]">
          Get your full salary breakdown sent to your inbox. No spam, one email.
        </p>
      </div>
      <div className="flex gap-2">
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="flex-1 bg-[#111] border border-[#2a2a2a] px-3 py-2.5 text-[11px] text-[#f0f0e8] placeholder-[#444] focus:outline-none focus:border-accent transition-colors"
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-5 py-2.5 text-[10px] font-extrabold uppercase tracking-widest bg-accent text-[#0a0a0a] disabled:opacity-50 flex-shrink-0"
          style={{ boxShadow: "2px 2px 0 #00aa90" }}
        >
          {loading ? "..." : "Save"}
        </button>
      </div>
      {error && (
        <p className="text-[10px] text-[#ef4444]">{error}</p>
      )}
    </div>
  );
}

function WhyCard({
  match, answers, jobRoleDef, rank, excludedCountries,
}: {
  match: CountryMatch;
  answers: Partial<WizardAnswers>;
  jobRoleDef: typeof JOB_ROLES[0] | undefined;
  rank: number;
  excludedCountries: { name: string; reason: string }[];
}) {
  const scores = computeScoreBreakdown(match.country, answers, jobRoleDef);
  const summary = generateSummary(match, answers, scores, rank);

  return (
    <div className="border border-[#2a2a2a] bg-[#0d0d0d] p-6 space-y-6 h-fit" style={{ boxShadow: "4px 4px 0 #00ffd520" }}>
      <div>
        <p className="text-[9px] font-bold text-accent uppercase tracking-[0.2em] mb-2">Why this match?</p>
        <p className="text-[11px] text-[#888880] leading-relaxed">{summary}</p>
      </div>
      <div className="space-y-3 border-t border-[#1a1a1a] pt-5">
        <p className="text-[9px] font-bold text-[#444] uppercase tracking-widest mb-3">Score breakdown</p>
        {Object.values(scores).map((s) => (
          <ScoreBar key={s.label} label={s.label} value={s.value} desc={s.desc} />
        ))}
      </div>
      {excludedCountries.length > 0 && (
        <div className="border-t border-[#1a1a1a] pt-5">
          <p className="text-[9px] font-bold text-[#444] uppercase tracking-widest mb-3">Filtered out</p>
          <div className="space-y-2">
            {excludedCountries.slice(0, 5).map((c) => (
              <div key={c.name} className="flex items-start gap-2">
                <X className="w-3 h-3 text-[#ef4444] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-[#f0f0e8]">{c.name}</span>
                  <span className="text-[10px] text-[#444]"> — {c.reason}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function WhyToggle({
  match, answers, jobRoleDef, rank,
}: {
  match: CountryMatch;
  answers: Partial<WizardAnswers>;
  jobRoleDef: typeof JOB_ROLES[0] | undefined;
  rank: number;
}) {
  const [open, setOpen] = useState(false);
  const scores = computeScoreBreakdown(match.country, answers, jobRoleDef);
  const summary = generateSummary(match, answers, scores, rank);

  return (
    <div className="mt-3">
      <button
        onClick={(e) => { e.preventDefault(); setOpen(!open); }}
        className="flex items-center gap-1.5 text-[10px] font-bold text-[#444] hover:text-[#888880] transition-colors uppercase tracking-widest"
      >
        Why this match? {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {open && (
        <div className="mt-3 pt-3 border-t border-[#1a1a1a] space-y-4">
          <p className="text-[10px] text-[#888880] leading-relaxed">{summary}</p>
          <div className="space-y-2.5">
            {Object.values(scores).map((s) => (
              <ScoreBar key={s.label} label={s.label} value={s.value} desc={s.desc} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function computeExcluded(allCountrySlugs: string[], matchSlugs: string[], answers: Partial<WizardAnswers>): { name: string; reason: string }[] {
  const dealBreakers = answers.dealBreakers ?? [];
  const excluded: { name: string; reason: string }[] = [];
  const REASON_MAP: Record<string, string> = {
    lowtax: "high income tax", lowcost: "high cost of living",
    europe: "not in Europe", english: "not English-speaking",
    warm: "cold climate", lowcrime: "crime rate too high",
    nomadvisa: "no digital nomad visa", healthcare: "weak public healthcare",
  };
  const SLUG_TO_NAME: Record<string, string> = {
    "australia": "Australia", "canada": "Canada", "norway": "Norway",
    "singapore": "Singapore", "switzerland": "Switzerland", "new-zealand": "New Zealand",
    "sweden": "Sweden", "germany": "Germany", "ireland": "Ireland",
    "united-kingdom": "United Kingdom", "netherlands": "Netherlands",
    "france": "France", "finland": "Finland", "belgium": "Belgium",
    "denmark": "Denmark", "austria": "Austria", "italy": "Italy",
    "usa": "USA", "japan": "Japan", "india": "India",
    "uae": "UAE", "brazil": "Brazil", "malaysia": "Malaysia",
    "portugal": "Portugal", "spain": "Spain", "poland": "Poland",
  };
  const current = (answers.currentCountry ?? answers.passport)?.toLowerCase().trim();
  if (current && SLUG_TO_NAME[current] && !matchSlugs.includes(current)) {
    excluded.push({ name: SLUG_TO_NAME[current], reason: "your current country" });
  }
  dealBreakers.forEach((db) => {
    if (db === "none") return;
    const reason = REASON_MAP[db] ?? db;
    if (db === "lowtax") {
      ["australia", "canada", "norway", "sweden", "germany", "ireland", "united-kingdom", "netherlands", "france", "finland", "belgium", "denmark", "austria", "italy", "new-zealand"]
        .filter((s) => !matchSlugs.includes(s) && SLUG_TO_NAME[s]).slice(0, 3)
        .forEach((s) => excluded.push({ name: SLUG_TO_NAME[s], reason }));
    }
    if (db === "lowcost") {
      ["singapore", "switzerland", "norway", "australia", "new-zealand", "ireland", "united-kingdom", "usa", "canada"]
        .filter((s) => !matchSlugs.includes(s) && SLUG_TO_NAME[s]).slice(0, 3)
        .forEach((s) => excluded.push({ name: SLUG_TO_NAME[s], reason }));
    }
    if (db === "europe") {
      ["australia", "canada", "usa", "uae", "singapore", "japan", "india", "brazil", "malaysia"]
        .filter((s) => !matchSlugs.includes(s) && SLUG_TO_NAME[s]).slice(0, 3)
        .forEach((s) => excluded.push({ name: SLUG_TO_NAME[s], reason }));
    }
  });
  const seen = new Set<string>();
  return excluded.filter((e) => { if (seen.has(e.name)) return false; seen.add(e.name); return true; });
}

// ── Take-home salary card ─────────────────────────────────────────────────
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

  return (
    <div className="mt-8 border-2 border-[#2a2a2a]" style={{ boxShadow: "4px 4px 0 #2a2a2a" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b-2 border-[#2a2a2a] bg-[#0d0d0d]">
        <p className="text-[10px] font-bold text-[#888880] uppercase tracking-[0.2em]">
          Estimated take-home · {jobRoleDef.label} · {match.country.name}
        </p>
        <span className="text-[10px] font-bold text-[#444] uppercase tracking-widest">
          {match.country.data.incomeTaxRateMid}% tax rate
        </span>
      </div>

      <div className="p-5 bg-[#0a0a0a]">
        <div className="space-y-0">
          {/* Gross */}
          <div className="flex items-center justify-between py-3 border-b border-[#1a1a1a]">
            <span className="text-[11px] font-bold text-[#888880] uppercase tracking-widest">Gross salary</span>
            <span className="font-heading text-base font-extrabold text-[#f0f0e8]">
              {cs}{gross.toLocaleString()}/yr
            </span>
          </div>

          {/* Tax */}
          <div className="flex items-center justify-between py-3 border-b border-[#1a1a1a]">
            <span className="text-[11px] font-bold text-[#888880] uppercase tracking-widest">
              Income tax ({match.country.data.incomeTaxRateMid}%)
            </span>
            <span className="font-heading text-base font-extrabold text-[#ef4444]">
              -{cs}{taxAmount.toLocaleString()}
            </span>
          </div>

          <div className="h-px bg-[#2a2a2a] my-1" />

          {/* Net annual */}
          <div className="flex items-center justify-between py-3 border-b border-[#1a1a1a]">
            <span className="text-[11px] font-bold text-[#f0f0e8] uppercase tracking-widest">Net annual</span>
            <span className="font-heading text-lg font-extrabold text-accent">
              {cs}{netAnnual.toLocaleString()}/yr
            </span>
          </div>

          {/* Net monthly */}
          <div className="flex items-center justify-between py-3 border-b border-[#1a1a1a]">
            <span className="text-[11px] font-bold text-[#f0f0e8] uppercase tracking-widest">Net monthly</span>
            <span className="font-heading text-lg font-extrabold text-accent">
              {cs}{netMonthly.toLocaleString()}/mo
            </span>
          </div>

          {/* Pro-locked rows */}
          <div className="relative">
            <div className={isPro ? "" : "blur-sm pointer-events-none select-none"}>
              <div className="flex items-center justify-between py-3 border-b border-[#1a1a1a]">
                <span className="text-[11px] font-bold text-[#888880] uppercase tracking-widest">Rent + groceries + transport</span>
                <span className="font-heading text-base font-extrabold text-[#ef4444]">
                  -{cs}{totalCosts.toLocaleString()}/mo
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-[11px] font-bold text-[#f0f0e8] uppercase tracking-widest">Disposable income</span>
                <span className="font-heading text-lg font-extrabold" style={{ color: disposable > 0 ? "#4ade80" : "#ef4444" }}>
                  {cs}{disposable.toLocaleString()}/mo
                </span>
              </div>
            </div>

            {!isPro && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]/60">
                <Link
                  href="/pro"
                  className="flex items-center gap-2 px-4 py-2 text-[10px] font-extrabold uppercase tracking-widest bg-accent text-[#0a0a0a]"
                  style={{ boxShadow: "2px 2px 0 #00aa90" }}
                >
                  <Lock className="w-3 h-3" />
                  Full breakdown → Pro
                </Link>
              </div>
            )}
          </div>
        </div>

        <p className="text-[9px] text-[#444] mt-4 leading-relaxed">
          * Estimate based on mid-bracket income tax rate. Social security, local taxes, and deductions vary. Verify with official sources before relocating.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
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

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data } = await supabase.from("profiles").select("is_pro").eq("id", session.user.id).single();
        setIsPro(data?.is_pro ?? false);
      }
    });
  }, []);

  useEffect(() => {
    const raw = sessionStorage.getItem("wizardMatches");
    const answersRaw = sessionStorage.getItem("wizardAnswers");
    if (!raw) { router.push("/wizard"); return; }
    try {
      setMatches(JSON.parse(raw));
      if (answersRaw) setAnswers(JSON.parse(answersRaw));
    } catch { router.push("/wizard"); return; }

    let progress = 0;
    let stepIndex = 0;
    const interval = setInterval(() => {
      progress += 2;
      setLoadingProgress(progress);
      if (progress % 20 === 0 && stepIndex < LOADING_STEPS.length - 1) { stepIndex++; setLoadingStep(stepIndex); }
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => { setIsLoading(false); setTimeout(() => setRevealed(true), 100); }, 400);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [router]);

  useEffect(() => {
    if (!isLoading && matches.length > 0 && user) {
      const save = async () => {
        try {
          const topCountries = matches.slice(0, 25).map(m => ({
            slug: m.country.slug, name: m.country.name,
            flagEmoji: m.country.flagEmoji, matchPercent: m.matchPercent, reasons: m.reasons,
          }));
          const { data: existing } = await supabase.from("wizard_results").select("id").eq("user_id", user.id).maybeSingle();
          if (existing) {
            await supabase.from("wizard_results").update({ top_countries: topCountries, answers, created_at: new Date().toISOString() }).eq("id", existing.id);
          } else {
            await supabase.from("wizard_results").insert({ user_id: user.id, top_countries: topCountries, answers, created_at: new Date().toISOString() });
          }
        } catch (err) { console.error("Failed to save:", err); }
      };
      save();
    }
  }, [isLoading, matches, user, answers]);

  const handleViewOnGlobe = () => {
    sessionStorage.setItem("highlightedCountries", JSON.stringify(matches.slice(0, 3).map(m => m.country.slug)));
    sessionStorage.setItem("wizardMatches", JSON.stringify(matches));
    router.push("/");
  };

  const jobRoleDef = JOB_ROLES.find(r => r.key === answers.jobRole);
  const visibleMatches = isPro ? matches.slice(0, 25) : matches.slice(0, 3);
  const compareHref = matches.length >= 3
    ? `/compare?a=${matches[0].country.slug}&b=${matches[1].country.slug}&c=${matches[2].country.slug}`
    : "/compare";
  const matchSlugs = matches.map(m => m.country.slug);
  const excludedCountries = matches.length > 0 ? computeExcluded(matchSlugs, matchSlugs, answers) : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-8">
          <div className="relative mx-auto w-20 h-20 border-2 border-[#2a2a2a] flex items-center justify-center">
            <Globe2 className="w-10 h-10 text-accent animate-spin" style={{ animationDuration: "3s" }} />
            <div className="absolute inset-0 border-2 border-accent animate-ping opacity-20" />
          </div>
          <div className="space-y-1">
            <h2 className="font-heading text-2xl font-extrabold text-[#f0f0e8] uppercase tracking-tight">Finding your country...</h2>
            <p key={loadingStep} className="text-[#888880] text-sm font-medium">{LOADING_STEPS[loadingStep]}</p>
          </div>
          <div className="w-full h-px bg-[#1a1a1a]">
            <div className="h-full bg-accent transition-all duration-100 ease-linear" style={{ width: loadingProgress + "%" }} />
          </div>
        </div>
      </div>
    );
  }

  if (matches.length === 0) return null;

  const top = matches[0];
  const pctColor = matchPercentColor(top.matchPercent);
  const cs = getCurrencySymbol(top.country.currency);
  const topSalary = jobRoleDef ? top.country.data[jobRoleDef.salaryKey] as number : null;

  return (
    <div
      className="min-h-screen bg-[#0a0a0a] text-[#f0f0e8]"
      style={{ opacity: revealed ? 1 : 0, transform: revealed ? "translateY(0)" : "translateY(16px)", transition: "opacity 0.5s ease, transform 0.5s ease" }}
    >
      {/* Nav */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a]">
        <button onClick={() => router.push("/wizard")}
          className="flex items-center gap-1.5 text-[11px] font-bold text-[#888880] hover:text-[#f0f0e8] transition-colors uppercase tracking-widest">
          <ArrowLeft className="w-3.5 h-3.5" /> Retake
        </button>
        <a href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
          <div className="w-3 h-3 bg-accent border-2 border-[#f0f0e8]" />
          <span className="font-heading font-extrabold uppercase tracking-tight text-sm">Origio</span>
        </a>
        <button onClick={handleViewOnGlobe}
          className="text-[11px] font-bold text-[#888880] hover:text-[#f0f0e8] transition-colors uppercase tracking-widest">
          Globe
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-6">

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="pt-16 pb-14 border-b border-[#1a1a1a]">
          <div className="grid lg:grid-cols-[1fr_320px] gap-10 items-start">

            {/* Left */}
            <div>
              <p className="text-[10px] font-bold text-[#888880] uppercase tracking-[0.2em] mb-8">
                Top match{jobRoleDef ? ` · ${jobRoleDef.label}` : ""}
              </p>

              <div className="flex items-start gap-6 mb-6">
                <span className="text-7xl leading-none flex-shrink-0">{top.country.flagEmoji}</span>
                <div>
                  <h1 className="font-heading text-[56px] sm:text-[72px] leading-[0.88] font-extrabold uppercase tracking-[-0.02em]">
                    {top.country.name}
                  </h1>
                  <div className="flex items-baseline gap-2.5 mt-4">
                    <span className="font-heading text-5xl font-extrabold" style={{ color: pctColor }}>
                      {top.matchPercent}%
                    </span>
                    <span className="text-[11px] font-bold text-[#888880] uppercase tracking-widest">match</span>
                  </div>
                </div>
              </div>

              {topSalary && (
                <div className="flex flex-wrap gap-x-6 gap-y-1 mb-7 text-[12px] font-bold text-[#888880]">
                  <span>{cs}{topSalary.toLocaleString()}/yr</span>
                  <span>Visa {getVisaLabel(top.country.data.visaDifficulty)}</span>
                  <span>{cs}{top.country.data.costRentCityCentre.toLocaleString()}/mo rent</span>
                  <span>{top.country.language}</span>
                  <span>{top.country.data.incomeTaxRateMid}% tax</span>
                </div>
              )}

              {top.reasons.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-10">
                  {top.reasons.map(r => (
                    <span key={r}
                      className="text-[10px] font-bold px-3 py-1 uppercase tracking-widest"
                      style={{ border: `1px solid ${pctColor}50`, color: pctColor }}>
                      {r}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href={"/country/" + top.country.slug + "/personalised"}
                  className="px-8 py-3.5 text-[11px] font-extrabold uppercase tracking-[0.15em] bg-accent text-[#0a0a0a]"
                  style={{ boxShadow: "3px 3px 0 #00aa90" }}
                >
                  View full report
                </Link>
                <button
                  onClick={handleViewOnGlobe}
                  className="px-8 py-3.5 text-[11px] font-extrabold uppercase tracking-[0.15em] border border-[#2a2a2a] text-[#888880] hover:text-[#f0f0e8] hover:border-[#444] transition-colors"
                >
                  See on globe
                </button>
                <button
                  onClick={() => router.push("/wizard")}
                  className="text-[11px] font-bold text-[#888880] hover:text-[#f0f0e8] transition-colors uppercase tracking-widest ml-auto"
                >
                  Retake quiz →
                </button>
              </div>

              {/* Take-home card */}
              <TakeHomeCard match={top} jobRoleDef={jobRoleDef} isPro={isPro} />

              {/* Email capture — only for non-logged-in users */}
              {!user && <EmailCapture />}
            </div>

            {/* Right — Why card */}
            <div className="lg:sticky lg:top-6">
              <WhyCard
                match={top}
                answers={answers}
                jobRoleDef={jobRoleDef}
                rank={1}
                excludedCountries={excludedCountries}
              />
            </div>
          </div>
        </section>

        {/* ── TOP 3 CARDS ──────────────────────────────────────────────────── */}
        <section className="py-14 border-b border-[#1a1a1a]">
          <p className="text-[10px] font-bold text-[#888880] uppercase tracking-[0.2em] mb-8">Your top 3</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {matches.slice(0, 3).map((m, i) => {
              const mcs = getCurrencySymbol(m.country.currency);
              const salary = jobRoleDef ? m.country.data[jobRoleDef.salaryKey] as number : null;
              const mPct = matchPercentColor(m.matchPercent);
              return (
                <div
                  key={m.country.slug}
                  className="border border-[#1a1a1a] p-5 hover:border-[#2a2a2a] transition-colors"
                  style={{ borderTopColor: RANK_COLORS[i], borderTopWidth: "2px" }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-heading text-[10px] font-extrabold uppercase tracking-widest" style={{ color: RANK_COLORS[i] }}>#{i + 1}</span>
                    <span className="font-heading text-xl font-extrabold" style={{ color: mPct }}>{m.matchPercent}%</span>
                  </div>
                  <div className="text-3xl mb-3">{m.country.flagEmoji}</div>
                  <p className="font-heading text-lg font-extrabold uppercase tracking-tight mb-1">{m.country.name}</p>
                  {salary && (
                    <p className="text-[10px] text-[#888880] font-medium">
                      {mcs}{salary.toLocaleString()}/yr · {getVisaLabel(m.country.data.visaDifficulty)} visa
                    </p>
                  )}
                  <div className="mt-3 pt-3 border-t border-[#1a1a1a] flex items-center justify-between">
                    <p className="text-[10px] text-[#888880]">{mcs}{m.country.data.costRentCityCentre.toLocaleString()}/mo rent</p>
                    <Link href={"/country/" + m.country.slug + "/personalised"}
                      className="text-[10px] font-bold text-[#888880] hover:text-accent transition-colors uppercase tracking-widest">
                      Report →
                    </Link>
                  </div>
                  <WhyToggle match={m} answers={answers} jobRoleDef={jobRoleDef} rank={i + 1} />
                </div>
              );
            })}
          </div>
          {isPro && (
            <div className="mt-6">
              <Link href={compareHref}
                className="inline-flex items-center gap-2 text-[11px] font-bold text-[#888880] hover:text-accent transition-colors uppercase tracking-widest">
                Compare these 3 side by side <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </section>

        {/* ── WHAT THIS MEANS ──────────────────────────────────────────────── */}
        <section className="py-14 border-b border-[#1a1a1a]">
          <p className="text-[10px] font-bold text-[#888880] uppercase tracking-[0.2em] mb-8">What this means</p>
          <div className="grid sm:grid-cols-2 gap-px bg-[#1a1a1a]">
            {[
              {
                label: "Best salary among your top 3",
                value: (() => {
                  if (!jobRoleDef) return "—";
                  const best = [...matches.slice(0, 3)].sort((a, b) =>
                    (b.country.data[jobRoleDef.salaryKey] as number) - (a.country.data[jobRoleDef.salaryKey] as number))[0];
                  const bcs = getCurrencySymbol(best.country.currency);
                  return `${best.country.flagEmoji} ${best.country.name} · ${bcs}${(best.country.data[jobRoleDef.salaryKey] as number).toLocaleString()}/yr`;
                })(),
              },
              {
                label: "Easiest visa among your top 3",
                value: (() => {
                  const easiest = [...matches.slice(0, 3)].sort((a, b) => a.country.data.visaDifficulty - b.country.data.visaDifficulty)[0];
                  return `${easiest.country.flagEmoji} ${easiest.country.name} · ${getVisaLabel(easiest.country.data.visaDifficulty)}`;
                })(),
              },
              {
                label: "Lowest rent among your top 3",
                value: (() => {
                  const cheapest = [...matches.slice(0, 3)].sort((a, b) => a.country.data.costRentCityCentre - b.country.data.costRentCityCentre)[0];
                  const lcs = getCurrencySymbol(cheapest.country.currency);
                  return `${cheapest.country.flagEmoji} ${cheapest.country.name} · ${lcs}${cheapest.country.data.costRentCityCentre.toLocaleString()}/mo`;
                })(),
              },
              {
                label: "Safest among your top 3",
                value: (() => {
                  const safest = [...matches.slice(0, 3)].sort((a, b) => b.country.data.scoreSafety - a.country.data.scoreSafety)[0];
                  return `${safest.country.flagEmoji} ${safest.country.name} · ${safest.country.data.scoreSafety}/10`;
                })(),
              },
            ].map(item => (
              <div key={item.label} className="bg-[#0a0a0a] px-6 py-5">
                <p className="text-[10px] font-bold text-[#888880] uppercase tracking-widest mb-2">{item.label}</p>
                <p className="font-heading text-base font-extrabold text-[#f0f0e8]">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FULL RANKING ─────────────────────────────────────────────────── */}
        <section className="py-14 pb-20">
          <div className="flex items-baseline justify-between mb-8">
            <p className="text-[10px] font-bold text-[#888880] uppercase tracking-[0.2em]">
              Full ranking{jobRoleDef ? ` · ${jobRoleDef.label}` : ""}
            </p>
            <p className="text-[10px] font-bold text-[#888880] uppercase tracking-widest">{visibleMatches.length} of 25</p>
          </div>

          <div>
            {visibleMatches.map((match, i) => {
              const mcs = getCurrencySymbol(match.country.currency);
              const salary = jobRoleDef ? match.country.data[jobRoleDef.salaryKey] as number : null;
              const isTop3 = i < 3;
              return (
                <div key={match.country.slug} className="border-b border-[#111111]"
                  style={isTop3 ? { borderLeftColor: RANK_COLORS[i], borderLeftWidth: "2px" } : {}}>
                  <Link href={"/country/" + match.country.slug + "/personalised"}
                    className="flex items-center gap-4 py-4 hover:bg-[#0d0d0d] transition-colors px-3 -mx-3 group"
                    style={isTop3 ? { paddingLeft: "14px", marginLeft: "-2px" } : {}}>
                    <span className="font-heading text-[11px] font-extrabold w-6 text-right flex-shrink-0"
                      style={{ color: isTop3 ? RANK_COLORS[i] : "#2a2a2a" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-xl flex-shrink-0">{match.country.flagEmoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-heading text-[14px] font-extrabold uppercase tracking-tight text-[#f0f0e8] truncate">
                        {match.country.name}
                      </p>
                      {salary && (
                        <p className="text-[10px] text-[#444] font-medium mt-0.5">
                          {mcs}{salary.toLocaleString()}/yr · {getVisaLabel(match.country.data.visaDifficulty)} visa · {mcs}{match.country.data.costRentCityCentre.toLocaleString()}/mo rent
                        </p>
                      )}
                    </div>
                    <span className="font-heading text-[14px] font-extrabold flex-shrink-0" style={{ color: matchPercentColor(match.matchPercent) }}>
                      {match.matchPercent}%
                    </span>
                  </Link>
                  {i >= 3 && (
                    <div className="px-3 pb-3 -mt-1">
                      <WhyToggle match={match} answers={answers} jobRoleDef={jobRoleDef} rank={i + 1} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!isPro && (
            <div className="mt-0">
              <div className="relative overflow-hidden" style={{ height: 100 }}>
                {[visibleMatches.length + 1, visibleMatches.length + 2].map((n, i) => (
                  <div key={n} className="flex items-center gap-4 py-4 border-b border-[#111111] px-3"
                    style={{ opacity: i === 0 ? 0.35 : 0.15 }}>
                    <span className="font-heading text-[11px] font-extrabold w-6 text-right text-[#2a2a2a]">{String(n).padStart(2, "0")}</span>
                    <span className="text-xl">🌍</span>
                    <div className="flex-1">
                      <div className="h-3 w-28 bg-[#1a1a1a]" />
                      <div className="h-2 w-40 bg-[#111] mt-1.5" />
                    </div>
                    <div className="h-3 w-8 bg-[#1a1a1a]" />
                  </div>
                ))}
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: "linear-gradient(to bottom, transparent 0%, #0a0a0a 85%)" }} />
              </div>
              <div className="flex items-center justify-between pt-5 border-t border-[#1a1a1a]">
                <div>
                  <p className="font-heading text-sm font-extrabold uppercase tracking-tight">{25 - visibleMatches.length} more countries</p>
                  <p className="text-[10px] text-[#888880] mt-0.5 uppercase tracking-widest">Unlock full ranking · €19.99 once</p>
                </div>
                <Link href="/pro"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-[10px] font-extrabold uppercase tracking-widest bg-accent text-[#0a0a0a]"
                  style={{ boxShadow: "2px 2px 0 #00aa90" }}>
                  <Sparkles className="w-3 h-3" /> Get Pro
                </Link>
              </div>
            </div>
          )}

          {isPro && matches.length >= 3 && (
            <div className="mt-8 pt-6 border-t border-[#1a1a1a] flex items-center justify-between">
              <p className="text-[10px] text-[#888880] uppercase tracking-widest">All 25 countries ranked for you</p>
              <Link href={compareHref}
                className="inline-flex items-center gap-2 text-[11px] font-bold text-[#888880] hover:text-accent transition-colors uppercase tracking-widest">
                Compare top 3 <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}