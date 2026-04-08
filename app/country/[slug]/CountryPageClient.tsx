"use client";

import React from "react";
import {
  DollarSign,
  Home,
  Shield,
  Wifi,
  Heart,
  Plane,
  TrendingUp,
  Receipt,
  ExternalLink,
  ArrowLeft,
  Globe2,
  MapPin,
  Languages,
  Banknote,
  FileText,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { CountryWithData } from "@/types";
import {
  getScoreColor,
  getScoreBreakdown,
  getVisaLabel,
  getVisaColor,
} from "@/lib/utils";

function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: "$", EUR: "€", GBP: "£", AUD: "A$", CAD: "C$",
    NZD: "NZ$", CHF: "CHF ", SGD: "S$", AED: "AED ", NOK: "kr ", SEK: "kr ",
  };
  return symbols[currency] ?? currency + " ";
}

interface Props {
  country: CountryWithData;
  otherCountries: CountryWithData[];
}

function StatBox({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="p-5 rounded-2xl bg-bg-surface border border-border stat-card">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: color + "15" }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <p className="text-xs text-text-muted uppercase tracking-wider mb-1">{label}</p>
      <p className="text-lg font-heading font-bold">{value}</p>
    </div>
  );
}
export default function CountryPageClient({ country, otherCountries }: Props) {
  const { data } = country;
  const scoreBreakdown = getScoreBreakdown(data);
  const moveScoreColor = getScoreColor(data.moveScore);

  const salaryData = [
    { role: "Software Eng.", salary: data.salarySoftwareEngineer, color: "#00d4c8" },
    { role: "Nurse", salary: data.salaryNurse, color: "#4ade80" },
    { role: "Teacher", salary: data.salaryTeacher, color: "#60a5fa" },
    { role: "Accountant", salary: data.salaryAccountant, color: "#a78bfa" },
    { role: "Marketing Mgr.", salary: data.salaryMarketingManager, color: "#f472b6" },
  ];

  const costItems = [
    { label: "Rent (City Centre)", value: data.costRentCityCentre },
    { label: "Rent (Outside)", value: data.costRentOutside },
    { label: "Groceries", value: data.costGroceriesMonthly },
    { label: "Transport", value: data.costTransportMonthly },
    { label: "Utilities", value: data.costUtilitiesMonthly },
    { label: "Eating Out (meal)", value: data.costEatingOut },
  ];

  const totalMonthlyCost = data.costRentCityCentre + data.costGroceriesMonthly + data.costTransportMonthly + data.costUtilitiesMonthly;

  const currencySymbol = getCurrencySymbol(country.currency);
  const visaColor = getVisaColor(data.visaDifficulty);

  return (
    <div className="min-h-screen bg-bg-primary" style={{ overflow: "auto" }}>
      <nav className="sticky top-0 z-50 glass-panel">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-accent" />
            <span className="font-heading text-lg font-extrabold">Origio</span>
          </a>
          <a href="/" className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Globe
          </a>
        </div>
      </nav>

      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <span className="text-6xl sm:text-7xl">{country.flagEmoji}</span>
            <div className="flex-1">
              <h1 className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight mb-2">{country.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{country.continent}</span>
                <span className="flex items-center gap-1.5"><Languages className="w-4 h-4" />{country.language}</span>
                <span className="flex items-center gap-1.5"><Banknote className="w-4 h-4" />{country.currency}</span>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div
                className="w-24 h-24 rounded-3xl flex items-center justify-center font-heading text-3xl font-extrabold"
                style={{
                  background: "linear-gradient(135deg, " + moveScoreColor + "22, " + moveScoreColor + "08)",
                  color: moveScoreColor,
                  border: "2px solid " + moveScoreColor + "44",
                }}
              >
                {data.moveScore}
              </div>
              <p className="text-xs text-text-muted mt-2 uppercase tracking-wider">Move Score</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        <section>
          <h2 className="font-heading text-xl font-bold mb-6">At a Glance</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatBox icon={DollarSign} label="Avg Dev Salary" value={currencySymbol + Math.round(data.salarySoftwareEngineer / 1000) + "k/yr"} color="#00d4c8" />
            <StatBox icon={Home} label="Rent (City)" value={currencySymbol + data.costRentCityCentre.toLocaleString() + "/mo"} color="#4ade80" />
            <StatBox icon={Heart} label="Quality of Life" value={data.scoreQualityOfLife + "/10"} color="#a78bfa" />
            <StatBox icon={Plane} label="Visa" value={getVisaLabel(data.visaDifficulty)} color={visaColor} />
          </div>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold mb-6">Score Breakdown</h2>
          <div className="p-6 rounded-2xl bg-bg-surface border border-border space-y-3">
            {scoreBreakdown.map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">{item.label}</span>
                  <span className="font-medium" style={{ color: item.color }}>{Math.round(item.value * 10) / 10}/10</span>
                </div>
                <div className="h-1.5 bg-bg-primary rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: (item.value / item.maxValue) * 100 + "%", background: "linear-gradient(90deg, " + item.color + "cc, " + item.color + ")" }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold mb-6">Average Salaries</h2>
          <div className="p-6 rounded-2xl bg-bg-surface border border-border">
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salaryData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                  <XAxis dataKey="role" tick={{ fill: "#8888a0", fontSize: 11 }} axisLine={{ stroke: "rgba(255,255,255,0.08)" }} tickLine={false} />
                  <YAxis tick={{ fill: "#8888a0", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => Math.round(v / 1000) + "k"} />
                  <Tooltip cursor={false} content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="glass-panel rounded-lg px-3 py-2">
                          <p className="text-sm font-medium text-text-primary">{payload[0].payload.role}</p>
                          <p className="text-sm text-accent font-bold">{currencySymbol + Number(payload[0].value).toLocaleString() + "/yr"}</p>
                        </div>
                      );
                    }
                    return null;
                  }} />
                  <Bar dataKey="salary" radius={[6, 6, 0, 0]} maxBarSize={45}>
                    {salaryData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} opacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold mb-6">Cost of Living</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {costItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between p-4 rounded-2xl bg-bg-surface border border-border">
                <span className="text-sm text-text-muted">{item.label}</span>
                <span className="text-lg font-heading font-bold text-text-primary">{currencySymbol + item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 rounded-2xl accent-border-glow bg-bg-surface">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">Estimated Monthly Total (city centre)</span>
              <span className="text-xl font-heading font-bold text-accent">{currencySymbol + totalMonthlyCost.toLocaleString()}</span>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold mb-6">Quality Scores</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatBox icon={Heart} label="Quality of Life" value={data.scoreQualityOfLife + "/10"} color="#a78bfa" />
            <StatBox icon={TrendingUp} label="Healthcare" value={data.scoreHealthcare + "/10"} color="#4ade80" />
            <StatBox icon={Shield} label="Safety" value={data.scoreSafety + "/10"} color="#60a5fa" />
            <StatBox icon={Wifi} label="Internet Speed" value={data.scoreInternetSpeed + "/10"} color="#facc15" />
          </div>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold mb-6">Tax Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-bg-surface border border-border">
              <div className="flex items-center gap-3 mb-2"><Receipt className="w-5 h-5 text-accent" /><span className="text-sm text-text-muted">Income Tax (mid bracket)</span></div>
              <p className="text-3xl font-heading font-bold">{data.incomeTaxRateMid}%</p>
            </div>
            <div className="p-6 rounded-2xl bg-bg-surface border border-border">
              <div className="flex items-center gap-3 mb-2"><Receipt className="w-5 h-5 text-accent" /><span className="text-sm text-text-muted">Social Security Rate</span></div>
              <p className="text-3xl font-heading font-bold">{data.socialSecurityRate}%</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold mb-6">Visa & Immigration</h2>
          <div className="p-6 rounded-2xl bg-bg-surface border border-border space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-text-muted">Difficulty:</span>
              <span className="px-3 py-1 text-sm font-medium rounded-full" style={{ color: visaColor, background: visaColor + "15", border: "1px solid " + visaColor + "33" }}>
                {getVisaLabel(data.visaDifficulty)}
              </span>
            </div>
            <p className="text-sm text-text-muted leading-relaxed">{data.visaNotes}</p>
            <div className="flex flex-wrap gap-2">
              {data.visaPopularRoutes.map((route) => (
                <span key={route} className="px-3 py-1.5 text-xs rounded-full border border-accent/20 text-accent bg-accent/5">{route}</span>
              ))}
            </div>
            {data.visaOfficialUrl && React.createElement("a", { href: data.visaOfficialUrl, target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent/80 transition-colors" }, React.createElement(ExternalLink, { className: "w-4 h-4" }), "Official immigration site")}
          </div>
        </section>

        <section className="text-center py-8">
          <h2 className="font-heading text-2xl font-bold mb-3">{"Ready to move to " + country.name + "?"}</h2>
          <p className="text-text-muted mb-6 max-w-md mx-auto">Get a personalised PDF report with detailed salary data for your role, visa guidance, and relocation checklist.</p>
          <button className="cta-button px-8 py-4 rounded-2xl text-base inline-flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Get Full Report
          </button>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold mb-6">Explore Other Countries</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {otherCountries.map((c) => (
              <a key={c.slug} href={"/country/" + c.slug} className="flex items-center gap-3 p-4 rounded-2xl bg-bg-surface border border-border hover:border-accent/30 transition-all hover:translate-y-[-2px]">
                <span className="text-2xl">{c.flagEmoji}</span>
                <div>
                  <p className="text-sm font-medium text-text-primary">{c.name}</p>
                  <p className="text-xs text-text-muted">{c.data.moveScore}/10</p>
                </div>
              </a>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2"><Globe2 className="w-4 h-4 text-accent" /><span className="font-heading text-sm font-bold">Origio</span></div>
          <p className="text-xs text-text-muted">{"Last verified: " + data.lastVerified}</p>
        </div>
      </footer>
    </div>
  );
}