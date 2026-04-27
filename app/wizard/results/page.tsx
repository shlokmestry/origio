"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Globe2, Sparkles, ArrowRight } from "lucide-react";
import { CountryMatch, WizardAnswers } from "@/lib/wizard";
import { JOB_ROLES } from "@/types";
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
    setMatches(JSON.parse(raw));
    if (answersRaw) setAnswers(JSON.parse(answersRaw));

    let progress = 0;
    let stepIndex = 0;
    const interval = setInterval(() => {
      progress += 2;
      setLoadingProgress(progress);
      if (progress % 20 === 0 && stepIndex < LOADING_STEPS.length - 1) {
        stepIndex++;
        setLoadingStep(stepIndex);
      }
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
          const topCountries = matches.slice(0, 10).map(m => ({
            slug: m.country.slug,
            name: m.country.name,
            flagEmoji: m.country.flagEmoji,
            matchPercent: m.matchPercent,
            reasons: m.reasons,
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
  const visibleMatches = isPro ? matches.slice(0, 25) : user ? matches.slice(0, 10) : matches.slice(0, 3);
  const compareHref = matches.length >= 3
    ? `/compare?a=${matches[0].country.slug}&b=${matches[1].country.slug}&c=${matches[2].country.slug}`
    : "/compare";

  // ── Loading ──────────────────────────────────────────────────────────────
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

      <div className="max-w-3xl mx-auto px-6">

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <section className="pt-16 pb-14 border-b border-[#1a1a1a]">
          <p className="text-[10px] font-bold text-[#888880] uppercase tracking-[0.2em] mb-8">
            Top match{jobRoleDef ? ` · ${jobRoleDef.label}` : ""}
          </p>

          <div className="flex items-start gap-6 mb-6">
            <span className="text-7xl leading-none flex-shrink-0">{top.country.flagEmoji}</span>
            <div>
              <h1 className="font-heading text-[64px] sm:text-[80px] leading-[0.88] font-extrabold uppercase tracking-[-0.02em]">
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

          {/* Stat strip */}
          {topSalary && (
            <div className="flex flex-wrap gap-x-6 gap-y-1 mb-7 text-[12px] font-bold text-[#888880]">
              <span>{cs}{topSalary.toLocaleString()}/yr</span>
              <span>Visa {getVisaLabel(top.country.data.visaDifficulty)}</span>
              <span>{cs}{top.country.data.costRentCityCentre.toLocaleString()}/mo rent</span>
              <span>{top.country.language}</span>
              <span>{top.country.data.incomeTaxRateMid}% tax</span>
            </div>
          )}

          {/* Reason tags */}
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

          {/* CTAs */}
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
        </section>

        {/* ── TOP 3 CARDS ────────────────────────────────────────────────────── */}
        <section className="py-14 border-b border-[#1a1a1a]">
          <p className="text-[10px] font-bold text-[#888880] uppercase tracking-[0.2em] mb-8">Your top 3</p>

          <div className="grid sm:grid-cols-3 gap-4">
            {matches.slice(0, 3).map((m, i) => {
              const mcs = getCurrencySymbol(m.country.currency);
              const salary = jobRoleDef ? m.country.data[jobRoleDef.salaryKey] as number : null;
              const mPct = matchPercentColor(m.matchPercent);
              return (
                <Link
                  key={m.country.slug}
                  href={"/country/" + m.country.slug + "/personalised"}
                  className="block border border-[#1a1a1a] p-5 hover:border-[#2a2a2a] transition-colors group"
                  style={{ borderTopColor: RANK_COLORS[i], borderTopWidth: "2px" }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-heading text-[10px] font-extrabold uppercase tracking-widest" style={{ color: RANK_COLORS[i] }}>
                      #{i + 1}
                    </span>
                    <span className="font-heading text-xl font-extrabold" style={{ color: mPct }}>
                      {m.matchPercent}%
                    </span>
                  </div>
                  <div className="text-3xl mb-3">{m.country.flagEmoji}</div>
                  <p className="font-heading text-lg font-extrabold uppercase tracking-tight mb-1">{m.country.name}</p>
                  {salary && (
                    <p className="text-[10px] text-[#888880] font-medium">
                      {mcs}{salary.toLocaleString()}/yr · {getVisaLabel(m.country.data.visaDifficulty)} visa
                    </p>
                  )}
                  <div className="mt-4 pt-3 border-t border-[#1a1a1a] flex items-center justify-between">
                    <p className="text-[10px] text-[#888880]">
                      {mcs}{m.country.data.costRentCityCentre.toLocaleString()}/mo rent
                    </p>
                    <span className="text-[10px] font-bold text-[#888880] group-hover:text-accent transition-colors uppercase tracking-widest">
                      Report →
                    </span>
                  </div>
                </Link>
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

        {/* ── WHAT THIS MEANS ─────────────────────────────────────────────── */}
        <section className="py-14 border-b border-[#1a1a1a]">
          <p className="text-[10px] font-bold text-[#888880] uppercase tracking-[0.2em] mb-8">What this means</p>

          <div className="grid sm:grid-cols-2 gap-px bg-[#1a1a1a]">
            {[
              {
                label: "Best salary",
                value: (() => {
                  if (!jobRoleDef) return "—";
                  const best = [...matches].sort((a, b) =>
                    (b.country.data[jobRoleDef.salaryKey] as number) - (a.country.data[jobRoleDef.salaryKey] as number)
                  )[0];
                  const bcs = getCurrencySymbol(best.country.currency);
                  return `${bcs}${(best.country.data[jobRoleDef.salaryKey] as number).toLocaleString()} in ${best.country.name}`;
                })(),
              },
              {
                label: "Easiest visa",
                value: (() => {
                  const easiest = [...matches].sort((a, b) => a.country.data.visaDifficulty - b.country.data.visaDifficulty)[0];
                  return `${easiest.country.name} · ${getVisaLabel(easiest.country.data.visaDifficulty)}`;
                })(),
              },
              {
                label: "Lowest rent",
                value: (() => {
                  const cheapest = [...matches].sort((a, b) => {
                    const toEur = (c: CountryMatch) => c.country.data.costRentCityCentre;
                    return toEur(a) - toEur(b);
                  })[0];
                  const lcs = getCurrencySymbol(cheapest.country.currency);
                  return `${lcs}${cheapest.country.data.costRentCityCentre.toLocaleString()}/mo in ${cheapest.country.name}`;
                })(),
              },
              {
                label: "Safest country",
                value: (() => {
                  const safest = [...matches].sort((a, b) => b.country.data.scoreSafety - a.country.data.scoreSafety)[0];
                  return `${safest.country.name} · ${safest.country.data.scoreSafety}/10`;
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

        {/* ── FULL RANKING LIST ───────────────────────────────────────────── */}
        <section className="py-14 pb-20">
          <div className="flex items-baseline justify-between mb-8">
            <p className="text-[10px] font-bold text-[#888880] uppercase tracking-[0.2em]">
              Full ranking{jobRoleDef ? ` · ${jobRoleDef.label}` : ""}
            </p>
            <p className="text-[10px] font-bold text-[#888880] uppercase tracking-widest">
              {visibleMatches.length} of 25
            </p>
          </div>

          <div>
            {visibleMatches.map((match, i) => {
              const mcs = getCurrencySymbol(match.country.currency);
              const salary = jobRoleDef ? match.country.data[jobRoleDef.salaryKey] as number : null;
              const isTop3 = i < 3;
              return (
                <Link
                  key={match.country.slug}
                  href={"/country/" + match.country.slug + "/personalised"}
                  className="flex items-center gap-4 py-4 border-b border-[#111111] hover:bg-[#0d0d0d] transition-colors px-3 -mx-3 group"
                  style={isTop3 ? { borderLeftColor: RANK_COLORS[i], borderLeftWidth: "2px", paddingLeft: "14px", marginLeft: "-2px" } : {}}
                >
                  <span
                    className="font-heading text-[11px] font-extrabold w-6 text-right flex-shrink-0"
                    style={{ color: isTop3 ? RANK_COLORS[i] : "#2a2a2a" }}
                  >
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
                  <span
                    className="font-heading text-[14px] font-extrabold flex-shrink-0"
                    style={{ color: matchPercentColor(match.matchPercent) }}
                  >
                    {match.matchPercent}%
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Upgrade gate */}
          {!isPro && (
            <div className="mt-0">
              {/* Fading teaser */}
              <div className="relative overflow-hidden" style={{ height: 100 }}>
                {[visibleMatches.length + 1, visibleMatches.length + 2].map((n, i) => (
                  <div
                    key={n}
                    className="flex items-center gap-4 py-4 border-b border-[#111111] px-3"
                    style={{ opacity: i === 0 ? 0.35 : 0.15 }}
                  >
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

              {/* Upgrade strip */}
              <div className="flex items-center justify-between pt-5 border-t border-[#1a1a1a]">
                <div>
                  <p className="font-heading text-sm font-extrabold uppercase tracking-tight">
                    {25 - visibleMatches.length} more countries
                  </p>
                  <p className="text-[10px] text-[#888880] mt-0.5 uppercase tracking-widest">Unlock full ranking · €5 once</p>
                </div>
                <Link
                  href="/pro"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-[10px] font-extrabold uppercase tracking-widest bg-accent text-[#0a0a0a]"
                  style={{ boxShadow: "2px 2px 0 #00aa90" }}
                >
                  <Sparkles className="w-3 h-3" /> Get Pro
                </Link>
              </div>
            </div>
          )}

          {/* Pro: compare */}
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