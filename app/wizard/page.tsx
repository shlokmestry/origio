/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { JOB_ROLES } from "@/types";
import { WizardAnswers, scoreCountriesForWizard } from "@/lib/wizard";
import { CountryWithData } from "@/types";
import { supabase } from "@/lib/supabase";
import QuizGate from "@/components/QuizGate";

const ANON_MAX_RUNS = 3;
const FREE_MAX_RUNS = 5;
const ANON_STORAGE_KEY = "origio_quiz_runs";
const TOTAL_STEPS = 8;

const PASSPORTS = ["Ireland","United Kingdom","Germany","France","Netherlands","Spain","Portugal","Sweden","Norway","Switzerland","Australia","New Zealand","Canada","USA","Singapore","UAE","India","China","Brazil","South Africa","Nigeria","Kenya","Philippines","Italy","Poland","Romania","Other"];

function getRentBudgets(passport: string) { /* unchanged */
  const p = passport.toLowerCase();
  if (p === "india") return { note: "Shown in Indian Rupees — typical rent abroad converted to INR", options: [{ key: "under800", label: "Under ₹65,000/mo", sub: "Budget-conscious" },{ key: "800to1500", label: "₹65,000 – ₹1,25,000/mo", sub: "Comfortable" },{ key: "1500to2500", label: "₹1,25,000 – ₹2,00,000/mo", sub: "Flexible" },{ key: "any", label: "Money isn't a concern", sub: "No limit" }] };
  if (p === "usa") return { note: "Shown in US Dollars", options: [{ key: "under800", label: "Under $800/mo", sub: "Budget-conscious" },{ key: "800to1500", label: "$800 – $1,500/mo", sub: "Comfortable" },{ key: "1500to2500", label: "$1,500 – $2,500/mo", sub: "Flexible" },{ key: "any", label: "Money isn't a concern", sub: "No limit" }] };
  return { note: "Shown in Euros — average city-centre rent abroad", options: [{ key: "under800", label: "Under €800/mo", sub: "Budget-conscious" },{ key: "800to1500", label: "€800 – €1,500/mo", sub: "Comfortable" },{ key: "1500to2500", label: "€1,500 – €2,500/mo", sub: "Flexible" },{ key: "any", label: "Money isn't a concern", sub: "No limit" }] };
}

const LANGUAGES = [{ key: "english", label: "English" },{ key: "spanish", label: "Spanish" },{ key: "french", label: "French" },{ key: "german", label: "German" },{ key: "portuguese", label: "Portuguese" },{ key: "arabic", label: "Arabic" },{ key: "mandarin", label: "Mandarin" },{ key: "hindi", label: "Hindi" },{ key: "italian", label: "Italian" },{ key: "dutch", label: "Dutch" },{ key: "swedish", label: "Swedish" },{ key: "norwegian", label: "Norwegian" },{ key: "japanese", label: "Japanese" },{ key: "korean", label: "Korean" },{ key: "tagalog", label: "Tagalog" },{ key: "turkish", label: "Turkish" },{ key: "polish", label: "Polish" },{ key: "none", label: "English only" }];
const DEAL_BREAKERS = [{ key: "english", label: "Must be English-speaking" },{ key: "europe", label: "Must be in Europe" },{ key: "lowtax", label: "Must have low taxes" },{ key: "warm", label: "Must have warm weather" },{ key: "lowcrime", label: "Must have low crime rate" },{ key: "none", label: "No deal breakers" }];

const HINTS = ["no signup needed","this shapes your score weights","salary expectations by role","drag to reorder · order = weight","city energy matters","keep it realistic","more languages = more options","constraints filter your final matches"];

const stepMeta = [null,
  { eyebrow: "Passport", title: "Where are you from", accent: "from" },
  { eyebrow: "Reason", title: "Why are you moving", accent: "moving" },
  { eyebrow: "Profession", title: "What's your job", accent: "job" },
  { eyebrow: "Priorities", title: "What matters most", accent: "most" },
  { eyebrow: "Vibe", title: "What's your vibe", accent: "vibe" },
  { eyebrow: "Budget", title: "Rent budget", accent: "budget" },
  { eyebrow: "Languages", title: "Languages you speak", accent: "speak" },
  { eyebrow: "Deal-breakers", title: "Any deal breakers", accent: "breakers" },
] as const;

export default function WizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Partial<WizardAnswers>>({ priorities: [], languages: [], dealBreakers: [] });
  const [gateChecked, setGateChecked] = useState(false);
  const [gateType, setGateType] = useState<"anon" | "free" | null>(null);
  const [runsUsed, setRunsUsed] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  useEffect(() => { async function checkGate() { const { data: { session } } = await supabase.auth.getSession(); if (!session?.user) { const stored = parseInt(localStorage.getItem(ANON_STORAGE_KEY) ?? "0", 10); setRunsUsed(stored); setIsSignedIn(false); if (stored >= ANON_MAX_RUNS) setGateType("anon"); setGateChecked(true); return; } setIsSignedIn(true); const { data: profile } = await supabase.from("profiles").select("is_pro, quiz_runs_count").eq("id", session.user.id).single(); const pro = profile?.is_pro ?? false; const runs = profile?.quiz_runs_count ?? 0; setIsPro(pro); setRunsUsed(runs); if (!pro && runs >= FREE_MAX_RUNS) setGateType("free"); setGateChecked(true);} checkGate(); }, []);
  const isJobOffer = answers.moveReason === "job";
  const getNextStep = (cur: number) => { if (cur === 2 && isJobOffer) return 3; if (cur === 3 && isJobOffer) return 7; return cur + 1; };
  const getPrevStep = (cur: number) => { if (cur === 7 && isJobOffer) return 3; if (cur === 3 && isJobOffer) return 2; return cur - 1; };
  const getEffectiveTotalSteps = () => isJobOffer ? 5 : TOTAL_STEPS;
  const getEffectiveStep = () => { if (!isJobOffer) return step; if (step <= 3) return step; if (step >= 7) return step - 3; return step; };
  const isLastStep = isJobOffer ? step === 8 : step === TOTAL_STEPS;
  const maxRuns = isPro ? Infinity : isSignedIn ? FREE_MAX_RUNS : ANON_MAX_RUNS;
  const runsLeft = isPro ? null : Math.max(0, maxRuns - runsUsed);
  const canProceed = () => { if (step === 1) return !!answers.passport; if (step === 2) return !!answers.moveReason; if (step === 3) return !!answers.jobRole; if (step === 4) return (answers.priorities?.length ?? 0) >= 3; if (step === 5) return !!answers.cityVibe; if (step === 6) return !!answers.rentBudget; if (step === 7) return (answers.languages?.length ?? 0) > 0; if (step === 8) return (answers.dealBreakers?.length ?? 0) > 0; return false; };
  const handleNext = () => { const next = getNextStep(step); if (next <= TOTAL_STEPS) setStep(next); else handleSubmit(); };
  const handleBack = () => { if (step === 1) router.push("/"); else setStep(getPrevStep(step)); };
  const handleSubmit = async () => { setLoading(true); try { const res = await fetch("/api/countries"); const countries: CountryWithData[] = await res.json(); let matches = scoreCountriesForWizard(countries, answers as WizardAnswers); try { const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 3000); const validationRes = await fetch("/api/validate-results", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ matches, answers }), signal: controller.signal }); clearTimeout(timeout); if (validationRes.ok) { const validation = await validationRes.json(); if (!validation.valid && validation.flaggedCountries?.length > 0) { const flagged = validation.flaggedCountries.map((n: string) => n.toLowerCase()); matches = [...matches.filter((m) => !flagged.includes(m.country.name.toLowerCase())), ...matches.filter((m) => flagged.includes(m.country.name.toLowerCase())).map((m) => ({ ...m, matchPercent: Math.min(m.matchPercent, 40) }))]; } } } catch {} const { data: { session } } = await supabase.auth.getSession(); if (session?.user) await supabase.rpc("increment_quiz_runs", { user_id: session.user.id }); else { const current = parseInt(localStorage.getItem(ANON_STORAGE_KEY) ?? "0", 10); localStorage.setItem(ANON_STORAGE_KEY, String(current + 1)); } sessionStorage.setItem("wizardMatches", JSON.stringify(matches)); sessionStorage.setItem("wizardAnswers", JSON.stringify(answers)); router.push("/wizard/results"); } catch (err) { console.error(err); setLoading(false);} };
  const { note: rentNote, options: rentOptions } = getRentBudgets(answers.passport ?? "");
  if (!gateChecked) return <div className="min-h-screen bg-bg-primary flex items-center justify-center"><div className="w-32 h-1 bg-bg-elevated"><div className="h-full bg-accent animate-pulse" style={{ width: "40%" }} /></div></div>;
  if (gateType) return <QuizGate type={gateType} runsUsed={runsUsed} maxRuns={gateType === "anon" ? ANON_MAX_RUNS : FREE_MAX_RUNS} />;
  const n = String(getEffectiveStep()).padStart(2, "0");
  const t = String(getEffectiveTotalSteps()).padStart(2, "0");
  const currentMeta = stepMeta[step as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8];

  return <div className="min-h-screen grain bg-bg-primary text-text-primary">
    <header className="px-6 md:px-10 py-4 border-b border-border">
      <div className="flex items-center justify-between">
        <button onClick={handleBack} className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted hover:text-text-primary flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5"/>back</button>
        <Link href="/" className="font-heading italic text-3xl">Origio</Link>
        <div className="font-mono text-xs tracking-[0.16em]"><span>{n}</span><span className="text-text-muted"> / {t}</span></div>
      </div>
      <div className="grid grid-cols-8 gap-2 mt-4">{Array.from({length:getEffectiveTotalSteps()}).map((_,i)=>{const cur=getEffectiveStep();const filled=i+1<cur;const active=i+1===cur;return <div key={i} className="h-[2px]" style={{background: filled?"var(--accent)":active?"color-mix(in srgb, var(--accent) 60%, transparent)":"rgb(240 240 232 / 0.1)", boxShadow: active?"0 0 8px var(--accent-glow)":"none"}}/>})}</div>
      <div className="flex justify-between mt-3"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">step {n} · {currentMeta?.eyebrow}</p><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">~5 min left</p></div>
    </header>

    <main className="px-6 md:px-10 py-8 md:py-12 grid md:grid-cols-12 gap-8">
      <section className="md:col-span-5 relative">
        <div className="absolute -top-16 -left-3 font-heading text-[180px] md:text-[260px] leading-none select-none pointer-events-none" style={{color:"rgb(240 240 232 / 0.04)"}}>{n}</div>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted mb-4 relative">question {n} of {t}</p>
        <h1 className="font-heading text-5xl md:text-6xl leading-[0.98] relative" style={{transform:"rotate(-0.4deg)"}}>{currentMeta?.title.split(" ").slice(0,-1).join(" ")} <span className="italic text-accent scribble-underline">{currentMeta?.accent}</span></h1>
        <p className="font-heading italic text-text-muted mt-4 max-w-sm">{step === 4 ? "Pick at least three. Earlier choices get higher weight in matching." : "One thoughtful answer at a time — we’ll build your final country short-list."}</p>
        {step === 1 && <svg width="88" height="48" viewBox="0 0 88 48" fill="none" className="absolute top-44 right-0 md:-right-8"><path d="M2 24 C16 8, 36 8, 58 18" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="3 3"/><path d="M54 12 L58 18 L50 20" stroke="var(--accent)" strokeWidth="1.5"/></svg>}
        <div className="inline-block mt-8 px-3 py-1 border border-border font-mono text-[10px] uppercase tracking-[0.15em] text-text-primary" style={{background:"var(--accent-dim)", transform:"rotate(-0.45deg)"}}>{HINTS[step-1]}</div>
        {runsLeft !== null && runsLeft <= 2 && <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.15em] text-text-muted">{runsLeft} run{runsLeft===1?"":"s"} left</p>}
      </section>

      <section className="md:col-span-7 md:border-l border-border md:pl-8">
        {step === 1 && <div className="grid grid-cols-2 md:grid-cols-3 gap-2">{PASSPORTS.map((p)=><button key={p} onClick={()=>setAnswers({...answers,passport:p.toLowerCase()})} className="border px-3 py-3 text-left font-sans text-sm" style={{borderColor:"var(--border)",background:answers.passport===p.toLowerCase()?"var(--accent)":"transparent",color:answers.passport===p.toLowerCase()?"var(--bg-primary)":"var(--text-primary)",fontWeight:answers.passport===p.toLowerCase()?700:500}}>{p}</button>)}</div>}
        {step === 2 && <div className="space-y-2">{[{ key: "job", label: "I have a job offer", sub: "Moving for a specific role" },{ key: "career", label: "Better career opportunities", sub: "Higher salary, growth, tech hubs" },{ key: "remote", label: "I work remotely", sub: "Location flexibility, low tax, good internet" },{ key: "retire", label: "Retirement / FIRE", sub: "Low cost, good healthcare, passive income" },{ key: "study", label: "Study abroad", sub: "Universities, student visas" },{ key: "lifestyle", label: "Lifestyle change", sub: "Weather, culture, quality of life" }].map((opt,i)=>{const s=answers.moveReason===opt.key; const r=i%3===0?"rotate(0.25deg)":i%3===1?"rotate(-0.2deg)":"rotate(0deg)"; return <button key={opt.key} onClick={()=>setAnswers({...answers,moveReason:opt.key})} className="w-full border px-4 py-4 text-left flex gap-3 items-start" style={{transform:r,borderColor:s?"var(--accent)":"var(--border)",background:s?"var(--accent-dim)":"transparent"}}><span className="mt-1 w-3 h-3 border" style={{borderColor:s?"var(--accent)":"var(--text-muted)", background:s?"var(--accent)":"transparent"}}/><span><span className="font-heading text-2xl block">{opt.label}</span><span className="text-sm text-text-muted">{opt.sub}</span></span></button>})}</div>}
        {step === 3 && <div className="border border-border">{JOB_ROLES.map((r,i)=>{const s=answers.jobRole===r.key; return <button key={r.key} onClick={()=>setAnswers({...answers,jobRole:r.key})} className="w-full border-b last:border-b-0 border-border px-4 py-4 text-left flex justify-between items-center"><span className="font-mono text-xs text-text-muted mr-3">{String(i+1).padStart(2,"0")}</span><span className="font-heading text-2xl flex-1">{r.label}</span><span className="ml-4">{s?<Check className="w-4 h-4 text-accent"/>:r.emoji}</span></button>})}</div>}
        {step === 4 && <div><div className="grid md:grid-cols-2 gap-2">{[{ key: "salary", label: "High salary" },{ key: "affordability", label: "Low cost of living" },{ key: "quality", label: "Quality of life" },{ key: "safety", label: "Safety & low crime" },{ key: "visa", label: "Easy visa / immigration" },{ key: "tax", label: "Low taxes" },{ key: "healthcare", label: "Good healthcare" },{ key: "english", label: "English-speaking environment" }].map((opt)=>{const idx=answers.priorities?.indexOf(opt.key)??-1;const s=idx!==-1; return <button key={opt.key} onClick={()=>{const cur=answers.priorities??[]; if(s) setAnswers({...answers,priorities:cur.filter((x)=>x!==opt.key)}); else setAnswers({...answers,priorities:[...cur,opt.key]});}} className="border px-3 py-3 text-left flex items-center justify-between" style={{borderColor:s?"var(--accent)":"var(--border)",background:s?"var(--accent-dim)":"transparent"}}><span>{opt.label}</span><span className="w-6 h-6 flex items-center justify-center font-mono text-xs" style={{background:s?"var(--accent)":"transparent",color:s?"var(--bg-primary)":"var(--text-muted)", border:s?"none":"1px solid var(--border)"}}>{s?idx+1:""}</span></button>})}</div><p className="mt-3 font-mono text-xs text-text-muted">{Math.max(0,3-(answers.priorities?.length??0))>0?`select ${Math.max(0,3-(answers.priorities?.length??0))} more`:`${answers.priorities?.length ?? 0} selected — order = weight`}</p></div>}
        {step === 5 && <div className="space-y-2">{[{ key: "big-city", label: "Big city", sub: "London, NYC, Singapore energy" },{ key: "mid-city", label: "Mid-size city", sub: "Liveable, less hectic" },{ key: "coastal", label: "Coastal / beach", sub: "Warm, relaxed, outdoor lifestyle" },{ key: "anywhere", label: "Anywhere works", sub: "I'm flexible" }].map((opt,i)=>{const s=answers.cityVibe===opt.key; const r=i%3===0?"rotate(0.25deg)":i%3===1?"rotate(-0.2deg)":"rotate(0deg)"; return <button key={opt.key} onClick={()=>setAnswers({...answers,cityVibe:opt.key})} className="w-full border px-4 py-4 text-left" style={{transform:r,borderColor:s?"var(--accent)":"var(--border)",background:s?"var(--accent-dim)":"transparent"}}><span className="font-heading text-2xl block">{opt.label}</span><span className="text-sm text-text-muted">{opt.sub}</span></button>})}</div>}
        {step === 6 && <div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted mb-3">{rentNote}</p><div className="space-y-2">{rentOptions.map((opt,i)=>{const s=answers.rentBudget===opt.key; const r=i%3===0?"rotate(0.2deg)":i%3===1?"rotate(-0.2deg)":"rotate(0deg)"; return <button key={opt.key} onClick={()=>setAnswers({...answers,rentBudget:opt.key})} className="w-full border px-4 py-4 text-left" style={{transform:r,borderColor:s?"var(--accent)":"var(--border)",background:s?"var(--accent-dim)":"transparent"}}><span className="font-heading text-2xl block">{opt.label}</span><span className="text-sm text-text-muted">{opt.sub}</span></button>})}</div></div>}
        {step === 7 && <div className="flex flex-wrap gap-2">{LANGUAGES.map((l)=>{const s=answers.languages?.includes(l.key); return <button key={l.key} onClick={()=>{const cur=answers.languages??[]; if(l.key==="none"){setAnswers({...answers,languages:["none"]}); return;} const w=cur.filter((x)=>x!=="none"); if(s) setAnswers({...answers,languages:w.filter((x)=>x!==l.key)}); else setAnswers({...answers,languages:[...w,l.key]});}} className="px-3 py-2 border font-mono text-xs uppercase tracking-wide" style={{borderColor:s?"var(--accent)":"var(--border)",background:s?"var(--accent)":"transparent",color:s?"var(--bg-primary)":"var(--text-primary)"}}>{l.label}</button>})}</div>}
        {step === 8 && <div className="space-y-2">{DEAL_BREAKERS.map((d,i)=>{const s=answers.dealBreakers?.includes(d.key); const r=i%3===0?"rotate(0.25deg)":i%3===1?"rotate(-0.2deg)":"rotate(0deg)"; return <button key={d.key} onClick={()=>{const cur=answers.dealBreakers??[]; if(d.key==="none"){setAnswers({...answers,dealBreakers:["none"]});return;} const w=cur.filter((x)=>x!=="none"); if(s) setAnswers({...answers,dealBreakers:w.filter((x)=>x!==d.key)}); else setAnswers({...answers,dealBreakers:[...w,d.key]});}} className="w-full border px-4 py-4 text-left" style={{transform:r,borderColor:s?"var(--accent)":"var(--border)",background:s?"var(--accent-dim)":"transparent"}}><span className="font-heading text-2xl">{d.label}</span></button>})}</div>}

        <div className="mt-10 pt-5 border-t border-border flex justify-between items-center">
          <button onClick={handleBack} className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted hover:text-text-primary flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5"/>back</button>
          <button onClick={handleNext} disabled={!canProceed() || loading} className="px-6 py-3 font-sans font-bold uppercase tracking-[0.12em] flex items-center gap-2 disabled:opacity-30" style={{background:"var(--accent)",color:"var(--bg-primary)",boxShadow:canProceed()&&!loading?"4px 4px 0 #facc15":"none",transform:"rotate(-0.3deg)"}}>{loading?"finding matches...":isLastStep?"see my matches":<>next <ArrowRight className="w-4 h-4"/></>}</button>
        </div>
      </section>
    </main>
  </div>;
}
