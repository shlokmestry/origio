"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  X,
  DollarSign,
  Home,
  Shield,
  Wifi,
  Heart,
  Plane,
  TrendingUp,
  Receipt,
  ChevronDown,
  ChevronUp,
  FileText,
  ArrowRightLeft,
  ExternalLink,
  Lock,
  Sparkles,
} from "lucide-react";
import { CountryWithData, JobRole, JOB_ROLES } from "@/types";
import { getScoreColor, getScoreBreakdown, getVisaLabel } from "@/lib/utils";
import ScoreCard from "./ScoreCard";
import SalaryChart from "./SalaryChart";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface CountryPanelProps {
  country: CountryWithData | null;
  onClose: () => void;
  selectedRole: JobRole;
  onRoleChange: (role: JobRole) => void;
}

function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: "$", EUR: "€", GBP: "£", AUD: "A$", CAD: "C$",
    NZD: "NZ$", CHF: "CHF ", SGD: "S$", AED: "AED ",
    NOK: "kr ", SEK: "kr ", JPY: "¥", INR: "₹", BRL: "R$",
    MYR: "RM ", DKK: "kr ",
  };
  return symbols[currency] ?? currency + " ";
}

function VisaLink(props: { url: string }) {
  if (!props.url) return null;
  return (
    <a
      href={props.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 transition-colors"
    >
      <ExternalLink className="w-3 h-3" />
      Official immigration site
    </a>
  );
}

export default function CountryPanel({ country, onClose, selectedRole, onRoleChange }: CountryPanelProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [costsExpanded, setCostsExpanded] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Check pro status once on mount
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_pro')
          .eq('id', session.user.id)
          .single();
        setIsPro(profile?.is_pro ?? false);
      }
      setAuthChecked(true);
    });
  }, []);

  useEffect(() => {
    if (country) {
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [country]);

  if (!country) return null;

  const { data } = country;
  const currencySymbol = getCurrencySymbol(country.currency);
  const scoreBreakdown = getScoreBreakdown(data);

  const currentRole = JOB_ROLES.find((r) => r.key === selectedRole) ?? JOB_ROLES[0];
  const currentSalary = data[currentRole.salaryKey] as number;

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 400);
  };

  const handleCompare = () => {
    router.push("/compare?a=" + country.slug);
  };

  const handleFullReport = () => {
    router.push("/country/" + country.slug);
  };

  const panelClasses = [
    "fixed top-16 right-0 z-40 w-full sm:max-w-md",
    "glass-panel-strong shadow-2xl shadow-black/50",
    "transform transition-transform duration-500",
    "ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto overscroll-contain",
    isVisible ? "translate-x-0" : "translate-x-full",
  ].join(" ");

  const backdropClasses = [
    "fixed inset-0 bg-black/50 z-30",
    "transition-opacity duration-300",
    isVisible ? "opacity-100" : "opacity-0 pointer-events-none",
  ].join(" ");

  // height: calc(100vh - 64px)
  const panelStyle = { height: "calc(100vh - 64px)" };

  const visaDifficultyColor = [
    "#4ade80", "#4ade80", "#fbbf24", "#f87171", "#ef4444"
  ][Math.min((data.visaDifficulty ?? 1) - 1, 4)] ?? "#fbbf24";

  return (
    <>
      <div className={backdropClasses} onClick={handleClose} />
      <div className={panelClasses} style={panelStyle}>
        <div className="p-5 space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{country.flagEmoji}</span>
              <div>
                <h2 className="font-heading text-2xl font-extrabold text-text-primary">{country.name}</h2>
                <p className="text-sm text-text-muted">{country.continent} · {country.language}</p>
              </div>
            </div>
            <button onClick={handleClose} className="p-2 rounded-xl hover:bg-white/5 text-text-muted hover:text-text-primary transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Move score */}
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-bg-primary/50 border border-border">
            <div className="flex-1">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Move Score</p>
              <div className="flex items-baseline gap-1">
                <span className="font-heading text-3xl font-extrabold" style={{ color: getScoreColor(data.moveScore) }}>
                  {data.moveScore.toFixed(1)}
                </span>
                <span className="text-text-muted text-sm">/10</span>
              </div>
            </div>
            <div className="w-16 h-16">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke={getScoreColor(data.moveScore)} strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${(data.moveScore / 10) * 100} 100`}
                />
              </svg>
            </div>
          </div>

          {/* Role selector */}
          <div className="space-y-2">
            <p className="text-xs text-text-muted uppercase tracking-wider">Salary for your role</p>
            <select
              value={selectedRole}
              onChange={(e) => onRoleChange(e.target.value as JobRole)}
              className="w-full px-3 py-2 rounded-xl bg-bg-elevated border border-border text-sm text-text-primary focus:outline-none focus:border-accent/40 transition-colors"
            >
              {JOB_ROLES.map((r) => (
                <option key={r.key} value={r.key} className="bg-bg-elevated">
                  {r.emoji} {r.label}
                </option>
              ))}
            </select>
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-3xl font-extrabold text-text-primary">
                {currencySymbol}{currentSalary.toLocaleString()}
              </span>
              <span className="text-text-muted text-sm">/ year</span>
            </div>
          </div>

          {/* Score breakdown */}
          <div className="grid grid-cols-2 gap-2">
            <ScoreCard icon={Heart} label="Quality of Life" value={data.scoreQualityOfLife + "/10"} scoreValue={data.scoreQualityOfLife} />
            <ScoreCard icon={Shield} label="Safety" value={data.scoreSafety + "/10"} scoreValue={data.scoreSafety} />
            <ScoreCard icon={Wifi} label="Internet" value={data.scoreInternetSpeed + "/10"} scoreValue={data.scoreInternetSpeed} />
            <ScoreCard icon={TrendingUp} label="Healthcare" value={data.scoreHealthcare + "/10"} scoreValue={data.scoreHealthcare} />
          </div>

          {/* Score bars */}
          <div className="space-y-2.5">
            {scoreBreakdown.map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">{item.label}</span>
                  <span className="font-medium" style={{ color: item.color }}>
                    {Math.round(item.value * 10) / 10}/10
                  </span>
                </div>
                <div className="h-1.5 bg-bg-primary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: (item.value / item.maxValue) * 100 + "%",
                      background: "linear-gradient(90deg, " + item.color + "cc, " + item.color + ")",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Cost of living */}
          <div className="space-y-3">
            <button
              onClick={() => setCostsExpanded(!costsExpanded)}
              className="w-full flex items-center justify-between text-left"
            >
              <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-text-muted">Cost of Living</h3>
              {costsExpanded ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
            </button>
            {costsExpanded && (
              <div className="space-y-2">
                {[
                  { label: "Rent (city centre)", value: data.costRentCityCentre },
                  { label: "Rent (outside centre)", value: data.costRentOutside },
                  { label: "Groceries/month", value: data.costGroceriesMonthly },
                  { label: "Transport/month", value: data.costTransportMonthly },
                  { label: "Utilities/month", value: data.costUtilitiesMonthly },
                  { label: "Eating out (meal)", value: data.costEatingOut },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                    <span className="text-sm text-text-muted">{item.label}</span>
                    <span className="text-sm font-semibold text-text-primary">
                      {currencySymbol}{item.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Visa Information — Pro gated ── */}
          <div className="space-y-3">
            <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-text-muted">
              Visa Information
            </h3>

            {isPro ? (
              // Full visa info for pro users
              <div className="p-4 rounded-2xl bg-bg-primary/50 border border-border space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">Difficulty:</span>
                  <span
                    className="px-2 py-0.5 text-xs font-medium rounded-full"
                    style={{ color: visaDifficultyColor, background: visaDifficultyColor + "15", border: "1px solid " + visaDifficultyColor + "33" }}
                  >
                    {getVisaLabel(data.visaDifficulty)}
                  </span>
                </div>
                <p className="text-sm text-text-muted leading-relaxed">{data.visaNotes}</p>
                <div className="flex flex-wrap gap-2">
                  {data.visaPopularRoutes.map((route) => (
                    <span
                      key={route}
                      className="px-3 py-1 text-xs rounded-full border border-accent/20 text-accent bg-accent/5"
                    >
                      {route}
                    </span>
                  ))}
                </div>
                <VisaLink url={data.visaOfficialUrl} />
              </div>
            ) : authChecked ? (
              // Pro upsell for non-pro users
              <div className="relative rounded-2xl border border-accent/20 overflow-hidden">
                {/* Blurred preview */}
                <div className="p-4 space-y-3 select-none" style={{ filter: 'blur(4px)', opacity: 0.4, pointerEvents: 'none' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">Difficulty:</span>
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-accent/10 text-accent border border-accent/20">
                      Moderate
                    </span>
                  </div>
                  <p className="text-sm text-text-muted leading-relaxed">
                    Skilled worker visa requires employer sponsorship with specific salary thresholds and documentation.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Skilled Worker Visa", "Global Talent", "Scale-Up Visa"].map((r) => (
                      <span key={r} className="px-3 py-1 text-xs rounded-full border border-accent/20 text-accent bg-accent/5">{r}</span>
                    ))}
                  </div>
                </div>
                {/* Overlay CTA */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4"
                  style={{ background: 'rgba(10,10,15,0.7)', backdropFilter: 'blur(2px)' }}>
                  <Lock className="w-5 h-5 text-accent" />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-text-primary mb-0.5">Pro feature</p>
                    <p className="text-xs text-text-muted">Visa routes, difficulty ratings & official links</p>
                  </div>
                  <Link
                    href="/pro"
                    className="cta-button px-4 py-2 rounded-xl text-xs inline-flex items-center gap-1.5 font-bold"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Upgrade — €5
                  </Link>
                </div>
              </div>
            ) : (
              // Loading state — show nothing yet to avoid flash
              <div className="h-24 rounded-2xl bg-bg-elevated animate-pulse" />
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3 pb-8">
            <button
              onClick={handleFullReport}
              className="cta-button w-full py-3.5 rounded-2xl text-base flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              View Full Country Page
            </button>
            <button
              onClick={handleCompare}
              className="w-full py-3 rounded-2xl text-sm border border-border hover:border-accent/30 transition-colors flex items-center justify-center gap-2 text-text-muted hover:text-text-primary"
            >
              <ArrowRightLeft className="w-4 h-4" />
              Compare with another country
            </button>
          </div>
        </div>
      </div>
    </>
  );
}