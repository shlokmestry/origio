"use client";

import Link from "next/link";

import { useRef, useState, useEffect } from "react";
import {
  DollarSign, Home, Shield, Wifi, Heart, Plane,
  TrendingUp, Receipt, ExternalLink, ArrowLeft,
  Languages, Banknote, FileText, Loader2, Sparkles, AlertTriangle,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import generatePDF, { Margin } from "react-to-pdf";
import { CountryWithData, JOB_ROLES } from "@/types";
import { getScoreColor, getScoreBreakdown, getVisaLabel, getVisaColor } from "@/lib/utils";
import SaveCountryButton from "@/components/SaveCountryButton";
import { supabase } from "@/lib/supabase";
import { WizardAnswers } from "@/lib/wizard";

function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: "$", EUR: "€", GBP: "£", AUD: "A$", CAD: "C$",
    NZD: "NZ$", CHF: "CHF ", SGD: "S$", AED: "AED ", NOK: "kr ", SEK: "kr ",
    JPY: "¥", INR: "₹", BRL: "R$", MYR: "RM ", DKK: "kr ",
  };
  return symbols[currency] ?? currency + " ";
}

interface Props {
  country: CountryWithData;
  otherCountries: CountryWithData[];
}

const SCORE_ICONS: Record<string, any> = {
  Salary: DollarSign,
  Affordability: Home,
  "Quality of Life": Heart,
  Safety: Shield,
  "Visa Access": Plane,
  "Tax Efficiency": Receipt,
};

// Rent budget upper limits in USD for comparison
const RENT_BUDGET_USD: Record<string, number> = {
  under800: 800,
  "800to1500": 1500,
  "1500to2500": 2500,
  any: 99999,
};

const TO_USD: Record<string, number> = {
  USD: 1, EUR: 1.08, GBP: 1.27, AUD: 0.65, CAD: 0.74,
  NZD: 0.61, CHF: 1.13, SGD: 0.74, AED: 0.27,
  NOK: 0.093, SEK: 0.096, DKK: 0.145, JPY: 0.0067,
  INR: 0.012, BRL: 0.20, MYR: 0.22,
};

export default function CountryPageClient({ country, otherCountries }: Props) {
  const { data } = country;
  const scoreBreakdown = getScoreBreakdown(data);
  const moveScoreColor = getScoreColor(data.moveScore);
  const currencySymbol = getCurrencySymbol(country.currency);
  const visaColor = getVisaColor(data.visaDifficulty);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // ── Personalisation state ──────────────────────────────────────────────────
  const [wizardAnswers, setWizardAnswers] = useState<Partial<WizardAnswers> | null>(null);
  const [matchPercent, setMatchPercent] = useState<number | null>(null);
  const [matchReasons, setMatchReasons] = useState<string[]>([]);

  useEffect(() => {
    async function loadPersonalisation() {
      // 1. sessionStorage first (works for everyone, fresh from wizard)
      let answers: Partial<WizardAnswers> | null = null;
      const raw = sessionStorage.getItem("wizardAnswers");
      if (raw) answers = JSON.parse(raw);

      // 2. Supabase override for logged-in users (more persistent)
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: result } = await supabase
          .from("wizard_results")
          .select("answers, top_countries")
          .eq("user_id", session.user.id)
          .maybeSingle();
        if (result?.answers) answers = result.answers;

        // Pull match % for this specific country from saved top_countries
        if (result?.top_countries) {
          const match = (result.top_countries as any[]).find(
            (c: any) => c.slug === country.slug
          );
          if (match) {
            setMatchPercent(match.matchPercent);
            setMatchReasons(match.reasons ?? []);
          }
        }
      }

      // Also try to get match reasons from sessionStorage matches
      if (!matchPercent) {
        const matchesRaw = sessionStorage.getItem("wizardMatches");
        if (matchesRaw) {
          const matches = JSON.parse(matchesRaw);
          const m = matches.find((m: any) => m.country.slug === country.slug);
          if (m) {
            setMatchPercent(m.matchPercent);
            setMatchReasons(m.reasons ?? []);
          }
        }
      }

      setWizardAnswers(answers);
    }
    loadPersonalisation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country.slug]);

  // Derived personalisation values
  const userRole = wizardAnswers?.jobRole
    ? JOB_ROLES.find((r) => r.key === wizardAnswers.jobRole)
    : null;
  const userSalary = userRole
    ? (data[userRole.salaryKey] as number)
    : null;

  const rentUSD = data.costRentCityCentre * (TO_USD[country.currency] ?? 1);
  const maxRentUSD = RENT_BUDGET_USD[wizardAnswers?.rentBudget ?? "any"] ?? 99999;
  const rentFits = rentUSD <= maxRentUSD;
  const rentWarning = wizardAnswers?.rentBudget && wizardAnswers.rentBudget !== "any" && !rentFits;

  const dealBreakers = wizardAnswers?.dealBreakers ?? [];
  const hasEnglishFlag = dealBreakers.includes("english") &&
    !["ireland", "united-kingdom", "australia", "new-zealand", "canada", "usa", "singapore"].includes(country.slug);
  const hasHighTaxFlag = dealBreakers.includes("lowtax") && data.incomeTaxRateMid > 30;

  // ── Salary data ───────────────────────────────────────────────────────────
  const salaryData = [
    { role: "Software Eng.", salary: data.salarySoftwareEngineer, color: "#00ffd5" },
    { role: "Doctor", salary: data.salaryDoctor, color: "#4ade80" },
    { role: "Nurse", salary: data.salaryNurse, color: "#60a5fa" },
    { role: "Data Scientist", salary: data.salaryDataScientist, color: "#a78bfa" },
    { role: "Product Mgr.", salary: data.salaryProductManager, color: "#f472b6" },
    { role: "DevOps", salary: data.salaryDevOps, color: "#fb923c" },
    { role: "Cybersecurity", salary: data.salaryCybersecurity, color: "#facc15" },
    { role: "UX Designer", salary: data.salaryUXDesigner, color: "#34d399" },
    { role: "Fin. Analyst", salary: data.salaryFinancialAnalyst, color: "#818cf8" },
    { role: "Lawyer", salary: data.salaryLawyer, color: "#f87171" },
    { role: "Architect", salary: data.salaryArchitect, color: "#38bdf8" },
    { role: "Civil Eng.", salary: data.salaryCivilEngineer, color: "#a3e635" },
    { role: "Pharmacist", salary: data.salaryPharmacist, color: "#e879f9" },
    { role: "Teacher", salary: data.salaryTeacher, color: "#2dd4bf" },
    { role: "Accountant", salary: data.salaryAccountant, color: "#fbbf24" },
    { role: "HR Manager", salary: data.salaryHRManager, color: "#f472b6" },
    { role: "Sales Mgr.", salary: data.salarySalesManager, color: "#60a5fa" },
    { role: "Marketing Mgr.", salary: data.salaryMarketingManager, color: "#c084fc" },
    { role: "Electrician", salary: data.salaryElectrician, color: "#86efac" },
    { role: "Chef", salary: data.salaryChef, color: "#fda4af" },
  ].filter((s) => s.salary > 0);

  const costItems = [
    { label: "Rent (city centre)", value: data.costRentCityCentre },
    { label: "Groceries", value: data.costGroceriesMonthly },
    { label: "Transport", value: data.costTransportMonthly },
    { label: "Dining out", value: data.costEatingOut },
    { label: "Utilities", value: data.costUtilitiesMonthly },
    { label: "Rent (outside)", value: data.costRentOutside },
  ];

  const totalMonthlyCost =
    data.costRentCityCentre +
    data.costGroceriesMonthly +
    data.costTransportMonthly +
    data.costEatingOut +
    data.costUtilitiesMonthly;

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
    <div className="min-h-screen bg-[#0a0a0a] text-text-primary">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0a] border-b-2 border-[#2a2a2a]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-3.5 h-3.5 bg-accent border-2 border-text-primary flex-shrink-0" />
            <span className="font-heading text-base font-extrabold uppercase tracking-tight">Origio</span>
          </Link>
          <div className="flex items-center gap-3">
            <SaveCountryButton countrySlug={country.slug} />
            <button
              onClick={handleGetReport}
              disabled={generatingPDF}
              className="ghost-button px-4 py-2 text-xs font-bold uppercase tracking-wide flex items-center gap-2"
            >
              {generatingPDF ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
              {generatingPDF ? "Generating..." : "Download PDF"}
            </button>
          </div>
        </div>
      </nav>

      <div ref={reportRef}>
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">

          {/* ── Personalisation banner ────────────────────────────────────── */}
          {wizardAnswers && (
            <section className="border-2 border-accent p-5 space-y-3" style={{ boxShadow: "4px 4px 0 #00ffd5" }}>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-accent" />
                <p className="text-xs font-bold text-accent uppercase tracking-widest">Personalised for you</p>
                {matchPercent && (
                  <span className="ml-auto font-heading text-lg font-extrabold text-accent">{matchPercent}% match</span>
                )}
              </div>

              {/* Role salary highlight */}
              {userRole && userSalary && (
                <div className="flex items-center justify-between border border-[#2a2a2a] px-4 py-3">
                  <span className="text-sm font-bold text-text-muted">
                    {userRole.emoji} {userRole.label} salary here
                  </span>
                  <span className="font-heading text-xl font-extrabold text-text-primary">
                    {currencySymbol}{userSalary.toLocaleString()}/yr
                  </span>
                </div>
              )}

              {/* Rent fit */}
              {wizardAnswers.rentBudget && wizardAnswers.rentBudget !== "any" && (
                <div className={`flex items-center gap-3 px-4 py-3 border ${rentFits ? "border-green-500/30 text-green-400" : "border-yellow-500/30 text-yellow-400"}`}>
                  {rentFits
                    ? <span className="text-xs font-bold">✓ Rent fits your budget ({currencySymbol}{data.costRentCityCentre.toLocaleString()}/mo city centre)</span>
                    : <span className="text-xs font-bold">⚠ Rent above your budget ({currencySymbol}{data.costRentCityCentre.toLocaleString()}/mo city centre)</span>
                  }
                </div>
              )}

              {/* Deal breaker flags */}
              {hasEnglishFlag && (
                <div className="flex items-center gap-2 px-4 py-3 border border-red-500/30 text-red-400">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="text-xs font-bold">Primary language is not English — you flagged this as a deal breaker</span>
                </div>
              )}
              {hasHighTaxFlag && (
                <div className="flex items-center gap-2 px-4 py-3 border border-red-500/30 text-red-400">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="text-xs font-bold">Income tax {data.incomeTaxRateMid}% — above 30% threshold you flagged</span>
                </div>
              )}

              {/* Match reasons */}
              {matchReasons.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {matchReasons.map((r) => (
                    <span key={r} className="text-[10px] font-bold px-2 py-1 border border-accent/40 text-accent uppercase tracking-wide">
                      {r}
                    </span>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ── Header ───────────────────────────────────────────────────── */}
          <section className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 border-b-2 border-[#2a2a2a] pb-10">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <span className="text-6xl">{country.flagEmoji}</span>
                <div>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-widest">{country.continent}</p>
                  <h1 className="font-heading text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-text-primary">
                    {country.name}
                  </h1>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs font-bold px-2 py-1 border-2 border-[#2a2a2a] text-text-muted flex items-center gap-1">
                  <Languages className="w-3 h-3" /> {country.language}
                </span>
                <span className="text-xs font-bold px-2 py-1 border-2 border-[#2a2a2a] text-text-muted flex items-center gap-1">
                  <Banknote className="w-3 h-3" /> {country.currency}
                </span>
                <a href={data.visaOfficialUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs font-bold px-2 py-1 border-2 border-[#2a2a2a] text-text-muted hover:border-accent hover:text-accent transition-colors flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> Official Visa Site
                </a>
              </div>
            </div>

            {/* Move score */}
            <div className="border-2 p-6 text-center flex-shrink-0 w-36" style={{ borderColor: moveScoreColor, boxShadow: `4px 4px 0 ${moveScoreColor}` }}>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Move Score</p>
              <p className="font-heading text-5xl font-extrabold" style={{ color: moveScoreColor }}>{data.moveScore}</p>
              <p className="text-xs text-text-muted font-bold mt-1">/ 10</p>
            </div>
          </section>

          {/* ── Score breakdown ───────────────────────────────────────────── */}
          <section>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4 border-l-2 border-accent pl-3">Score breakdown</p>
            <div className="border-2 border-[#2a2a2a]">
              {scoreBreakdown.map((item, i) => {
                const Icon = SCORE_ICONS[item.label] ?? TrendingUp;
                return (
                  <div key={item.label} className={`flex items-center justify-between px-5 py-4 ${i < scoreBreakdown.length - 1 ? "border-b-2 border-[#1a1a1a]" : ""}`}>
                    <div className="flex items-center gap-3">
                      <Icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                      <span className="text-xs font-bold text-text-muted uppercase tracking-wide">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-28 h-1.5 bg-[#1a1a1a]">
                        <div className="h-full transition-all" style={{ width: `${(item.value / item.maxValue) * 100}%`, background: item.color }} />
                      </div>
                      <span className="text-sm font-bold w-8 text-right" style={{ color: item.color }}>
                        {Math.round(item.value * 10) / 10}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── Salary chart ──────────────────────────────────────────────── */}
          <section>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 border-l-2 border-accent pl-3">Average salaries</p>
            <p className="text-xs text-text-muted font-medium mb-4 pl-5">
              Annual · {country.currency}
              {userRole && <span className="text-accent ml-2">· Your role: {userRole.label} highlighted</span>}
            </p>
            <div className="border-2 border-[#2a2a2a] p-4">
              <div className="w-full h-96 min-h-[384px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salaryData} margin={{ top: 5, right: 5, left: -10, bottom: 60 }}>
                    <XAxis dataKey="role" tick={{ fill: "#666660", fontSize: 10, fontWeight: 700 }}
                      axisLine={{ stroke: "#2a2a2a" }} tickLine={false} angle={-45} textAnchor="end" interval={0} />
                    <YAxis tick={{ fill: "#666660", fontSize: 11, fontWeight: 700 }} axisLine={false}
                      tickLine={false} tickFormatter={(v) => Math.round(v / 1000) + "k"} />
                    <Tooltip cursor={{ fill: "rgba(255,255,255,0.03)" }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-[#111111] border-2 border-[#f0f0e8] px-3 py-2" style={{ boxShadow: "3px 3px 0 #f0f0e8" }}>
                              <p className="text-xs font-bold text-text-primary uppercase">{payload[0].payload.role}</p>
                              <p className="text-sm font-extrabold text-accent">{currencySymbol + Number(payload[0].value).toLocaleString() + "/yr"}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="salary" maxBarSize={28} radius={[0, 0, 0, 0]}>
                      {salaryData.map((entry, i) => {
                        // Highlight user's role bar
                        const isUserRole = userRole && entry.role === salaryData.find(
                          (s) => s.salary === userSalary
                        )?.role;
                        return (
                          <Cell
                            key={i}
                            fill={entry.color}
                            opacity={userRole ? (isUserRole ? 1 : 0.35) : 0.9}
                            strokeWidth={isUserRole ? 2 : 0}
                            stroke={isUserRole ? "#fff" : "none"}
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* ── Cost of living ────────────────────────────────────────────── */}
          <section>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4 border-l-2 border-accent pl-3">Cost of living</p>
            <div className="border-2 border-[#2a2a2a] mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {costItems.map((item, i) => (
                  <div key={item.label} className={`flex items-center justify-between p-4 bg-[#111111] border-[#2a2a2a] ${i % 3 !== 2 ? "sm:border-r-2" : ""} ${i < 3 ? "border-b-2" : ""}`}>
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wide">{item.label}</span>
                    <span className="font-heading font-extrabold text-text-primary">{currencySymbol + item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={`border-2 p-4 flex items-center justify-between ${rentWarning ? "border-yellow-500" : "border-accent"}`}
              style={{ boxShadow: rentWarning ? "4px 4px 0 #eab308" : "4px 4px 0 #00ffd5" }}>
              <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Est. monthly total (city centre)</span>
              <span className={`font-heading text-2xl font-extrabold ${rentWarning ? "text-yellow-400" : "text-accent"}`}>
                {currencySymbol + totalMonthlyCost.toLocaleString()}
              </span>
            </div>
          </section>

          {/* ── Quality scores ────────────────────────────────────────────── */}
          <section>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4 border-l-2 border-accent pl-3">Quality scores</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border-2 border-[#2a2a2a]">
              {[
                { icon: Heart, label: "Quality of Life", value: data.scoreQualityOfLife + "/10", color: "#a78bfa" },
                { icon: TrendingUp, label: "Healthcare", value: data.scoreHealthcare + "/10", color: "#4ade80" },
                { icon: Shield, label: "Safety", value: data.scoreSafety + "/10", color: "#60a5fa" },
                { icon: Wifi, label: "Internet Speed", value: data.scoreInternetSpeed + "/10", color: "#facc15" },
              ].map((item, i) => (
                <div key={item.label} className={`p-5 bg-[#111111] ${i < 3 ? "border-r-2 border-[#2a2a2a]" : ""}`}>
                  <item.icon className="w-4 h-4 mb-2" style={{ color: item.color }} />
                  <p className="font-heading text-2xl font-extrabold" style={{ color: item.color }}>{item.value}</p>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wide mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Visa ─────────────────────────────────────────────────────── */}
          <section>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4 border-l-2 border-accent pl-3">Visa & immigration</p>
            <div className="border-2 border-[#2a2a2a] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-heading text-xl font-extrabold text-text-primary uppercase">{getVisaLabel(data.visaDifficulty)}</p>
                <span className="text-xs font-bold px-3 py-1 border-2 uppercase" style={{ borderColor: visaColor, color: visaColor }}>
                  Difficulty {data.visaDifficulty}/5
                </span>
              </div>
              <p className="text-sm text-text-muted leading-relaxed">{data.visaNotes}</p>
              {data.visaPopularRoutes?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {data.visaPopularRoutes.map((route) => (
                    <span key={route} className="text-[10px] font-bold px-2 py-1 border-2 border-accent text-accent uppercase">{route}</span>
                  ))}
                </div>
              )}
              <a href={data.visaOfficialUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-text-muted hover:text-accent transition-colors uppercase tracking-wide">
                Official immigration website <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </section>

          {/* ── Tax summary ───────────────────────────────────────────────── */}
          <section>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4 border-l-2 border-accent pl-3">Tax summary</p>
            <div className="grid grid-cols-2 gap-0 border-2 border-[#2a2a2a]">
              <div className="p-5 border-r-2 border-[#2a2a2a] bg-[#111111]">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wide mb-1">Income Tax (mid)</p>
                <p className={`font-heading text-3xl font-extrabold ${hasHighTaxFlag ? "text-red-400" : "text-text-primary"}`}>
                  {data.incomeTaxRateMid}%
                </p>
              </div>
              <div className="p-5 bg-[#111111]">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wide mb-1">Social Security</p>
                <p className="font-heading text-3xl font-extrabold text-text-primary">{data.socialSecurityRate}%</p>
              </div>
            </div>
          </section>

          {/* ── Explore more ─────────────────────────────────────────────── */}
          {otherCountries.length > 0 && (
            <section>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4 border-l-2 border-accent pl-3">Explore more countries</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-0 border-2 border-[#2a2a2a]">
                {otherCountries.slice(0, 6).map((c, i) => (
                  <a key={c.slug} href={"/country/" + c.slug}
                    className={`flex items-center gap-2 p-4 bg-[#111111] hover:bg-[#1a1a1a] transition-colors border-[#2a2a2a] ${i % 6 !== 5 ? "border-r-2" : ""}`}>
                    <span className="text-xl">{c.flagEmoji}</span>
                    <div>
                      <p className="text-xs font-bold text-text-primary uppercase tracking-tight">{c.name}</p>
                      <p className="text-[10px] font-bold text-text-muted">{c.data.moveScore}/10</p>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

        </main>
      </div>

      {/* Footer */}
      <footer className="border-t-2 border-[#2a2a2a]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-accent border-2 border-text-primary" />
            <span className="font-heading text-sm font-extrabold uppercase tracking-tight">Origio</span>
          </div>
          <p className="text-xs font-bold text-text-muted uppercase tracking-wide">
            Data last verified · {country.data.lastVerified}
          </p>
        </div>
      </footer>
    </div>
  );
}