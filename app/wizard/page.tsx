"use client";

import React, { useEffect, useState } from "react";
import { X, Sparkles, DollarSign, Home, Heart, Plane } from "lucide-react";
import { CountryWithData, JobRole, JOB_ROLES } from "@/types";
import { getVisaLabel } from "@/lib/utils";
import { CountryMatch } from "@/lib/wizard";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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

const RANK_COLORS = ["#fbbf24", "#00d4c8", "#a78bfa"];
const RANK_LABELS = ["Best Match", "2nd Match", "3rd Match"];

export default function WizardMatchesPanel({
  matches,
  allCountries,
  selectedRole,
  onCountrySelect,
  onClose,
}: WizardMatchesPanelProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));

    // ✅ Auto-save wizard result to Supabase if user is logged in
    const saveResult = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const topCountries = matches.slice(0, 3).map((m) => ({
        slug: m.country.slug,
        name: m.country.name,
        flagEmoji: m.country.flagEmoji,
        matchPercent: m.matchPercent,
      }))

      // Upsert — replaces previous result so only latest is stored
      await supabase.from('wizard_results').upsert(
        {
          user_id: session.user.id,
          top_countries: topCountries,
          answers: { role: selectedRole },
        },
        { onConflict: 'user_id' }
      )
    }

    saveResult()
  }, [])

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 400);
  };

  const currentRole = JOB_ROLES.find((r) => r.key === selectedRole) ?? JOB_ROLES[0];

  const panelClasses = [
    "fixed top-0 left-0 h-full z-50 w-full max-w-sm",
    "glass-panel-strong shadow-2xl shadow-black/50",
    "transform transition-transform duration-500",
    "ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto",
    isVisible ? "translate-x-0" : "-translate-x-full",
  ].join(" ");

  return (
    <div className={panelClasses}>
      {/* Header */}
      <div className="sticky top-0 z-10 glass-panel-strong border-b border-border">
        <div className="flex items-center justify-between p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <div>
              <h2 className="font-heading text-lg font-extrabold text-text-primary">
                Your Top Matches
              </h2>
              <p className="text-xs text-text-muted">Based on your wizard answers</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl hover:bg-bg-elevated transition-colors"
          >
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>
      </div>

      {/* Match cards */}
      <div className="p-4 space-y-4">
        {matches.slice(0, 3).map((match, index) => {
          const country = allCountries.find((c) => c.slug === match.country.slug);
          if (!country) return null;

          const color = RANK_COLORS[index];
          const salary = country.data[currentRole.salaryKey] as number;
          const currencySymbol = getCurrencySymbol(country.currency);

          return (
            <button
              key={match.country.slug}
              onClick={() => onCountrySelect(match.country.slug)}
              className="w-full text-left p-4 rounded-2xl bg-bg-surface border border-border hover:border-accent/30 transition-all space-y-4"
              style={{ borderColor: color + "33" }}
            >
              {/* Rank + flag + match % */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="text-xs font-bold px-2 py-1 rounded-full"
                    style={{ color, background: color + "20", border: "1px solid " + color + "40" }}
                  >
                    {RANK_LABELS[index]}
                  </span>
                  <span className="text-2xl">{match.country.flagEmoji}</span>
                  <div>
                    <p className="font-heading font-bold text-text-primary">
                      {match.country.name}
                    </p>
                    <p className="text-xs text-text-muted">{match.country.continent}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-heading font-extrabold text-xl" style={{ color }}>
                    {match.matchPercent}%
                  </p>
                  <p className="text-xs text-text-muted">match</p>
                </div>
              </div>

              {/* Match bar */}
              <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: match.matchPercent + "%", background: color }}
                />
              </div>

              {/* Key stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-bg-elevated">
                  <DollarSign className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                  <div>
                    <p className="text-xs text-text-muted truncate">{currentRole.label}</p>
                    <p className="text-sm font-bold text-text-primary">
                      {currencySymbol}{Math.round(salary / 1000)}k
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-bg-elevated">
                  <Home className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                  <div>
                    <p className="text-xs text-text-muted">Rent (City)</p>
                    <p className="text-sm font-bold text-text-primary">
                      {currencySymbol}{country.data.costRentCityCentre.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-bg-elevated">
                  <Heart className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                  <div>
                    <p className="text-xs text-text-muted">Quality of Life</p>
                    <p className="text-sm font-bold text-text-primary">
                      {country.data.scoreQualityOfLife}/10
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-bg-elevated">
                  <Plane className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                  <div>
                    <p className="text-xs text-text-muted">Visa</p>
                    <p className="text-sm font-bold text-text-primary">
                      {getVisaLabel(country.data.visaDifficulty)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Why reasons */}
              {match.reasons.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {match.reasons.slice(0, 2).map((reason) => (
                    <span
                      key={reason}
                      className="text-xs px-2 py-1 rounded-full"
                      style={{
                        color,
                        background: color + "15",
                        border: "1px solid " + color + "30",
                      }}
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              )}
            </button>
          );
        })}

        {/* Actions */}
        <div className="space-y-2 pt-2">
          <button
            onClick={() => router.push("/wizard/results")}
            className="w-full py-3 rounded-xl border border-accent/30 text-sm text-accent hover:bg-accent/10 transition-colors"
          >
            View full results
          </button>
          <button
            onClick={() => router.push("/wizard")}
            className="w-full py-3 rounded-xl border border-border text-sm text-text-muted hover:text-text-primary hover:border-accent/30 transition-colors"
          >
            Retake the quiz
          </button>
        </div>
      </div>
    </div>
  );
}