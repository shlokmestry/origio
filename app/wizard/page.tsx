// app/wizard/page.tsx
/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState, useEffect, Component } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Sparkles, Check } from "lucide-react";
import Link from "next/link";
import { JOB_ROLES } from "@/types";
import { WizardAnswers, scoreCountriesForWizard } from "@/lib/wizard";
import { CountryWithData } from "@/types";
import { supabase } from "@/lib/supabase";
import QuizGate from "@/components/QuizGate";

// ── Design tokens ──────────────────────────────────────────────────────────
const SERIF  = "'DM Serif Display', Georgia, serif";
const SANS   = "'Satoshi', system-ui, sans-serif";
const MONO   = "'Cabinet Grotesk', 'Satoshi', sans-serif";
const BG     = "#0a0a0a";
const FG     = "#f0f0e8";
const MINT   = "#00ffd5";
const DIM    = "#888880";
const LINE   = "#1f1f1f";
const PANEL  = "#0f0f0f";

// ── Constants ──────────────────────────────────────────────────────────────
const ANON_MAX_RUNS    = 3;
const FREE_MAX_RUNS    = 5;
const ANON_STORAGE_KEY = "origio_quiz_runs";
const TOTAL_STEPS      = 8;

const STEP_LABELS = [
  "Origin", "Reason", "Role", "Priorities",
  "Vibe", "Budget", "Languages", "Deal breakers",
];

// ── Static data ────────────────────────────────────────────────────────────
const PASSPORTS = [
  "Ireland","United Kingdom","Germany","France","Netherlands","Spain",
  "Portugal","Sweden","Norway","Switzerland","Australia","New Zealand",
  "Canada","USA","Singapore","UAE","India","China","Brazil","South Africa",
  "Nigeria","Kenya","Philippines","Italy","Poland","Romania","Other",
];

function getRentBudgets(passport: string) {
  const p = passport.toLowerCase();
  if (p === "india") return {
    note: "Shown in Indian Rupees — typical rent abroad converted to INR",
    options: [
      { key: "under800",   label: "Under ₹65,000/mo",          sub: "Budget-conscious" },
      { key: "800to1500",  label: "₹65,000 – ₹1,25,000/mo",   sub: "Comfortable" },
      { key: "1500to2500", label: "₹1,25,000 – ₹2,00,000/mo", sub: "Flexible" },
      { key: "any",        label: "Money isn't a concern",      sub: "No limit" },
    ],
  };
  if (p === "usa") return {
    note: "Shown in US Dollars",
    options: [
      { key: "under800",   label: "Under $800/mo",        sub: "Budget-conscious" },
      { key: "800to1500",  label: "$800 – $1,500/mo",     sub: "Comfortable" },
      { key: "1500to2500", label: "$1,500 – $2,500/mo",   sub: "Flexible" },
      { key: "any",        label: "Money isn't a concern", sub: "No limit" },
    ],
  };
  return {
    note: "Shown in Euros — average city-centre rent abroad",
    options: [
      { key: "under800",   label: "Under €800/mo",        sub: "Budget-conscious" },
      { key: "800to1500",  label: "€800 – €1,500/mo",     sub: "Comfortable" },
      { key: "1500to2500", label: "€1,500 – €2,500/mo",   sub: "Flexible" },
      { key: "any",        label: "Money isn't a concern", sub: "No limit" },
    ],
  };
}

const LANGUAGES = [
  { key: "english",    label: "English" },
  { key: "spanish",    label: "Spanish" },
  { key: "french",     label: "French" },
  { key: "german",     label: "German" },
  { key: "portuguese", label: "Portuguese" },
  { key: "arabic",     label: "Arabic" },
  { key: "mandarin",   label: "Mandarin" },
  { key: "hindi",      label: "Hindi" },
  { key: "italian",    label: "Italian" },
  { key: "dutch",      label: "Dutch" },
  { key: "swedish",    label: "Swedish" },
  { key: "norwegian",  label: "Norwegian" },
  { key: "japanese",   label: "Japanese" },
  { key: "korean",     label: "Korean" },
  { key: "tagalog",    label: "Tagalog" },
  { key: "turkish",    label: "Turkish" },
  { key: "polish",     label: "Polish" },
  { key: "none",       label: "English only" },
];

const DEAL_BREAKERS = [
  { key: "english",  label: "Must be English-speaking" },
  { key: "europe",   label: "Must be in Europe" },
  { key: "lowtax",   label: "Must have low taxes" },
  { key: "warm",     label: "Must have warm weather" },
  { key: "lowcrime", label: "Must have low crime rate" },
  { key: "none",     label: "No deal breakers" },
];

// ── Error boundary ─────────────────────────────────────────────────────────
class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: "100vh", background: BG, color: FG, fontFamily: SANS, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 32 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: MINT }}>Error</div>
          <p style={{ color: DIM, fontSize: 14, maxWidth: 400, textAlign: "center", lineHeight: 1.6 }}>
            Something went wrong loading the quiz. Please refresh the page.
          </p>
          <pre style={{ fontSize: 11, color: "#555", maxWidth: 500, overflow: "auto", background: PANEL, padding: 12, borderRadius: 8 }}>
            {this.state.error.message}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: "12px 24px", background: MINT, color: BG, border: "none", cursor: "pointer", fontFamily: MONO, fontSize: 11, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase" }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Loading spinner ────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <div style={{ fontFamily: SERIF, fontSize: 22, color: FG, letterSpacing: "-0.02em" }}>
          origio<span style={{ color: MINT }}>.</span>
        </div>
        <div style={{ width: 120, height: 2, background: LINE, overflow: "hidden" }}>
          <div style={{ width: "40%", height: "100%", background: MINT, animation: "pulse 1.4s ease infinite" }} />
        </div>
      </div>
    </div>
  );
}

// ── Shared UI ──────────────────────────────────────────────────────────────
function EyebrowLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase" as const, color: MINT, marginBottom: 12 }}>
      {children}
    </div>
  );
}

function StepHeading({ children }: { children: React.ReactNode }) {
  return (
    <h1 style={{ fontFamily: SERIF, fontSize: "clamp(38px, 5vw, 60px)", lineHeight: 1.04, letterSpacing: "-0.02em", margin: "0 0 14px", color: FG, fontWeight: 400 }}>
      {children}
    </h1>
  );
}

function StepSub({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ color: DIM, fontSize: 15, lineHeight: 1.6, margin: "0 0 32px", fontFamily: SANS }}>
      {children}
    </p>
  );
}

function Mint({ children }: { children: React.ReactNode }) {
  return <em style={{ color: MINT, fontStyle: "italic" }}>{children}</em>;
}

function OptionCard({ selected, onClick, children, badge }: {
  selected: boolean; onClick: () => void; children: React.ReactNode; badge?: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button onClick={onClick} type="button"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 14,
        padding: "15px 18px", borderRadius: 12,
        border: `1px solid ${selected ? MINT : hovered ? "#333" : LINE}`,
        background: selected ? "rgba(0,255,213,0.05)" : PANEL,
        color: FG, cursor: "pointer", transition: "all 0.15s",
        fontFamily: SANS, fontSize: 14,
        boxShadow: selected ? "0 0 0 3px rgba(0,255,213,0.07)" : "none",
      }}>
      {badge}
      <div style={{ flex: 1 }}>{children}</div>
      {selected && !badge && (
        <span style={{ width: 22, height: 22, borderRadius: "50%", background: MINT, color: BG, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Check size={12} strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

// ── Inner wizard (separated so ErrorBoundary wraps it cleanly) ─────────────
function WizardInner() {
  const router = useRouter();
  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Partial<WizardAnswers>>({ priorities: [], languages: [], dealBreakers: [] });

  const [gateChecked, setGateChecked] = useState(false);
  const [gateType, setGateType]       = useState<"anon" | "free" | null>(null);
  const [runsUsed, setRunsUsed]       = useState(0);
  const [isPro, setIsPro]             = useState(false);
  const [isSignedIn, setIsSignedIn]   = useState(false);

  useEffect(() => {
    async function checkGate() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          const stored = parseInt(localStorage.getItem(ANON_STORAGE_KEY) ?? "0", 10);
          setRunsUsed(stored);
          setIsSignedIn(false);
          if (stored >= ANON_MAX_RUNS) setGateType("anon");
          setGateChecked(true);
          return;
        }
        setIsSignedIn(true);
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_pro, quiz_runs_count")
          .eq("id", session.user.id)
          .single();
        const pro  = profile?.is_pro ?? false;
        const runs = profile?.quiz_runs_count ?? 0;
        setIsPro(pro);
        setRunsUsed(runs);
        if (!pro && runs >= FREE_MAX_RUNS) setGateType("free");
      } catch (err) {
        console.error("Gate check failed:", err);
      } finally {
        setGateChecked(true);
      }
    }
    checkGate();
  }, []);

  const isJobOffer = answers.moveReason === "job";
  const getNextStep = (cur: number) => {
    if (cur === 2 && isJobOffer) return 3;
    if (cur === 3 && isJobOffer) return 7;
    return cur + 1;
  };
  const getPrevStep = (cur: number) => {
    if (cur === 7 && isJobOffer) return 3;
    if (cur === 3 && isJobOffer) return 2;
    return cur - 1;
  };
  const getEffectiveTotalSteps = () => isJobOffer ? 5 : TOTAL_STEPS;
  const getEffectiveStep = () => {
    if (!isJobOffer) return step;
    if (step <= 3) return step;
    if (step >= 7) return step - 3;
    return step;
  };
  const progress   = (getEffectiveStep() / getEffectiveTotalSteps()) * 100;
  const isLastStep = isJobOffer ? step === 8 : step === TOTAL_STEPS;
  const maxRuns    = isPro ? Infinity : isSignedIn ? FREE_MAX_RUNS : ANON_MAX_RUNS;
  const runsLeft   = isPro ? null : Math.max(0, maxRuns - runsUsed);

  const canProceed = () => {
    if (step === 1) return !!answers.passport;
    if (step === 2) return !!answers.moveReason;
    if (step === 3) return !!answers.jobRole;
    if (step === 4) return (answers.priorities?.length ?? 0) >= 3;
    if (step === 5) return !!answers.cityVibe;
    if (step === 6) return !!answers.rentBudget;
    if (step === 7) return (answers.languages?.length ?? 0) > 0;
    if (step === 8) return (answers.dealBreakers?.length ?? 0) > 0;
    return false;
  };

  const handleNext = () => {
    const next = getNextStep(step);
    if (next <= TOTAL_STEPS) setStep(next);
    else handleSubmit();
  };
  const handleBack = () => {
    if (step === 1) router.push("/");
    else setStep(getPrevStep(step));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res       = await fetch("/api/countries");
      const countries: CountryWithData[] = await res.json();
      let matches     = scoreCountriesForWizard(countries, answers as WizardAnswers);
      try {
        const controller = new AbortController();
        const timeout    = setTimeout(() => controller.abort(), 3000);
        const vRes       = await fetch("/api/validate-results", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ matches, answers }),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (vRes.ok) {
          const v = await vRes.json();
          if (!v.valid && v.flaggedCountries?.length > 0) {
            const flagged = v.flaggedCountries.map((n: string) => n.toLowerCase());
            matches = [
              ...matches.filter(m => !flagged.includes(m.country.name.toLowerCase())),
              ...matches.filter(m => flagged.includes(m.country.name.toLowerCase()))
                .map(m => ({ ...m, matchPercent: Math.min(m.matchPercent, 40) })),
            ];
          }
        }
      } catch { /* silent */ }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.rpc("increment_quiz_runs", { user_id: session.user.id });
      } else {
        const cur = parseInt(localStorage.getItem(ANON_STORAGE_KEY) ?? "0", 10);
        localStorage.setItem(ANON_STORAGE_KEY, String(cur + 1));
      }
      sessionStorage.setItem("wizardMatches", JSON.stringify(matches));
      sessionStorage.setItem("wizardAnswers", JSON.stringify(answers));
      router.push("/wizard/results");
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const { note: rentNote, options: rentOptions } = getRentBudgets(answers.passport ?? "");
  const effectiveStep = getEffectiveStep();
  const totalSteps    = getEffectiveTotalSteps();
  const stepPad       = (n: number) => String(n).padStart(2, "0");

  // ── Loading gate check ─────────────────────────────────────────────────
  if (!gateChecked) return <LoadingScreen />;

  // ── Gate walls ─────────────────────────────────────────────────────────
  if (gateType) {
    return (
      <QuizGate
        type={gateType}
        runsUsed={runsUsed}
        maxRuns={gateType === "anon" ? ANON_MAX_RUNS : FREE_MAX_RUNS}
      />
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: BG, color: FG, fontFamily: SANS }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.35} }
        select option { background:#0f0f0f; color:#f0f0e8; }
        @media(max-width:860px){
          .wiz-layout  { grid-template-columns: 1fr !important; }
          .wiz-sidebar { display: none !important; }
        }
      `}</style>

      {/* ── Header ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(10,10,10,0.80)", backdropFilter: "blur(14px)", borderBottom: `1px solid ${LINE}` }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={handleBack}
            style={{ background: "none", border: "none", color: DIM, cursor: "pointer", fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6, transition: "color 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.color = FG)}
            onMouseLeave={e => (e.currentTarget.style.color = DIM)}>
            <ArrowLeft size={14} /> Back
          </button>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: FG }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: MINT, display: "inline-block" }} />
            <span style={{ fontFamily: SERIF, fontSize: 22, letterSpacing: "-0.02em" }}>origio<span style={{ color: MINT }}>.</span></span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {runsLeft !== null && runsLeft <= 2 && (
              <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: DIM, border: `1px solid ${LINE}`, padding: "4px 10px" }}>
                {runsLeft} run{runsLeft !== 1 ? "s" : ""} left
              </span>
            )}
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: DIM }}>
              <span style={{ color: MINT }}>{stepPad(effectiveStep)}</span>{" / "}<span>{stepPad(totalSteps)}</span>
            </div>
          </div>
        </div>
        <div style={{ height: 2, background: "#111" }}>
          <div style={{ width: `${progress}%`, height: "100%", background: MINT, transition: "width 0.45s cubic-bezier(.2,.8,.2,1)" }} />
        </div>
      </header>

      {/* ── Main layout ── */}
      <main className="wiz-layout" style={{ maxWidth: 1280, margin: "0 auto", padding: "52px 32px 120px", display: "grid", gridTemplateColumns: "240px 1fr", gap: "48px 52px", alignItems: "start" }}>

        {/* ── Sidebar ── */}
        <aside className="wiz-sidebar" style={{ position: "sticky", top: 88, alignSelf: "start" }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: DIM, marginBottom: 18 }}>
            ✦ Quiz · 8 questions
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
            {STEP_LABELS.map((label, i) => {
              const num     = i + 1;
              const isCur   = num === step;
              const done    = num < step;
              const skipped = isJobOffer && (num === 4 || num === 5 || num === 6);
              return (
                <li key={label} style={{ display: "flex", alignItems: "center", gap: 12, opacity: skipped ? 0.2 : isCur || done ? 1 : 0.45 }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, background: done ? MINT : "transparent", border: `1px solid ${isCur ? MINT : done ? MINT : LINE}`, color: done ? BG : isCur ? MINT : DIM, fontFamily: MONO, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {done ? <Check size={11} strokeWidth={3} /> : num}
                  </span>
                  <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: isCur ? FG : DIM, textDecoration: skipped ? "line-through" : "none" }}>
                    {label}
                  </span>
                </li>
              );
            })}
          </ul>

          <div style={{ marginTop: 32, padding: "16px 18px", border: `1px solid ${LINE}`, borderRadius: 12, background: PANEL }}>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: MINT, marginBottom: 8 }}>✦ How it works</div>
            <p style={{ fontSize: 13, color: DIM, lineHeight: 1.6, margin: 0, fontFamily: SANS }}>
              We score 25 countries against your role, passport and priorities. Takes ~90 seconds.
            </p>
          </div>
        </aside>

        {/* ── Step content ── */}
        <section key={step} style={{ animation: "fadeUp 0.38s ease both", maxWidth: 660 }}>

          {/* Step 1 */}
          {step === 1 && (
            <>
              <EyebrowLabel>Step 01 · Origin</EyebrowLabel>
              <StepHeading>Where are you <Mint>from?</Mint></StepHeading>
              <StepSub>Your passport affects which countries are easiest to move to — visas, taxes, and treaties all hinge on it.</StepSub>
              <select
                value={answers.passport ?? ""}
                onChange={e => setAnswers({ ...answers, passport: e.target.value })}
                style={{ width: "100%", padding: "16px 18px", background: PANEL, border: `1px solid ${LINE}`, borderRadius: 12, color: answers.passport ? FG : DIM, fontSize: 15, outline: "none", fontFamily: SANS, cursor: "pointer", transition: "border-color 0.15s" }}
                onFocus={e => (e.currentTarget.style.borderColor = MINT)}
                onBlur={e  => (e.currentTarget.style.borderColor = LINE)}
              >
                <option value="" disabled>Select your passport country</option>
                {PASSPORTS.map(p => <option key={p} value={p.toLowerCase()}>{p}</option>)}
              </select>
            </>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <>
              <EyebrowLabel>Step 02 · Reason</EyebrowLabel>
              <StepHeading>Why are you <Mint>moving?</Mint></StepHeading>
              <StepSub>This shapes which factors matter most. A job offer skips a few questions.</StepSub>
              <div style={{ display: "grid", gap: 10 }}>
                {[
                  { key: "job",       label: "I have a job offer",          sub: "Moving for a specific role" },
                  { key: "career",    label: "Better career opportunities", sub: "Higher salary, growth, tech hubs" },
                  { key: "remote",    label: "I work remotely",             sub: "Location flexibility, low tax, fast internet" },
                  { key: "retire",    label: "Retirement / FIRE",           sub: "Low cost, healthcare, passive income" },
                  { key: "study",     label: "Study abroad",                sub: "Universities, student visas" },
                  { key: "lifestyle", label: "Lifestyle change",            sub: "Weather, culture, quality of life" },
                ].map(opt => (
                  <OptionCard key={opt.key} selected={answers.moveReason === opt.key} onClick={() => setAnswers({ ...answers, moveReason: opt.key })}>
                    <div style={{ fontWeight: 600, fontSize: 15, color: FG, marginBottom: 2 }}>{opt.label}</div>
                    <div style={{ fontSize: 13, color: DIM }}>{opt.sub}</div>
                  </OptionCard>
                ))}
              </div>
            </>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <>
              <EyebrowLabel>Step 03 · Role</EyebrowLabel>
              <StepHeading>What's your <Mint>job?</Mint></StepHeading>
              <StepSub>Used to show realistic salary expectations per country.</StepSub>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
                {JOB_ROLES.map(r => (
                  <OptionCard key={r.key} selected={answers.jobRole === r.key} onClick={() => setAnswers({ ...answers, jobRole: r.key })}
                    badge={<span style={{ fontSize: 20, flexShrink: 0 }}>{r.emoji}</span>}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: FG }}>{r.label}</div>
                  </OptionCard>
                ))}
              </div>
            </>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <>
              <EyebrowLabel>Step 04 · Priorities</EyebrowLabel>
              <StepHeading>What matters <Mint>most?</Mint></StepHeading>
              <StepSub>Pick at least 3, in order of importance. The first one you tap carries the highest weight.</StepSub>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
                {[
                  { key: "salary",        label: "High salary" },
                  { key: "affordability", label: "Low cost of living" },
                  { key: "quality",       label: "Quality of life" },
                  { key: "safety",        label: "Safety & low crime" },
                  { key: "visa",          label: "Easy visa / immigration" },
                  { key: "tax",           label: "Low taxes" },
                  { key: "healthcare",    label: "Good healthcare" },
                  { key: "english",       label: "English-speaking" },
                ].map(opt => {
                  const idx      = answers.priorities?.indexOf(opt.key) ?? -1;
                  const selected = idx !== -1;
                  return (
                    <OptionCard key={opt.key} selected={selected}
                      onClick={() => {
                        const cur = answers.priorities ?? [];
                        setAnswers({ ...answers, priorities: selected ? cur.filter(x => x !== opt.key) : [...cur, opt.key] });
                      }}
                      badge={
                        <span style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, border: `1px solid ${selected ? MINT : LINE}`, color: selected ? MINT : DIM, background: selected ? "rgba(0,255,213,0.08)" : "transparent", fontFamily: SERIF, fontStyle: "italic", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {selected ? idx + 1 : "·"}
                        </span>
                      }>
                      <div style={{ fontWeight: 600, fontSize: 14, color: FG }}>{opt.label}</div>
                    </OptionCard>
                  );
                })}
              </div>
              <div style={{ marginTop: 14, fontFamily: MONO, fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: (answers.priorities?.length ?? 0) >= 3 ? MINT : DIM, transition: "color 0.2s" }}>
                {answers.priorities?.length ?? 0} / 3 selected {(answers.priorities?.length ?? 0) >= 3 && "✓"}
              </div>
            </>
          )}

          {/* Step 5 */}
          {step === 5 && (
            <>
              <EyebrowLabel>Step 05 · Vibe</EyebrowLabel>
              <StepHeading>What's your <Mint>vibe?</Mint></StepHeading>
              <StepSub>What kind of place are you actually looking for?</StepSub>
              <div style={{ display: "grid", gap: 10 }}>
                {[
                  { key: "big-city", label: "Big city",        sub: "London, NYC, Singapore energy" },
                  { key: "mid-city", label: "Mid-size city",   sub: "Liveable, less hectic" },
                  { key: "coastal",  label: "Coastal / beach", sub: "Warm, relaxed, outdoor lifestyle" },
                  { key: "anywhere", label: "Anywhere works",  sub: "I'm flexible" },
                ].map(opt => (
                  <OptionCard key={opt.key} selected={answers.cityVibe === opt.key} onClick={() => setAnswers({ ...answers, cityVibe: opt.key })}>
                    <div style={{ fontWeight: 600, fontSize: 15, color: FG, marginBottom: 2 }}>{opt.label}</div>
                    <div style={{ fontSize: 13, color: DIM }}>{opt.sub}</div>
                  </OptionCard>
                ))}
              </div>
            </>
          )}

          {/* Step 6 */}
          {step === 6 && (
            <>
              <EyebrowLabel>Step 06 · Budget</EyebrowLabel>
              <StepHeading>Rent <Mint>budget?</Mint></StepHeading>
              <StepSub>{rentNote}</StepSub>
              <div style={{ display: "grid", gap: 10 }}>
                {rentOptions.map(opt => (
                  <OptionCard key={opt.key} selected={answers.rentBudget === opt.key} onClick={() => setAnswers({ ...answers, rentBudget: opt.key })}>
                    <div style={{ fontWeight: 600, fontSize: 15, color: FG, marginBottom: 2 }}>{opt.label}</div>
                    <div style={{ fontSize: 13, color: DIM }}>{opt.sub}</div>
                  </OptionCard>
                ))}
              </div>
            </>
          )}

          {/* Step 7 */}
          {step === 7 && (
            <>
              <EyebrowLabel>Step 07 · Languages</EyebrowLabel>
              <StepHeading>Languages you <Mint>speak?</Mint></StepHeading>
              <StepSub>Speaking the local language opens more doors — and unlocks lower-tax visas in some countries.</StepSub>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {LANGUAGES.map(l => {
                  const selected = answers.languages?.includes(l.key);
                  return (
                    <button key={l.key} type="button"
                      onClick={() => {
                        const cur = answers.languages ?? [];
                        if (l.key === "none") { setAnswers({ ...answers, languages: ["none"] }); return; }
                        const withoutNone = cur.filter(x => x !== "none");
                        setAnswers({ ...answers, languages: selected ? withoutNone.filter(x => x !== l.key) : [...withoutNone, l.key] });
                      }}
                      style={{ padding: "10px 16px", borderRadius: 999, border: `1px solid ${selected ? MINT : LINE}`, background: selected ? "rgba(0,255,213,0.08)" : PANEL, color: selected ? MINT : FG, fontFamily: SANS, fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 6 }}>
                      {selected && <Check size={12} strokeWidth={3} />}
                      {l.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Step 8 */}
          {step === 8 && (
            <>
              <EyebrowLabel>Final step · Deal breakers</EyebrowLabel>
              <StepHeading>Anything <Mint>non-negotiable?</Mint></StepHeading>
              <StepSub>Select all that apply. We'll filter out countries that don't meet these.</StepSub>
              <div style={{ display: "grid", gap: 10 }}>
                {DEAL_BREAKERS.map(d => {
                  const selected = answers.dealBreakers?.includes(d.key);
                  return (
                    <OptionCard key={d.key} selected={!!selected}
                      onClick={() => {
                        const cur = answers.dealBreakers ?? [];
                        if (d.key === "none") { setAnswers({ ...answers, dealBreakers: ["none"] }); return; }
                        const withoutNone = cur.filter(x => x !== "none");
                        setAnswers({ ...answers, dealBreakers: selected ? withoutNone.filter(x => x !== d.key) : [...withoutNone, d.key] });
                      }}>
                      <div style={{ fontWeight: 600, fontSize: 15, color: FG }}>{d.label}</div>
                    </OptionCard>
                  );
                })}
              </div>
            </>
          )}

          {/* Nav buttons */}
          <div style={{ marginTop: 44, paddingTop: 24, borderTop: `1px solid ${LINE}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button onClick={handleBack}
              style={{ padding: "12px 22px", borderRadius: 999, background: "transparent", border: `1px solid ${LINE}`, color: DIM, cursor: "pointer", fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8, transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.color = FG; e.currentTarget.style.borderColor = "#3a3a3a"; }}
              onMouseLeave={e => { e.currentTarget.style.color = DIM; e.currentTarget.style.borderColor = LINE; }}>
              <ArrowLeft size={14} /> Back
            </button>
            <button onClick={handleNext} disabled={!canProceed() || loading}
              style={{ padding: "14px 28px", borderRadius: 999, background: canProceed() && !loading ? MINT : "#1a1a1a", color: canProceed() && !loading ? BG : DIM, border: "none", cursor: canProceed() && !loading ? "pointer" : "not-allowed", fontFamily: MONO, fontSize: 12, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8, transition: "all 0.15s", boxShadow: canProceed() && !loading ? "0 4px 20px rgba(0,255,213,0.18)" : "none" }}>
              {loading
                ? "Finding matches..."
                : isLastStep
                  ? <><Sparkles size={14} /> Find my country</>
                  : <>Next <ArrowRight size={14} /></>
              }
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

// ── Root export ────────────────────────────────────────────────────────────
export default function WizardPage() {
  return (
    <ErrorBoundary>
      <WizardInner />
    </ErrorBoundary>
  );
}