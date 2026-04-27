"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Lock, Check, X, Wifi,
  DollarSign, Shield, Heart, Home, Plane, Receipt,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { WizardAnswers, CountryMatch } from "@/lib/wizard";
import { JOB_ROLES, CountryWithData } from "@/types";
import { getVisaLabel, getVisaColor, getScoreBreakdown } from "@/lib/utils";

// ── helpers ────────────────────────────────────────────────────────────────

const SYM: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", AUD: "A$", CAD: "C$",
  NZD: "NZ$", CHF: "CHF ", SGD: "S$", AED: "AED ",
  NOK: "kr ", SEK: "kr ", JPY: "¥", INR: "₹", BRL: "R$",
  MYR: "RM ", DKK: "kr ",
};
const sym = (c: string) => SYM[c] ?? c + " ";

const TO_USD: Record<string, number> = {
  USD: 1, EUR: 1.08, GBP: 1.27, AUD: 0.65, CAD: 0.74,
  NZD: 0.61, CHF: 1.13, SGD: 0.74, AED: 0.27,
  NOK: 0.093, SEK: 0.096, DKK: 0.145,
  JPY: 0.0067, INR: 0.012, BRL: 0.20, MYR: 0.22,
};

const RENT_MAX: Record<string, number> = {
  under800: 800, "800to1500": 1500, "1500to2500": 2500, any: 99999,
};

const EU_PASSPORTS = [
  "ireland", "germany", "france", "netherlands", "spain", "portugal",
  "sweden", "norway", "switzerland", "austria", "belgium", "denmark", "finland", "italy", "poland",
];

const ENGLISH_COUNTRIES = [
  "ireland", "united-kingdom", "australia", "new-zealand", "canada", "usa", "singapore",
];

const SCORE_ICONS: Record<string, any> = {
  Salary: DollarSign, Affordability: Home, "Quality of Life": Heart,
  Safety: Shield, "Visa Access": Plane, "Tax Efficiency": Receipt,
};

function scoreColor(v: number) {
  if (v >= 7) return "#4ade80";
  if (v >= 5) return "#facc15";
  return "#f87171";
}

// Simple take-home estimate: gross * (1 - taxRate/100) * (1 - ssRate/100)
function calcTakeHome(gross: number, taxRate: number, ssRate: number) {
  const net = gross * (1 - taxRate / 100) * (1 - ssRate / 100);
  return { annual: Math.round(net), monthly: Math.round(net / 12) };
}

// ── types ──────────────────────────────────────────────────────────────────

interface Props {
  country: CountryWithData;
  allCountries: CountryWithData[];
}

// ── component ──────────────────────────────────────────────────────────────

export default function PersonalisedReport({ country, allCountries }: Props) {
  const router = useRouter();
  const { data } = country;
  const cs = sym(country.currency);
  const scoreBreakdown = getScoreBreakdown(data);

  const [answers, setAnswers] = useState<Partial<WizardAnswers> | null>(null);
  const [match, setMatch] = useState<{ percent: number; reasons: string[] } | null>(null);
  const [otherMatches, setOtherMatches] = useState<CountryMatch[]>([]);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // sessionStorage first
      let ans: Partial<WizardAnswers> | null = null;
      const rawA = sessionStorage.getItem("wizardAnswers");
      if (rawA) ans = JSON.parse(rawA);

      const rawM = sessionStorage.getItem("wizardMatches");
      if (rawM) {
        const all: CountryMatch[] = JSON.parse(rawM);
        const m = all.find((x) => x.country.slug === country.slug);
        if (m) setMatch({ percent: m.matchPercent, reasons: m.reasons });
        setOtherMatches(all.filter((x) => x.country.slug !== country.slug).slice(0, 2));
      }

      // Supabase override
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles").select("is_pro").eq("id", session.user.id).single();
        if (profile?.is_pro) setIsPro(true);

        const { data: result } = await supabase
          .from("wizard_results")
          .select("answers, top_countries")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (result?.answers) ans = result.answers;
        if (result?.top_countries) {
          const m = (result.top_countries as any[]).find((c: any) => c.slug === country.slug);
          if (m) setMatch({ percent: m.matchPercent, reasons: m.reasons ?? [] });
          const others = (result.top_countries as any[])
            .filter((c: any) => c.slug !== country.slug)
            .slice(0, 2)
            .map((c: any) => {
              const full = allCountries.find((x) => x.slug === c.slug);
              return full ? { country: full, matchPercent: c.matchPercent, matchScore: 0, reasons: c.reasons ?? [] } : null;
            })
            .filter(Boolean) as CountryMatch[];
          if (others.length) setOtherMatches(others);
        }
      }

      setAnswers(ans);
      setLoading(false);
    }
    load();
  }, [country.slug, allCountries]);

  // If no wizard answers → redirect to wizard
  useEffect(() => {
    if (!loading && !answers) router.replace("/wizard");
  }, [loading, answers, router]);

  if (loading || !answers) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-32 h-1 bg-[#1a1a1a]">
        <div className="h-full bg-accent animate-pulse" style={{ width: "60%" }} />
      </div>
    </div>
  );

  // ── derived data ──────────────────────────────────────────────────────────

  const userRole = JOB_ROLES.find((r) => r.key === answers.jobRole) ?? JOB_ROLES[0];
  const grossSalary = data[userRole.salaryKey] as number;
  const { annual: takeHomeAnnual, monthly: takeHomeMonthly } = calcTakeHome(
    grossSalary, data.incomeTaxRateMid, data.socialSecurityRate
  );

  const rentUSD = data.costRentCityCentre * (TO_USD[country.currency] ?? 1);
  const maxRentUSD = RENT_MAX[answers.rentBudget ?? "any"] ?? 99999;
  const rentFits = rentUSD <= maxRentUSD;
  const rentPct = Math.round(((rentUSD - maxRentUSD) / maxRentUSD) * 100);

  const monthlyTotal =
    data.costRentCityCentre + data.costGroceriesMonthly +
    data.costTransportMonthly + data.costEatingOut * 20 + data.costUtilitiesMonthly;
  const disposable = takeHomeMonthly - monthlyTotal;

  const isEU = EU_PASSPORTS.includes((answers.passport ?? "").toLowerCase());
  const isEnglish = ENGLISH_COUNTRIES.includes(country.slug);
  const dealBreakers = answers.dealBreakers ?? [];
  const hasEnglishFlag = dealBreakers.includes("english") && !isEnglish;
  const hasHighTaxFlag = dealBreakers.includes("lowtax") && data.incomeTaxRateMid > 30;
  const hasCrimeFlag = dealBreakers.includes("lowcrime") && (data.scoreCrimeRate ?? 0) < 7;

  // Wins list
  const wins: { title: string; sub: string }[] = [];
  if (grossSalary > 0) wins.push({
    title: `${userRole.label} salary: ${cs}${grossSalary.toLocaleString()}/yr`,
    sub: `Take-home ~${cs}${takeHomeMonthly.toLocaleString()}/mo after ${data.incomeTaxRateMid}% tax`,
  });
  if (isEU && [
    "germany","netherlands","portugal","spain","ireland","france","italy",
    "sweden","switzerland","norway","austria","finland","belgium","denmark",
  ].includes(country.slug)) wins.push({
    title: "Your passport makes the visa straightforward",
    sub: "EU/EFTA freedom of movement — no pre-approval needed in most cases.",
  });
  if (rentFits) wins.push({
    title: "Rent fits your budget",
    sub: `${cs}${data.costRentCityCentre.toLocaleString()}/mo city centre — within your range.`,
  });
  if (data.scoreSafety >= 8.5) wins.push({
    title: `Safety score ${data.scoreSafety}/10`,
    sub: answers.priorities?.includes("safety") ? "You ranked this as a priority." : "One of the safer countries in the index.",
  });
  if (data.scoreInternetSpeed >= 8 && answers.moveReason === "remote") wins.push({
    title: `${data.scoreInternetSpeed}/10 internet speed`,
    sub: "Strong infrastructure for remote work.",
  });
  if (isEnglish) wins.push({
    title: "English spoken",
    sub: "No language barrier for work or daily life.",
  });
  if (data.scoreHealthcare >= 8) wins.push({
    title: `Healthcare ${data.scoreHealthcare}/10`,
    sub: "High-quality public or private healthcare system.",
  });

  // Warnings
  const warnings: { title: string; sub: string }[] = [];
  if (!rentFits && answers.rentBudget !== "any") warnings.push({
    title: "Rent is above your budget",
    sub: `${cs}${data.costRentCityCentre.toLocaleString()}/mo is ${Math.abs(rentPct)}% over your range. Consider outer suburbs.`,
  });
  if (hasEnglishFlag) warnings.push({
    title: "Primary language is not English",
    sub: "You flagged English as a must. Day-to-day life will require learning the local language.",
  });
  if (hasHighTaxFlag) warnings.push({
    title: `Income tax ${data.incomeTaxRateMid}% is above your threshold`,
    sub: "You flagged low taxes as a priority. This country sits above 30%.",
  });
  if (hasCrimeFlag) warnings.push({
    title: "Crime rate below your threshold",
    sub: "You flagged low crime as a deal breaker. Check neighbourhood-level data before deciding.",
  });
  if (data.visaDifficulty >= 4 && !isEU) warnings.push({
    title: `Visa difficulty: ${data.visaDifficulty}/5`,
    sub: "This country has restrictive immigration. Expect a longer, more expensive process.",
  });

  const visaColor = getVisaColor(data.visaDifficulty);

  // Priority scores for "Scored against your priorities"
  const priorities = answers.priorities ?? [];
  const priorityLabelMap: Record<string, string> = {
    salary: "Salary", affordability: "Affordability", quality: "Quality of Life",
    safety: "Safety", visa: "Visa Access", tax: "Tax Efficiency",
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f0f0e8]" style={{ fontFamily: "var(--font-body, sans-serif)" }}>

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur border-b-2 border-[#2a2a2a]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 bg-accent border-2 border-[#f0f0e8]" />
            <span className="font-heading text-base font-extrabold uppercase tracking-tight">Origio</span>
          </Link>
          <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-widest text-[#888880]">
            <button onClick={() => router.back()} className="flex items-center gap-1.5 hover:text-[#f0f0e8] transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-6 pt-5">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest font-bold text-[#888880]">
          <Link href="/wizard/results" className="hover:text-[#f0f0e8] transition-colors">Results</Link>
          <span>/</span>
          <Link href={`/country/${country.slug}`} className="hover:text-[#f0f0e8] transition-colors">{country.name}</Link>
          <span>/</span>
          <span className="text-accent">Your report</span>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 pb-20 space-y-0">

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="pt-10 pb-14">
          <div className="flex items-center gap-4 mb-7">
            <span className="text-5xl leading-none">{country.flagEmoji}</span>
            <div>
              <p className="text-[10px] font-bold text-[#888880] uppercase tracking-widest">{country.name} · Personalised report</p>
              <p className="text-xs text-[#888880] mt-0.5">
                for {userRole.label}{answers.passport ? ` · ${answers.passport} passport` : ""}
              </p>
            </div>
            {match && (
              <span className="ml-auto flex items-center gap-2 px-3 py-1.5 border-2 border-accent" style={{ boxShadow: "3px 3px 0 #00ffd5" }}>
                <span className="font-heading text-lg font-extrabold text-accent">{match.percent}%</span>
                <span className="text-[10px] font-bold text-accent uppercase tracking-widest">match</span>
              </span>
            )}
          </div>

          <h1 className="font-heading text-[36px] sm:text-[52px] leading-[1.0] font-extrabold tracking-[-0.02em] max-w-3xl mb-5">
            {disposable > 0
              ? <>You'd earn <span className="text-accent">{cs}{grossSalary.toLocaleString()}</span>, take home {cs}{takeHomeMonthly.toLocaleString()}/mo, and keep <span className="text-accent">{cs}{disposable.toLocaleString()}</span> after costs.</>
              : <>You'd earn <span className="text-accent">{cs}{grossSalary.toLocaleString()}</span> as a {userRole.label} — but costs are tight.</>
            }
          </h1>

          {match?.reasons && match.reasons.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {match.reasons.map((r) => (
                <span key={r} className="text-[11px] font-bold px-2.5 py-1 border-2 border-accent text-accent uppercase tracking-wide">{r}</span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <a href="#visa" className="inline-block px-6 py-3 text-sm font-heading font-extrabold uppercase tracking-wide bg-accent text-[#0a0a0a] border-2 border-accent" style={{ boxShadow: "3px 3px 0 #00aa90" }}>
              View visa path →
            </a>
            {otherMatches[0] && (
              <Link href={`/country/${otherMatches[0].country.slug}/personalised`}
                className="inline-block px-6 py-3 text-sm font-heading font-extrabold uppercase tracking-wide bg-[#0f0f0f] text-[#f0f0e8] border-2 border-[#2a2a2a]" style={{ boxShadow: "3px 3px 0 #2a2a2a" }}>
                Compare with {otherMatches[0].country.name}
              </Link>
            )}
          </div>
        </section>

        {/* ── SALARY ───────────────────────────────────────────────────────── */}
        <section className="py-14 border-t-2 border-[#2a2a2a]">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold uppercase tracking-tight">Salary</h2>
            <p className="text-xs text-[#888880] hidden md:block">{userRole.label} · {country.currency}</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-5 mb-6">
            {/* Gross */}
            <div className="border-2 border-[#2a2a2a] bg-[#0f0f0f] p-5" style={{ boxShadow: "3px 3px 0 #2a2a2a" }}>
              <p className="text-[10px] font-bold text-[#888880] uppercase tracking-widest mb-3">Gross salary</p>
              <p className="font-heading text-4xl font-extrabold leading-none">{cs}{grossSalary.toLocaleString()}</p>
              <p className="text-xs text-[#888880] mt-2">/ year as {userRole.label}</p>
            </div>

            {/* Take-home */}
            <div className="border-2 border-accent bg-[#0f0f0f] p-5 relative" style={{ boxShadow: "3px 3px 0 #00ffd5" }}>
              <div className="absolute -top-2.5 left-3 bg-accent text-[#0a0a0a] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">Take-home</div>
              <p className="text-[10px] font-bold text-[#888880] uppercase tracking-widest mb-3 mt-1">After {data.incomeTaxRateMid}% tax + {data.socialSecurityRate}% SS</p>
              <p className="font-heading text-4xl font-extrabold leading-none text-accent">{cs}{takeHomeAnnual.toLocaleString()}</p>
              <p className="text-xs text-[#888880] mt-2">~ {cs}{takeHomeMonthly.toLocaleString()} / month</p>
            </div>

            {/* Disposable */}
            <div className="border-2 border-[#2a2a2a] bg-[#0f0f0f] p-5" style={{ boxShadow: "3px 3px 0 #2a2a2a" }}>
              <p className="text-[10px] font-bold text-[#888880] uppercase tracking-widest mb-3">After all costs</p>
              <p className={`font-heading text-4xl font-extrabold leading-none ${disposable > 0 ? "text-[#4ade80]" : "text-[#f87171]"}`}>
                {disposable > 0 ? "+" : ""}{cs}{Math.abs(disposable).toLocaleString()}
              </p>
              <p className="text-xs text-[#888880] mt-2">/ month {disposable > 0 ? "free" : "shortfall"}</p>
            </div>
          </div>

          {/* Monthly breakdown bar */}
          <div className="border-2 border-[#2a2a2a] bg-[#0f0f0f] p-5">
            <p className="text-[10px] font-bold text-[#888880] uppercase tracking-widest mb-4">
              Monthly take-home · {cs}{takeHomeMonthly.toLocaleString()}
            </p>
            <div className="flex h-9 border-2 border-[#2a2a2a] overflow-hidden mb-4">
              {(() => {
                const total = takeHomeMonthly || 1;
                const rPct = Math.round((data.costRentCityCentre / total) * 100);
                const gPct = Math.round((data.costGroceriesMonthly / total) * 100);
                const tPct = Math.round((data.costTransportMonthly / total) * 100);
                const uPct = Math.round((data.costUtilitiesMonthly / total) * 100);
                const freePct = Math.max(0, 100 - rPct - gPct - tPct - uPct);
                return (
                  <>
                    <div style={{ width: rPct + "%", background: "#00ffd5" }} className="flex items-center justify-center text-[9px] font-extrabold text-[#0a0a0a] uppercase overflow-hidden px-1">
                      {rPct > 8 ? "Rent" : ""}
                    </div>
                    <div style={{ width: gPct + "%", background: "#4ade80" }} className="border-l-2 border-[#0a0a0a]" />
                    <div style={{ width: tPct + "%", background: "#facc15" }} className="border-l-2 border-[#0a0a0a]" />
                    <div style={{ width: uPct + "%", background: "#a78bfa" }} className="border-l-2 border-[#0a0a0a]" />
                    <div style={{ width: freePct + "%", background: "#1a1a1a" }} className="border-l-2 border-[#0a0a0a] flex items-center justify-center text-[9px] font-extrabold text-[#f0f0e8] uppercase overflow-hidden px-1">
                      {freePct > 10 ? `Free ${cs}${disposable.toLocaleString()}` : ""}
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[11px]">
              {[
                { label: "Rent", val: data.costRentCityCentre, color: "#00ffd5" },
                { label: "Groceries", val: data.costGroceriesMonthly, color: "#4ade80" },
                { label: "Transport", val: data.costTransportMonthly, color: "#facc15" },
                { label: "Utilities", val: data.costUtilitiesMonthly, color: "#a78bfa" },
              ].map((item) => (
                <span key={item.label} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5" style={{ background: item.color }} />
                  <span className="font-bold">{item.label}</span>
                  <span className="text-[#888880]">{cs}{item.val.toLocaleString()}</span>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── FITS / DOESN'T FIT ────────────────────────────────────────────── */}
        <section className="py-14 border-t-2 border-[#2a2a2a]">
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold uppercase tracking-tight mb-8">What fits, what doesn't</h2>

          <div className="grid lg:grid-cols-2 gap-5">
            {/* Wins */}
            <div className="border-2 border-[#2a2a2a] bg-[#0f0f0f] overflow-hidden">
              <div className="border-b-2 border-[#2a2a2a] px-5 py-3">
                <p className="text-[10px] font-bold text-[#4ade80] uppercase tracking-widest">Fits · {wins.length}</p>
              </div>
              {wins.length === 0 && (
                <p className="px-5 py-4 text-sm text-[#888880]">No strong matches found for your criteria.</p>
              )}
              {wins.map((w, i) => (
                <div key={i} className={`flex gap-3 px-5 py-3.5 ${i < wins.length - 1 ? "border-b border-[#1a1a1a]" : ""}`}>
                  <Check className="w-4 h-4 text-[#4ade80] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold">{w.title}</p>
                    <p className="text-[11px] text-[#888880] mt-0.5">{w.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Warnings */}
            <div className="border-2 border-[#2a2a2a] bg-[#0f0f0f] overflow-hidden">
              <div className="border-b-2 border-[#2a2a2a] px-5 py-3">
                <p className="text-[10px] font-bold text-[#f87171] uppercase tracking-widest">Watch out · {warnings.length}</p>
              </div>
              {warnings.length === 0 && (
                <div className="px-5 py-4">
                  <p className="text-sm text-[#888880]">No deal-breakers flagged.</p>
                </div>
              )}
              {warnings.map((w, i) => (
                <div key={i} className={`flex gap-3 px-5 py-3.5 ${i < warnings.length - 1 ? "border-b border-[#1a1a1a]" : ""}`}>
                  <X className="w-4 h-4 text-[#f87171] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold">{w.title}</p>
                    <p className="text-[11px] text-[#888880] mt-0.5">{w.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── VISA PATH ─────────────────────────────────────────────────────── */}
        <section id="visa" className="py-14 border-t-2 border-[#2a2a2a]">
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold uppercase tracking-tight mb-8">
            Visa <span className="text-[#888880]">— your route</span>
          </h2>

          <div className="border-2 border-[#2a2a2a] bg-[#0f0f0f] overflow-hidden" style={{ boxShadow: "3px 3px 0 #2a2a2a" }}>
            <div className="grid grid-cols-3 border-b-2 border-[#2a2a2a]">
              <div className="p-5 border-r-2 border-[#2a2a2a]">
                <p className="text-[10px] font-bold text-[#888880] uppercase tracking-widest mb-2">Top route</p>
                <p className="font-heading text-lg font-extrabold text-accent leading-tight">
                  {data.visaPopularRoutes?.[0] ?? "Work Permit"}
                </p>
              </div>
              <div className="p-5 border-r-2 border-[#2a2a2a]">
                <p className="text-[10px] font-bold text-[#888880] uppercase tracking-widest mb-2">Difficulty</p>
                <div className="flex items-center gap-2">
                  <p className="font-heading text-xl font-extrabold" style={{ color: visaColor }}>
                    {data.visaDifficulty}<span className="text-[#888880] text-sm">/5</span>
                  </p>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((n) => (
                      <span key={n} className="w-1.5 h-5" style={{ background: n <= data.visaDifficulty ? visaColor : "#1a1a1a" }} />
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-[#888880] mt-1">{getVisaLabel(data.visaDifficulty)}</p>
              </div>
              <div className="p-5">
                <p className="text-[10px] font-bold text-[#888880] uppercase tracking-widest mb-2">Passport</p>
                <p className="font-heading text-xl font-extrabold">
                  {isEU ? <span className="text-[#4ade80]">EU ✓</span> : <span>{answers.passport ?? "—"}</span>}
                </p>
                <p className="text-[11px] text-[#888880] mt-1">
                  {isEU ? "Freedom of movement" : "Work permit required"}
                </p>
              </div>
            </div>

            <div className="p-6">
              <p className="text-xs text-[#888880] leading-relaxed mb-5">{data.visaNotes}</p>

              {data.visaPopularRoutes?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {data.visaPopularRoutes.map((r) => (
                    <span key={r} className="text-[10px] font-bold px-2 py-1 border-2 border-accent text-accent uppercase">{r}</span>
                  ))}
                </div>
              )}

              <a href={data.visaOfficialUrl} target="_blank" rel="noopener noreferrer"
                className="text-[11px] font-bold text-accent uppercase tracking-wider hover:underline">
                Official immigration site →
              </a>
            </div>
          </div>
        </section>

        {/* ── COST REALITY ──────────────────────────────────────────────────── */}
        <section className="py-14 border-t-2 border-[#2a2a2a]">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold uppercase tracking-tight">Monthly costs</h2>
            <p className="text-xs text-[#888880] hidden md:block">vs your budget</p>
          </div>

          <div className="border-2 border-[#2a2a2a] bg-[#0f0f0f] overflow-hidden">
            <div className="grid grid-cols-[1fr_120px_100px] bg-[#0a0a0a] border-b-2 border-[#2a2a2a] px-5 py-3">
              <p className="text-[10px] font-bold text-[#888880] uppercase tracking-widest">Category</p>
              <p className="text-[10px] font-bold text-[#888880] uppercase tracking-widest text-right">Est.</p>
              <p className="text-[10px] font-bold text-[#888880] uppercase tracking-widest text-right">Status</p>
            </div>
            {[
              { label: "Rent (1-bed, city centre)", val: data.costRentCityCentre, budgetKey: "rent" },
              { label: "Groceries", val: data.costGroceriesMonthly, budgetKey: "food" },
              { label: "Transport", val: data.costTransportMonthly, budgetKey: "transport" },
              { label: "Utilities", val: data.costUtilitiesMonthly, budgetKey: "utilities" },
              { label: "Eating out (×20 meals)", val: data.costEatingOut * 20, budgetKey: "dining" },
            ].map((item, i, arr) => (
              <div key={item.label} className={`grid grid-cols-[1fr_120px_100px] px-5 py-3.5 items-center ${i < arr.length - 1 ? "border-b border-[#1a1a1a]" : ""}`}>
                <span className="text-sm font-bold">{item.label}</span>
                <p className="font-heading text-sm font-extrabold text-right">{cs}{item.val.toLocaleString()}</p>
                <div className="flex justify-end">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 border-2"
                    style={item.budgetKey === "rent" && !rentFits
                      ? { borderColor: "#f87171", color: "#f87171" }
                      : { borderColor: "#4ade80", color: "#4ade80" }}>
                    {item.budgetKey === "rent" && !rentFits ? `+${Math.abs(rentPct)}%` : "OK"}
                  </span>
                </div>
              </div>
            ))}
            <div className="grid grid-cols-[1fr_120px_100px] px-5 py-4 bg-[#0a0a0a] items-center border-t-2 border-[#2a2a2a]">
              <p className="font-heading text-sm font-extrabold uppercase tracking-tight">Total monthly</p>
              <p className="font-heading text-xl font-extrabold text-accent text-right">{cs}{monthlyTotal.toLocaleString()}</p>
              <div className="flex justify-end">
                <span className={`text-[10px] font-extrabold uppercase px-2 py-1 ${disposable >= 0 ? "bg-[#4ade80] text-[#0a0a0a]" : "bg-[#f87171] text-[#0a0a0a]"}`}>
                  {disposable >= 0 ? `${cs}${disposable.toLocaleString()} free` : "Over budget"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── QUALITY SCORES ────────────────────────────────────────────────── */}
        <section className="py-14 border-t-2 border-[#2a2a2a]">
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold uppercase tracking-tight mb-8">
            Scored against your priorities
          </h2>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Breakdown */}
            <div className="border-2 border-[#2a2a2a] bg-[#0f0f0f] overflow-hidden">
              <div className="px-5 py-3 border-b-2 border-[#2a2a2a]">
                <p className="text-[10px] font-bold text-[#888880] uppercase tracking-widest">Score breakdown</p>
              </div>
              {scoreBreakdown.map((item, i) => {
                const Icon = SCORE_ICONS[item.label] ?? Wifi;
                const isUserPriority = priorities.includes(
                  Object.entries(priorityLabelMap).find(([, v]) => v === item.label)?.[0] ?? ""
                );
                return (
                  <div key={item.label} className={`flex items-center gap-4 px-5 py-3 ${i < scoreBreakdown.length - 1 ? "border-b border-[#1a1a1a]" : ""}`}>
                    <Icon className="w-4 h-4 flex-shrink-0" style={{ color: item.color }} />
                    <p className="text-xs font-bold uppercase tracking-wider text-[#888880] flex-1">{item.label}</p>
                    <div className="w-28 h-1.5 bg-[#1a1a1a]">
                      <div className="h-full" style={{ width: `${(item.value / item.maxValue) * 100}%`, background: item.color }} />
                    </div>
                    <p className="font-heading text-sm font-extrabold w-10 text-right" style={{ color: item.color }}>
                      {Math.round(item.value * 10) / 10}
                    </p>
                    {isUserPriority && (
                      <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 border border-accent text-accent flex-shrink-0">★ You</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Priorities context */}
            <div className="border-2 border-[#2a2a2a] bg-[#0f0f0f] p-6 flex flex-col">
              <p className="text-[10px] font-bold text-[#888880] uppercase tracking-widest mb-4">Your priorities</p>
              {priorities.length > 0 ? (
                <ol className="space-y-3">
                  {priorities.map((p, i) => {
                    const label = priorityLabelMap[p] ?? p;
                    const score = scoreBreakdown.find((s) => s.label === label);
                    return (
                      <li key={p} className="flex items-center gap-3">
                        <span className="font-heading text-2xl font-extrabold text-accent w-8">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="flex-1 text-sm font-bold uppercase tracking-tight">{label}</span>
                        {score && (
                          <span className="text-xs font-bold" style={{ color: scoreColor(score.value) }}>
                            {Math.round(score.value * 10) / 10}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <p className="text-sm text-[#888880]">No priorities selected in wizard.</p>
              )}
            </div>
          </div>
        </section>

        {/* ── OTHER MATCHES ─────────────────────────────────────────────────── */}
        <section id="compare" className="py-14 border-t-2 border-[#2a2a2a]">
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold uppercase tracking-tight mb-8">Your other matches</h2>

          {/* Free: #2 and #3 */}
          <div className="grid md:grid-cols-2 gap-5 mb-8">
            {otherMatches.slice(0, 2).map((m, i) => (
              <Link key={m.country.slug} href={`/country/${m.country.slug}/personalised`}
                className="border-2 border-[#2a2a2a] bg-[#0f0f0f] p-5 hover:border-accent transition-all group block"
                style={{ boxShadow: "3px 3px 0 #2a2a2a" }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{m.country.flagEmoji}</span>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#888880]">#{i + 2}</span>
                </div>
                <p className="text-[10px] font-bold text-[#888880] uppercase tracking-widest mb-1">{i + 2 === 2 ? "2nd" : "3rd"} best match</p>
                <p className="font-heading text-2xl font-extrabold uppercase">{m.country.name}</p>
                <div className="flex items-baseline gap-2 mt-3">
                  <span className="font-heading text-3xl font-extrabold text-accent">{m.matchPercent}<span className="text-[#888880] text-base">%</span></span>
                  <span className="text-[11px] text-[#888880]">match</span>
                </div>
                <div className="mt-4 pt-4 border-t border-[#2a2a2a] flex items-center justify-between">
                  <span className="text-[11px] text-[#888880]">
                    {sym(m.country.currency)}{(m.country.data[userRole.salaryKey] as number).toLocaleString()} · {getVisaLabel(m.country.data.visaDifficulty)}
                  </span>
                  <span className="text-[11px] font-bold text-accent uppercase tracking-wider group-hover:translate-x-1 transition-transform">View →</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Pro paywall */}
          <div className="border-2 border-[#2a2a2a] bg-[#0f0f0f] overflow-hidden">
            <div className="px-5 py-4 border-b-2 border-[#2a2a2a] flex items-center justify-between">
              <p className="text-[10px] font-bold text-[#f0f0e8] uppercase tracking-widest">22 more countries · ranked for you</p>
              <span className="text-[11px] font-bold text-[#888880] uppercase tracking-wider">Pro · €5</span>
            </div>

            <div className="relative">
              <div style={{ filter: isPro ? "none" : "blur(4px) saturate(0.4)", opacity: isPro ? 1 : 0.5, pointerEvents: isPro ? "auto" : "none" }}>
                {[4,5,6,7,8].map((n) => (
                  <div key={n} className="flex items-center gap-4 px-5 py-3.5 border-b border-[#1a1a1a]">
                    <span className="font-heading text-xs font-extrabold text-[#888880] w-6">{String(n).padStart(2, "0")}</span>
                    <span className="text-xl">🌍</span>
                    <span className="text-sm font-bold flex-1">Country {n}</span>
                    <div className="w-32 h-1.5 bg-[#1a1a1a]">
                      <div className="h-full bg-[#4ade80]" style={{ width: `${90 - n * 4}%` }} />
                    </div>
                    <p className="font-heading text-sm font-extrabold w-10 text-right">{90 - n * 4}%</p>
                  </div>
                ))}
              </div>
              {!isPro && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0a0a0a] border-2 border-accent" style={{ boxShadow: "3px 3px 0 #00ffd5" }}>
                    <Lock className="w-3.5 h-3.5 text-accent" />
                    <span className="text-[11px] font-extrabold text-accent uppercase tracking-wider">22 more countries — Pro</span>
                  </div>
                </div>
              )}
            </div>

            {!isPro && (
              <div className="px-5 py-5 border-t-2 border-[#2a2a2a] flex flex-wrap items-center justify-between gap-4 bg-[#0a0a0a]">
                <div>
                  <p className="font-heading text-xl font-extrabold uppercase tracking-tight">See all 25 — €5 once</p>
                  <p className="text-[11px] text-[#888880] mt-0.5">Full ranking · compare · take-home calculator · visa timelines</p>
                </div>
                <Link href="/pro" className="px-6 py-3 text-sm font-heading font-extrabold uppercase tracking-wide bg-accent text-[#0a0a0a] border-2 border-accent" style={{ boxShadow: "3px 3px 0 #00aa90" }}>
                  Upgrade
                </Link>
              </div>
            )}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t-2 border-[#2a2a2a] py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-accent border-2 border-[#f0f0e8]" />
            <span className="font-heading font-extrabold uppercase tracking-tight">Origio</span>
            <span className="text-[#888880] text-[11px] uppercase tracking-widest font-bold ml-2">© 2026</span>
          </div>
          <div className="flex items-center gap-5 text-[11px] uppercase tracking-widest font-bold text-[#888880]">
            <Link href="/privacy" className="hover:text-[#f0f0e8] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[#f0f0e8] transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}