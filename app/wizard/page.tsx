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

const LANGUAGES = [
  { key: "english", label: "English" }, { key: "spanish", label: "Spanish" },
  { key: "french", label: "French" }, { key: "german", label: "German" },
  { key: "portuguese", label: "Portuguese" }, { key: "arabic", label: "Arabic" },
  { key: "mandarin", label: "Mandarin" }, { key: "hindi", label: "Hindi" },
  { key: "italian", label: "Italian" }, { key: "dutch", label: "Dutch" },
  { key: "swedish", label: "Swedish" }, { key: "norwegian", label: "Norwegian" },
  { key: "japanese", label: "Japanese" }, { key: "korean", label: "Korean" },
  { key: "tagalog", label: "Tagalog" }, { key: "turkish", label: "Turkish" },
  { key: "polish", label: "Polish" }, { key: "none", label: "English only" },
];

const DEAL_BREAKERS = [
  { key: "english", label: "Must be English-speaking" },
  { key: "europe", label: "Must be in Europe" },
  { key: "lowtax", label: "Must have low taxes" },
  { key: "warm", label: "Must have warm weather" },
  { key: "lowcrime", label: "Must have low crime rate" },
  { key: "none", label: "No deal breakers" },
];

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
      let matches = scoreCountriesForWizard(countries, answers as WizardAnswers);

      // ── AI validation — runs during loading, never blocks user ──
      try {
        const validationRes = await fetch("/api/validate-results", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ matches, answers }),
        });
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
      } catch {
        // Validation failed — don't block the user, use original matches
      }
      // ────────────────────────────────────────────────────────────

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
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-3 h-3 bg-accent border-2 border-text-primary" />
          <span className="font-heading font-extrabold uppercase tracking-tight">Origio</span>
        </Link>
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
              <select value={answers.passport ?? ""}
                onChange={(e) => setAnswers({ ...answers, passport: e.target.value })}
                className="w-full px-4 py-3 bg-[#111] border-2 border-[#2a2a2a] text-text-primary font-bold focus:outline-none focus:border-accent text-sm">
                <option value="">Select your passport country</option>
                {PASSPORTS.map((p) => <option key={p} value={p.toLowerCase()}>{p}</option>)}
              </select>
            </div>
          )}

          {/* Step 2 — Move reason */}
          {step === 2 && (
            <div className="space-y-8 animate-fade-up">
              <div>
                <p className="text-accent text-xs font-bold uppercase tracking-widest mb-2">Step 2</p>
                <h2 className="font-heading text-4xl font-extrabold mb-3 uppercase tracking-tight">Why are you moving?</h2>
                <p className="text-text-muted text-sm">This shapes which factors matter most in your results.</p>
              </div>
              <div className="space-y-2">
                {[
                  { key: "job", label: "I have a job offer", sub: "Moving for a specific role" },
                  { key: "career", label: "Better career opportunities", sub: "Higher salary, growth, tech hubs" },
                  { key: "remote", label: "I work remotely", sub: "Location flexibility, low tax, good internet" },
                  { key: "retire", label: "Retirement / FIRE", sub: "Low cost, good healthcare, passive income" },
                  { key: "study", label: "Study abroad", sub: "Universities, student visas" },
                  { key: "lifestyle", label: "Lifestyle change", sub: "Weather, culture, quality of life" },
                ].map((opt) => (
                  <button key={opt.key}
                    onClick={() => setAnswers({ ...answers, moveReason: opt.key })}
                    className={`${optionBase} ${answers.moveReason === opt.key ? optionSelected : optionIdle}`}
                    style={answers.moveReason === opt.key ? { boxShadow: "3px 3px 0 #00ffd5" } : {}}>
                    <div>
                      <div className="font-bold">{opt.label}</div>
                      <div className="text-xs opacity-60 mt-0.5">{opt.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 — Job role */}
          {step === 3 && (
            <div className="space-y-8 animate-fade-up">
              <div>
                <p className="text-accent text-xs font-bold uppercase tracking-widest mb-2">Step 3</p>
                <h2 className="font-heading text-4xl font-extrabold mb-3 uppercase tracking-tight">What's your job?</h2>
                <p className="text-text-muted text-sm">Used to show realistic salary expectations per country.</p>
              </div>
              <div className="space-y-2">
                {JOB_ROLES.map((r) => (
                  <button key={r.key}
                    onClick={() => setAnswers({ ...answers, jobRole: r.key })}
                    className={`${optionBase} ${answers.jobRole === r.key ? optionSelected : optionIdle}`}
                    style={answers.jobRole === r.key ? { boxShadow: "3px 3px 0 #00ffd5" } : {}}>
                    <span>{r.emoji}</span>
                    <span>{r.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4 — Priorities */}
          {step === 4 && (
            <div className="space-y-8 animate-fade-up">
              <div>
                <p className="text-accent text-xs font-bold uppercase tracking-widest mb-2">Step 4</p>
                <h2 className="font-heading text-4xl font-extrabold mb-3 uppercase tracking-tight">What matters most?</h2>
                <p className="text-text-muted text-sm">Pick at least 3, in order of importance. First = highest weight.</p>
              </div>
              <div className="space-y-2">
                {[
                  { key: "salary", label: "High salary" },
                  { key: "affordability", label: "Low cost of living" },
                  { key: "quality", label: "Quality of life" },
                  { key: "safety", label: "Safety & low crime" },
                  { key: "visa", label: "Easy visa / immigration" },
                  { key: "tax", label: "Low taxes" },
                  { key: "healthcare", label: "Good healthcare" },
                  { key: "english", label: "English-speaking environment" },
                ].map((opt) => {
                  const idx = answers.priorities?.indexOf(opt.key) ?? -1;
                  const selected = idx !== -1;
                  return (
                    <button key={opt.key}
                      onClick={() => {
                        const cur = answers.priorities ?? [];
                        if (selected) setAnswers({ ...answers, priorities: cur.filter((x) => x !== opt.key) });
                        else setAnswers({ ...answers, priorities: [...cur, opt.key] });
                      }}
                      className={`${optionBase} ${selected ? optionSelected : optionIdle}`}
                      style={selected ? { boxShadow: "3px 3px 0 #00ffd5" } : {}}>
                      {selected && <span className="text-accent font-extrabold text-xs w-4">{idx + 1}</span>}
                      <span>{opt.label}</span>
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
                <p className="text-accent text-xs font-bold uppercase tracking-widest mb-2">Step 5</p>
                <h2 className="font-heading text-4xl font-extrabold mb-3 uppercase tracking-tight">What's your vibe?</h2>
                <p className="text-text-muted text-sm">What kind of place are you looking for?</p>
              </div>
              <div className="space-y-2">
                {[
                  { key: "big-city", label: "Big city", sub: "London, NYC, Singapore energy" },
                  { key: "mid-city", label: "Mid-size city", sub: "Liveable, less hectic" },
                  { key: "coastal", label: "Coastal / beach", sub: "Warm, relaxed, outdoor lifestyle" },
                  { key: "anywhere", label: "Anywhere works", sub: "I'm flexible" },
                ].map((opt) => (
                  <button key={opt.key}
                    onClick={() => setAnswers({ ...answers, cityVibe: opt.key })}
                    className={`${optionBase} ${answers.cityVibe === opt.key ? optionSelected : optionIdle}`}
                    style={answers.cityVibe === opt.key ? { boxShadow: "3px 3px 0 #00ffd5" } : {}}>
                    <div>
                      <div className="font-bold">{opt.label}</div>
                      <div className="text-xs opacity-60 mt-0.5">{opt.sub}</div>
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
                <p className="text-accent text-xs font-bold uppercase tracking-widest mb-2">Step 6</p>
                <h2 className="font-heading text-4xl font-extrabold mb-3 uppercase tracking-tight">Rent budget?</h2>
                <p className="text-text-muted text-sm">{rentNote}</p>
              </div>
              <div className="space-y-2">
                {rentOptions.map((opt) => (
                  <button key={opt.key}
                    onClick={() => setAnswers({ ...answers, rentBudget: opt.key })}
                    className={`${optionBase} ${answers.rentBudget === opt.key ? optionSelected : optionIdle}`}
                    style={answers.rentBudget === opt.key ? { boxShadow: "3px 3px 0 #00ffd5" } : {}}>
                    <div>
                      <div className="font-bold">{opt.label}</div>
                      <div className="text-xs opacity-60 mt-0.5">{opt.sub}</div>
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
                <p className="text-accent text-xs font-bold uppercase tracking-widest mb-2">Step 7</p>
                <h2 className="font-heading text-4xl font-extrabold mb-3 uppercase tracking-tight">Languages you speak?</h2>
                <p className="text-text-muted text-sm">Speaking the local language opens more doors.</p>
              </div>
              <div className="space-y-2">
                {LANGUAGES.map((l) => {
                  const selected = answers.languages?.includes(l.key);
                  return (
                    <button key={l.key}
                      onClick={() => {
                        const cur = answers.languages ?? [];
                        if (l.key === "none") { setAnswers({ ...answers, languages: ["none"] }); return; }
                        const withoutNone = cur.filter((x) => x !== "none");
                        if (selected) setAnswers({ ...answers, languages: withoutNone.filter((x) => x !== l.key) });
                        else setAnswers({ ...answers, languages: [...withoutNone, l.key] });
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
                <p className="text-accent text-xs font-bold uppercase tracking-widest mb-2">Final step</p>
                <h2 className="font-heading text-4xl font-extrabold mb-3 uppercase tracking-tight">Any deal breakers?</h2>
                <p className="text-text-muted text-sm">Select all that apply.</p>
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