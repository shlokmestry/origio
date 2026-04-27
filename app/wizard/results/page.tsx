"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Globe2, Sparkles } from "lucide-react";
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
        } catch (err) { console.error("Failed to save wizard results:", err); }
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

  // ── Loading ────────────────────────────────────────────────────────────────
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
          <div className="w-full h-1 bg-[#1a1a1a]">
            <div className="h-full bg-accent transition-all duration-100 ease-linear" style={{ width: loadingProgress + "%" }} />
          </div>
        </div>
      </div>
    );
  }

  if (matches.length === 0) return null;
  const top = matches[0];
  const pctColor = matchPercentColor(top.matchPercent);
  const topCs = getCurrencySymbol(top.country.currency);
  const topSalary = jobRoleDef ? top.country.data[jobRoleDef.salaryKey] as number : null;
  const compareHref = `/compare?a=${matches[0]?.country.slug}&b=${matches[1]?.country.slug}&c=${matches[2]?.country.slug}`;

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

      {/* Two-column layout */}
      <div className="max-w-6xl mx-auto px-6 py-12 lg:grid lg:grid-cols-[1fr_420px] lg:gap-16 lg:items-start space-y-12 lg:space-y-0">

        {/* ── LEFT: Hero ──────────────────────────────────────────────────── */}
        <div>
          {/* Eyebrow */}
          <p className="text-[10px] font-bold text-[#888880] uppercase tracking-[0.2em] mb-6">
            Your top match{jobRoleDef ? ` · ${jobRoleDef.label}` : ""}
          </p>

          {/* Flag + name */}
          <div className="flex items-start gap-5 mb-5">
            <span className="text-6xl leading-none flex-shrink-0">{top.country.flagEmoji}</span>
            <div>
              <h1 className="font-heading text-[56px] sm:text-[72px] leading-[0.9] font-extrabold uppercase tracking-[-0.02em] text-[#f0f0e8]">
                {top.country.name}
              </h1>
              <div className="flex items-baseline gap-2 mt-3">
                <span className="font-heading text-4xl font-extrabold" style={{ color: pctColor }}>
                  {top.matchPercent}%
                </span>
                <span className="text-[11px] font-bold text-[#888880] uppercase tracking-widest">match</span>
              </div>
            </div>
          </div>

          {/* Key stat line */}
          {topSalary && (
            <p className="text-[13px] font-bold text-[#888880] mb-6 tracking-wide">
              {topCs}{topSalary.toLocaleString()}/yr · {top.country.language} · Visa {top.country.data.visaDifficulty}/5
            </p>
          )}

          {/* Reason tags */}
          {top.reasons.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {top.reasons.map(r => (
                <span key={r}
                  className="text-[10px] font-bold px-2.5 py-1 uppercase tracking-widest"
                  style={{ border: `1px solid ${pctColor}60`, color: pctColor }}>
                  {r}
                </span>
              ))}
            </div>
          )}

          {/* CTAs — no rounded corners, sharp, editorial */}
          <div className="flex flex-col sm:flex-row gap-3 mb-10">
            <Link
              href={"/country/" + top.country.slug + "/personalised"}
              className="inline-block px-7 py-3.5 text-[11px] font-extrabold uppercase tracking-[0.15em] bg-accent text-[#0a0a0a]"
              style={{ boxShadow: "3px 3px 0 #00aa90" }}
            >
              View full report
            </Link>
            <button
              onClick={handleViewOnGlobe}
              className="inline-block px-7 py-3.5 text-[11px] font-extrabold uppercase tracking-[0.15em] border border-[#2a2a2a] text-[#888880] hover:text-[#f0f0e8] hover:border-[#444] transition-colors"
            >
              See on globe
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-[#1a1a1a] pt-8">
            <p className="text-[10px] font-bold text-[#888880] uppercase tracking-[0.2em] mb-4">Your top 3</p>
            <div className="space-y-3">
              {matches.slice(0, 3).map((m, i) => {
                const cs = getCurrencySymbol(m.country.currency);
                const salary = jobRoleDef ? m.country.data[jobRoleDef.salaryKey] as number : null;
                return (
                  <Link
                    key={m.country.slug}
                    href={"/country/" + m.country.slug + "/personalised"}
                    className="flex items-center gap-4 py-3 border-b border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors group"
                  >
                    <span className="font-heading text-xs font-extrabold w-4 flex-shrink-0" style={{ color: RANK_COLORS[i] }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-xl flex-shrink-0">{m.country.flagEmoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-heading text-sm font-extrabold uppercase tracking-tight text-[#f0f0e8]">{m.country.name}</p>
                      {salary && (
                        <p className="text-[10px] text-[#888880] font-medium mt-0.5">
                          {cs}{salary.toLocaleString()}/yr · {m.country.language}
                        </p>
                      )}
                    </div>
                    <span className="font-heading text-base font-extrabold flex-shrink-0" style={{ color: matchPercentColor(m.matchPercent) }}>
                      {m.matchPercent}%
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Compare hint for Pro */}
            {isPro && matches.length >= 3 && (
              <Link
                href={compareHref}
                className="inline-block mt-4 text-[10px] font-bold text-[#888880] hover:text-accent transition-colors uppercase tracking-widest"
              >
                Compare top 3 →
              </Link>
            )}
          </div>

          {/* Bottom links */}
          <div className="mt-8 flex items-center gap-5">
            <button onClick={() => router.push("/wizard")}
              className="text-[10px] font-bold text-[#888880] hover:text-[#f0f0e8] transition-colors uppercase tracking-widest">
              Retake quiz
            </button>
            <button onClick={handleViewOnGlobe}
              className="text-[10px] font-bold text-[#888880] hover:text-[#f0f0e8] transition-colors uppercase tracking-widest">
              View on globe
            </button>
          </div>
        </div>

        {/* ── RIGHT: Full ranking list ─────────────────────────────────────── */}
        <div className="lg:border-l lg:border-[#1a1a1a] lg:pl-10">
          {/* Header */}
          <div className="flex items-baseline justify-between mb-5">
            <p className="text-[10px] font-bold text-[#888880] uppercase tracking-[0.2em]">Full ranking</p>
            {jobRoleDef && (
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: matchPercentColor(top.matchPercent) }}>
                {jobRoleDef.label}
              </p>
            )}
          </div>

          {/* Rows */}
          <div>
            {visibleMatches.map((match, i) => {
              const cs = getCurrencySymbol(match.country.currency);
              const salary = jobRoleDef ? match.country.data[jobRoleDef.salaryKey] as number : null;
              const pct = match.matchPercent;
              const isTop3 = i < 3;
              return (
                <Link
                  key={match.country.slug}
                  href={"/country/" + match.country.slug + "/personalised"}
                  className="flex items-center gap-3 py-3 border-b border-[#111111] hover:bg-[#0f0f0f] transition-colors px-2 -mx-2 group"
                  style={isTop3 ? { borderLeft: `2px solid ${RANK_COLORS[i]}`, paddingLeft: "10px", marginLeft: "-2px" } : {}}
                >
                  <span
                    className="font-heading text-[11px] font-extrabold w-6 flex-shrink-0 text-right"
                    style={{ color: isTop3 ? RANK_COLORS[i] : "#333" }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-lg flex-shrink-0">{match.country.flagEmoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading text-[13px] font-extrabold uppercase tracking-tight text-[#f0f0e8] truncate">
                      {match.country.name}
                    </p>
                    {salary && (
                      <p className="text-[10px] text-[#555] font-medium mt-0.5">
                        {cs}{salary.toLocaleString()}/yr · Visa {match.country.data.visaDifficulty}/5 · {cs}{match.country.data.costRentCityCentre.toLocaleString()}/mo rent
                      </p>
                    )}
                  </div>
                  <span className="font-heading text-[13px] font-extrabold flex-shrink-0" style={{ color: matchPercentColor(pct) }}>
                    {pct}%
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Upgrade gate — fade out style */}
          {!isPro && (
            <div className="mt-0 relative">
              {/* Teaser rows — fading */}
              <div className="relative overflow-hidden" style={{ height: "120px" }}>
                {[
                  { n: visibleMatches.length + 1, opacity: 0.5 },
                  { n: visibleMatches.length + 2, opacity: 0.25 },
                ].map(({ n, opacity }) => (
                  <div key={n} className="flex items-center gap-3 py-3 border-b border-[#111111] px-2 -mx-2" style={{ opacity }}>
                    <span className="font-heading text-[11px] font-extrabold w-6 text-right text-[#333]">{n}</span>
                    <span className="text-lg">🌍</span>
                    <div className="flex-1">
                      <div className="h-3 w-24 bg-[#1a1a1a] rounded-sm" />
                      <div className="h-2 w-36 bg-[#111] rounded-sm mt-1.5" />
                    </div>
                    <div className="h-3 w-8 bg-[#1a1a1a] rounded-sm" />
                  </div>
                ))}
                {/* Fade gradient */}
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: "linear-gradient(to bottom, transparent 0%, #0a0a0a 90%)" }} />
              </div>

              {/* Upgrade line */}
              <div className="pt-4 flex items-center justify-between border-t border-[#1a1a1a]">
                <p className="text-[11px] font-bold text-[#888880] uppercase tracking-widest">
                  {25 - visibleMatches.length} more countries ranked
                </p>
                <Link
                  href="/pro"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-[10px] font-extrabold uppercase tracking-widest bg-accent text-[#0a0a0a]"
                  style={{ boxShadow: "2px 2px 0 #00aa90" }}
                >
                  <Sparkles className="w-3 h-3" /> Pro · €5
                </Link>
              </div>
            </div>
          )}

          {/* Pro: compare hint */}
          {isPro && matches.length >= 3 && (
            <div className="mt-6 pt-5 border-t border-[#1a1a1a]">
              <Link
                href={compareHref}
                className="text-[10px] font-bold text-[#888880] hover:text-accent transition-colors uppercase tracking-widest"
              >
                Compare top 3 →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}