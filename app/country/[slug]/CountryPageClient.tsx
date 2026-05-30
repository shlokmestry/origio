"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  DollarSign, Home, Heart, Shield, Plane, Receipt,
  Languages, Banknote, Sparkles, AlertTriangle,
  TrendingUp, Wifi, ExternalLink, Loader2,
} from "lucide-react";
import generatePDF, { Margin } from "react-to-pdf";
import { CountryWithData, GlobeCountry, JOB_ROLES } from "@/types";
import {
  getScoreColor, getScoreBreakdown, getVisaLabel,
  getVisaColor,
} from "@/lib/utils";
import SaveCountryButton from "@/components/SaveCountryButton";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import {
  WizardAnswers, getPassportStrength,
  resolveEffectivePassports,
} from "@/lib/wizard";

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:      "#0a0a0a",
  surface: "#111111",
  elevated:"#1a1a1a",
  accent:  "#00ffd5",
  primary: "#f0f0e8",
  muted:   "#666660",
  border:  "#2a2a2a",
  dim:     "#1a1a1a",
};
const HEAD = "'Cabinet Grotesk', sans-serif";
const BODY = "'Satoshi', sans-serif";

// ── Helpers ───────────────────────────────────────────────────────────────────
function getCurrencySymbol(currency: string): string {
  const m: Record<string, string> = {
    USD:"$",EUR:"€",GBP:"£",AUD:"A$",CAD:"C$",NZD:"NZ$",
    CHF:"CHF ",SGD:"S$",AED:"AED ",NOK:"kr ",SEK:"kr ",
    DKK:"kr ",JPY:"¥",INR:"₹",BRL:"R$",MYR:"RM ",
  };
  return m[currency] ?? currency + " ";
}

const TO_USD: Record<string, number> = {
  USD:1,EUR:1.08,GBP:1.27,AUD:0.65,CAD:0.74,
  NZD:0.61,CHF:1.13,SGD:0.74,AED:0.27,
  NOK:0.093,SEK:0.096,DKK:0.145,JPY:0.0067,
  INR:0.012,BRL:0.20,MYR:0.22,
};

const RENT_BUDGET_USD: Record<string, number> = {
  under800:800,"800to1500":1500,"1500to2500":2500,any:99999,
};

type IconComp = (props: { size: number; color?: string; style?: React.CSSProperties }) => JSX.Element;
const SCORE_ICON: Record<string, IconComp> = {
  "Salary": DollarSign,
  "Affordability": Home,
  "Quality of Life": Heart,
  "Safety": Shield,
  "Visa Access": Plane,
  "Tax Efficiency": Receipt,
};

const TESTIMONIALS = [
  { quote: "Origio's visa checklist saved me 3 weeks of research. Moved to Portugal in 2024.", name: "L.H.", role: "Software Engineer" },
  { quote: "Finally a tool that shows real take-home, not just headline salary. Changed my whole decision.", name: "M.K.", role: "Product Manager" },
  { quote: "Compared 6 countries in an afternoon. Ended up in Singapore — best decision I made.", name: "A.R.", role: "Marketing Director" },
];

// ── Sub-components ────────────────────────────────────────────────────────────
function Label({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p style={{
      fontFamily: BODY, fontSize: 10, fontWeight: 700,
      textTransform: "uppercase", letterSpacing: "0.16em",
      color: C.muted, borderLeft: `2px solid ${C.accent}`,
      paddingLeft: 10, margin: 0, lineHeight: 1, ...style,
    }}>{children}</p>
  );
}

function Pill({ children, color, style }: { children: React.ReactNode; color?: string; style?: React.CSSProperties }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontFamily: BODY, fontSize: 10, fontWeight: 700,
      textTransform: "uppercase", letterSpacing: "0.07em",
      padding: "4px 10px", borderRadius: 9999,
      border: `1px solid ${color ?? C.border}`,
      color: color ?? C.muted,
      whiteSpace: "nowrap", ...style,
    }}>{children}</span>
  );
}

// ── Personalisation banner ────────────────────────────────────────────────────
function PersonalisationBanner({
  matchPercent, matchReasons, passportContext,
  userRole, userSalary, currencySymbol,
  rentFits, rentWarning, hasEnglishFlag, hasHighTaxFlag,
  rentMonthly,
}: {
  matchPercent: number | null;
  matchReasons: string[];
  passportContext: { tier: 1|2|3|4; isEU: boolean; upgraded: boolean } | null;
  userRole: typeof JOB_ROLES[number] | null;
  userSalary: number | null;
  currencySymbol: string;
  rentFits: boolean;
  rentWarning: boolean | null | undefined;
  hasEnglishFlag: boolean;
  hasHighTaxFlag: boolean;
  rentMonthly: number;
}) {
  const hasAny = matchPercent != null || userRole || matchReasons.length > 0;
  if (!hasAny) return null;
  return (
    <section style={{
      background: "rgba(0,255,213,0.03)",
      border: `1px solid ${C.accent}`,
      boxShadow: `4px 4px 0 ${C.accent}`,
      padding: "20px 24px",
      display: "flex", flexDirection: "column", gap: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Sparkles size={13} color={C.accent} />
        <span style={{ fontFamily: BODY, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: C.accent }}>Personalised for you</span>
        {matchPercent != null && (
          <span style={{ marginLeft: "auto", fontFamily: HEAD, fontSize: 22, fontWeight: 800, color: C.accent, letterSpacing: "-0.02em" }}>{matchPercent}% match</span>
        )}
      </div>

      {userRole && userSalary != null && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(0,255,213,0.15)", paddingTop: 12 }}>
          <span style={{ fontFamily: BODY, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(0,255,213,0.6)" }}>
            {userRole.label} salary here
          </span>
          <span style={{ fontFamily: HEAD, fontSize: 22, fontWeight: 800, color: C.primary, letterSpacing: "-0.02em" }}>
            {currencySymbol}{userSalary.toLocaleString()}/yr
          </span>
        </div>
      )}

      {rentWarning != null && (
        <div style={{ fontFamily: BODY, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: rentFits ? "#4ade80" : "#f5c518" }}>
          {rentFits ? "✓" : "⚠"} Rent {rentFits ? "fits" : "above"} your budget · {currencySymbol}{rentMonthly.toLocaleString()}/mo city centre
        </div>
      )}

      {hasEnglishFlag && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#ff6b35", fontFamily: BODY, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          <AlertTriangle size={12} /> Primary language is not English — flagged as deal breaker
        </div>
      )}
      {hasHighTaxFlag && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#ff6b35", fontFamily: BODY, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          <AlertTriangle size={12} /> High income tax — above 30% threshold you flagged
        </div>
      )}

      {(matchReasons.length > 0 || passportContext) && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, borderTop: "1px solid rgba(0,255,213,0.15)", paddingTop: 12 }}>
          {matchReasons.map(r => <Pill key={r} color={C.accent} style={{ borderColor: "rgba(0,255,213,0.35)" }}>{r}</Pill>)}
          {passportContext && <Pill color={C.accent} style={{ borderColor: "rgba(0,255,213,0.35)" }}>Tier {passportContext.tier} passport</Pill>}
          {passportContext?.isEU && <Pill color="rgba(0,255,213,0.6)" style={{ borderColor: "rgba(0,255,213,0.2)" }}>EU free movement</Pill>}
          {passportContext?.upgraded && <Pill color="#f5c518" style={{ borderColor: "rgba(245,197,24,0.35)" }}>↑ Upgraded via 2nd passport</Pill>}
        </div>
      )}
    </section>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero({ country, data, currencySymbol, moveScoreColor, isPro, onGetReport, generatingPDF }: {
  country: CountryWithData;
  data: CountryWithData["data"];
  currencySymbol: string;
  moveScoreColor: string;
  isPro: boolean;
  onGetReport: () => void;
  generatingPDF: boolean;
}) {
  return (
    <section style={{ position: "relative", overflow: "hidden", paddingBottom: 60, borderBottom: `1px solid ${C.border}` }}>
      {/* Country name watermark */}
      <span aria-hidden="true" style={{
        position: "absolute", top: -10, left: -8, zIndex: 0,
        fontFamily: HEAD, fontSize: "clamp(140px, 18vw, 220px)", fontWeight: 800,
        textTransform: "uppercase", letterSpacing: "-0.05em",
        color: C.primary, opacity: 0.028, lineHeight: 1,
        pointerEvents: "none", userSelect: "none", whiteSpace: "nowrap",
      }}>{country.name}</span>

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Top row: continent label + actions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <p style={{ fontFamily: BODY, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: C.muted, margin: 0 }}>{country.continent}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <SaveCountryButton countrySlug={country.slug} />
            <button
              onClick={onGetReport}
              disabled={generatingPDF}
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                fontFamily: BODY, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
                padding: "7px 14px", cursor: generatingPDF ? "wait" : "pointer", background: "transparent",
                border: `2px solid ${C.border}`, color: C.muted, transition: "color 120ms, border-color 120ms",
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.accent; }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}
            >
              {generatingPDF ? <Loader2 size={11} className="animate-spin" /> : null}
              {generatingPDF ? "Generating…" : "Get Report →"}
            </button>
          </div>
        </div>

        {/* Main hero row */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 48, flexWrap: "wrap" }}>
          {/* Left: flag + name + pills */}
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "nowrap" }}>
              <span style={{ fontSize: 80, lineHeight: 1, flexShrink: 0 }}>{country.flagEmoji}</span>
              <h1 style={{
                fontFamily: HEAD, fontWeight: 800, fontSize: "clamp(64px, 8.5vw, 104px)",
                lineHeight: 0.86, letterSpacing: "-0.04em", textTransform: "uppercase",
                color: C.primary, margin: 0, minWidth: 0,
              }}>{country.name}</h1>
            </div>
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10, marginTop: 32 }}>
              <Pill style={{ background: C.surface }}>
                <Languages size={10} style={{ marginRight: 4 }} />{country.language}
              </Pill>
              <Pill style={{ background: C.surface }}>
                <Banknote size={10} style={{ marginRight: 4 }} />{country.currency}
              </Pill>
              {data.visaOfficialUrl && (
                <a href={data.visaOfficialUrl} target="_blank" rel="noopener noreferrer" style={{
                  fontFamily: BODY, fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "0.1em", color: C.muted, textDecoration: "none",
                  transition: "color 120ms",
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = C.accent}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = C.muted}
                >Official Visa Site →</a>
              )}
            </div>
          </div>

          {/* Right: move score */}
          <div style={{ flexShrink: 0, textAlign: "right" }}>
            <p style={{ fontFamily: BODY, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: C.muted, margin: "0 0 10px" }}>Move Score</p>
            <div style={{
              display: "inline-block", textAlign: "right",
              borderLeft: `4px solid ${moveScoreColor}`,
              paddingLeft: 28,
              boxShadow: `6px 6px 0 ${moveScoreColor}`,
            }}>
              <span style={{
                display: "block", fontFamily: HEAD, fontWeight: 800,
                fontSize: "clamp(88px, 11vw, 130px)", lineHeight: 0.88,
                letterSpacing: "-0.04em", color: moveScoreColor,
              }}>{data.moveScore}</span>
              <span style={{ display: "block", fontFamily: HEAD, fontWeight: 800, fontSize: 24, color: C.muted, marginTop: 12 }}>/ 10</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Score rack ────────────────────────────────────────────────────────────────
function ScoreRack({ scoreBreakdown }: { scoreBreakdown: ReturnType<typeof getScoreBreakdown> }) {
  return (
    <section>
      <Label style={{ marginBottom: 28 }}>Score breakdown</Label>
      <div style={{ display: "flex", overflowX: "auto", gap: 0 }}>
        {scoreBreakdown.map((item, i) => {
          const color = getScoreColor(item.value);
          const Icon = SCORE_ICON[item.label] ?? TrendingUp;
          return (
            <div key={item.label} style={{
              flex: "1 1 0", minWidth: 120,
              padding: `0 ${i === scoreBreakdown.length - 1 ? "0" : "28px"} 0 ${i === 0 ? "0" : "28px"}`,
              borderLeft: i === 0 ? "none" : `1px solid ${C.border}`,
              display: "flex", flexDirection: "column",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
                <Icon size={11} color={C.muted} />
                <span style={{ fontFamily: BODY, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.13em", color: C.muted }}>{item.label}</span>
              </div>
              <span style={{ fontFamily: HEAD, fontSize: 44, fontWeight: 800, color, lineHeight: 1, letterSpacing: "-0.03em", display: "block", marginBottom: 20 }}>
                {Math.round(item.value * 10) / 10}
              </span>
              <div style={{ height: 2, background: C.border, marginTop: "auto" }}>
                <div style={{ height: "100%", width: `${(item.value / item.maxValue) * 100}%`, background: color }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── Key stats strip ───────────────────────────────────────────────────────────
function KeyStats({ data, currencySymbol, totalMonthlyCost, hasHighTaxFlag }: {
  data: CountryWithData["data"];
  currencySymbol: string;
  totalMonthlyCost: number;
  hasHighTaxFlag: boolean;
}) {
  const stats = [
    { label: "Income Tax", value: `${data.incomeTaxRateMid}%`, color: hasHighTaxFlag ? "#ff6b35" : C.primary },
    { label: "Social Security", value: `${data.socialSecurityRate}%`, color: C.primary },
    { label: "Est. Monthly", value: `${currencySymbol}${totalMonthlyCost.toLocaleString()}`, color: C.primary },
    { label: "Visa Difficulty", value: `${data.visaDifficulty}/5`, color: getVisaColor(data.visaDifficulty) },
  ];
  return (
    <section style={{ display: "flex", borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
      {stats.map((s, i) => (
        <div key={s.label} style={{
          flex: 1, padding: "28px 36px",
          borderRight: i < stats.length - 1 ? `1px solid ${C.border}` : "none",
        }}>
          <p style={{ fontFamily: BODY, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: C.muted, margin: "0 0 12px" }}>{s.label}</p>
          <p style={{ fontFamily: HEAD, fontSize: "clamp(28px, 3.2vw, 40px)", fontWeight: 800, color: s.color, margin: 0, lineHeight: 1, letterSpacing: "-0.03em" }}>{s.value}</p>
        </div>
      ))}
    </section>
  );
}

// ── Salary table ──────────────────────────────────────────────────────────────
function SalaryTable({ data, currencySymbol, userRoleKey }: {
  data: CountryWithData["data"];
  currencySymbol: string;
  userRoleKey: string | null;
}) {
  const rows = [
    { role: "Software Eng.", key: "salarySoftwareEngineer" },
    { role: "Doctor",         key: "salaryDoctor" },
    { role: "Nurse",          key: "salaryNurse" },
    { role: "Data Scientist", key: "salaryDataScientist" },
    { role: "Product Mgr.",   key: "salaryProductManager" },
    { role: "DevOps",         key: "salaryDevOps" },
    { role: "Cybersecurity",  key: "salaryCybersecurity" },
    { role: "UX Designer",    key: "salaryUXDesigner" },
    { role: "Fin. Analyst",   key: "salaryFinancialAnalyst" },
    { role: "Lawyer",         key: "salaryLawyer" },
    { role: "Architect",      key: "salaryArchitect" },
    { role: "Civil Eng.",     key: "salaryCivilEngineer" },
    { role: "Pharmacist",     key: "salaryPharmacist" },
    { role: "Teacher",        key: "salaryTeacher" },
    { role: "Accountant",     key: "salaryAccountant" },
    { role: "HR Manager",     key: "salaryHRManager" },
    { role: "Sales Mgr.",     key: "salarySalesManager" },
    { role: "Marketing Mgr.", key: "salaryMarketingManager" },
    { role: "Electrician",    key: "salaryElectrician" },
    { role: "Chef",           key: "salaryChef" },
  ]
    .map(s => ({ ...s, salary: (data as any)[s.key] as number }))
    .filter(s => s.salary > 0)
    .sort((a, b) => b.salary - a.salary);

  const max = Math.max(...rows.map(s => s.salary));

  return (
    <section>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
        <Label>Average salaries</Label>
        <span style={{ fontFamily: BODY, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: C.muted }}>
          Annual · {data.id && ""}{currencySymbol.trim()}
          {userRoleKey && <span style={{ color: C.accent, marginLeft: 8 }}>· your role highlighted</span>}
        </span>
      </div>
      <div>
        {rows.map((s, i) => {
          const isUser = s.key === userRoleKey;
          const fill = (s.salary / max) * 100;
          return (
            <div key={s.key} style={{
              display: "flex", alignItems: "center", gap: 16,
              padding: isUser ? "13px 0 13px 14px" : "13px 0",
              borderBottom: `1px solid ${C.dim}`,
              background: isUser ? "rgba(0,255,213,0.03)" : "transparent",
              borderLeft: isUser ? `3px solid ${C.accent}` : "3px solid transparent",
              marginLeft: "-3px",
              transition: "background 120ms",
            }}>
              <span style={{ fontFamily: BODY, fontSize: 9, fontWeight: 700, color: C.muted, width: 20, flexShrink: 0, letterSpacing: "0.04em" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span style={{ fontFamily: BODY, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: isUser ? C.accent : C.muted, width: 136, flexShrink: 0 }}>
                {s.role}
              </span>
              <div style={{ flex: 1, height: 1, background: C.border, position: "relative", minWidth: 60 }}>
                <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${fill}%`, background: isUser ? C.accent : C.muted, opacity: isUser ? 1 : 0.4 }} />
              </div>
              <span style={{ fontFamily: HEAD, fontSize: 16, fontWeight: 800, color: isUser ? C.accent : C.primary, letterSpacing: "-0.01em", flexShrink: 0, width: 56, textAlign: "right" }}>
                {currencySymbol}{(s.salary / 1000).toFixed(0)}k
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── Cost of living ────────────────────────────────────────────────────────────
function CostOfLiving({ data, currencySymbol, totalMonthlyCost, rentWarning, userSalary }: {
  data: CountryWithData["data"];
  currencySymbol: string;
  totalMonthlyCost: number;
  rentWarning: boolean | null | undefined;
  userSalary: number | null;
}) {
  const items = [
    { label: "Rent — city centre", value: data.costRentCityCentre },
    { label: "Groceries",          value: data.costGroceriesMonthly },
    { label: "Transport",          value: data.costTransportMonthly },
    { label: "Dining out",         value: data.costEatingOut },
    { label: "Utilities",          value: data.costUtilitiesMonthly },
    { label: "Rent — outside",     value: data.costRentOutside },
  ];
  const totalColor = rentWarning ? "#f5c518" : C.accent;
  const monthlySalary = userSalary ? userSalary / 12 : null;
  const ratio = monthlySalary ? Math.min((data.costRentCityCentre / monthlySalary) * 100, 100) : null;

  return (
    <section>
      <Label style={{ marginBottom: 28 }}>Cost of living</Label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr min(320px, 40%)", gap: 64, alignItems: "start" }}>
        {/* Ledger */}
        <div>
          {items.map(item => (
            <div key={item.label} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "13px 0", borderBottom: `1px solid ${C.dim}`,
            }}>
              <span style={{ fontFamily: BODY, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.muted }}>{item.label}</span>
              <span style={{ fontFamily: HEAD, fontSize: 15, fontWeight: 800, color: C.primary, letterSpacing: "-0.01em" }}>{currencySymbol}{item.value.toLocaleString()}</span>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderTop: `1px solid ${C.border}`, marginTop: 2 }}>
            <span style={{ fontFamily: BODY, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: C.primary }}>Monthly total</span>
            <span style={{ fontFamily: HEAD, fontSize: 20, fontWeight: 800, color: totalColor, letterSpacing: "-0.02em" }}>{currencySymbol}{totalMonthlyCost.toLocaleString()}</span>
          </div>
        </div>

        {/* Big number */}
        <div>
          <p style={{ fontFamily: BODY, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: C.muted, margin: "0 0 14px" }}>Monthly total · city centre</p>
          <p style={{ fontFamily: HEAD, fontSize: "clamp(44px, 6vw, 60px)", fontWeight: 800, color: totalColor, margin: 0, lineHeight: 0.9, letterSpacing: "-0.04em" }}>
            {currencySymbol}{totalMonthlyCost.toLocaleString()}
          </p>
          {ratio != null && (
            <div style={{ marginTop: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontFamily: BODY, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: C.muted }}>Rent of salary</span>
                <span style={{ fontFamily: BODY, fontSize: 9, fontWeight: 700, color: C.muted }}>{Math.round(ratio)}%</span>
              </div>
              <div style={{ height: 2, background: C.border }}>
                <div style={{ height: "100%", width: `${ratio}%`, background: C.accent }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Quality scores ────────────────────────────────────────────────────────────
function QualityScores({ data }: { data: CountryWithData["data"] }) {
  const items = [
    { Icon: Heart,     label: "Quality of Life", value: data.scoreQualityOfLife },
    { Icon: TrendingUp,label: "Healthcare",       value: data.scoreHealthcare },
    { Icon: Shield,    label: "Safety",           value: data.scoreSafety },
    { Icon: Wifi,      label: "Internet Speed",   value: data.scoreInternetSpeed },
  ];
  return (
    <section>
      <Label style={{ marginBottom: 28 }}>Quality scores</Label>
      <div style={{ display: "flex" }}>
        {items.map((item, i) => {
          const color = getScoreColor(item.value);
          return (
            <div key={item.label} style={{
              flex: 1,
              padding: `0 ${i === items.length - 1 ? "0" : "28px"} 0 ${i === 0 ? "0" : "28px"}`,
              borderLeft: i === 0 ? "none" : `1px solid ${C.border}`,
              display: "flex", flexDirection: "column",
            }}>
              <item.Icon size={15} color={C.muted} style={{ marginBottom: 16 }} />
              <span style={{ fontFamily: HEAD, fontSize: 36, fontWeight: 800, color, lineHeight: 1, letterSpacing: "-0.03em", marginBottom: 10 }}>{item.value}</span>
              <span style={{ fontFamily: BODY, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: C.muted }}>{item.label}</span>
              <div style={{ height: 2, background: C.border, marginTop: 16 }}>
                <div style={{ height: "100%", width: `${(item.value / 10) * 100}%`, background: color }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── Visa ──────────────────────────────────────────────────────────────────────
function Visa({ data, passportContext }: {
  data: CountryWithData["data"];
  passportContext: { tier: 1|2|3|4; isEU: boolean; upgraded: boolean } | null;
}) {
  const visaColor = getVisaColor(data.visaDifficulty);
  const [disclosureOpen, setDisclosureOpen] = useState(false);

  return (
    <section>
      <Label style={{ marginBottom: 18 }}>Visa & immigration</Label>
      <div style={{
        display: "flex", border: `2px solid ${C.border}`,
        boxShadow: `4px 4px 0 ${visaColor}`, background: C.surface,
        flexWrap: "wrap",
      }}>
        {/* Left: big difficulty label */}
        <div style={{
          width: 220, flexShrink: 0, padding: "32px 28px",
          borderRight: `1px solid ${C.border}`,
          display: "flex", flexDirection: "column", justifyContent: "space-between",
        }}>
          <span style={{
            fontFamily: HEAD, fontWeight: 800, fontSize: "clamp(44px, 5vw, 64px)",
            lineHeight: 0.88, letterSpacing: "-0.04em", textTransform: "uppercase",
            color: visaColor, display: "block",
          }}>{getVisaLabel(data.visaDifficulty)}</span>
          <Pill color={visaColor} style={{ marginTop: 20, alignSelf: "flex-start" }}>Difficulty {data.visaDifficulty}/5</Pill>
        </div>

        {/* Right: details */}
        <div style={{ flex: 1, minWidth: 240, padding: "32px 36px", display: "flex", flexDirection: "column", gap: 16 }}>
          {passportContext && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <Pill color={C.accent} style={{ borderColor: "rgba(0,255,213,0.4)" }}>Tier {passportContext.tier} passport</Pill>
              {passportContext.isEU && <Pill color="rgba(0,255,213,0.65)" style={{ borderColor: "rgba(0,255,213,0.25)" }}>EU free movement</Pill>}
              {passportContext.upgraded && <Pill color="#f5c518" style={{ borderColor: "rgba(245,197,24,0.4)" }}>↑ Upgraded via 2nd passport</Pill>}
            </div>
          )}

          {data.visaNotes && (
            <p style={{ fontFamily: BODY, fontSize: 13, fontWeight: 400, lineHeight: 1.7, color: C.muted, margin: 0, maxWidth: "62ch" }}>
              {data.visaNotes}
            </p>
          )}

          {data.visaPopularRoutes?.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {data.visaPopularRoutes.map(r => (
                <Pill key={r} color={C.accent}>{r}</Pill>
              ))}
            </div>
          )}

          {data.visaOfficialUrl && (
            <a href={data.visaOfficialUrl} target="_blank" rel="noopener noreferrer" style={{
              fontFamily: BODY, fontSize: 10, fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.14em", color: C.muted, textDecoration: "none",
              transition: "color 120ms", alignSelf: "flex-start",
              display: "flex", alignItems: "center", gap: 6,
            }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = C.primary}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = C.muted}
            >Official Immigration Website <ExternalLink size={10} /></a>
          )}

          {/* Disclosure */}
          <div style={{ borderTop: `1px solid rgba(255,255,255,0.07)`, paddingTop: 16 }}>
            <button
              onClick={() => setDisclosureOpen(v => !v)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                width: "100%", padding: 0, background: "none", border: "none",
                cursor: "pointer", color: "rgba(255,255,255,0.55)",
                fontFamily: BODY, fontSize: 12, fontWeight: 500, textAlign: "left",
              }}
            >
              <span>How we rate visa difficulty</span>
              <span style={{ transform: disclosureOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 160ms ease", fontSize: 14, lineHeight: 1 }}>⌄</span>
            </button>
            {disclosureOpen && (
              <div style={{ marginTop: 12, fontFamily: BODY, fontSize: 12, fontWeight: 400, lineHeight: 1.55, color: "rgba(255,255,255,0.45)" }}>
                <p style={{ margin: 0 }}>1 = visa-free or visa-on-arrival for most passports. 5 = requires sponsorship, extensive documentation, or is rarely approved.</p>
                <p style={{ margin: "8px 0 0" }}>Score reflects typical experience for a professional relocation, not tourism.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ──────────────────────────────────────────────────────────────
function Testimonials() {
  return (
    <section>
      <Label style={{ marginBottom: 28 }}>From people who moved</Label>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {TESTIMONIALS.map((t, i) => (
          <div key={i} style={{
            flex: "1 1 240px",
            paddingLeft: i === 0 ? 0 : 32, paddingRight: i < TESTIMONIALS.length - 1 ? 32 : 0,
            borderLeft: i === 0 ? "none" : `1px solid ${C.border}`,
          }}>
            <span style={{
              fontFamily: HEAD, fontSize: 56, fontWeight: 800, color: C.accent,
              lineHeight: 0.8, display: "block", marginBottom: 16, opacity: 0.7,
            }}>"</span>
            <p style={{ fontFamily: BODY, fontSize: 13, fontWeight: 400, lineHeight: 1.7, color: C.muted, margin: "0 0 20px" }}>
              {t.quote}
            </p>
            <p style={{ fontFamily: BODY, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.primary, margin: 0 }}>
              {t.name} <span style={{ color: C.muted }}>· {t.role}</span>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Explore more ──────────────────────────────────────────────────────────────
function ExploreMore({ countries }: { countries: CountryWithData[] }) {
  const shown = countries.slice(0, 6);
  return (
    <section>
      <Label style={{ marginBottom: 18 }}>Explore more</Label>
      <div style={{ display: "flex", borderTop: `1px solid ${C.border}`, flexWrap: "wrap" }}>
        {shown.map((c, i) => (
          <Link key={c.slug} href={`/country/${c.slug}`} style={{ flex: "1 1 100px", textDecoration: "none", display: "block" }}>
            <div style={{
              padding: "24px 20px", background: C.surface,
              borderRight: i < shown.length - 1 ? `1px solid ${C.border}` : "none",
              transition: "background 120ms", cursor: "pointer",
            }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = C.elevated}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = C.surface}
            >
              <span style={{ fontSize: 40, display: "block", marginBottom: 14, lineHeight: 1 }}>{c.flagEmoji}</span>
              <p style={{ fontFamily: HEAD, fontSize: 16, fontWeight: 800, textTransform: "uppercase", letterSpacing: "-0.02em", color: C.primary, margin: "0 0 6px", lineHeight: 1 }}>{c.name}</p>
              <p style={{ fontFamily: BODY, fontSize: 11, fontWeight: 700, color: getScoreColor(c.data.moveScore), margin: 0 }}>{c.data.moveScore}/10</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ── Root component ────────────────────────────────────────────────────────────
interface Props {
  country: CountryWithData;
  otherCountries: CountryWithData[];
}

const EU_PASSPORT_SLUGS = new Set(["ireland","germany","france","netherlands","spain","portugal","sweden","norway","switzerland","austria","belgium","denmark","finland","italy","poland","romania"]);

export default function CountryPageClient({ country, otherCountries }: Props) {
  const { data } = country;
  const scoreBreakdown = getScoreBreakdown(data);
  const moveScoreColor = getScoreColor(data.moveScore);
  const currencySymbol = getCurrencySymbol(country.currency);
  const reportRef = useRef<HTMLDivElement>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [isPro, setIsPro] = useState(false);

  // ── Personalisation state ─────────────────────────────────────────────────
  const [wizardAnswers, setWizardAnswers] = useState<Partial<WizardAnswers> | null>(null);
  const [matchPercent, setMatchPercent] = useState<number | null>(null);
  const [matchReasons, setMatchReasons] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      let answers: Partial<WizardAnswers> | null = null;
      const raw = sessionStorage.getItem("wizardAnswers");
      if (raw) answers = JSON.parse(raw);

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase.from("profiles").select("is_pro").eq("id", session.user.id).maybeSingle();
        setIsPro(profile?.is_pro ?? false);
        const { data: result } = await supabase
          .from("wizard_results")
          .select("answers, top_countries")
          .eq("user_id", session.user.id)
          .maybeSingle();
        if (result?.answers) answers = result.answers;
        if (result?.top_countries) {
          const match = (result.top_countries as any[]).find((c: any) => c.slug === country.slug);
          if (match) { setMatchPercent(match.matchPercent); setMatchReasons(match.reasons ?? []); }
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

  // Derived personalisation
  const userRole = wizardAnswers?.jobRole ? JOB_ROLES.find(r => r.key === wizardAnswers!.jobRole) ?? null : null;
  const userSalary: number | null = userRole ? (data as any)[userRole.salaryKey] : null;

  const passportContext = (() => {
    if (!wizardAnswers?.passport) return null;
    const { primary, secondary } = resolveEffectivePassports(
      wizardAnswers.passport.toLowerCase(),
      (wizardAnswers.secondPassport ?? "").toLowerCase() || undefined,
    );
    const tier = Math.min(getPassportStrength(primary), secondary ? getPassportStrength(secondary) : 4) as 1|2|3|4;
    const rawTier = getPassportStrength(wizardAnswers.passport.toLowerCase());
    const isEU = EU_PASSPORT_SLUGS.has(primary) || (secondary ? EU_PASSPORT_SLUGS.has(secondary) : false);
    const upgraded = !!secondary && tier < rawTier;
    return { tier, isEU, upgraded };
  })();

  const rentUSD = data.costRentCityCentre * (TO_USD[country.currency] ?? 1);
  const maxRentUSD = RENT_BUDGET_USD[wizardAnswers?.rentBudget ?? "any"] ?? 99999;
  const rentFits = rentUSD <= maxRentUSD;
  const rentWarning = wizardAnswers?.rentBudget && wizardAnswers.rentBudget !== "any" ? !rentFits : null;
  const dealBreakers = wizardAnswers?.dealBreakers ?? [];
  const hasEnglishFlag = dealBreakers.includes("english") && !["ireland","united-kingdom","australia","new-zealand","canada","usa","singapore"].includes(country.slug);
  const hasHighTaxFlag = dealBreakers.includes("lowtax") && data.incomeTaxRateMid > 30;

  const totalMonthlyCost = data.costRentCityCentre + data.costGroceriesMonthly + data.costTransportMonthly + data.costEatingOut + data.costUtilitiesMonthly;

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
    <div ref={reportRef} style={{ minHeight: "100vh", background: C.bg, color: C.primary, display: "flex", flexDirection: "column" }}>
      <Nav countries={otherCountries.map((c): GlobeCountry => ({
        slug: c.slug, name: c.name, flagEmoji: c.flagEmoji,
        lat: c.lat, lng: c.lng, moveScore: c.data.moveScore,
        salarySoftwareEngineer: c.data.salarySoftwareEngineer,
        costRentCityCentre: c.data.costRentCityCentre,
        scoreQualityOfLife: c.data.scoreQualityOfLife,
        visaDifficulty: c.data.visaDifficulty,
        incomeTaxRateMid: c.data.incomeTaxRateMid,
      }))} />

      <main style={{ maxWidth: 1152, margin: "0 auto", width: "100%", padding: "56px 40px", boxSizing: "border-box" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 72 }}>
          <PersonalisationBanner
            matchPercent={matchPercent}
            matchReasons={matchReasons}
            passportContext={passportContext}
            userRole={userRole ?? null}
            userSalary={userSalary}
            currencySymbol={currencySymbol}
            rentFits={rentFits}
            rentWarning={rentWarning}
            hasEnglishFlag={hasEnglishFlag}
            hasHighTaxFlag={hasHighTaxFlag}
            rentMonthly={data.costRentCityCentre}
          />
          <Hero
            country={country}
            data={data}
            currencySymbol={currencySymbol}
            moveScoreColor={moveScoreColor}
            isPro={isPro}
            onGetReport={handleGetReport}
            generatingPDF={generatingPDF}
          />
          <ScoreRack scoreBreakdown={scoreBreakdown} />
          <KeyStats data={data} currencySymbol={currencySymbol} totalMonthlyCost={totalMonthlyCost} hasHighTaxFlag={hasHighTaxFlag} />
          <SalaryTable data={data} currencySymbol={currencySymbol} userRoleKey={userRole?.salaryKey ?? null} />
          <CostOfLiving data={data} currencySymbol={currencySymbol} totalMonthlyCost={totalMonthlyCost} rentWarning={rentWarning} userSalary={userSalary} />
          <QualityScores data={data} />
          <Visa data={data} passportContext={passportContext} />
          <Testimonials />
          <ExploreMore countries={otherCountries} />
        </div>
      </main>

      <footer style={{ borderTop: `2px solid ${C.border}`, marginTop: 40 }}>
        <div style={{ maxWidth: 1152, margin: "0 auto", padding: "24px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 22, height: 22, background: "#fff", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <rect width="12" height="12" rx="2" fill="#0a0a0a"/>
                <circle cx="6" cy="6" r="3" fill="#fff"/>
              </svg>
            </div>
            <span style={{ fontFamily: HEAD, fontSize: 14, fontWeight: 800, textTransform: "uppercase", letterSpacing: "-0.02em", color: C.primary }}>Origio</span>
          </div>
          <p style={{ fontFamily: BODY, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: C.muted, margin: 0 }}>
            Data last verified · {data.lastVerified}
          </p>
        </div>
      </footer>
    </div>
  );
}
