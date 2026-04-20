"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRightLeft, Globe2, DollarSign, Home, Shield, Wifi, Heart } from "lucide-react";
import { CountryWithData, JobRole, JOB_ROLES } from "@/types";
import { getScoreBreakdown } from "@/lib/utils";
import Nav from "@/components/Nav";

function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = { USD: "$", EUR: "€", GBP: "£", AUD: "A$", CAD: "C$", NZD: "NZ$", CHF: "CHF ", SGD: "S$", AED: "AED ", NOK: "kr ", SEK: "kr " };
  return symbols[currency] ?? currency + " ";
}

function CompareBar({ label, valueA, valueB, format, nameA, nameB, higherIsBetter }: {
  label: string; valueA: number; valueB: number;
  format: (v: number) => string; nameA: string; nameB: string; higherIsBetter: boolean;
}) {
  const max = Math.max(valueA, valueB);
  const widthA = max > 0 ? (valueA / max) * 100 : 0;
  const widthB = max > 0 ? (valueB / max) * 100 : 0;
  const aWins = higherIsBetter ? valueA > valueB : valueA < valueB;
  const bWins = higherIsBetter ? valueB > valueA : valueB < valueA;
  const tie = valueA === valueB;

  return (
    <div className="space-y-2 p-4 border-b border-[#1a1a1a] last:border-0">
      <p className="text-xs font-bold text-text-muted uppercase tracking-widest">{label}</p>
      <div className="space-y-1.5">
        {[{ name: nameA, val: valueA, width: widthA, wins: aWins, color: "#00ffd5" },
          { name: nameB, val: valueB, width: widthB, wins: bWins, color: "#a78bfa" }].map((item) => (
          <div key={item.name} className="flex items-center gap-3">
            <span className="text-xs text-text-muted w-20 text-right truncate font-medium">{item.name}</span>
            <div className="flex-1 h-5 bg-[#0a0a0a] border border-[#2a2a2a] overflow-hidden">
              <div className="h-full flex items-center justify-end px-2 transition-all duration-500"
                style={{ width: Math.max(widthA, widthB) > 0 ? item.width + "%" : "40px", background: item.wins && !tie ? item.color : "#2a2a2a", minWidth: "32px" }}>
                <span className="text-[10px] font-bold" style={{ color: item.wins && !tie ? "#0a0a0a" : "#666" }}>{format(item.val)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScoreCard({ label, valueA, valueB, icon: Icon }: { label: string; valueA: number; valueB: number; icon: any }) {
  const aWins = valueA > valueB; const bWins = valueB > valueA;
  return (
    <div className="p-4 border-r border-[#2a2a2a] last:border-0">
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className="w-3 h-3 text-text-muted" />
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{label}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className={"font-heading text-xl font-extrabold " + (aWins ? "text-accent" : bWins ? "text-text-muted" : "text-text-primary")}>{valueA}/10</span>
        <span className="text-[10px] text-text-muted font-bold">vs</span>
        <span className={"font-heading text-xl font-extrabold " + (bWins ? "text-[#a78bfa]" : aWins ? "text-text-muted" : "text-text-primary")}>{valueB}/10</span>
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
  const [selectedRole, setSelectedRole] = useState<JobRole>("softwareEngineer");

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetch('/api/countries')
      .then((res) => res.json())
      .then((data: CountryWithData[]) => {
        setAllCountries(data);
        const paramA = searchParams.get('a');
        const paramB = searchParams.get('b');
        const validSlugs = data.map((c) => c.slug);
        setSlugA(paramA && validSlugs.includes(paramA) ? paramA : 'canada');
        setSlugB(paramB && validSlugs.includes(paramB) ? paramB : 'germany');
      })
      .catch((err) => console.error('Failed to fetch countries:', err));
  }, [searchParams]);

  const countryA = allCountries.find((c) => c.slug === slugA) || null;
  const countryB = allCountries.find((c) => c.slug === slugB) || null;
  const bothSelected = countryA && countryB;
  const symA = countryA ? getCurrencySymbol(countryA.currency) : "€";
  const symB = countryB ? getCurrencySymbol(countryB.currency) : "€";
  const currentRole = JOB_ROLES.find((r) => r.key === selectedRole) ?? JOB_ROLES[0];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-text-primary">
      <Nav countries={allCountries.map(c => ({ slug: c.slug, name: c.name, flagEmoji: c.flagEmoji, lat: c.lat, lng: c.lng, moveScore: c.data.moveScore, salarySoftwareEngineer: c.data.salarySoftwareEngineer, costRentCityCentre: c.data.costRentCityCentre, scoreQualityOfLife: c.data.scoreQualityOfLife, visaDifficulty: c.data.visaDifficulty, incomeTaxRateMid: c.data.incomeTaxRateMid }))} onCountrySelect={() => {}} />

      {/* Country selectors */}
      <div className="border-b-2 border-[#2a2a2a] bg-[#0f0f0f]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-4">
            <p className="text-xs font-bold text-accent uppercase tracking-widest mb-1">Compare</p>
            <h1 className="font-heading text-3xl font-extrabold uppercase tracking-tight">Country vs Country</h1>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <select value={slugA ?? ""} onChange={(e) => setSlugA(e.target.value)}
              className="flex-1 min-w-[140px] px-3 py-2.5 bg-[#1a1a1a] border-2 border-[#2a2a2a] focus:border-accent text-text-primary text-sm font-bold outline-none appearance-none cursor-pointer uppercase tracking-wide transition-colors">
              {allCountries.map((c) => <option key={c.slug} value={c.slug}>{c.flagEmoji} {c.name}</option>)}
            </select>
            <button onClick={() => { const t = slugA; setSlugA(slugB); setSlugB(t); }}
              className="p-2.5 border-2 border-[#2a2a2a] hover:border-text-primary transition-colors flex-shrink-0">
              <ArrowRightLeft className="w-4 h-4" />
            </button>
            <select value={slugB ?? ""} onChange={(e) => setSlugB(e.target.value)}
              className="flex-1 min-w-[140px] px-3 py-2.5 bg-[#1a1a1a] border-2 border-[#2a2a2a] focus:border-[#a78bfa] text-text-primary text-sm font-bold outline-none appearance-none cursor-pointer uppercase tracking-wide transition-colors">
              {allCountries.map((c) => <option key={c.slug} value={c.slug}>{c.flagEmoji} {c.name}</option>)}
            </select>
            <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value as JobRole)}
              className="flex-1 min-w-[140px] px-3 py-2.5 bg-[#1a1a1a] border-2 border-[#2a2a2a] focus:border-accent text-text-primary text-sm font-bold outline-none appearance-none cursor-pointer uppercase tracking-wide transition-colors">
              {JOB_ROLES.map((r) => <option key={r.key} value={r.key}>{r.emoji} {r.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {bothSelected ? (
          <div className="space-y-8">

            {/* Flag headers */}
            <div className="grid grid-cols-2 gap-4">
              {[{ country: countryA, color: "#00ffd5" }, { country: countryB, color: "#a78bfa" }].map(({ country, color }) => (
                <div key={country.slug} className="border-2 p-5 text-center" style={{ borderColor: color, boxShadow: "4px 4px 0 " + color }}>
                  <div className="text-5xl mb-2">{country.flagEmoji}</div>
                  <h2 className="font-heading text-2xl font-extrabold uppercase tracking-tight text-text-primary">{country.name}</h2>
                  <p className="text-xs font-bold mt-1 uppercase tracking-widest" style={{ color }}>Move Score: {country.data.moveScore}/10</p>
                </div>
              ))}
            </div>

            {/* Score cards */}
            <div className="border-2 border-[#2a2a2a]">
              <p className="px-4 py-3 text-[10px] font-bold text-text-muted uppercase tracking-widest border-b-2 border-[#2a2a2a]">Score Breakdown</p>
              <div className="grid grid-cols-2 sm:grid-cols-4">
                <ScoreCard label="Quality of Life" valueA={countryA.data.scoreQualityOfLife} valueB={countryB.data.scoreQualityOfLife} icon={Heart} />
                <ScoreCard label="Safety" valueA={countryA.data.scoreSafety} valueB={countryB.data.scoreSafety} icon={Shield} />
                <ScoreCard label="Healthcare" valueA={countryA.data.scoreHealthcare} valueB={countryB.data.scoreHealthcare} icon={Heart} />
                <ScoreCard label="Internet" valueA={countryA.data.scoreInternetSpeed} valueB={countryB.data.scoreInternetSpeed} icon={Wifi} />

              </div>
            </div>

            {/* Salary */}
            <div className="border-2 border-[#2a2a2a]">
              <p className="px-4 py-3 text-[10px] font-bold text-text-muted uppercase tracking-widest border-b-2 border-[#2a2a2a]">
                Salary · {currentRole.label}
              </p>
              <CompareBar label="Annual salary"
                valueA={countryA.data[currentRole.salaryKey] as number}
                valueB={countryB.data[currentRole.salaryKey] as number}
                format={(v) => v.toLocaleString()}
                nameA={countryA.name} nameB={countryB.name} higherIsBetter={true}
              />
            </div>

            {/* Cost of living */}
            <div className="border-2 border-[#2a2a2a]">
              <p className="px-4 py-3 text-[10px] font-bold text-text-muted uppercase tracking-widest border-b-2 border-[#2a2a2a]">Cost of Living</p>
              <CompareBar label="Rent / month" valueA={countryA.data.costRentCityCentre} valueB={countryB.data.costRentCityCentre}
                format={(v) => v.toLocaleString()} nameA={countryA.name} nameB={countryB.name} higherIsBetter={false} />
              <CompareBar label="Groceries / month" valueA={countryA.data.costGroceries} valueB={countryB.data.costGroceries}
                format={(v) => v.toLocaleString()} nameA={countryA.name} nameB={countryB.name} higherIsBetter={false} />
              <CompareBar label="Income tax (mid)" valueA={countryA.data.incomeTaxRateMid} valueB={countryB.data.incomeTaxRateMid}
                format={(v) => v + "%"} nameA={countryA.name} nameB={countryB.name} higherIsBetter={false} />
            </div>

            {/* Visa */}
            <div className="grid sm:grid-cols-2 gap-4">
              {[{ country: countryA, color: "#00ffd5" }, { country: countryB, color: "#a78bfa" }].map(({ country, color }) => (
                <div key={country.slug} className="border-2 border-[#2a2a2a] p-5">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Visa — {country.name}</p>
                  <p className="text-sm font-bold text-text-primary mb-2">{country.data.visaDifficulty}</p>
                  <p className="text-xs text-text-muted leading-relaxed mb-3">{country.data.visaNotes}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {country.data.visaPopularRoutes?.map((route) => (
                      <span key={route} className="text-[10px] font-bold px-2 py-0.5 border-2 uppercase" style={{ borderColor: color, color }}>{route}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* View full pages */}
            <div className="grid sm:grid-cols-2 gap-4 pb-8">
              <a href={"/country/" + countryA.slug} className="ghost-button py-3 text-sm font-bold uppercase tracking-wide text-center block">
                Full {countryA.name} report →
              </a>
              <a href={"/country/" + countryB.slug} className="ghost-button py-3 text-sm font-bold uppercase tracking-wide text-center block">
                Full {countryB.name} report →
              </a>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <ArrowRightLeft className="w-10 h-10 text-text-muted mx-auto mb-4" />
            <p className="text-text-muted font-bold uppercase tracking-wide">Select two countries above to compare them.</p>
          </div>
        )}
      </main>

      <footer className="border-t-2 border-[#2a2a2a]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-accent border-2 border-text-primary" />
            <span className="font-heading text-sm font-extrabold uppercase tracking-tight">Origio</span>
          </div>
          <p className="text-xs font-bold text-text-muted uppercase tracking-wide">Compare countries side by side</p>
        </div>
      </footer>
    </div>
  );
}