"use client";

import { useRef, useState } from "react";
import {
  DollarSign, Home, Shield, Wifi, Heart, Plane,
  TrendingUp, Receipt, ExternalLink, ArrowLeft,
  Languages, Banknote, FileText, Loader2,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import generatePDF, { Margin } from "react-to-pdf";
import { CountryWithData } from "@/types";
import { getScoreColor, getScoreBreakdown, getVisaLabel, getVisaColor } from "@/lib/utils";
import SaveCountryButton from "@/components/SaveCountryButton";

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

// ScoreBreakdown has no icon field — map by label
const SCORE_ICONS: Record<string, any> = {
  Salary: DollarSign,
  Affordability: Home,
  "Quality of Life": Heart,
  Safety: Shield,
  "Visa Access": Plane,
  "Tax Efficiency": Receipt,
};

export default function CountryPageClient({ country, otherCountries }: Props) {
  const { data } = country;
  const scoreBreakdown = getScoreBreakdown(data);
  const moveScoreColor = getScoreColor(data.moveScore);
  const currencySymbol = getCurrencySymbol(country.currency);
  const visaColor = getVisaColor(data.visaDifficulty);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Only use fields that exist on CountryData
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
  ];

  // Use actual CountryData field names: costGroceriesMonthly, costTransportMonthly, costUtilitiesMonthly, costEatingOut
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
          <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-3.5 h-3.5 bg-accent border-2 border-text-primary flex-shrink-0" />
            <span className="font-heading text-base font-extrabold uppercase tracking-tight">Origio</span>
          </a>
          <div className="flex items-center gap-3">
            <SaveCountryButton countrySlug={country.slug} />
            <a href="/" className="ghost-button flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wide">
              <ArrowLeft className="w-3.5 h-3.5" /> Globe
            </a>
          </div>
        </div>
      </nav>

      <div ref={reportRef}>
        {/* Hero */}
        <div className="border-b-2 border-[#2a2a2a] bg-[#0f0f0f]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-6xl">{country.flagEmoji}</span>
                  <div>
                    <p className="text-[10px] font-bold text-accent uppercase tracking-widest mb-1">{country.continent}</p>
                    <h1 className="font-heading text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-text-primary">
                      {country.name}
                    </h1>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-text-muted uppercase tracking-wide">
                
                  <span className="border-l-2 border-[#2a2a2a] pl-3 flex items-center gap-1.5"><Languages className="w-3 h-3" />{country.language}</span>
                  <span className="border-l-2 border-[#2a2a2a] pl-3 flex items-center gap-1.5"><Banknote className="w-3 h-3" />{country.currency}</span>
                </div>
              </div>

              {/* Move score */}
              <div className="border-2 p-5 flex-shrink-0" style={{ borderColor: moveScoreColor, boxShadow: "6px 6px 0 " + moveScoreColor }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: moveScoreColor }}>Move Score</p>
                <p className="font-heading text-5xl font-extrabold" style={{ color: moveScoreColor }}>{data.moveScore}</p>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">out of 10</p>
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">

          {/* Quick stats */}
          <section>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4 border-l-2 border-accent pl-3">At a glance</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-0 border-2 border-[#2a2a2a]">
              {[
                { icon: DollarSign, label: "SE Salary", value: currencySymbol + data.salarySoftwareEngineer.toLocaleString() + "/yr", color: "#00ffd5" },
                { icon: Home, label: "Rent / mo", value: currencySymbol + data.costRentCityCentre.toLocaleString(), color: "#a78bfa" },
                { icon: Receipt, label: "Income Tax", value: data.incomeTaxRateMid + "%", color: "#facc15" },
                { icon: Plane, label: "Visa", value: getVisaLabel(data.visaDifficulty), color: visaColor },
                { icon: Heart, label: "Quality of Life", value: data.scoreQualityOfLife + "/10", color: "#f472b6" },
                { icon: Shield, label: "Safety", value: data.scoreSafety + "/10", color: "#60a5fa" },
                { icon: TrendingUp, label: "Healthcare", value: data.scoreHealthcare + "/10", color: "#4ade80" },
                { icon: Wifi, label: "Internet", value: data.scoreInternetSpeed + "/10", color: "#fb923c" },
              ].map((item, i) => (
                <div key={item.label} className={`p-4 bg-[#111111] ${i % 4 !== 3 ? "border-r-2" : ""} ${i < 4 ? "border-b-2" : ""} border-[#2a2a2a]`}>
                  <div className="flex items-center gap-2 mb-2">
                    <item.icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{item.label}</p>
                  </div>
                  <p className="font-heading text-lg font-extrabold text-text-primary">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Score breakdown — uses item.value and item.maxValue (not item.score) */}
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

          {/* Salary chart */}
          <section>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 border-l-2 border-accent pl-3">Average salaries</p>
            <p className="text-xs text-text-muted font-medium mb-4 pl-5">Annual · {country.currency}</p>
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
                      {salaryData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} opacity={0.9} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* Cost of living */}
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
            {/* Total */}
            <div className="border-2 border-accent p-4 flex items-center justify-between" style={{ boxShadow: "4px 4px 0 #00ffd5" }}>
              <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Est. monthly total (city centre)</span>
              <span className="font-heading text-2xl font-extrabold text-accent">{currencySymbol + totalMonthlyCost.toLocaleString()}</span>
            </div>
          </section>

          {/* Quality scores */}
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
                  <div className="w-8 h-8 border-2 flex items-center justify-center mb-3" style={{ borderColor: item.color }}>
                    <item.icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                  </div>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="font-heading text-2xl font-extrabold" style={{ color: item.color }}>{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Tax */}
          <section>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4 border-l-2 border-accent pl-3">Tax</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border-2 border-[#2a2a2a]">
              <div className="p-6 bg-[#111111] border-r-2 border-[#2a2a2a]">
                <div className="flex items-center gap-2 mb-2">
                  <Receipt className="w-3.5 h-3.5 text-accent" />
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Income Tax (mid bracket)</span>
                </div>
                <p className="font-heading text-4xl font-extrabold text-text-primary">{data.incomeTaxRateMid}<span className="text-xl text-text-muted">%</span></p>
              </div>
              <div className="p-6 bg-[#111111]">
                <div className="flex items-center gap-2 mb-2">
                  <Receipt className="w-3.5 h-3.5 text-accent" />
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Social Security Rate</span>
                </div>
                <p className="font-heading text-4xl font-extrabold text-text-primary">{data.socialSecurityRate}<span className="text-xl text-text-muted">%</span></p>
              </div>
            </div>
          </section>

          {/* Visa */}
          <section>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4 border-l-2 border-accent pl-3">Visa & immigration</p>
            <div className="border-2 p-6 space-y-4 bg-[#111111]" style={{ borderColor: visaColor, boxShadow: "4px 4px 0 " + visaColor }}>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Difficulty:</span>
                <span className="border-2 px-3 py-1 text-xs font-bold uppercase tracking-wide" style={{ borderColor: visaColor, color: visaColor }}>
                  {getVisaLabel(data.visaDifficulty)}
                </span>
              </div>
              <p className="text-sm text-text-muted leading-relaxed">{data.visaNotes}</p>
              <div className="flex flex-wrap gap-2">
                {data.visaPopularRoutes.map((route) => (
                  <span key={route} className="border-2 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest" style={{ borderColor: visaColor, color: visaColor }}>
                    {route}
                  </span>
                ))}
              </div>
              {data.visaOfficialUrl && (
                <a href={data.visaOfficialUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:opacity-80 transition-opacity uppercase tracking-wide">
                  <ExternalLink className="w-3.5 h-3.5" />
                  Official immigration site
                </a>
              )}
            </div>
          </section>

          {/* PDF CTA */}
          <section className="border-2 border-accent p-8 text-center" style={{ boxShadow: "6px 6px 0 #00ffd5" }}>
            <h2 className="font-heading text-2xl font-extrabold uppercase tracking-tight mb-2">
              Ready to move to {country.name}?
            </h2>
            <p className="text-text-muted text-sm mb-6 max-w-md mx-auto">
              Download a full PDF report with all salary data, cost of living, visa info, and quality scores.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={handleGetReport} disabled={generatingPDF}
                className="cta-button px-8 py-3.5 text-sm font-bold uppercase tracking-wide disabled:opacity-70 disabled:transform-none disabled:shadow-none inline-flex items-center gap-2">
                {generatingPDF ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating PDF...</>
                ) : (
                  <><FileText className="w-4 h-4" /> Get Full Report</>
                )}
              </button>
              <a href={"/compare?a=" + country.slug}
                className="ghost-button px-8 py-3.5 text-sm font-bold uppercase tracking-wide inline-flex items-center gap-2">
                Compare countries
              </a>
            </div>
          </section>

          {/* Other countries */}
          <section className="pb-8">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4 border-l-2 border-accent pl-3">Explore other countries</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-0 border-2 border-[#2a2a2a]">
              {otherCountries.slice(0, 10).map((c, i) => (
                <a key={c.slug} href={"/country/" + c.slug}
                  className={`flex items-center gap-3 p-4 bg-[#111111] hover:bg-[#1a1a1a] transition-colors border-[#2a2a2a] ${i % 5 !== 4 ? "border-r-2" : ""} ${i < 5 ? "border-b-2" : ""}`}>
                  <span className="text-xl">{c.flagEmoji}</span>
                  <div>
                    <p className="text-xs font-bold text-text-primary uppercase tracking-tight">{c.name}</p>
                    <p className="text-[10px] font-bold text-text-muted">{c.data.moveScore}/10</p>
                  </div>
                </a>
              ))}
            </div>
          </section>

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
            Data last verified · {country.name}
          </p>
        </div>
      </footer>
    </div>
  );
}