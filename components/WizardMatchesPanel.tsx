"use client";

import React, { useEffect, useState } from "react";
import { X, Sparkles } from "lucide-react";
import { CountryWithData, JobRole, JOB_ROLES } from "@/types";
import { getVisaLabel } from "@/lib/utils";
import { CountryMatch } from "@/lib/wizard";
import { useRouter } from "next/navigation";

interface WizardMatchesPanelProps {
  matches: CountryMatch[];
  allCountries: CountryWithData[];
  selectedRole: JobRole;
  onCountrySelect: (slug: string) => void;
  onClose: () => void;
}

function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: "$", EUR: "€", GBP: "£", AUD: "A$", CAD: "C$",
    NZD: "NZ$", CHF: "CHF ", SGD: "S$", AED: "AED ", NOK: "kr ", SEK: "kr ",
  };
  return symbols[currency] ?? currency + " ";
}

const RANK_COLORS = ["#00ffd5", "#facc15", "#a78bfa"];
const RANK_LABELS = ["Best Match", "2nd Match", "3rd Match"];

export default function WizardMatchesPanel({
  matches, allCountries, selectedRole, onCountrySelect, onClose,
}: WizardMatchesPanelProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => { requestAnimationFrame(() => setIsVisible(true)); }, []);

  const handleClose = () => { setIsVisible(false); setTimeout(onClose, 400); };

  const currentRole = JOB_ROLES.find((r) => r.key === selectedRole) ?? JOB_ROLES[0];

  const panelClasses = [
    "fixed top-0 left-0 h-full z-50 w-full max-w-sm",
    "bg-[#0f0f0f] border-r-2 border-[#f0f0e8]",
    "transform transition-transform duration-400",
    "ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto",
    isVisible ? "translate-x-0" : "-translate-x-full",
  ].join(" ");

  return (
    <div className={panelClasses} style={{ boxShadow: "6px 0 0 #f0f0e8" }}>

      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0f0f0f] border-b-2 border-[#2a2a2a] p-5">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-accent border-2 border-text-primary" />
            <h2 className="font-heading text-lg font-extrabold text-text-primary uppercase tracking-tight">Your Matches</h2>
          </div>
          <button onClick={handleClose} className="p-1.5 border-2 border-[#2a2a2a] hover:border-text-primary transition-colors">
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </div>
        <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Based on your answers</p>
      </div>

      <div className="p-4 space-y-3">
        {matches.slice(0, 3).map((match, index) => {
          // CountryMatch shape: { country: CountryWithData, matchScore, matchPercent, reasons }
          const country = match.country;
          if (!country) return null;
          const currencySymbol = getCurrencySymbol(country.currency);
          const salary = country.data[currentRole.salaryKey] as number;
          const rankColor = RANK_COLORS[index];

          return (
            <button
              key={country.slug}
              onClick={() => onCountrySelect(country.slug)}
              className="w-full text-left border-2 bg-[#111111] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px]"
              style={{ borderColor: rankColor, boxShadow: "4px 4px 0 " + rankColor }}
            >
              {/* Card header */}
              <div className="flex items-center justify-between px-4 py-3 border-b-2" style={{ borderColor: "#1a1a1a" }}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{country.flagEmoji}</span>
                  <div>
                    <p className="font-heading font-extrabold text-text-primary uppercase tracking-tight">{country.name}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: rankColor }}>{RANK_LABELS[index]}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-heading text-lg font-extrabold" style={{ color: rankColor }}>{match.matchPercent}%</p>
                  <p className="text-[10px] font-bold text-text-muted uppercase">match</p>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 divide-x-2 divide-[#1a1a1a]">
                <div className="px-4 py-3">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Salary</p>
                  <p className="text-sm font-bold text-text-primary">{currencySymbol}{salary.toLocaleString()}</p>
                </div>
                <div className="px-4 py-3">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Rent/mo</p>
                  <p className="text-sm font-bold text-text-primary">{currencySymbol}{country.data.costRentCityCentre.toLocaleString()}</p>
                </div>
              </div>

              {/* Reasons */}
              {match.reasons.length > 0 && (
                <div className="px-4 pb-3 flex flex-wrap gap-1.5">
                  {match.reasons.slice(0, 2).map((reason) => (
                    <span key={reason} className="text-[10px] font-bold px-2 py-0.5 border uppercase"
                      style={{ borderColor: rankColor + "60", color: rankColor }}>
                      {reason}
                    </span>
                  ))}
                </div>
              )}
            </button>
          );
        })}

        {/* Upgrade prompt */}
        <div className="border-2 border-[#2a2a2a] p-5 text-center mt-4" style={{ boxShadow: "4px 4px 0 #2a2a2a" }}>
          <Sparkles className="w-5 h-5 text-accent mx-auto mb-2" />
          <p className="font-heading font-bold text-text-primary text-sm uppercase mb-1">See all rankings</p>
          <p className="text-xs text-text-muted mb-4">Upgrade to Pro to unlock all 25 countries ranked for you.</p>
          <a href="/pro" className="cta-button w-full py-2.5 text-xs font-bold block text-center uppercase tracking-wide">
            Upgrade to Pro ~ €5
          </a>
        </div>

        <button
          onClick={() => router.push("/wizard")}
          className="ghost-button w-full py-2.5 text-xs font-bold uppercase tracking-wide"
        >
          Retake the quiz
        </button>
      </div>
    </div>
  );
}