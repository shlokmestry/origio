"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Globe2,
  ArrowLeft,
  ArrowRightLeft,
  ChevronDown,
  Heart,
  Shield,
  Wifi,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CountryWithData } from "@/types";
import { getScoreColor, getVisaLabel, getVisaColor } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

function CountrySelector({
  selected,
  onChange,
  excludeSlug,
  allCountries,
}: {
  selected: string | null;
  onChange: (slug: string) => void;
  excludeSlug: string | null;
  allCountries: CountryWithData[];
}) {
  const [open, setOpen] = useState(false);
  const selectedCountry = allCountries.find((c) => c.slug === selected);
  const filtered = allCountries.filter((c) => c.slug !== excludeSlug);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-bg-elevated border border-border hover:border-border-hover transition-colors text-left"
      >
        {selectedCountry ? (
          <div className="flex items-center gap-3">
            <span className="text-2xl">{selectedCountry.flagEmoji}</span>
            <span className="font-medium text-text-primary">{selectedCountry.name}</span>
          </div>
        ) : (
          <span className="text-text-muted">Select a country...</span>
        )}
        <ChevronDown className="w-4 h-4 text-text-muted" />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 glass-panel-strong rounded-xl max-h-64 overflow-y-auto shadow-xl shadow-black/30">
          {filtered.map((c) => (
            <button
              key={c.slug}
              onClick={() => {
                onChange(c.slug);
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-bg-elevated transition-colors text-left"
            >
              <span className="text-xl">{c.flagEmoji}</span>
              <div>
                <p className="text-sm font-medium text-text-primary">{c.name}</p>
                <p className="text-xs text-text-muted">Move Score: {c.data.moveScore}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CompareBar({ label, valueA, valueB, nameA, nameB, format, higherIsBetter = true }: {
  label: string;
  valueA: number;
  valueB: number;
  nameA: string;
  nameB: string;
  format: (v: number) => string;
  higherIsBetter?: boolean;
}) {
  const max = Math.max(valueA, valueB);
  const widthA = max > 0 ? (valueA / max) * 100 : 0;
  const widthB = max > 0 ? (valueB / max) * 100 : 0;
  const aWins = higherIsBetter ? valueA > valueB : valueA < valueB;
  const bWins = higherIsBetter ? valueB > valueA : valueB < valueA;
  const tie = valueA === valueB;

  return (
    <div className="space-y-2">
      <p className="text-sm text-text-muted font-medium">{label}</p>
      <div className="space-y-1.5">
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-muted w-20 text-right truncate">{nameA}</span>
          <div className="flex-1 h-6 bg-bg-primary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full flex items-center justify-end px-2"
              style={{
                width: widthA + "%",
                background: aWins && !tie ? "#00d4c8" : tie ? "#8888a0" : "#8888a044",
                minWidth: "40px",
              }}
            >
              <span className="text-xs font-bold text-bg-primary">{format(valueA)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-muted w-20 text-right truncate">{nameB}</span>
          <div className="flex-1 h-6 bg-bg-primary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full flex items-center justify-end px-2"
              style={{
                width: widthB + "%",
                background: bWins && !tie ? "#a78bfa" : tie ? "#8888a0" : "#8888a044",
                minWidth: "40px",
              }}
            >
              <span className="text-xs font-bold text-bg-primary">{format(valueB)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreCard({ label, valueA, valueB, icon: Icon }: { label: string; valueA: number; valueB: number; icon: any }) {
  const aWins = valueA > valueB;
  const bWins = valueB > valueA;
  return (
    <div className="p-4 rounded-2xl bg-bg-surface border border-border">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-text-muted" />
        <span className="text-xs text-text-muted uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className={"text-xl font-heading font-bold " + (aWins ? "text-accent" : bWins ? "text-text-muted" : "text-text-primary")}>{valueA}/10</span>
        <span className="text-xs text-text-muted">vs</span>
        <span className={"text-xl font-heading font-bold " + (bWins ? "text-[#a78bfa]" : aWins ? "text-text-muted" : "text-text-primary")}>{valueB}/10</span>
      </div>
    </div>
  );
}

export default function ComparePageClient() {
  const searchParams = useSearchParams();
  const fetchedRef = useRef(false);
  const [allCountries, setAllCountries] = useState<CountryWithData[]>([]);
  const [slugA, setSlugA] = useState<string | null>(null);
  const [slugB, setSlugB] = useState<string | null>(null);

  // Fetch countries once
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetch('/api/countries')
      .then((res) => res.json())
      .then((data: CountryWithData[]) => {
        setAllCountries(data);
        // Read query params after data loads
        const paramA = searchParams.get('a');
        const paramB = searchParams.get('b');
        const validSlugs = data.map((c) => c.slug);
        setSlugA(paramA && validSlugs.includes(paramA) ? paramA : 'canada');
        setSlugB(paramB && validSlugs.includes(paramB) ? paramB : 'germany');
      })
      .catch((err) => console.error('Failed to fetch countries:', err))
  }, [searchParams])

  const countryA = allCountries.find((c) => c.slug === slugA) || null;
  const countryB = allCountries.find((c) => c.slug === slugB) || null;

  const handleSwap = () => {
    const tempA = slugA;
    setSlugA(slugB);
    setSlugB(tempA);
  };

  const salaryCompareData = countryA && countryB ? [
    { role: "Software Eng.", a: countryA.data.salarySoftwareEngineer, b: countryB.data.salarySoftwareEngineer },
    { role: "Nurse", a: countryA.data.salaryNurse, b: countryB.data.salaryNurse },
    { role: "Teacher", a: countryA.data.salaryTeacher, b: countryB.data.salaryTeacher },
    { role: "Accountant", a: countryA.data.salaryAccountant, b: countryB.data.salaryAccountant },
    { role: "Marketing Mgr.", a: countryA.data.salaryMarketingManager, b: countryB.data.salaryMarketingManager },
  ] : [];

  const bothSelected = countryA && countryB;

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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">Compare Countries</h1>
          <p className="text-text-muted">Side-by-side comparison of salaries, costs, and quality of life.</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
          <div className="flex-1">
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Country A</label>
            <CountrySelector selected={slugA} onChange={setSlugA} excludeSlug={slugB} allCountries={allCountries} />
          </div>
          <button onClick={handleSwap} className="self-center p-3 rounded-xl border border-border hover:border-accent/30 transition-colors">
            <ArrowRightLeft className="w-5 h-5 text-text-muted" />
          </button>
          <div className="flex-1">
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Country B</label>
            <CountrySelector selected={slugB} onChange={setSlugB} excludeSlug={slugA} allCountries={allCountries} />
          </div>
        </div>

        {bothSelected && (
          <div className="space-y-10">
            <section>
              <h2 className="font-heading text-xl font-bold mb-6">Move Score</h2>
              <div className="grid grid-cols-2 gap-4">
                {[countryA, countryB].map((c) => {
                  const color = getScoreColor(c.data.moveScore);
                  return (
                    <div key={c.slug} className="p-6 rounded-2xl bg-bg-surface border border-border text-center">
                      <span className="text-3xl mb-3 block">{c.flagEmoji}</span>
                      <p className="font-heading font-bold text-lg mb-3">{c.name}</p>
                      <div
                        className="w-20 h-20 rounded-2xl flex items-center justify-center font-heading text-3xl font-extrabold mx-auto"
                        style={{
                          background: "linear-gradient(135deg, " + color + "22, " + color + "08)",
                          color: color,
                          border: "2px solid " + color + "44",
                        }}
                      >
                        {c.data.moveScore}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold mb-6">Quality Scores</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <ScoreCard label="Quality of Life" valueA={countryA.data.scoreQualityOfLife} valueB={countryB.data.scoreQualityOfLife} icon={Heart} />
                <ScoreCard label="Healthcare" valueA={countryA.data.scoreHealthcare} valueB={countryB.data.scoreHealthcare} icon={TrendingUp} />
                <ScoreCard label="Safety" valueA={countryA.data.scoreSafety} valueB={countryB.data.scoreSafety} icon={Shield} />
                <ScoreCard label="Internet" valueA={countryA.data.scoreInternetSpeed} valueB={countryB.data.scoreInternetSpeed} icon={Wifi} />
              </div>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold mb-6">Salary Comparison</h2>
              <div className="p-6 rounded-2xl bg-bg-surface border border-border">
                <div className="flex items-center gap-4 mb-4 text-xs text-text-muted">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-accent inline-block"></span>{countryA.name}</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#a78bfa] inline-block"></span>{countryB.name}</span>
                </div>
                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salaryCompareData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                      <XAxis dataKey="role" tick={{ fill: "#8888a0", fontSize: 11 }} axisLine={{ stroke: "rgba(255,255,255,0.08)" }} tickLine={false} />
                      <YAxis tick={{ fill: "#8888a0", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => Math.round(v / 1000) + "k"} />
                      <Tooltip cursor={false} content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="glass-panel rounded-lg px-3 py-2">
                              <p className="text-sm font-medium text-text-primary mb-1">{label}</p>
                              <p className="text-xs text-accent">{countryA.name + ": " + Number(payload[0].value).toLocaleString()}</p>
                              <p className="text-xs text-[#a78bfa]">{countryB.name + ": " + Number(payload[1].value).toLocaleString()}</p>
                            </div>
                          );
                        }
                        return null;
                      }} />
                      <Bar dataKey="a" radius={[4, 4, 0, 0]} maxBarSize={30} fill="#00d4c8" opacity={0.85} />
                      <Bar dataKey="b" radius={[4, 4, 0, 0]} maxBarSize={30} fill="#a78bfa" opacity={0.85} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold mb-6">Cost of Living</h2>
              <div className="p-6 rounded-2xl bg-bg-surface border border-border space-y-5">
                <CompareBar label="Rent (City Centre)" valueA={countryA.data.costRentCityCentre} valueB={countryB.data.costRentCityCentre} nameA={countryA.name} nameB={countryB.name} format={(v) => "€" + v.toLocaleString()} higherIsBetter={false} />
                <CompareBar label="Rent (Outside)" valueA={countryA.data.costRentOutside} valueB={countryB.data.costRentOutside} nameA={countryA.name} nameB={countryB.name} format={(v) => "€" + v.toLocaleString()} higherIsBetter={false} />
                <CompareBar label="Groceries" valueA={countryA.data.costGroceriesMonthly} valueB={countryB.data.costGroceriesMonthly} nameA={countryA.name} nameB={countryB.name} format={(v) => "€" + v.toLocaleString()} higherIsBetter={false} />
                <CompareBar label="Transport" valueA={countryA.data.costTransportMonthly} valueB={countryB.data.costTransportMonthly} nameA={countryA.name} nameB={countryB.name} format={(v) => "€" + v.toLocaleString()} higherIsBetter={false} />
                <CompareBar label="Utilities" valueA={countryA.data.costUtilitiesMonthly} valueB={countryB.data.costUtilitiesMonthly} nameA={countryA.name} nameB={countryB.name} format={(v) => "€" + v.toLocaleString()} higherIsBetter={false} />
              </div>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold mb-6">Tax</h2>
              <div className="p-6 rounded-2xl bg-bg-surface border border-border space-y-5">
                <CompareBar label="Income Tax (mid bracket)" valueA={countryA.data.incomeTaxRateMid} valueB={countryB.data.incomeTaxRateMid} nameA={countryA.name} nameB={countryB.name} format={(v) => v + "%"} higherIsBetter={false} />
                <CompareBar label="Social Security" valueA={countryA.data.socialSecurityRate} valueB={countryB.data.socialSecurityRate} nameA={countryA.name} nameB={countryB.name} format={(v) => v + "%"} higherIsBetter={false} />
              </div>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold mb-6">Visa</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[countryA, countryB].map((c) => {
                  const vColor = getVisaColor(c.data.visaDifficulty);
                  return (
                    <div key={c.slug} className="p-5 rounded-2xl bg-bg-surface border border-border space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{c.flagEmoji}</span>
                          <span className="font-heading font-bold">{c.name}</span>
                        </div>
                        <span className="px-3 py-1 text-xs font-medium rounded-full" style={{ color: vColor, background: vColor + "15", border: "1px solid " + vColor + "33" }}>
                          {getVisaLabel(c.data.visaDifficulty)}
                        </span>
                      </div>
                      <p className="text-sm text-text-muted leading-relaxed">{c.data.visaNotes}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {c.data.visaPopularRoutes.map((route) => (
                          <span key={route} className="px-2 py-1 text-xs rounded-full border border-accent/20 text-accent bg-accent/5">{route}</span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="flex flex-col sm:flex-row gap-4">
              <a href={"/country/" + countryA.slug} className="flex-1 text-center py-3 rounded-2xl border border-border hover:border-accent/30 transition-colors text-sm text-text-muted hover:text-text-primary">
                {"View full " + countryA.name + " page"}
              </a>
              <a href={"/country/" + countryB.slug} className="flex-1 text-center py-3 rounded-2xl border border-border hover:border-accent/30 transition-colors text-sm text-text-muted hover:text-text-primary">
                {"View full " + countryB.name + " page"}
              </a>
            </section>
          </div>
        )}

        {!bothSelected && (
          <div className="text-center py-20">
            <ArrowRightLeft className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-muted">Select two countries above to compare them.</p>
          </div>
        )}
      </main>

      <footer className="border-t border-border mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2"><Globe2 className="w-4 h-4 text-accent" /><span className="font-heading text-sm font-bold">Origio</span></div>
          <p className="text-xs text-text-muted">Compare countries side by side</p>
        </div>
      </footer>
    </div>
  );
}