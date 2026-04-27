"use client";

import React, { useEffect, useState } from "react";
import {
  X, DollarSign, Home, Shield, Wifi, Heart, Plane,
  TrendingUp, Receipt, ChevronDown, ChevronUp, ArrowRightLeft,
} from "lucide-react";
import { CountryWithData, JobRole, JOB_ROLES } from "@/types";
import { getScoreColor, getScoreBreakdown, getVisaLabel } from "@/lib/utils";
import { useRouter } from "next/navigation";

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

const SCORE_ICONS: Record<string, any> = {
  Salary: DollarSign,
  Affordability: Home,
  "Quality of Life": Heart,
  Safety: Shield,
  "Visa Access": Plane,
  "Tax Efficiency": Receipt,
};

export default function CountryPanel({ country, onClose, selectedRole, onRoleChange }: CountryPanelProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [costsExpanded, setCostsExpanded] = useState(false);

  useEffect(() => {
    if (country) requestAnimationFrame(() => setIsVisible(true));
    else setIsVisible(false);
  }, [country]);

  if (!country) return null;

  const { data } = country;
  const currencySymbol = getCurrencySymbol(country.currency);
  const scoreBreakdown = getScoreBreakdown(data);
  const currentRole = JOB_ROLES.find((r) => r.key === selectedRole) ?? JOB_ROLES[0];
  const currentSalary = data[currentRole.salaryKey] as number;

  const handleClose = () => { setIsVisible(false); setTimeout(onClose, 400); };
  const handleCompare = () => router.push("/compare?a=" + country.slug);
  const handleFullReport = () => router.push("/country/" + country.slug);

  const panelClasses = [
    "fixed top-14 right-0 z-40 w-full sm:max-w-md",
    "bg-[#0f0f0f] border-l-2 border-[#f0f0e8]",
    "transform transition-transform duration-400",
    "ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto overscroll-contain",
    isVisible ? "translate-x-0" : "translate-x-full",
  ].join(" ");

  const backdropClasses = [
    "fixed inset-0 bg-black/60 z-30",
    "transition-opacity duration-300",
    isVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
  ].join(" ");

  const moveScoreColor = getScoreColor(data.moveScore);

  return (
    <>
      <div className={backdropClasses} onClick={handleClose} />
      <div className={panelClasses} style={{ height: "calc(100vh - 3.5rem)" }}>
        <div className="flex flex-col gap-4 p-4">

          {/* Header */}
          <div className="flex items-start justify-between pt-1">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{country.flagEmoji}</span>
              <div>
                <h2 className="font-heading text-xl font-extrabold text-text-primary uppercase tracking-tight">
                  {country.name}
                </h2>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                  {country.continent} · {country.language}
                </p>
              </div>
            </div>
            <button onClick={handleClose} className="p-1.5 hover:text-accent transition-colors text-text-muted">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Move score */}
          <div className="p-4 border-2 border-[#2a2a2a]" style={{ borderColor: moveScoreColor, boxShadow: `3px 3px 0 ${moveScoreColor}` }}>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Move Score</p>
            <div className="flex items-end gap-3">
              <span className="font-heading text-4xl font-extrabold" style={{ color: moveScoreColor }}>
                {data.moveScore}
              </span>
              <span className="text-sm text-text-muted font-bold mb-1">/ 10</span>
            </div>
          </div>

          {/* Role selector */}
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Job Role</p>
            <select
              value={selectedRole}
              onChange={(e) => onRoleChange(e.target.value as JobRole)}
              className="w-full px-3 py-2.5 bg-[#1a1a1a] border-2 border-[#2a2a2a] focus:border-accent text-text-primary text-sm font-medium outline-none appearance-none cursor-pointer transition-colors"
            >
              {JOB_ROLES.map((r) => (
                <option key={r.key} value={r.key}>{r.emoji} {r.label}</option>
              ))}
            </select>
          </div>

          {/* Salary */}
          <div className="p-4 border-2 border-[#2a2a2a]" style={{ boxShadow: "3px 3px 0 #2a2a2a" }}>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">
              {currentRole.label} Salary
            </p>
            <p className="font-heading text-2xl font-extrabold text-text-primary">
              {currencySymbol}{currentSalary.toLocaleString()}
            </p>
            <p className="text-xs text-text-muted font-medium mt-0.5">per year · {country.currency}</p>
          </div>

          {/* Score breakdown */}
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Score Breakdown</p>
            <div className="space-y-0 border-2 border-[#2a2a2a]">
              {scoreBreakdown.map((item, i) => {
                const Icon = SCORE_ICONS[item.label] ?? TrendingUp;
                return (
                  <div key={item.label} className={`flex items-center justify-between px-4 py-3 ${i < scoreBreakdown.length - 1 ? "border-b-2 border-[#1a1a1a]" : ""}`}>
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                      <span className="text-xs font-bold text-text-muted uppercase tracking-wide">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-1.5 bg-[#1a1a1a]">
                        <div className="h-full transition-all"
                          style={{ width: `${(item.value / item.maxValue) * 100}%`, background: item.color }} />
                      </div>
                      <span className="text-xs font-bold w-6 text-right" style={{ color: item.color }}>
                        {Math.round(item.value * 10) / 10}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Visa */}
          <div className="p-4 border-2 border-[#2a2a2a]">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Visa</p>
            <p className="text-sm font-bold text-text-primary mb-1">{getVisaLabel(data.visaDifficulty)}</p>
            <p className="text-xs text-text-muted leading-relaxed">{data.visaNotes}</p>
            {data.visaPopularRoutes?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {data.visaPopularRoutes.map((route) => (
                  <span key={route} className="text-[10px] font-bold px-2 py-0.5 border-2 border-accent text-accent uppercase">
                    {route}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Cost of living */}
          <div>
            <button
              onClick={() => setCostsExpanded(!costsExpanded)}
              className="w-full flex items-center justify-between px-4 py-3 border-2 border-[#2a2a2a] hover:border-text-primary transition-colors"
            >
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Cost of Living</span>
              {costsExpanded
                ? <ChevronUp className="w-4 h-4 text-text-muted" />
                : <ChevronDown className="w-4 h-4 text-text-muted" />}
            </button>
            {costsExpanded && (
              <div className="border-2 border-[#2a2a2a] border-t-0 space-y-0">
                {[
                  { label: "Rent (city centre)", value: currencySymbol + data.costRentCityCentre.toLocaleString() + "/mo" },
                  { label: "Groceries", value: currencySymbol + data.costGroceriesMonthly.toLocaleString() + "/mo" },
                  { label: "Transport", value: currencySymbol + data.costTransportMonthly.toLocaleString() + "/mo" },
                  { label: "Dining out", value: currencySymbol + data.costEatingOut.toLocaleString() + "/meal" },
                  { label: "Utilities", value: currencySymbol + data.costUtilitiesMonthly.toLocaleString() + "/mo" },
                  { label: "Income tax (mid)", value: data.incomeTaxRateMid + "%" },
                ].map((item, i, arr) => (
                  <div key={item.label} className={`flex items-center justify-between px-4 py-3 ${i < arr.length - 1 ? "border-b border-[#1a1a1a]" : ""}`}>
                    <span className="text-xs font-medium text-text-muted">{item.label}</span>
                    <span className="text-xs font-bold text-text-primary">{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CTAs */}
          <div className="space-y-3 pb-6">
            <button
              onClick={handleFullReport}
              className="cta-button w-full py-3.5 text-sm font-bold uppercase tracking-wide flex items-center justify-center"
            >
              View Country Page
            </button>
            <button
              onClick={handleCompare}
              className="ghost-button w-full py-3 text-sm font-bold uppercase tracking-wide flex items-center justify-center"
            >
              Compare Countries
            </button>
          </div>

        </div>
      </div>
    </>
  );
}