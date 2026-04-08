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
  "Ireland", "United Kingdom", "Germany", "France", "Netherlands", "Spain",
  "Portugal", "Sweden", "Norway", "Switzerland", "Australia", "New Zealand",
  "Canada", "USA", "Singapore", "UAE", "India", "China", "Brazil", "South Africa",
  "Nigeria", "Kenya", "Philippines", "Italy", "Poland", "Romania", "Other"
];

// Currency symbol and rent ranges by passport region
function getRentBudgets(passport: string) {
  const p = passport.toLowerCase();
  if (p === "india") {
    return [
      { key: "under800", label: "Under ₹65,000/mo", sub: "Tight budget" },
      { key: "800to1500", label: "₹65,000 – ₹1,25,000/mo", sub: "Comfortable" },
      { key: "1500to2500", label: "₹1,25,000 – ₹2,00,000/mo", sub: "Flexible" },
      { key: "any", label: "Money isn't a concern", sub: "No limit" },
    ];
  } else if (p === "usa" || p === "canada") {
    return [
      { key: "under800", label: "Under $800/mo", sub: "Tight budget" },
      { key: "800to1500", label: "$800 – $1,500/mo", sub: "Comfortable" },
      { key: "1500to2500", label: "$1,500 – $2,500/mo", sub: "Flexible" },
      { key: "any", label: "Money isn't a concern", sub: "No limit" },
    ];
  } else if (p === "united kingdom") {
    return [
      { key: "under800", label: "Under £650/mo", sub: "Tight budget" },
      { key: "800to1500", label: "£650 – £1,200/mo", sub: "Comfortable" },
      { key: "1500to2500", label: "£1,200 – £2,000/mo", sub: "Flexible" },
      { key: "any", label: "Money isn't a concern", sub: "No limit" },
    ];
  } else if (p === "australia" || p === "new zealand") {
    return [
      { key: "under800", label: "Under A$1,200/mo", sub: "Tight budget" },
      { key: "800to1500", label: "A$1,200 – A$2,200/mo", sub: "Comfortable" },
      { key: "1500to2500", label: "A$2,200 – A$3,800/mo", sub: "Flexible" },
      { key: "any", label: "Money isn't a concern", sub: "No limit" },
    ];
  } else if (p === "uae") {
    return [
      { key: "under800", label: "Under AED 3,000/mo", sub: "Tight budget" },
      { key: "800to1500", label: "AED 3,000 – AED 5,500/mo", sub: "Comfortable" },
      { key: "1500to2500", label: "AED 5,500 – AED 9,000/mo", sub: "Flexible" },
      { key: "any", label: "Money isn't a concern", sub: "No limit" },
    ];
  } else {
    // Default EUR for European passports and others
    return [
      { key: "under800", label: "Under €800/mo", sub: "Tight budget" },
      { key: "800to1500", label: "€800 – €1,500/mo", sub: "Comfortable" },
      { key: "1500to2500", label: "€1,500 – €2,500/mo", sub: "Flexible" },
      { key: "any", label: "Money isn't a concern", sub: "No limit" },
    ];
  }
}

const MOVE_REASONS = [
  { key: "job", label: "I got a job offer abroad", emoji: "💼" },
  { key: "looking", label: "I'm looking for work", emoji: "🔍" },
  { key: "remote", label: "I work remotely", emoji: "💻" },
  { key: "retire", label: "I'm planning to retire", emoji: "🌅" },
  { key: "study", label: "I'm going to study", emoji: "🎓" },
];

const PRIORITIES = [
  { key: "salary", label: "High salary", emoji: "💰" },
  { key: "affordability", label: "Low cost of living", emoji: "🏠" },
  { key: "quality", label: "Quality of life", emoji: "✨" },
  { key: "safety", label: "Safety & stability", emoji: "🛡️" },
  { key: "visa", label: "Easy visa process", emoji: "✈️" },
  { key: "tax", label: "Low taxes", emoji: "📊" },
];

const CITY_VIBES = [
  { key: "bigcity", label: "Buzzing metropolis", sub: "Think London, Singapore, NYC" },
  { key: "midcity", label: "Mid-size city", sub: "Good balance of work and life" },
  { key: "quiet", label: "Quiet and affordable", sub: "Suburbs, smaller towns" },
  { key: "any", label: "I'm open to anything", sub: "Surprise me" },
];

const LANGUAGES = [
  { key: "german", label: "German" },
  { key: "french", label: "French" },
  { key: "spanish", label: "Spanish" },
  { key: "portuguese", label: "Portuguese" },
  { key: "arabic", label: "Arabic" },
  { key: "mandarin", label: "Mandarin" },
  { key: "hindi", label: "Hindi" },
  { key: "italian", label: "Italian" },
  { key: "dutch", label: "Dutch" },
  { key: "swedish", label: "Swedish" },
  { key: "norwegian", label: "Norwegian" },
  { key: "japanese", label: "Japanese" },
  { key: "korean", label: "Korean" },
  { key: "tagalog", label: "Tagalog" },
  { key: "turkish", label: "Turkish" },
  { key: "polish", label: "Polish" },
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

export default function WizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Partial<WizardAnswers>>({
    priorities: [],
    languages: [],
    dealBreakers: [],
  });

  // If job offer selected, skip steps 4,5,6 (priorities, city vibe, rent)
  const isJobOffer = answers.moveReason === "job";

  // Actual step sequence based on move reason
  const getNextStep = (current: number) => {
    if (current === 2 && isJobOffer) return 3; // go to job role
    if (current === 3 && isJobOffer) return 7; // skip to languages
    return current + 1;
  };

  const getPrevStep = (current: number) => {
    if (current === 7 && isJobOffer) return 3;
    if (current === 3 && isJobOffer) return 2;
    return current - 1;
  };

  const getEffectiveTotalSteps = () => isJobOffer ? 5 : TOTAL_STEPS;
  const getEffectiveStep = () => {
    if (!isJobOffer) return step;
    if (step <= 3) return step;
    if (step >= 7) return step - 3;
    return step;
  };

  const progress = (getEffectiveStep() / getEffectiveTotalSteps()) * 100;

  const handleNext = () => {
    const next = getNextStep(step);
    if (next <= TOTAL_STEPS) {
      setStep(next);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step === 1) {
      router.push("/");
    } else {
      setStep(getPrevStep(step));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/countries");
      const countries: CountryWithData[] = await res.json();
      const matches = scoreCountriesForWizard(countries, answers as WizardAnswers);
      sessionStorage.setItem("wizardMatches", JSON.stringify(matches));
      sessionStorage.setItem("wizardAnswers", JSON.stringify(answers));
      router.push("/wizard/results");
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

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

  const rentBudgets = getRentBudgets(answers.passport ?? "");

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border">
        <button onClick={handleBack} className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Globe2 className="w-5 h-5 text-accent" />
          <span className="font-heading font-extrabold">Origio</span>
        </a>
        <span className="text-sm text-text-muted">
          {getEffectiveStep()} of {getEffectiveTotalSteps()}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-bg-elevated">
        <div
          className="h-full bg-accent transition-all duration-500 ease-out"
          style={{ width: progress + "%" }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">

          {/* Step 1 — Passport */}
          {step === 1 && (
            <div className="space-y-8 animate-fade-up">
              <div>
                <p className="text-accent text-sm font-medium mb-2">Let's get started</p>
                <h2 className="font-heading text-3xl font-extrabold mb-3">Where are you from?</h2>
                <p className="text-text-muted">Your passport affects which countries are easiest to move to.</p>
              </div>
              <select
                value={answers.passport ?? ""}
                onChange={(e) => setAnswers({ ...answers, passport: e.target.value })}
                className="w-full px-4 py-3.5 rounded-xl bg-bg-elevated border border-border focus:border-accent/40 focus:outline-none text-text-primary text-sm appearance-none cursor-pointer"
              >
                <option value="">Select your country...</option>
                {PASSPORTS.map((p) => (
                  <option key={p} value={p.toLowerCase()}>{p}</option>
                ))}
              </select>
            </div>
          )}

          {/* Step 2 — Move reason */}
          {step === 2 && (
            <div className="space-y-8 animate-fade-up">
              <div>
                <p className="text-accent text-sm font-medium mb-2">Your situation</p>
                <h2 className="font-heading text-3xl font-extrabold mb-3">Why are you planning to move?</h2>
                <p className="text-text-muted">This helps us understand what matters most for your move.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MOVE_REASONS.map((r) => (
                  <button
                    key={r.key}
                    onClick={() => setAnswers({ ...answers, moveReason: r.key })}
                    className={[
                      "flex items-center gap-3 p-4 rounded-xl border text-left transition-all",
                      answers.moveReason === r.key
                        ? "border-accent bg-accent/10 text-text-primary"
                        : "border-border bg-bg-elevated text-text-muted hover:border-accent/30 hover:text-text-primary",
                    ].join(" ")}
                  >
                    <span className="text-xl">{r.emoji}</span>
                    <span className="text-sm font-medium">{r.label}</span>
                  </button>
                ))}
              </div>
              {isJobOffer && (
                <div className="p-3 rounded-xl bg-accent/5 border border-accent/20">
                  <p className="text-xs text-accent">Since you have a job offer, we'll skip some questions and focus on what matters most for your move.</p>
                </div>
              )}
            </div>
          )}

          {/* Step 3 — Job role */}
          {step === 3 && (
            <div className="space-y-8 animate-fade-up">
              <div>
                <p className="text-accent text-sm font-medium mb-2">Your work</p>
                <h2 className="font-heading text-3xl font-extrabold mb-3">What do you do?</h2>
                <p className="text-text-muted">We'll show you salaries specific to your field in each country.</p>
              </div>
              <div className="relative">
                <select
                  value={answers.jobRole ?? ""}
                  onChange={(e) => setAnswers({ ...answers, jobRole: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl bg-bg-elevated border border-border focus:border-accent/40 focus:outline-none text-text-primary text-sm appearance-none cursor-pointer"
                >
                  <option value="">Select your job role...</option>
                  {JOB_ROLES.map((r) => (
                    <option key={r.key} value={r.key}>{r.emoji} {r.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 4 — Priorities (skipped for job offer) */}
          {step === 4 && (
            <div className="space-y-8 animate-fade-up">
              <div>
                <p className="text-accent text-sm font-medium mb-2">What matters to you</p>
                <h2 className="font-heading text-3xl font-extrabold mb-3">Pick your top 3 priorities</h2>
                <p className="text-text-muted">Select exactly 3 — we'll weight your matches accordingly.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {PRIORITIES.map((p) => {
                  const selected = answers.priorities?.includes(p.key);
                  const maxReached = (answers.priorities?.length ?? 0) >= 3 && !selected;
                  return (
                    <button
                      key={p.key}
                      disabled={maxReached}
                      onClick={() => {
                        const current = answers.priorities ?? [];
                        if (selected) {
                          setAnswers({ ...answers, priorities: current.filter((x) => x !== p.key) });
                        } else if (current.length < 3) {
                          setAnswers({ ...answers, priorities: [...current, p.key] });
                        }
                      }}
                      className={[
                        "flex items-center gap-3 p-4 rounded-xl border text-left transition-all",
                        selected ? "border-accent bg-accent/10 text-text-primary" : "",
                        !selected && !maxReached ? "border-border bg-bg-elevated text-text-muted hover:border-accent/30 hover:text-text-primary" : "",
                        maxReached ? "border-border bg-bg-elevated text-text-muted/40 cursor-not-allowed" : "",
                      ].join(" ")}
                    >
                      <span className="text-xl">{p.emoji}</span>
                      <span className="text-sm font-medium">{p.label}</span>
                      {selected && (
                        <span className="ml-auto text-xs text-accent font-bold">
                          #{(answers.priorities?.indexOf(p.key) ?? 0) + 1}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-text-muted text-center">
                {answers.priorities?.length ?? 0}/3 selected
              </p>
            </div>
          )}

          {/* Step 5 — City vibe (skipped for job offer) */}
          {step === 5 && (
            <div className="space-y-8 animate-fade-up">
              <div>
                <p className="text-accent text-sm font-medium mb-2">Your lifestyle</p>
                <h2 className="font-heading text-3xl font-extrabold mb-3">What kind of place do you want to live in?</h2>
                <p className="text-text-muted">There's no wrong answer here.</p>
              </div>
              <div className="space-y-3">
                {CITY_VIBES.map((v) => (
                  <button
                    key={v.key}
                    onClick={() => setAnswers({ ...answers, cityVibe: v.key })}
                    className={[
                      "w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all",
                      answers.cityVibe === v.key
                        ? "border-accent bg-accent/10"
                        : "border-border bg-bg-elevated hover:border-accent/30",
                    ].join(" ")}
                  >
                    <div>
                      <p className={["text-sm font-medium", answers.cityVibe === v.key ? "text-text-primary" : "text-text-muted"].join(" ")}>{v.label}</p>
                      <p className="text-xs text-text-muted mt-0.5">{v.sub}</p>
                    </div>
                    {answers.cityVibe === v.key && (
                      <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 6 — Rent budget (skipped for job offer) */}
          {step === 6 && (
            <div className="space-y-8 animate-fade-up">
              <div>
                <p className="text-accent text-sm font-medium mb-2">Your budget</p>
                <h2 className="font-heading text-3xl font-extrabold mb-3">What's your monthly rent budget?</h2>
                <p className="text-text-muted">We'll filter out countries that would stretch you too thin.</p>
              </div>
              <div className="space-y-3">
                {rentBudgets.map((b) => (
                  <button
                    key={b.key}
                    onClick={() => setAnswers({ ...answers, rentBudget: b.key })}
                    className={[
                      "w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all",
                      answers.rentBudget === b.key
                        ? "border-accent bg-accent/10"
                        : "border-border bg-bg-elevated hover:border-accent/30",
                    ].join(" ")}
                  >
                    <div>
                      <p className={["text-sm font-medium", answers.rentBudget === b.key ? "text-text-primary" : "text-text-muted"].join(" ")}>{b.label}</p>
                      <p className="text-xs text-text-muted mt-0.5">{b.sub}</p>
                    </div>
                    {answers.rentBudget === b.key && (
                      <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 7 — Languages */}
          {step === 7 && (
            <div className="space-y-8 animate-fade-up">
              <div>
                <p className="text-accent text-sm font-medium mb-2">Your skills</p>
                <h2 className="font-heading text-3xl font-extrabold mb-3">Do you speak any other languages?</h2>
                <p className="text-text-muted">Speaking the local language can give you a real edge — we'll factor it in.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {LANGUAGES.map((l) => {
                  const selected = answers.languages?.includes(l.key);
                  return (
                    <button
                      key={l.key}
                      onClick={() => {
                        const current = answers.languages ?? [];
                        if (l.key === "none") {
                          setAnswers({ ...answers, languages: ["none"] });
                        } else {
                          const withoutNone = current.filter((x) => x !== "none");
                          if (selected) {
                            setAnswers({ ...answers, languages: withoutNone.filter((x) => x !== l.key) });
                          } else {
                            setAnswers({ ...answers, languages: [...withoutNone, l.key] });
                          }
                        }
                      }}
                      className={[
                        "flex items-center gap-3 p-4 rounded-xl border text-left transition-all",
                        selected
                          ? "border-accent bg-accent/10 text-text-primary"
                          : "border-border bg-bg-elevated text-text-muted hover:border-accent/30 hover:text-text-primary",
                      ].join(" ")}
                    >
                      <span className="text-sm font-medium">{l.label}</span>
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
                <p className="text-accent text-sm font-medium mb-2">Almost there</p>
                <h2 className="font-heading text-3xl font-extrabold mb-3">Any deal breakers?</h2>
                <p className="text-text-muted">We'll remove countries that don't fit. Select all that apply.</p>
              </div>
              <div className="space-y-3">
                {DEAL_BREAKERS.map((d) => {
                  const selected = answers.dealBreakers?.includes(d.key);
                  return (
                    <button
                      key={d.key}
                      onClick={() => {
                        const current = answers.dealBreakers ?? [];
                        if (d.key === "none") {
                          setAnswers({ ...answers, dealBreakers: ["none"] });
                        } else {
                          const withoutNone = current.filter((x) => x !== "none");
                          if (selected) {
                            setAnswers({ ...answers, dealBreakers: withoutNone.filter((x) => x !== d.key) });
                          } else {
                            setAnswers({ ...answers, dealBreakers: [...withoutNone, d.key] });
                          }
                        }
                      }}
                      className={[
                        "w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all",
                        selected
                          ? "border-accent bg-accent/10 text-text-primary"
                          : "border-border bg-bg-elevated text-text-muted hover:border-accent/30 hover:text-text-primary",
                      ].join(" ")}
                    >
                      <span className="text-sm font-medium">{d.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-border text-sm text-text-muted hover:text-text-primary hover:border-accent/30 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed() || loading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-bg-primary text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors"
            >
              {loading ? (
                <>Finding your matches...</>
              ) : isLastStep ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  Find My Country
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}