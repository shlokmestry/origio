"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import {
  ExternalLink, Loader2, FileText, Sparkles, AlertTriangle,
} from "lucide-react";
import generatePDF, { Margin } from "react-to-pdf";
import { CountryWithData, JOB_ROLES } from "@/types";
import { getScoreBreakdown, getVisaLabel, getVisaColor } from "@/lib/utils";
import SaveCountryButton from "@/components/SaveCountryButton";
import { supabase } from "@/lib/supabase";
import { WizardAnswers } from "@/lib/wizard";

// ── tokens ────────────────────────────────────────────────────────────────
const BG     = "#040407";
const INK    = "#f0f0ed";
const TEAL   = "#4de6cc";
const DIM    = "rgba(240,240,237,0.36)";
const DIMMER = "rgba(240,240,237,0.13)";
const RULE   = "rgba(240,240,237,0.085)";
const SERIF  = "'DM Serif Display', Georgia, serif";
const MONO   = "'Space Mono', monospace";
const SANS   = "'Inter', sans-serif";

const SCORE_COLORS = [TEAL, "#a78bfa", "#f472b6", "#60a5fa", "#fb923c", "#facc15"];
const QUALITY_COLORS = ["#f472b6", "#4ade80", "#60a5fa", "#facc15"];
const COST_COLORS = [TEAL, "#a78bfa", "#60a5fa", "#f472b6", "#facc15", "#4ade80"];

const TO_USD: Record<string, number> = {
  USD: 1, EUR: 1.08, GBP: 1.27, AUD: 0.65, CAD: 0.74,
  NZD: 0.61, CHF: 1.13, SGD: 0.74, AED: 0.27,
  NOK: 0.093, SEK: 0.096, DKK: 0.145, JPY: 0.0067,
  INR: 0.012, BRL: 0.20, MYR: 0.22,
};
const RENT_BUDGET_USD: Record<string, number> = {
  under800: 800, "800to1500": 1500, "1500to2500": 2500, any: 99999,
};

function getCurrencySymbol(currency: string): string {
  const s: Record<string, string> = {
    USD: "$", EUR: "€", GBP: "£", AUD: "A$", CAD: "C$",
    NZD: "NZ$", CHF: "CHF ", SGD: "S$", AED: "AED ", NOK: "kr ",
    SEK: "kr ", JPY: "¥", INR: "₹", BRL: "R$", MYR: "RM ", DKK: "kr ",
  };
  return s[currency] ?? currency + " ";
}

function getVisaDifficultyLabel(d: number) {
  if (d <= 1) return "Easy entry.";
  if (d <= 2) return "Easy entry.";
  if (d <= 3) return "Moderate entry.";
  if (d <= 4) return "Difficult entry.";
  return "Very hard entry.";
}

// ── Fit name to full width ────────────────────────────────────────────────
function FitName({ name }: { name: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    function fit() {
      if (!el) return;
      el.style.fontSize = "10px";
      const containerW = el.parentElement?.offsetWidth ?? window.innerWidth;
      const ratio = containerW / el.scrollWidth;
      el.style.fontSize = (10 * ratio * 0.995) + "px";
    }
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [name]);
  return (
    <span ref={ref} style={{
      fontFamily: SERIF, fontWeight: 400, fontStyle: "italic",
      lineHeight: 0.84, letterSpacing: "-0.025em", color: INK,
      display: "block", whiteSpace: "nowrap", width: "100%",
    }}>
      {name}
    </span>
  );
}

// ── Dot plot row ──────────────────────────────────────────────────────────
function DotPlotRow({ role, salary, minS, maxS, color, isHighlighted }: {
  role: string; salary: number; minS: number; maxS: number;
  color: string; isHighlighted: boolean;
}) {
  const pct = ((salary - minS) / (maxS - minS)) * 100;
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "118px 1fr 80px",
      alignItems: "center", gap: 14, padding: "8px 0",
      borderBottom: `1px solid rgba(240,240,237,0.04)`,
    }}>
      <span style={{
        fontFamily: MONO, fontSize: 9, fontWeight: 700,
        color: isHighlighted ? TEAL : DIM,
        letterSpacing: "0.05em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>{role}</span>
      <div style={{ position: "relative", height: 1, background: "rgba(240,240,237,0.08)" }}>
        <div style={{
          position: "absolute", width: 8, height: 8, borderRadius: "50%",
          background: color, top: "50%", left: `${pct}%`,
          transform: "translate(-50%, -50%)",
          boxShadow: isHighlighted ? `0 0 10px rgba(77,230,204,0.55)` : "none",
        }} />
      </div>
      <span style={{
        fontFamily: MONO, fontSize: 10, fontWeight: 700,
        color: isHighlighted ? TEAL : DIM, textAlign: "right",
      }}>
        {salary >= 1000 ? `<${Math.ceil(salary / 1000)}k` : salary}
      </span>
    </div>
  );
}

interface Props {
  country: CountryWithData;
  otherCountries: CountryWithData[];
}

export default function CountryPageClient({ country, otherCountries }: Props) {
  const { data } = country;
  const scoreBreakdown = getScoreBreakdown(data);
  const cs = getCurrencySymbol(country.currency);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // ── Personalisation ───────────────────────────────────────────────────────
  const [wizardAnswers, setWizardAnswers] = useState<Partial<WizardAnswers> | null>(null);
  const [matchPercent, setMatchPercent]   = useState<number | null>(null);
  const [matchReasons, setMatchReasons]   = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      let answers: Partial<WizardAnswers> | null = null;
      const raw = sessionStorage.getItem("wizardAnswers");
      if (raw) answers = JSON.parse(raw);

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: result } = await supabase
          .from("wizard_results").select("answers, top_countries")
          .eq("user_id", session.user.id).maybeSingle();
        if (result?.answers) answers = result.answers;
        if (result?.top_countries) {
          const m = (result.top_countries as any[]).find((c: any) => c.slug === country.slug);
          if (m) { setMatchPercent(m.matchPercent); setMatchReasons(m.reasons ?? []); }
        }
      }
      if (!matchPercent) {
        const matchesRaw = sessionStorage.getItem("wizardMatches");
        if (matchesRaw) {
          const matches = JSON.parse(matchesRaw);
          const m = matches.find((m: any) => m.country.slug === country.slug);
          if (m) { setMatchPercent(m.matchPercent); setMatchReasons(m.reasons ?? []); }
        }
      }
      setWizardAnswers(answers);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country.slug]);

  const userRole   = wizardAnswers?.jobRole ? JOB_ROLES.find(r => r.key === wizardAnswers.jobRole) : null;
  const userSalary = userRole ? (data[userRole.salaryKey] as number) : null;
  const rentUSD    = data.costRentCityCentre * (TO_USD[country.currency] ?? 1);
  const maxRentUSD = RENT_BUDGET_USD[wizardAnswers?.rentBudget ?? "any"] ?? 99999;
  const rentFits   = rentUSD <= maxRentUSD;
  const rentWarning = wizardAnswers?.rentBudget && wizardAnswers.rentBudget !== "any" && !rentFits;
  const dealBreakers = wizardAnswers?.dealBreakers ?? [];
  const hasEnglishFlag = dealBreakers.includes("english") &&
    !["ireland","united-kingdom","australia","new-zealand","canada","usa","singapore"].includes(country.slug);
  const hasHighTaxFlag = dealBreakers.includes("lowtax") && data.incomeTaxRateMid > 30;

  // ── Salary data ───────────────────────────────────────────────────────────
  const salaryData = [
    { role: "Doctor",         salary: data.salaryDoctor,           color: "#4ade80" },
    { role: "Lawyer",         salary: data.salaryLawyer,           color: "#f87171" },
    { role: "Product Mgr.",   salary: data.salaryProductManager,   color: "#f472b6" },
    { role: "DevOps",         salary: data.salaryDevOps,           color: "#60a5fa" },
    { role: "Software Eng.",  salary: data.salarySoftwareEngineer, color: TEAL },
    { role: "Data Scientist", salary: data.salaryDataScientist,    color: "#a78bfa" },
    { role: "Cybersecurity",  salary: data.salaryCybersecurity,    color: "#facc15" },
    { role: "Fin. Analyst",   salary: data.salaryFinancialAnalyst, color: "#818cf8" },
    { role: "UX Designer",    salary: data.salaryUXDesigner,       color: "#34d399" },
    { role: "Architect",      salary: data.salaryArchitect,        color: "#38bdf8" },
    { role: "Civil Eng.",     salary: data.salaryCivilEngineer,    color: "#a3e635" },
    { role: "Accountant",     salary: data.salaryAccountant,       color: "#fbbf24" },
    { role: "Nurse",          salary: data.salaryNurse,            color: "#fb923c" },
    { role: "Teacher",        salary: data.salaryTeacher,          color: "#2dd4bf" },
    { role: "Chef",           salary: data.salaryChef,             color: "#fda4af" },
  ].filter(s => s.salary > 0).sort((a, b) => b.salary - a.salary);

  const minS = Math.min(...salaryData.map(s => s.salary));
  const maxS = Math.max(...salaryData.map(s => s.salary));

  // ── Cost data ─────────────────────────────────────────────────────────────
  const costItems = [
    { label: "Rent\ncity",    val: data.costRentCityCentre,  color: COST_COLORS[0] },
    { label: "Groceries",     val: data.costGroceriesMonthly, color: COST_COLORS[1] },
    { label: "Transport",     val: data.costTransportMonthly, color: COST_COLORS[2] },
    { label: "Dining\nout",   val: data.costEatingOut,        color: COST_COLORS[3] },
    { label: "Utilities",     val: data.costUtilitiesMonthly, color: COST_COLORS[4] },
    { label: "Rent\noutside", val: data.costRentOutside,      color: COST_COLORS[5] },
  ];
  const maxCost = Math.max(...costItems.map(c => c.val));
  const totalMonthlyCost = data.costRentCityCentre + data.costGroceriesMonthly +
    data.costTransportMonthly + data.costEatingOut + data.costUtilitiesMonthly;

  // ── Visa segments ─────────────────────────────────────────────────────────
  const visaSegs = Array.from({ length: 5 }, (_, i) => i < data.visaDifficulty);
  const visaBadgeColor = data.visaDifficulty <= 2 ? "#4ade80" : data.visaDifficulty <= 3 ? "#facc15" : "#f87171";

  const handleGetReport = async () => {
    setGeneratingPDF(true);
    try {
      await generatePDF(reportRef, {
        filename: country.name.toLowerCase().replace(/\s+/g, "-") + "-origio-report.pdf",
        page: { margin: Margin.MEDIUM },
      });
    } finally {
      setGeneratingPDF(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: BG, color: INK, fontFamily: SANS, WebkitFontSmoothing: "antialiased", overflowX: "hidden" }}>
      <style>{`
        @keyframes breathe { 0%,100%{opacity:.45} 50%{opacity:1} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fu { animation: fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) both; }
        .d1{animation-delay:.04s}.d2{animation-delay:.09s}.d3{animation-delay:.14s}.d4{animation-delay:.19s}
        @media(max-width:900px){
          .salary-layout { grid-template-columns: 1fr !important; gap: 28px !important; }
          .scores-grid { grid-template-columns: repeat(2,1fr) !important; }
          .quality-grid { grid-template-columns: repeat(2,1fr) !important; }
          .visa-grid { grid-template-columns: 1fr !important; gap: 36px !important; }
          .tax-pair { grid-template-columns: 1fr !important; }
          .explore-grid { grid-template-columns: repeat(3,1fr) !important; }
          .cost-chart-grid { grid-template-columns: repeat(3,1fr) !important; gap: 16px !important; }
          .nav-center { display: none !important; }
          .hm-strip { flex-wrap: wrap !important; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(4,4,7,0.93)", backdropFilter: "blur(14px)", borderBottom: `1px solid ${RULE}` }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 36px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{ width: 17, height: 17, background: INK, borderRadius: 3, display: "grid", placeItems: "center" }}>
              <span style={{ width: 6, height: 6, background: BG, borderRadius: 1, display: "block" }} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.16em", color: INK, textTransform: "uppercase" }}>Origio</span>
          </Link>

          <Link href="/countries" className="nav-center" style={{ fontFamily: MONO, fontSize: 8.5, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: DIMMER, textDecoration: "none", transition: "color 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.color = DIM)}
            onMouseLeave={e => (e.currentTarget.style.color = DIMMER)}>
            ← All countries
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <SaveCountryButton countrySlug={country.slug} />
            <button onClick={handleGetReport} disabled={generatingPDF} style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              border: `1px solid ${RULE}`, borderRadius: 100, padding: "5px 13px",
              color: DIM, fontSize: 10, fontWeight: 600, letterSpacing: "0.07em",
              textTransform: "uppercase", cursor: "pointer", background: "transparent",
              fontFamily: SANS, transition: "border-color 0.15s, color 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(240,240,237,0.24)"; e.currentTarget.style.color = INK; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = RULE; e.currentTarget.style.color = DIM; }}>
              {generatingPDF ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> : <FileText size={12} />}
              {generatingPDF ? "Generating..." : "↓ PDF"}
            </button>
          </div>
        </div>
      </nav>

      <div ref={reportRef}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 36px 100px" }}>

          {/* ── HERO ── */}
          <section className="fu d1" style={{ paddingTop: 52, overflow: "hidden" }}>
            <p style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: TEAL, marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ display: "block", width: 20, height: 1, background: TEAL, opacity: 0.5 }} />
              {country.continent}
            </p>

            <FitName name={country.name} />

            <hr style={{ border: "none", height: 1, background: RULE, margin: "22px 0 0", position: "relative" }} />
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 0, top: -1, width: 80, height: 1, background: TEAL, opacity: 0.45 }} />
            </div>

            {/* Meta strip */}
            <div className="hm-strip" style={{ display: "flex", alignItems: "center", borderBottom: `1px solid ${RULE}` }}>
              {[
                { label: country.flagEmoji + " " + country.language, sub: null },
                { label: country.currency, sub: "Currency" },
                { label: `${data.moveScore} / 10`, sub: "Move Score" },
                { label: `${data.visaDifficulty} / 5`, sub: "Visa difficulty" },
              ].map((item, i) => (
                <div key={i} style={{
                  fontFamily: MONO, fontSize: 8.5, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase",
                  padding: "14px 28px 14px 0", color: DIM, display: "flex", alignItems: "center", gap: 14,
                  ...(i > 0 ? { paddingLeft: 28, borderLeft: `1px solid ${RULE}` } : {}),
                }}>
                  {item.sub && <span style={{ color: DIMMER }}>{item.sub}</span>}
                  {item.label}
                </div>
              ))}
            </div>

            {/* Personalisation strip */}
            {wizardAnswers && (
              <div style={{ display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap", padding: "14px 0", borderBottom: `1px solid ${RULE}` }}>
                <span style={{ fontFamily: MONO, fontSize: 7.5, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: TEAL, display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
                  <span style={{ width: 4, height: 4, borderRadius: "50%", background: TEAL, animation: "breathe 2.2s ease-in-out infinite" }} />
                  Personalised
                  {matchPercent && <span style={{ color: INK, marginLeft: 6 }}>{matchPercent}% match</span>}
                </span>
                <span style={{ width: 1, height: 12, background: RULE, flexShrink: 0 }} />
                {userRole && userSalary && (
                  <span style={{ fontSize: 12, color: DIM }}>
                    {userRole.emoji} {userRole.label} salary here — <strong style={{ color: INK, fontWeight: 600 }}>{cs}{userSalary.toLocaleString()}/yr</strong>
                  </span>
                )}
                {wizardAnswers.rentBudget && wizardAnswers.rentBudget !== "any" && (
                  <>
                    <span style={{ width: 1, height: 12, background: RULE, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: rentFits ? "#4ade80" : "#facc15" }}>
                      {rentFits ? "✓" : "⚠"} Rent {rentFits ? "fits" : "above"} your budget — {cs}{data.costRentCityCentre.toLocaleString()}/mo city centre
                    </span>
                  </>
                )}
                {hasEnglishFlag && (
                  <>
                    <span style={{ width: 1, height: 12, background: RULE, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "#f87171", display: "flex", alignItems: "center", gap: 5 }}>
                      <AlertTriangle size={11} /> Not English-speaking — flagged as deal breaker
                    </span>
                  </>
                )}
                {hasHighTaxFlag && (
                  <>
                    <span style={{ width: 1, height: 12, background: RULE, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "#f87171", display: "flex", alignItems: "center", gap: 5 }}>
                      <AlertTriangle size={11} /> {data.incomeTaxRateMid}% tax — above your threshold
                    </span>
                  </>
                )}
                {matchReasons.length > 0 && matchReasons.map(r => (
                  <span key={r} style={{ fontFamily: MONO, fontSize: 7.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: TEAL, background: "rgba(77,230,204,0.07)", border: "1px solid rgba(77,230,204,0.18)", borderRadius: 3, padding: "4px 9px" }}>
                    {r}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* ── SCORES: naked large numbers ── */}
          <section className="fu d2" style={{ padding: "56px 0", borderTop: `1px solid ${RULE}` }}>
            <p style={{ fontFamily: MONO, fontSize: 7.5, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: DIMMER, marginBottom: 36 }}>Score breakdown</p>
            <div className="scores-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 0 }}>
              {scoreBreakdown.map((item, i) => (
                <div key={item.label} style={{
                  padding: "28px 0",
                  borderRight: (i + 1) % 3 === 0 ? "none" : `1px solid ${RULE}`,
                  borderBottom: i < 3 ? `1px solid ${RULE}` : "none",
                  paddingLeft: i % 3 !== 0 ? 28 : 0,
                  paddingRight: i % 3 !== 2 ? 28 : 0,
                }}>
                  <p style={{ fontFamily: SERIF, fontSize: 80, fontWeight: 400, lineHeight: 0.88, marginBottom: 10, color: SCORE_COLORS[i] }}>
                    {(Math.round(item.value * 10) / 10).toFixed(1)}
                  </p>
                  <p style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: DIMMER }}>{item.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── SALARY: dot plot ── */}
          <section className="fu d2" style={{ padding: "56px 0", borderTop: `1px solid ${RULE}` }}>
            <div className="salary-layout" style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 60, alignItems: "start" }}>
              <div style={{ position: "sticky", top: 68 }}>
                <p style={{ fontFamily: MONO, fontSize: 7.5, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: DIMMER, marginBottom: 0 }}>Salaries</p>
                <h2 style={{ fontFamily: SERIF, fontSize: 36, fontWeight: 400, fontStyle: "italic", color: INK, lineHeight: 1.06, margin: "14px 0 12px" }}>
                  Annual pay,<br />per role.
                </h2>
                <p style={{ fontSize: 12, color: DIM, lineHeight: 1.78 }}>
                  Gross annual averages.{userRole ? ` ${userRole.label} highlighted in teal.` : ""}
                </p>
                <p style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: DIMMER, marginTop: 16 }}>
                  Annual · {country.currency} · 2024
                </p>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 7.5, color: DIMMER, marginBottom: 10, letterSpacing: "0.08em" }}>
                  <span>{cs}{Math.round(minS / 1000)}k</span>
                  <span>{cs}{Math.round(maxS / 1000)}k</span>
                </div>
                <div>
                  {salaryData.map((s) => {
                    const isHighlighted = userRole
                      ? s.salary === userSalary
                      : s.role === "Software Eng.";
                    return (
                      <DotPlotRow
                        key={s.role}
                        role={s.role}
                        salary={s.salary}
                        minS={minS}
                        maxS={maxS}
                        color={s.color}
                        isHighlighted={isHighlighted}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* ── COST: column chart ── */}
          <section className="fu d3" style={{ padding: "56px 0", borderTop: `1px solid ${RULE}` }}>
            <p style={{ fontFamily: MONO, fontSize: 7.5, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: DIMMER, marginBottom: 36 }}>Cost of living</p>

            {/* bars */}
            <div className="cost-chart-grid" style={{ display: "grid", gridTemplateColumns: `repeat(${costItems.length},1fr)`, gap: 0, alignItems: "flex-end", height: 180 }}>
              {costItems.map((c) => {
                const barH = Math.max(4, Math.round((c.val / maxCost) * 160));
                return (
                  <div key={c.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: 7, height: "100%" }}>
                    <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: INK }}>{cs}{c.val.toLocaleString()}</span>
                    <div style={{ width: 28, height: barH, background: c.color, borderRadius: "2px 2px 0 0", opacity: 0.75, flexShrink: 0 }} />
                  </div>
                );
              })}
            </div>
            <hr style={{ border: "none", height: 1, background: RULE, margin: 0 }} />
            {/* labels */}
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${costItems.length},1fr)`, gap: 0 }}>
              {costItems.map((c) => (
                <div key={c.label} style={{ fontFamily: MONO, fontSize: 7.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: DIMMER, textAlign: "center", lineHeight: 1.55, paddingTop: 10 }}>
                  {c.label.split("\n").map((line, i) => <span key={i}>{line}{i < c.label.split("\n").length - 1 ? <br /> : null}</span>)}
                </div>
              ))}
            </div>

            {/* total */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 16, paddingTop: 28, marginTop: 28, borderTop: `1px solid ${RULE}` }}>
              <span style={{ fontFamily: MONO, fontSize: 8.5, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: DIMMER }}>Est. monthly total</span>
              <span style={{ fontFamily: SERIF, fontSize: 52, fontWeight: 400, color: rentWarning ? "#facc15" : TEAL, lineHeight: 1 }}>{cs}{totalMonthlyCost.toLocaleString()}</span>
              <span style={{ fontFamily: MONO, fontSize: 10, color: DIMMER }}>/ month · city centre</span>
            </div>
          </section>

          {/* ── QUALITY: four large numbers ── */}
          <section className="fu d3" style={{ padding: "56px 0", borderTop: `1px solid ${RULE}` }}>
            <p style={{ fontFamily: MONO, fontSize: 7.5, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: DIMMER, marginBottom: 36 }}>Quality scores</p>
            <div className="quality-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0 }}>
              {[
                { label: "Quality of Life", value: data.scoreQualityOfLife, color: QUALITY_COLORS[0] },
                { label: "Healthcare",      value: data.scoreHealthcare,    color: QUALITY_COLORS[1] },
                { label: "Safety",          value: data.scoreSafety,        color: QUALITY_COLORS[2] },
                { label: "Internet Speed",  value: data.scoreInternetSpeed, color: QUALITY_COLORS[3] },
              ].map((item, i) => (
                <div key={item.label} style={{
                  padding: "24px 28px 24px 0",
                  borderRight: i < 3 ? `1px solid ${RULE}` : "none",
                  paddingLeft: i > 0 ? 28 : 0,
                }}>
                  <p style={{ fontFamily: SERIF, fontSize: 60, fontWeight: 400, lineHeight: 0.9, marginBottom: 8, color: item.color }}>{item.value}</p>
                  <p style={{ fontFamily: MONO, fontSize: 7.5, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: DIMMER }}>{item.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── VISA ── */}
          <section className="fu d3" style={{ padding: "56px 0", borderTop: `1px solid ${RULE}` }}>
            <p style={{ fontFamily: MONO, fontSize: 7.5, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: DIMMER, marginBottom: 36 }}>Visa & immigration</p>
            <div className="visa-grid" style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: 72, alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 14 }}>
                  <span style={{ fontFamily: SERIF, fontSize: 38, fontWeight: 400, color: INK }}>{getVisaDifficultyLabel(data.visaDifficulty)}</span>
                  <span style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: visaBadgeColor, background: `${visaBadgeColor}12`, border: `1px solid ${visaBadgeColor}33`, borderRadius: 100, padding: "4px 12px" }}>
                    Difficulty {data.visaDifficulty}/5
                  </span>
                </div>
                {/* segments */}
                <div style={{ display: "flex", gap: 4, marginBottom: 18 }}>
                  {visaSegs.map((on, i) => (
                    <div key={i} style={{ height: 2, width: 32, borderRadius: 100, background: on ? visaBadgeColor : RULE }} />
                  ))}
                </div>
                <p style={{ fontSize: 13, color: DIM, lineHeight: 1.86, marginBottom: 18 }}>{data.visaNotes}</p>
                {data.visaPopularRoutes?.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 18 }}>
                    {data.visaPopularRoutes.map((route) => (
                      <span key={route} style={{ fontFamily: MONO, fontSize: 7.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: TEAL, background: "rgba(77,230,204,0.07)", border: "1px solid rgba(77,230,204,0.18)", borderRadius: 3, padding: "4px 9px" }}>
                        {route}
                      </span>
                    ))}
                  </div>
                )}
                <a href={data.visaOfficialUrl} target="_blank" rel="noopener noreferrer" style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: DIMMER, textDecoration: "none", transition: "color 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = DIM)}
                  onMouseLeave={e => (e.currentTarget.style.color = DIMMER)}>
                  Official immigration website ↗
                </a>
              </div>

              {/* Passport stamp */}
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <div style={{ width: 174, height: 174, borderRadius: "50%", border: `2px solid ${visaBadgeColor}40`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  <div style={{ position: "absolute", inset: 7, borderRadius: "50%", border: `1px dashed ${visaBadgeColor}20` }} />
                  <p style={{ fontFamily: MONO, fontSize: 7, fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", color: visaBadgeColor, opacity: 0.55, marginBottom: 2 }}>{country.name}</p>
                  <p style={{ fontFamily: SERIF, fontSize: 64, fontWeight: 400, color: visaBadgeColor, lineHeight: 0.9 }}>{data.visaDifficulty}</p>
                  <p style={{ fontFamily: MONO, fontSize: 11, color: `${visaBadgeColor}72` }}>/5</p>
                  <p style={{ fontFamily: MONO, fontSize: 7, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: visaBadgeColor, opacity: 0.45, marginTop: 2 }}>Difficulty</p>
                </div>
              </div>
            </div>
          </section>

          {/* ── TAX ── */}
          <section className="fu d4" style={{ padding: "56px 0", borderTop: `1px solid ${RULE}` }}>
            <p style={{ fontFamily: MONO, fontSize: 7.5, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: DIMMER, marginBottom: 36 }}>Tax summary</p>
            <div className="tax-pair" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
              {[
                { label: "Income tax — mid bracket", value: data.incomeTaxRateMid, warn: hasHighTaxFlag },
                { label: "Social security",          value: data.socialSecurityRate, warn: false },
              ].map((item, i) => (
                <div key={item.label} style={{ padding: i === 0 ? "0 48px 0 0" : "0 0 0 48px", borderLeft: i === 1 ? `1px solid ${RULE}` : "none" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontFamily: SERIF, fontSize: 104, fontWeight: 400, lineHeight: 0.84, letterSpacing: "-0.03em", color: item.warn ? "#f87171" : INK }}>{item.value}</span>
                    <span style={{ fontFamily: MONO, fontSize: 30, color: DIMMER }}>%</span>
                  </div>
                  <p style={{ fontFamily: MONO, fontSize: 8.5, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: DIM, marginTop: 12 }}>{item.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── EXPLORE ── */}
          {otherCountries.length > 0 && (
            <section className="fu d4" style={{ padding: "56px 0", borderTop: `1px solid ${RULE}` }}>
              <p style={{ fontFamily: MONO, fontSize: 7.5, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: DIMMER, marginBottom: 36 }}>Explore more countries</p>
              <div className="explore-grid" style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 10 }}>
                {otherCountries.slice(0, 6).map(c => (
                  <a key={c.slug} href={`/country/${c.slug}`} style={{
                    padding: "16px 12px", border: `1px solid ${RULE}`, borderRadius: 8,
                    background: "rgba(240,240,237,0.018)", textDecoration: "none",
                    transition: "border-color 0.15s, background 0.15s", display: "block",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(240,240,237,0.11)"; e.currentTarget.style.background = "rgba(240,240,237,0.036)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = RULE; e.currentTarget.style.background = "rgba(240,240,237,0.018)"; }}>
                    <span style={{ fontSize: 20, display: "block", marginBottom: 8 }}>{c.flagEmoji}</span>
                    <p style={{ fontSize: 11, fontWeight: 700, color: INK, marginBottom: 3 }}>{c.name}</p>
                    <p style={{ fontFamily: MONO, fontSize: 8.5, color: DIMMER }}>{c.data.moveScore}/10</p>
                  </a>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: `1px solid ${RULE}`, padding: "22px 36px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 7, textDecoration: "none" }}>
            <div style={{ width: 13, height: 13, background: INK, borderRadius: 2, display: "grid", placeItems: "center" }}>
              <span style={{ width: 5, height: 5, background: BG, borderRadius: 1, display: "block" }} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.16em", color: INK, textTransform: "uppercase" }}>Origio</span>
          </Link>
          <p style={{ fontFamily: MONO, fontSize: 8, color: DIMMER, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Data last verified · {data.lastVerified}
          </p>
        </div>
      </footer>
    </div>
  );
}