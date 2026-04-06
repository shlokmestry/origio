"use client";

import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import { CountryWithData } from "@/types";
import { getScoreColor, getScoreBreakdown, getVisaLabel } from "@/lib/utils";
import ScoreCard from "./ScoreCard";
import SalaryChart from "./SalaryChart";

interface CountryPanelProps {
  country: CountryWithData | null;
  onClose: () => void;
}

export default function CountryPanel({ country, onClose }: CountryPanelProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [costsExpanded, setCostsExpanded] = useState(false);

  useEffect(() => {
    if (country) {
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [country]);

  if (!country) return null;

  const { data } = country;
  const scoreBreakdown = getScoreBreakdown(data);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 400);
  };

  const panelClasses = [
    "fixed top-0 right-0 h-full z-50 w-full max-w-md",
    "glass-panel-strong shadow-2xl shadow-black/50",
    "transform transition-transform duration-500",
    "ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto",
    isVisible ? "translate-x-0" : "translate-x-full",
  ].join(" ");

  const backdropClasses = [
    "fixed inset-0 bg-black/50 z-40 md:hidden",
    "transition-opacity duration-300",
    isVisible ? "opacity-100" : "opacity-0 pointer-events-none",
  ].join(" ");

  const moveScoreColor = getScoreColor(data.moveScore);

  return (
    <div>
      <div className={backdropClasses} onClick={handleClose} />
      <div className={panelClasses}>
        <div className="sticky top-0 z-10 glass-panel-strong border-b border-border">
          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{country.flagEmoji}</span>
              <div>
                <h2 className="font-heading text-2xl font-extrabold text-text-primary">
                  {country.name}
                </h2>
                <p className="text-sm text-text-muted">
                  {country.continent} · {country.language}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-xl hover:bg-bg-elevated transition-colors"
            >
              <X className="w-5 h-5 text-text-muted" />
            </button>
          </div>
          <div className="px-5 pb-5">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-bg-primary/50 accent-border-glow">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center font-heading text-2xl font-extrabold"
                style={{
                  background: "linear-gradient(135deg, " + moveScoreColor + "22, " + moveScoreColor + "08)",
                  color: moveScoreColor,
                  border: "1px solid " + moveScoreColor + "33",
                }}
              >
                {data.moveScore}
              </div>
              <div>
                <p className="text-sm text-text-muted uppercase tracking-wider">
                  Move Score
                </p>
                <p className="text-sm text-text-muted mt-1">
                  Based on salary, cost, quality, safety, visa & tax
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-5 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <ScoreCard
              icon={DollarSign}
              label="Avg Dev Salary"
              value={"$" + Math.round(data.salarySoftwareEngineer / 1000) + "k"}
              sublabel="per year"
              accentBorder
            />
            <ScoreCard
              icon={Home}
              label="Rent (City)"
              value={"$" + data.costRentCityCentre.toLocaleString()}
              sublabel="per month"
              scoreValue={10 - ((data.costRentCityCentre - 400) / (4000 - 400)) * 10}
            />
            <ScoreCard
              icon={Heart}
              label="Quality of Life"
              value={data.scoreQualityOfLife + "/10"}
              scoreValue={data.scoreQualityOfLife}
            />
            <ScoreCard
              icon={Plane}
              label="Visa Difficulty"
              value={getVisaLabel(data.visaDifficulty)}
              scoreValue={10 - data.visaDifficulty * 2}
            />
          </div>
          <div className="space-y-3">
            <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-text-muted">
              Score Breakdown
            </h3>
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
          </div>
          <div className="space-y-3">
            <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-text-muted">
              Average Salaries
            </h3>
            <div className="p-4 rounded-2xl bg-bg-primary/50 border border-border">
              <SalaryChart data={data} currency={country.currency} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ScoreCard
              icon={Shield}
              label="Safety"
              value={data.scoreSafety + "/10"}
              scoreValue={data.scoreSafety}
            />
            <ScoreCard
              icon={Wifi}
              label="Internet"
              value={data.scoreInternetSpeed + "/10"}
              scoreValue={data.scoreInternetSpeed}
            />
            <ScoreCard
              icon={TrendingUp}
              label="Healthcare"
              value={data.scoreHealthcare + "/10"}
              scoreValue={data.scoreHealthcare}
            />
            <ScoreCard
              icon={Receipt}
              label="Income Tax"
              value={data.incomeTaxRateMid + "%"}
              scoreValue={10 - (data.incomeTaxRateMid / 55) * 10}
            />
          </div>
          <div className="space-y-3">
            <button
              onClick={() => setCostsExpanded(!costsExpanded)}
              className="flex items-center justify-between w-full"
            >
              <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-text-muted">
                Monthly Costs Breakdown
              </h3>
              {costsExpanded ? (
                <ChevronUp className="w-4 h-4 text-text-muted" />
              ) : (
                <ChevronDown className="w-4 h-4 text-text-muted" />
              )}
            </button>
            {costsExpanded && (
              <div className="space-y-2 p-4 rounded-2xl bg-bg-primary/50 border border-border animate-fade-in">
                {[
                  { label: "Rent (City Centre)", value: data.costRentCityCentre },
                  { label: "Rent (Outside Centre)", value: data.costRentOutside },
                  { label: "Groceries", value: data.costGroceriesMonthly },
                  { label: "Transport", value: data.costTransportMonthly },
                  { label: "Utilities", value: data.costUtilitiesMonthly },
                  { label: "Eating Out (per meal)", value: data.costEatingOut },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0"
                  >
                    <span className="text-text-muted">{item.label}</span>
                    <span className="text-text-primary font-medium">
                      {"$" + item.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-3">
            <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-text-muted">
              Visa Information
            </h3>
            <div className="p-4 rounded-2xl bg-bg-primary/50 border border-border space-y-3">
              <p className="text-sm text-text-muted leading-relaxed">
                {data.visaNotes}
              </p>
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
          </div>
          <div className="space-y-3 pb-8">
            <button className="cta-button w-full py-3.5 rounded-2xl text-base flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />
              Get Full Report
            </button>
            <button className="w-full py-3 rounded-2xl text-sm border border-border hover:border-accent/30 transition-colors flex items-center justify-center gap-2 text-text-muted hover:text-text-primary">
              <ArrowRightLeft className="w-4 h-4" />
              Compare with another country
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function VisaLink(props: { url: string }) {
  if (!props.url) return null;
  const linkElement = React.createElement(
    "a",
    {
      href: props.url,
      target: "_blank",
      rel: "noopener noreferrer",
      className: "inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 transition-colors",
    },
    React.createElement(ExternalLink, { className: "w-3 h-3" }),
    "Official immigration site"
  );
  return linkElement;
}