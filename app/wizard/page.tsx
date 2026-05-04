/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { JOB_ROLES } from "@/types";
import { WizardAnswers, scoreCountriesForWizard } from "@/lib/wizard";
import { CountryWithData } from "@/types";
import { supabase } from "@/lib/supabase";
import QuizGate from "@/components/QuizGate";

// ── Constants ──────────────────────────────────────────────────────────────
const ANON_MAX_RUNS = 3;
const FREE_MAX_RUNS = 5;
const ANON_STORAGE_KEY = "origio_quiz_runs";
const TOTAL_STEPS = 8;

const STEP_LABELS: Record<number, string> = {
  1: "Departure",
  2: "Motive",
  3: "Profession",
  4: "Priorities",
  5: "Vibe",
  6: "Budget",
  7: "Tongue",
  8: "Non-negotiables",
};

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
      { key: "800to1500",  label: "€800 – €1,500/mo",    sub: "Comfortable" },
      { key: "1500to2500", label: "€1,500 – €2,500/mo",  sub: "Flexible" },
      { key: "any",        label: "Money isn't a concern", sub: "No limit" },
    ],
  };
}

const LANGUAGES = [
  { key: "english",    label: "English" },    { key: "spanish",   label: "Spanish" },
  { key: "french",     label: "French" },     { key: "german",    label: "German" },
  { key: "portuguese", label: "Portuguese" }, { key: "arabic",    label: "Arabic" },
  { key: "mandarin",   label: "Mandarin" },   { key: "hindi",     label: "Hindi" },
  { key: "italian",    label: "Italian" },    { key: "dutch",     label: "Dutch" },
  { key: "swedish",    label: "Swedish" },    { key: "norwegian", label: "Norwegian" },
  { key: "japanese",   label: "Japanese" },   { key: "korean",    label: "Korean" },
  { key: "tagalog",    label: "Tagalog" },    { key: "turkish",   label: "Turkish" },
  { key: "polish",     label: "Polish" },     { key: "none",      label: "English only" },
];

const DEAL_BREAKERS = [
  { key: "english",  label: "Must be English-speaking" },
  { key: "europe",   label: "Must be in Europe" },
  { key: "lowtax",   label: "Must have low taxes" },
  { key: "warm",     label: "Must have warm weather" },
  { key: "lowcrime", label: "Must have low crime rate" },
  { key: "none",     label: "No deal breakers" },
];

// ── Framer-motion variants ─────────────────────────────────────────────────
const pageVariants = {
  enter: { opacity: 0, y: 32 },
  center: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] } },
  exit:  { opacity: 0, y: -24, transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } },
};

const rowContainerVariants = {
  center: { transition: { staggerChildren: 0.055, delayChildren: 0.12 } },
};

const rowItemVariants = {
  enter:  { opacity: 0, y: 18 },
  center: { opacity: 1, y: 0,  transition: { type: "spring", damping: 28, stiffness: 220 } },
  exit:   { opacity: 0 },
};

// ── SplitFlapDigit ─────────────────────────────────────────────────────────
function SplitFlapDigit({ value }: { value: string }) {
  const [prev, setPrev] = useState(value);
  const [curr, setCurr] = useState(value);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (value === curr) return;
    setFlipping(true);
    setPrev(curr);
    const t = setTimeout(() => { setCurr(value); setFlipping(false); }, 180);
    return () => clearTimeout(t);
  }, [value, curr]);

  return (
    <span
      className="inline-block relative overflow-hidden font-mono tabular-nums"
      style={{ minWidth: "0.6em" }}
    >
      {/* Static bottom half always shows curr */}
      <span className="block" style={{ color: "#00ffd5", opacity: flipping ? 0.3 : 1, transition: "opacity 0.18s" }}>
        {curr}
      </span>
      {/* Flipping overlay */}
      {flipping && (
        <span
          className="absolute inset-0 flex items-center justify-center"
          style={{
            color: "#f5c518",
            animation: "splitFlap 0.18s ease-in forwards",
          }}
        >
          {prev}
        </span>
      )}
    </span>
  );
}

// ── SegmentedProgress ──────────────────────────────────────────────────────
function SegmentedProgress({
  total,
  current,
}: {
  total: number;
  current: number;
}) {
  return (
    <div className="flex w-full gap-px" role="progressbar" aria-valuenow={current} aria-valuemax={total}>
      {Array.from({ length: total }).map((_, i) => {
        const filled = i < current - 1;
        const active = i === current - 1;
        return (
          <div
            key={i}
            className="h-[3px] flex-1 relative overflow-hidden"
            style={{ background: "#1a1a1a" }}
          >
            {filled && (
              <div className="absolute inset-0" style={{ background: "#00ffd5" }} />
            )}
            {active && (
              <motion.div
                className="absolute inset-0"
                style={{ background: "#00ffd5", transformOrigin: "left" }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              />
            )}
            {active && (
              <motion.div
                className="absolute inset-0"
                style={{ background: "#f5c518", opacity: 0.5 }}
                animate={{ opacity: [0.5, 0.9, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── OptionRow ──────────────────────────────────────────────────────────────
function OptionRow({
  selected,
  onClick,
  children,
  sub,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  sub?: string;
}) {
  return (
    <motion.button
      layout
      onClick={onClick}
      whileHover={{ x: 8 }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="w-full flex items-center gap-4 py-3.5 text-left relative group border-b border-[#1e1e1e] last:border-b-0 focus:outline-none"
      style={{ borderTop: "1px solid #1e1e1e" }}
    >
      {/* Left accent bar */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-[2px]"
        style={{ background: "#00ffd5" }}
        animate={{ scaleY: selected ? 1 : 0, opacity: selected ? 1 : 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      />

      {/* Checkmark */}
      <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
        {selected ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <motion.path
              d="M2.5 8.5L6.5 12.5L13.5 4"
              stroke="#00ffd5"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
        ) : (
          <div
            className="w-[14px] h-[14px] border transition-colors duration-150"
            style={{ borderColor: selected ? "#00ffd5" : "#333330" }}
          />
        )}
      </div>

      {/* Label */}
      <div className="flex-1 min-w-0">
        <span
          className="font-mono text-sm transition-colors duration-150"
          style={{
            color: selected ? "#f0f0e8" : "#777770",
            textDecoration: "none",
          }}
        >
          {children}
        </span>
        {sub && (
          <div className="font-mono text-[11px] mt-0.5" style={{ color: "#444440" }}>
            {sub}
          </div>
        )}
      </div>
    </motion.button>
  );
}

// ── PriorityRow ────────────────────────────────────────────────────────────
function PriorityRow({
  label,
  rank,
  selected,
  onClick,
}: {
  label: string;
  rank: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      layout
      onClick={onClick}
      whileHover={{ x: 8 }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="w-full flex items-center gap-4 py-3.5 text-left relative border-b border-[#1e1e1e] last:border-b-0 focus:outline-none"
      style={{ borderTop: "1px solid #1e1e1e" }}
    >
      {/* Left accent bar */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-[2px]"
        style={{ background: "#00ffd5" }}
        animate={{ scaleY: selected ? 1 : 0, opacity: selected ? 1 : 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      />

      {/* Rank badge — spring pop */}
      <motion.div
        className="flex-shrink-0 w-6 h-6 flex items-center justify-center font-mono text-[11px] font-bold"
        style={{
          background: selected ? "#00ffd5" : "transparent",
          color: selected ? "#0a0a0a" : "#333330",
          border: selected ? "none" : "1px solid #2a2a2a",
        }}
        animate={selected ? { scale: [1, 1.3, 1] } : { scale: 1 }}
        transition={{ type: "spring", damping: 12, stiffness: 300, duration: 0.35 }}
      >
        {selected ? rank : "·"}
      </motion.div>

      <span
        className="font-mono text-sm transition-colors duration-150"
        style={{ color: selected ? "#f0f0e8" : "#777770" }}
      >
        {label}
      </span>
    </motion.button>
  );
}

// ── CompassButton ──────────────────────────────────────────────────────────
function CompassButton({
  loading,
  disabled,
  onClick,
  label,
}: {
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
  label: string;
}) {
  const [hovered, setHovered] = useState(false);
  const [typewriterText, setTypewriterText] = useState("");
  const fullText = "Scanning 197 countries…";
  const twRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (loading) {
      let i = 0;
      setTypewriterText("");
      twRef.current = setInterval(() => {
        i++;
        setTypewriterText(fullText.slice(0, i));
        if (i >= fullText.length && twRef.current) clearInterval(twRef.current);
      }, 38);
    }
    return () => { if (twRef.current) clearInterval(twRef.current); };
  }, [loading]);

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative overflow-hidden flex items-center gap-3 px-8 py-4 font-mono text-sm font-bold uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none"
      style={{
        background: disabled && !loading ? "transparent" : "#00ffd5",
        color: "#0a0a0a",
        boxShadow: !disabled && !loading ? "4px 4px 0 #f5c518" : "none",
        border: disabled ? "1px solid #2a2a2a" : "none",
      }}
      whileHover={!disabled && !loading ? { x: -2, y: -2 } : {}}
      whileTap={!disabled && !loading ? { x: 2, y: 2, boxShadow: "0px 0px 0 #f5c518" } : {}}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
    >
      {/* Rotating compass rose behind text */}
      {hovered && !disabled && !loading && (
        <motion.svg
          className="absolute right-4 opacity-20"
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        >
          <circle cx="16" cy="16" r="14" stroke="#0a0a0a" strokeWidth="1" />
          <path d="M16 2L18 14H14L16 2Z" fill="#0a0a0a" />
          <path d="M16 30L14 18H18L16 30Z" fill="#0a0a0a" opacity="0.5" />
          <path d="M2 16L14 14V18L2 16Z" fill="#0a0a0a" opacity="0.5" />
          <path d="M30 16L18 18V14L30 16Z" fill="#0a0a0a" />
          <circle cx="16" cy="16" r="2" fill="#0a0a0a" />
        </motion.svg>
      )}

      {loading ? (
        <span className="font-mono">
          {typewriterText}
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.6 }}
          >▮</motion.span>
        </span>
      ) : (
        <>
          {label}
          <ArrowRight className="w-4 h-4" />
        </>
      )}
    </motion.button>
  );
}

// ── JobInitial ────────────────────────────────────────────────────────────
function JobInitial({ label }: { label: string }) {
  const initials = label
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <span
      className="flex-shrink-0 w-7 h-7 flex items-center justify-center font-mono text-[10px] font-bold"
      style={{ border: "1px solid #2a2a2a", color: "#555550" }}
    >
      {initials}
    </span>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function WizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Partial<WizardAnswers>>({
    priorities: [],
    languages: [],
    dealBreakers: [],
  });

  // Gate state
  const [gateChecked, setGateChecked] = useState(false);
  const [gateType, setGateType] = useState<"anon" | "free" | null>(null);
  const [runsUsed, setRunsUsed] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  // ── Check run limits on mount ────────────────────────────────────────────
  useEffect(() => {
    async function checkGate() {
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
      const pro = profile?.is_pro ?? false;
      const runs = profile?.quiz_runs_count ?? 0;
      setIsPro(pro);
      setRunsUsed(runs);
      if (!pro && runs >= FREE_MAX_RUNS) setGateType("free");
      setGateChecked(true);
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
  const getEffectiveTotalSteps = () => (isJobOffer ? 5 : TOTAL_STEPS);
  const getEffectiveStep = () => {
    if (!isJobOffer) return step;
    if (step <= 3) return step;
    if (step >= 7) return step - 3;
    return step;
  };
  const isLastStep = isJobOffer ? step === 8 : step === TOTAL_STEPS;

  const maxRuns = isPro ? Infinity : isSignedIn ? FREE_MAX_RUNS : ANON_MAX_RUNS;
  const runsLeft = isPro ? null : Math.max(0, maxRuns - runsUsed);

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
    setDirection(1);
    const next = getNextStep(step);
    if (next <= TOTAL_STEPS) setStep(next);
    else handleSubmit();
  };
  const handleBack = () => {
    if (step === 1) { router.push("/"); return; }
    setDirection(-1);
    setStep(getPrevStep(step));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/countries");
      const countries: CountryWithData[] = await res.json();
      let matches = scoreCountriesForWizard(countries, answers as WizardAnswers);

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const validationRes = await fetch("/api/validate-results", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ matches, answers }),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (validationRes.ok) {
          const validation = await validationRes.json();
          if (!validation.valid && validation.flaggedCountries?.length > 0) {
            const flagged = validation.flaggedCountries.map((n: string) => n.toLowerCase());
            matches = [
              ...matches.filter((m) => !flagged.includes(m.country.name.toLowerCase())),
              ...matches
                .filter((m) => flagged.includes(m.country.name.toLowerCase()))
                .map((m) => ({ ...m, matchPercent: Math.min(m.matchPercent, 40) })),
            ];
          }
        }
      } catch { /* silent */ }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.rpc("increment_quiz_runs", { user_id: session.user.id });
      } else {
        const current = parseInt(localStorage.getItem(ANON_STORAGE_KEY) ?? "0", 10);
        localStorage.setItem(ANON_STORAGE_KEY, String(current + 1));
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
  const effectiveTotal = getEffectiveTotalSteps();
  const stepLabel = STEP_LABELS[step] ?? `Step ${step}`;
  const stepNumStr = String(effectiveStep).padStart(2, "0");
  const totalNumStr = String(effectiveTotal).padStart(2, "0");

  // ── Loading gate ─────────────────────────────────────────────────────────
  if (!gateChecked) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="flex gap-px">
        {[0,1,2,3,4,5,6,7].map((i) => (
          <motion.div
            key={i}
            className="w-8 h-[3px]"
            style={{ background: "#1a1a1a" }}
            animate={{ background: ["#1a1a1a", "#00ffd5", "#1a1a1a"] }}
            transition={{ duration: 1.2, delay: i * 0.12, repeat: Infinity }}
          />
        ))}
      </div>
    </div>
  );

  if (gateType) {
    return <QuizGate type={gateType} runsUsed={runsUsed} maxRuns={gateType === "anon" ? ANON_MAX_RUNS : FREE_MAX_RUNS} />;
  }

  return (
    <>
      {/* CRT scanlines overlay */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Fraunces:ital,wght@0,700;1,400&display=swap');

        @keyframes splitFlap {
          0%   { transform: rotateX(0deg);   opacity: 1; }
          50%  { transform: rotateX(90deg);  opacity: 0.3; }
          100% { transform: rotateX(180deg); opacity: 0; }
        }

        .crt-scanlines::before {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 9999;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.06) 2px,
            rgba(0,0,0,0.06) 4px
          );
        }

        .board-digit {
          font-family: 'JetBrains Mono', monospace;
          display: inline-block;
          position: relative;
          overflow: hidden;
        }

        .wizard-select {
          appearance: none;
          -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23444' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 16px center;
        }

        .wizard-select option {
          background: #111;
          color: #f0f0e8;
        }
      `}</style>

      <div
        className="crt-scanlines min-h-screen flex flex-col"
        style={{ background: "#080808", fontFamily: "'JetBrains Mono', monospace" }}
      >
        {/* ── Segmented progress bar — absolute top ── */}
        <div className="sticky top-0 z-50 w-full" style={{ background: "#080808" }}>
          <SegmentedProgress total={effectiveTotal} current={effectiveStep} />
        </div>

        {/* ── Header ── */}
        <header className="flex items-center justify-between px-6 md:px-12 py-5"
          style={{ borderBottom: "1px solid #161616" }}>
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm transition-colors duration-150 group"
            style={{ color: "#444440" }}
          >
            <ArrowLeft className="w-4 h-4 group-hover:text-[#f0f0e8] transition-colors" />
            <span className="group-hover:text-[#f0f0e8] transition-colors lowercase tracking-wide">back</span>
          </button>

          <Link href="/" className="hover:opacity-70 transition-opacity">
            <span style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontStyle: "italic",
              fontSize: "1.1rem",
              color: "#f0f0e8",
              letterSpacing: "-0.01em",
            }}>
              Origio
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Ticket-stub runs badge */}
            {runsLeft !== null && runsLeft <= 2 && (
              <span
                className="font-mono text-[10px] px-3 py-1.5"
                style={{
                  color: "#f5c518",
                  borderLeft: "2px dashed #f5c518",
                  borderTop: "1px solid #2a2a2a",
                  borderRight: "1px solid #2a2a2a",
                  borderBottom: "1px solid #2a2a2a",
                  letterSpacing: "0.12em",
                }}
              >
                {runsLeft}×left
              </span>
            )}

            {/* Split-flap step counter */}
            <div className="flex items-center gap-1 font-mono text-sm" style={{ color: "#333330" }}>
              <span style={{ color: "#00ffd5" }}>
                {stepNumStr.split("").map((ch, i) => (
                  <SplitFlapDigit key={`cur-${i}`} value={ch} />
                ))}
              </span>
              <span style={{ color: "#222220" }}> / </span>
              <span>{totalNumStr}</span>
            </div>
          </div>
        </header>

        {/* ── Two-column layout ── */}
        <div className="flex-1 flex flex-col md:flex-row">

          {/* LEFT — step identity */}
          <div
            className="relative flex flex-col justify-between px-6 md:px-12 pt-10 pb-8 md:py-16 md:w-[38%] md:min-h-0 md:sticky md:top-[3px] md:h-[calc(100vh-3px)] overflow-hidden"
            style={{ borderRight: "1px solid #161616" }}
          >
            {/* Oversized background digit */}
            <div
              className="absolute right-0 bottom-0 select-none pointer-events-none font-mono font-bold leading-none"
              style={{
                fontSize: "clamp(140px, 18vw, 220px)",
                color: "#0f0f0f",
                lineHeight: 0.85,
                right: "-0.05em",
                bottom: "-0.1em",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {stepNumStr}
            </div>

            <div className="relative z-10">
              {/* Meta line */}
              <div
                className="font-mono text-[10px] mb-8 flex items-center gap-3"
                style={{ color: "#2a2a2a", letterSpacing: "0.2em" }}
              >
                <span style={{ color: "#00ffd5" }}>
                  {stepNumStr.split("").map((ch, i) => (
                    <SplitFlapDigit key={`big-${i}`} value={ch} />
                  ))}
                </span>
                <span>/</span>
                <span>{totalNumStr}</span>
                <span>·</span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={stepLabel}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    style={{ color: "#333330", letterSpacing: "0.2em" }}
                  >
                    {stepLabel.toUpperCase()}
                  </motion.span>
                </AnimatePresence>
              </div>

              {/* Question heading — animated on step change */}
              <AnimatePresence mode="wait">
                <motion.h2
                  key={`q-${step}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    fontFamily: "'Fraunces', Georgia, serif",
                    fontSize: "clamp(32px, 3.5vw, 54px)",
                    fontWeight: 700,
                    lineHeight: 1.05,
                    color: "#f0f0e8",
                    maxWidth: "14ch",
                  }}
                >
                  {step === 1 && "Where are you from?"}
                  {step === 2 && "Why are you moving?"}
                  {step === 3 && "What's your job?"}
                  {step === 4 && "What matters most?"}
                  {step === 5 && "What's your vibe?"}
                  {step === 6 && "Rent budget?"}
                  {step === 7 && "Languages you speak?"}
                  {step === 8 && "Any deal breakers?"}
                </motion.h2>
              </AnimatePresence>

              {/* Subtext */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={`sub-${step}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="mt-4 font-mono text-[11px] leading-relaxed"
                  style={{ color: "#333330", maxWidth: "28ch" }}
                >
                  {step === 1 && "Passport affects visa routes and entry options."}
                  {step === 2 && "Shapes which factors matter in your ranking."}
                  {step === 3 && "Used for realistic salary estimates per country."}
                  {step === 4 && "Pick ≥ 3 in order. First = highest weight."}
                  {step === 5 && "What kind of city environment fits you."}
                  {step === 6 && "Average city-centre rent in your destination."}
                  {step === 7 && "Local language opens more visa routes."}
                  {step === 8 && "These filters remove incompatible countries."}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Amber decorative line at bottom of left col */}
            <div
              className="relative z-10 hidden md:block h-px mt-8"
              style={{ background: "linear-gradient(to right, #f5c518, transparent)", width: "60%" }}
            />
          </div>

          {/* RIGHT — options */}
          <div className="flex-1 flex flex-col px-6 md:px-12 pt-6 pb-16 md:py-16 overflow-y-auto">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col flex-1"
              >
                {/* Step 1 — Passport */}
                {step === 1 && (
                  <motion.div variants={rowContainerVariants} initial="enter" animate="center">
                    <motion.div variants={rowItemVariants}>
                      <select
                        value={answers.passport ?? ""}
                        onChange={(e) => setAnswers({ ...answers, passport: e.target.value })}
                        className="wizard-select w-full max-w-md py-4 px-5 font-mono text-sm focus:outline-none transition-colors"
                        style={{
                          background: "#0f0f0f",
                          border: "1px solid #2a2a2a",
                          color: answers.passport ? "#f0f0e8" : "#444440",
                          borderBottom: answers.passport ? "2px solid #00ffd5" : "1px solid #2a2a2a",
                        }}
                      >
                        <option value="">— select passport country —</option>
                        {PASSPORTS.map((p) => (
                          <option key={p} value={p.toLowerCase()}>{p}</option>
                        ))}
                      </select>
                    </motion.div>
                  </motion.div>
                )}

                {/* Step 2 — Move reason */}
                {step === 2 && (
                  <motion.div variants={rowContainerVariants} initial="enter" animate="center">
                    {[
                      { key: "job",       label: "I have a job offer",          sub: "Moving for a specific role" },
                      { key: "career",    label: "Better career opportunities", sub: "Higher salary, growth, tech hubs" },
                      { key: "remote",    label: "I work remotely",             sub: "Location flexibility, low tax, good internet" },
                      { key: "retire",    label: "Retirement / FIRE",           sub: "Low cost, good healthcare, passive income" },
                      { key: "study",     label: "Study abroad",                sub: "Universities, student visas" },
                      { key: "lifestyle", label: "Lifestyle change",            sub: "Weather, culture, quality of life" },
                    ].map((opt) => (
                      <motion.div key={opt.key} variants={rowItemVariants}>
                        <OptionRow
                          selected={answers.moveReason === opt.key}
                          onClick={() => setAnswers({ ...answers, moveReason: opt.key })}
                          sub={opt.sub}
                        >
                          {opt.label}
                        </OptionRow>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* Step 3 — Job role */}
                {step === 3 && (
                  <motion.div variants={rowContainerVariants} initial="enter" animate="center">
                    {JOB_ROLES.map((r) => (
                      <motion.div key={r.key} variants={rowItemVariants}>
                        <motion.button
                          layout
                          onClick={() => setAnswers({ ...answers, jobRole: r.key })}
                          whileHover={{ x: 8 }}
                          transition={{ type: "spring", damping: 30, stiffness: 300 }}
                          className="w-full flex items-center gap-4 py-3.5 text-left relative border-b border-[#1e1e1e] last:border-b-0 focus:outline-none"
                          style={{ borderTop: "1px solid #1e1e1e" }}
                        >
                          <motion.div
                            className="absolute left-0 top-0 bottom-0 w-[2px]"
                            style={{ background: "#00ffd5" }}
                            animate={{ scaleY: answers.jobRole === r.key ? 1 : 0, opacity: answers.jobRole === r.key ? 1 : 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                          />
                          <JobInitial label={r.label} />
                          <span
                            className="font-mono text-sm transition-colors duration-150"
                            style={{ color: answers.jobRole === r.key ? "#f0f0e8" : "#777770" }}
                          >
                            {r.label}
                          </span>
                          {answers.jobRole === r.key && (
                            <svg className="ml-auto" width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <motion.path
                                d="M2.5 8.5L6.5 12.5L13.5 4"
                                stroke="#00ffd5"
                                strokeWidth="2"
                                strokeLinecap="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.3 }}
                              />
                            </svg>
                          )}
                        </motion.button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* Step 4 — Priorities */}
                {step === 4 && (
                  <motion.div variants={rowContainerVariants} initial="enter" animate="center">
                    {[
                      { key: "salary",        label: "High salary" },
                      { key: "affordability", label: "Low cost of living" },
                      { key: "quality",       label: "Quality of life" },
                      { key: "safety",        label: "Safety & low crime" },
                      { key: "visa",          label: "Easy visa / immigration" },
                      { key: "tax",           label: "Low taxes" },
                      { key: "healthcare",    label: "Good healthcare" },
                      { key: "english",       label: "English-speaking environment" },
                    ].map((opt) => {
                      const idx = answers.priorities?.indexOf(opt.key) ?? -1;
                      const selected = idx !== -1;
                      return (
                        <motion.div key={opt.key} variants={rowItemVariants}>
                          <PriorityRow
                            label={opt.label}
                            rank={idx + 1}
                            selected={selected}
                            onClick={() => {
                              const cur = answers.priorities ?? [];
                              if (selected) setAnswers({ ...answers, priorities: cur.filter((x) => x !== opt.key) });
                              else setAnswers({ ...answers, priorities: [...cur, opt.key] });
                            }}
                          />
                        </motion.div>
                      );
                    })}
                    <p className="font-mono text-[10px] mt-6" style={{ color: "#2a2a2a", letterSpacing: "0.1em" }}>
                      {(answers.priorities?.length ?? 0) < 3
                        ? `SELECT ${3 - (answers.priorities?.length ?? 0)} MORE`
                        : `${answers.priorities?.length} SELECTED — ORDER = WEIGHT`}
                    </p>
                  </motion.div>
                )}

                {/* Step 5 — City vibe */}
                {step === 5 && (
                  <motion.div variants={rowContainerVariants} initial="enter" animate="center">
                    {[
                      { key: "big-city", label: "Big city",       sub: "London, NYC, Singapore energy" },
                      { key: "mid-city", label: "Mid-size city",  sub: "Liveable, less hectic" },
                      { key: "coastal",  label: "Coastal / beach", sub: "Warm, relaxed, outdoor lifestyle" },
                      { key: "anywhere", label: "Anywhere works", sub: "I'm flexible" },
                    ].map((opt) => (
                      <motion.div key={opt.key} variants={rowItemVariants}>
                        <OptionRow
                          selected={answers.cityVibe === opt.key}
                          onClick={() => setAnswers({ ...answers, cityVibe: opt.key })}
                          sub={opt.sub}
                        >
                          {opt.label}
                        </OptionRow>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* Step 6 — Rent budget */}
                {step === 6 && (
                  <motion.div variants={rowContainerVariants} initial="enter" animate="center">
                    <motion.p
                      variants={rowItemVariants}
                      className="font-mono text-[10px] mb-6"
                      style={{ color: "#333330", letterSpacing: "0.12em" }}
                    >
                      {rentNote.toUpperCase()}
                    </motion.p>
                    {rentOptions.map((opt) => (
                      <motion.div key={opt.key} variants={rowItemVariants}>
                        <OptionRow
                          selected={answers.rentBudget === opt.key}
                          onClick={() => setAnswers({ ...answers, rentBudget: opt.key })}
                          sub={opt.sub}
                        >
                          {opt.label}
                        </OptionRow>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* Step 7 — Languages */}
                {step === 7 && (
                  <motion.div variants={rowContainerVariants} initial="enter" animate="center">
                    {LANGUAGES.map((l) => {
                      const selected = answers.languages?.includes(l.key);
                      return (
                        <motion.div key={l.key} variants={rowItemVariants}>
                          <OptionRow
                            selected={!!selected}
                            onClick={() => {
                              const cur = answers.languages ?? [];
                              if (l.key === "none") { setAnswers({ ...answers, languages: ["none"] }); return; }
                              const withoutNone = cur.filter((x) => x !== "none");
                              if (selected) setAnswers({ ...answers, languages: withoutNone.filter((x) => x !== l.key) });
                              else setAnswers({ ...answers, languages: [...withoutNone, l.key] });
                            }}
                          >
                            {l.label}
                          </OptionRow>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}

                {/* Step 8 — Deal breakers */}
                {step === 8 && (
                  <motion.div variants={rowContainerVariants} initial="enter" animate="center">
                    {DEAL_BREAKERS.map((d) => {
                      const selected = answers.dealBreakers?.includes(d.key);
                      return (
                        <motion.div key={d.key} variants={rowItemVariants}>
                          <OptionRow
                            selected={!!selected}
                            onClick={() => {
                              const cur = answers.dealBreakers ?? [];
                              if (d.key === "none") { setAnswers({ ...answers, dealBreakers: ["none"] }); return; }
                              const withoutNone = cur.filter((x) => x !== "none");
                              if (selected) setAnswers({ ...answers, dealBreakers: withoutNone.filter((x) => x !== d.key) });
                              else setAnswers({ ...answers, dealBreakers: [...withoutNone, d.key] });
                            }}
                          >
                            {d.label}
                          </OptionRow>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}

                {/* Nav row */}
                <div className="flex items-center justify-between mt-14 pt-8"
                  style={{ borderTop: "1px solid #161616" }}>
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 font-mono text-xs transition-colors duration-150 group"
                    style={{ color: "#333330", letterSpacing: "0.1em" }}
                  >
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:text-[#f0f0e8] transition-colors" />
                    <span className="group-hover:text-[#f0f0e8] transition-colors uppercase">Back</span>
                  </button>

                  {isLastStep ? (
                    <CompassButton
                      loading={loading}
                      disabled={!canProceed()}
                      onClick={handleNext}
                      label="Plot my route"
                    />
                  ) : (
                    <motion.button
                      onClick={handleNext}
                      disabled={!canProceed()}
                      className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest px-6 py-3 transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none"
                      style={{
                        background: canProceed() ? "#00ffd5" : "transparent",
                        color: canProceed() ? "#0a0a0a" : "#2a2a2a",
                        border: canProceed() ? "none" : "1px solid #1e1e1e",
                      }}
                      whileHover={canProceed() ? { x: -1, y: -1 } : {}}
                      whileTap={canProceed() ? { x: 1, y: 1 } : {}}
                      transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    >
                      Next <ArrowRight className="w-3.5 h-3.5" />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}