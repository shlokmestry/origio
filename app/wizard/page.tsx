// app/wizard/page.tsx
/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Globe2, Sparkles } from "lucide-react";
import { JOB_ROLES } from "@/types";
import { WizardAnswers, scoreCountriesForWizard } from "@/lib/wizard";
import { CountryWithData } from "@/types";

const TOTAL_STEPS = 8;

const PASSPORTS = [
  "Ireland","United Kingdom","Germany","France","Netherlands","Spain",
  "Portugal","Sweden","Norway","Switzerland","Australia","New Zealand",
  "Canada","USA","Singapore","UAE","India","China","Brazil","South Africa",
  "Nigeria","Kenya","Philippines","Italy","Poland","Romania","Other"
];

function getRentBudgets(passport: string) {
  const p = passport.toLowerCase();
  if (p === "india") return {
    note: "Shown in Indian Rupees — typical rent abroad converted to INR",
    options: [
      { key: "under800", label: "Under ₹65,000/mo", sub: "Budget-conscious" },
      { key: "800to1500", label: "₹65,000 – ₹1,25,000/mo", sub: "Comfortable" },
      { key: "1500to2500", label: "₹1,25,000 – ₹2,00,000/mo", sub: "Flexible" },
      { key: "any", label: "Money isn't a concern", sub: "No limit" },
    ]
  };
  if (p === "usa") return {
    note: "Shown in US Dollars",
    options: [
      { key: "under800", label: "Under $800/mo", sub: "Budget-conscious" },
      { key: "800to1500", label: "$800 – $1,500/mo", sub: "Comfortable" },
      { key: "1500to2500", label: "$1,500 – $2,500/mo", sub: "Flexible" },
      { key: "any", label: "Money isn't a concern", sub: "No limit" },
    ]
  };
  return {
    note: "Shown in Euros — average city-centre rent abroad",
    options: [
      { key: "under800", label: "Under €800/mo", sub: "Budget-conscious" },
      { key: "800to1500", label: "€800 – €1,500/mo", sub: "Comfortable" },
      { key: "1500to2500", label: "€1,500 – €2,500/mo", sub: "Flexible" },
      { key: "any", label: "Money isn't a concern", sub: "No limit" },
    ]
  };
}

const MOVE_REASONS = [
  { key: "job", emoji: "💼", label: "I have a job offer" },
  { key: "career", emoji: "🚀", label: "Career growth" },
  { key: "lifestyle", emoji: "🌴", label: "Better lifestyle" },
  { key: "cost", emoji: "💰", label: "Lower cost of living" },
  { key: "family", emoji: "👨‍👩‍👧", label: "Family or relationship" },
  { key: "explore", emoji: "🌍", label: "Just exploring" },
];

const PRIORITIES = [
  { key: "salary", emoji: "💵", label: "High salary" },
  { key: "tax", emoji: "📊", label: "Low taxes" },
  { key: "cost", emoji: "🏠", label: "Affordable living" },
  { key: "visa", emoji: "✈️", label: "Easy visa" },
  { key: "safety", emoji: "🛡️", label: "Safety & stability" },
  { key: "quality", emoji: "🌿", label: "Quality of life" },
  { key: "tech", emoji: "💻", label: "Tech scene" },
  { key: "weather", emoji: "☀️", label: "Good weather" },
];

const CITY_VIBES = [
  { key: "metro", emoji: "🏙️", label: "Big city energy", sub: "NYC, London, Tokyo" },
  { key: "mid", emoji: "🌆", label: "Mid-size city", sub: "Balanced pace" },
  { key: "beach", emoji: "🏖️", label: "Coastal / beach", sub: "Warm & relaxed" },
  { key: "nature", emoji: "🏔️", label: "Close to nature", sub: "Outdoors & quiet" },
  { key: "any", emoji: "🎲", label: "I'm open to anything", sub: "Surprise me" },
];

const LANGUAGES = [
  { key: "german", label: "German" }, { key: "french", label: "French" },
  { key: "spanish", label: "Spanish" }, { key: "portuguese", label: "Portuguese" },
  { key: "arabic", label: "Arabic" }, { key: "mandarin", label: "Mandarin" },
  { key: "hindi", label: "Hindi" }, { key: "italian", label: "Italian" },
  { key: "dutch", label: "Dutch" }, { key: "swedish", label: "Swedish" },
  { key: "norwegian", label: "Norwegian" }, { key: "japanese", label: "Japanese" },
  { key: "korean", label: "Korean" }, { key: "tagalog", label: "Tagalog" },
  { key: "turkish", label: "Turkish" }, { key: "polish", label: "Polish" },
  { key: "none", label: "English only" },
];

const DEAL_BREAKERS = [
  { key: "english", label: "Must be English-speaking" },
  { key: "europe", label: "Must be in Europe" },
  { key: "lowtax", label: "Must have low taxes" },
  { key: "warm", label: "Must have warm weather" },
  { key: "lowcrime", label: "Must have low crime rate" },
  { key: "none", label: "No deal breakers" },
];

// Shared button styles
const optionBase = "w-full flex items-center gap-3 p-4 border-2 text-left transition-all font-medium text-sm";
const optionSelected = "border-accent bg-accent/10 text-text-primary";
const optionIdle = "border-[#2a2a2a] bg-[#1a1a1a] text-text-muted hover:border-text-primary hover:text-text-primary";

export default function WizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Partial<WizardAnswers>>({ priorities: [], languages: [], dealBreakers: [] });

  const isJobOffer = answers.moveReason === "job";

  const getNextStep = (cur: number) => { if (cur === 2 && isJobOffer) return 3; if (cur === 3 && isJobOffer) return 7; return cur + 1; };
  const getPrevStep = (cur: number) => { if (cur === 7 && isJobOffer) return 3; if (cur === 3 && isJobOffer) return 2; return cur - 1; };
  const getEffectiveTotalSteps = () => isJobOffer ? 5 : TOTAL_STEPS;
  const getEffectiveStep = () => { if (!isJobOffer) return step; if (step <= 3) return step; if (step >= 7) return step - 3; return step; };
  const progress = (getEffectiveStep() / getEffectiveTotalSteps()) * 100;
  const isLastStep = isJobOffer ? step === 8 : step === TOTAL_STEPS;

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

  const handleNext = () => { const next = getNextStep(step); if (next <= TOTAL_STEPS) setStep(next); else handleSubmit(); };
  const handleBack = () => { if (step === 1) router.push("/"); else setStep(getPrevStep(step)); };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/countries");
      const countries: CountryWithData[] = await res.json();
      const matches = scoreCountriesForWizard(countries, answers as WizardAnswers);
      sessionStorage.setItem("wizardMatches", JSON.stringify(matches));
      sessionStorage.setItem("wizardAnswers", JSON.stringify(answers));
      router.push("/wizard/results");
    } catch (err) { console.error(err); setLoading(false); }
  };

  const { note: rentNote, options: rentOptions } = getRentBudgets(answers.passport ?? "");

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b-2 border-[#2a2a2a]">
        <button onClick={handleBack} className="flex items-center gap-2 text-sm font-bold text-text-muted hover:text-text-primary transition-colors uppercase tracking-wide">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-3 h-3 bg-accent border-2 border-text-primary" />
          <span className="font-heading font-extrabold uppercase tracking-tight">Origio</span>
        </a>
        <span className="text-sm font-bold text-text-muted uppercase tracking-wide">
          {getEffectiveStep()} / {getEffectiveTotalSteps()}
        </span>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-[#1a1a1a] border-b-2 border-[#2a2a2a]">
        <div className="h-full bg-accent transition-all duration-500 ease-out" style={{ width: progress + "%" }} />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">

          {/* Step 1 — Passport */}
          {step === 1 && (
            <div className="space-y-8 animate-fade-up">
              <div>
                <p className="text-accent text-xs font-bold uppercase tracking-widest mb-2">Let's get started</p>
                <h2 className="font-heading text-4xl font-extrabold mb-3 uppercase tracking-tight">Where are you from?</h2>
                <p className="text-text-muted text-sm">Your passport affects which countries are easiest to move to.</p>
              </div>
              <select value={answers.passport ?? ""} onChange={(e) => setAnswers({ ...answers, passport: e.target.value })}
                className="w-full px-4 py-3.5 bg-[#1a1a1a] border-2 border-[#2a2a2a] focus:border-accent text-text-primary text-sm outline-none appearance-none cursor-pointer font-medium transition-colors">
                <option value="">Select your country...</option>
                {PASSPORTS.map((p) => <option key={p} value={p.toLowerCase()}>{p}</option>)}
              </select>
            </div>
          )}

          {/* Step 2 — Move reason */}
          {step === 2 && (
            <div className="space-y-8 animate-fade-up">
              <div>
                <p className="text-accent text-xs font-bold uppercase tracking-widest mb-2">Your situation</p>
                <h2 className="font-heading text-4xl font-extrabold mb-3 uppercase tracking-tight">Why are you moving?</h2>
                <p className="text-text-muted text-sm">This helps us understand what matters most.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {MOVE_REASONS.map((r) => (
                  <button key={r.key} onClick={() => setAnswers({ ...answers, moveReason: r.key })}
                    className={`${optionBase} ${answers.moveReason === r.key ? optionSelected : optionIdle}`}
                    style={answers.moveReason === r.key ? { boxShadow: "3px 3px 0 #00ffd5" } : {}}>
                    <span className="text-xl">{r.emoji}</span>
                    <span>{r.label}</span>
                  </button>
                ))}
              </div>
              {isJobOffer && (
                <div className="p-3 border-2 border-accent/40 bg-accent/5">
                  <p className="text-xs font-bold text-accent">Since you have a job offer, we'll skip some questions and focus on what matters most.</p>
                </div>
              )}
            </div>
          )}

          {/* Step 3 — Job role */}
          {step === 3 && (
            <div className="space-y-8 animate-fade-up">
              <div>
                <p className="text-accent text-xs font-bold uppercase tracking-widest mb-2">Your work</p>
                <h2 className="font-heading text-4xl font-extrabold mb-3 uppercase tracking-tight">What do you do?</h2>
                <p className="text-text-muted text-sm">We'll show you salaries specific to your field.</p>
              </div>
              <select value={answers.jobRole ?? ""} onChange={(e) => setAnswers({ ...answers, jobRole: e.target.value })}
                className="w-full px-4 py-3.5 bg-[#1a1a1a] border-2 border-[#2a2a2a] focus:border-accent text-text-primary text-sm outline-none appearance-none cursor-pointer font-medium transition-colors">
                <option value="">Select your job role...</option>
                {JOB_ROLES.map((r) => <option key={r.key} value={r.key}>{r.emoji} {r.label}</option>)}
              </select>
            </div>
          )}

          {/* Step 4 — Priorities */}
          {step === 4 && (
            <div className="space-y-8 animate-fade-up">
              <div>
                <p className="text-accent text-xs font-bold uppercase tracking-widest mb-2">What matters to you</p>
                <h2 className="font-heading text-4xl font-extrabold mb-3 uppercase tracking-tight">Pick your top 3</h2>
                <p className="text-text-muted text-sm">Select exactly 3 — we'll weight your matches accordingly.</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {PRIORITIES.map((p) => {
                  const selected = answers.priorities?.includes(p.key);
                  const maxReached = (answers.priorities?.length ?? 0) >= 3 && !selected;
                  return (
                    <button key={p.key} disabled={maxReached}
                      onClick={() => {
                        const cur = answers.priorities ?? [];
                        if (selected) setAnswers({ ...answers, priorities: cur.filter((x) => x !== p.key) });
                        else if (cur.length < 3) setAnswers({ ...answers, priorities: [...cur, p.key] });
                      }}
                      className={`${optionBase} ${selected ? optionSelected : maxReached ? "border-[#2a2a2a] bg-[#111] text-text-muted/30 cursor-not-allowed" : optionIdle}`}
                      style={selected ? { boxShadow: "3px 3px 0 #00ffd5" } : {}}>
                      <span className="text-xl">{p.emoji}</span>
                      <span>{p.label}</span>
                      {selected && <span className="ml-auto text-xs font-bold text-accent">#{(answers.priorities?.indexOf(p.key) ?? 0) + 1}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 5 — City vibe */}
          {step === 5 && (
            <div className="space-y-8 animate-fade-up">
              <div>
                <p className="text-accent text-xs font-bold uppercase tracking-widest mb-2">Your lifestyle</p>
                <h2 className="font-heading text-4xl font-extrabold mb-3 uppercase tracking-tight">What's your vibe?</h2>
                <p className="text-text-muted text-sm">What kind of place do you want to live in?</p>
              </div>
              <div className="space-y-2">
                {CITY_VIBES.map((v) => (
                  <button key={v.key} onClick={() => setAnswers({ ...answers, cityVibe: v.key })}
                    className={`${optionBase} ${answers.cityVibe === v.key ? optionSelected : optionIdle}`}
                    style={answers.cityVibe === v.key ? { boxShadow: "3px 3px 0 #00ffd5" } : {}}>
                    <span className="text-xl">{v.emoji}</span>
                    <div>
                      <p>{v.label}</p>
                      <p className="text-xs text-text-muted mt-0.5">{v.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 6 — Rent budget */}
          {step === 6 && (
            <div className="space-y-8 animate-fade-up">
              <div>
                <p className="text-accent text-xs font-bold uppercase tracking-widest mb-2">Your budget</p>
                <h2 className="font-heading text-4xl font-extrabold mb-3 uppercase tracking-tight">Max rent budget?</h2>
                <p className="text-text-muted text-sm">{rentNote}</p>
              </div>
              <div className="space-y-2">
                {rentOptions.map((o) => (
                  <button key={o.key} onClick={() => setAnswers({ ...answers, rentBudget: o.key })}
                    className={`${optionBase} ${answers.rentBudget === o.key ? optionSelected : optionIdle}`}
                    style={answers.rentBudget === o.key ? { boxShadow: "3px 3px 0 #00ffd5" } : {}}>
                    <div>
                      <p>{o.label}</p>
                      <p className="text-xs text-text-muted mt-0.5">{o.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 7 — Languages */}
          {step === 7 && (
            <div className="space-y-8 animate-fade-up">
              <div>
                <p className="text-accent text-xs font-bold uppercase tracking-widest mb-2">Languages</p>
                <h2 className="font-heading text-4xl font-extrabold mb-3 uppercase tracking-tight">Languages you speak?</h2>
                <p className="text-text-muted text-sm">Select all that apply — or English only.</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {LANGUAGES.map((l) => {
                  const selected = answers.languages?.includes(l.key);
                  return (
                    <button key={l.key}
                      onClick={() => {
                        const cur = answers.languages ?? [];
                        if (selected) setAnswers({ ...answers, languages: cur.filter((x) => x !== l.key) });
                        else setAnswers({ ...answers, languages: [...cur, l.key] });
                      }}
                      className={`${optionBase} ${selected ? optionSelected : optionIdle}`}
                      style={selected ? { boxShadow: "3px 3px 0 #00ffd5" } : {}}>
                      <span>{l.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 8 — Deal breakers */}
          {step === 8 && (
            <div className="space-y-8 animate-fade-up">
              <div>
                <p className="text-accent text-xs font-bold uppercase tracking-widest mb-2">Almost there</p>
                <h2 className="font-heading text-4xl font-extrabold mb-3 uppercase tracking-tight">Any deal breakers?</h2>
                <p className="text-text-muted text-sm">We'll remove countries that don't fit. Select all that apply.</p>
              </div>
              <div className="space-y-2">
                {DEAL_BREAKERS.map((d) => {
                  const selected = answers.dealBreakers?.includes(d.key);
                  return (
                    <button key={d.key}
                      onClick={() => {
                        const cur = answers.dealBreakers ?? [];
                        if (d.key === "none") { setAnswers({ ...answers, dealBreakers: ["none"] }); return; }
                        const withoutNone = cur.filter((x) => x !== "none");
                        if (selected) setAnswers({ ...answers, dealBreakers: withoutNone.filter((x) => x !== d.key) });
                        else setAnswers({ ...answers, dealBreakers: [...withoutNone, d.key] });
                      }}
                      className={`${optionBase} ${selected ? optionSelected : optionIdle}`}
                      style={selected ? { boxShadow: "3px 3px 0 #00ffd5" } : {}}>
                      <span>{d.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Nav buttons */}
          <div className="flex items-center justify-between mt-10">
            <button onClick={handleBack}
              className="ghost-button flex items-center gap-2 px-5 py-3 text-sm font-bold uppercase tracking-wide">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button onClick={handleNext} disabled={!canProceed() || loading}
              className="cta-button flex items-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-wide disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none">
              {loading ? "Finding matches..." : isLastStep ? "Find My Country" : <>Next <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}