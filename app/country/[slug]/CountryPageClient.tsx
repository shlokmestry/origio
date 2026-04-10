"use client";

import { useRef, useState } from "react";
import {
  DollarSign, Home, Shield, Wifi, Heart, Plane,
  TrendingUp, Receipt, ExternalLink, ArrowLeft,
  Globe2, MapPin, Languages, Banknote, FileText, Loader2,
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
  const currencySymbol = getCurrencySymbol(country.currency);
  const visaColor = getVisaColor(data.visaDifficulty);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const salaryData = [
    { role: "Software Eng.", salary: data.salarySoftwareEngineer, color: "#00d4c8" },
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
    { role: "Chef", salary: data.salaryChef, color: "#fca5a5" },
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

  const handleGetReport = async () => {
    setGeneratingPDF(true);
    await generatePDF(reportRef, {
      filename: `origio-${country.slug}-report.pdf`,
      page: { margin: Margin.SMALL, format: "a4", orientation: "portrait" },
      overrides: { canvas: { useCORS: true } },
    });
    setGeneratingPDF(false);
  };

  return (
    <div className="min-h-screen bg-bg-primary" style={{ overflow: "auto" }}>
      <nav className="sticky top-0 z-50 glass-panel">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
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
              <div className="mt-4">
                <SaveCountryButton countrySlug={country.slug} />
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
          <h2 className="font-heading text-xl font-bold mb-2">Average Salaries</h2>
          <p className="text-text-muted text-sm mb-6">Annual salary across 20 job roles · {country.currency}</p>
          <div className="p-6 rounded-2xl bg-bg-surface border border-border">
            <div className="w-full h-96 min-h-[384px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salaryData} margin={{ top: 5, right: 5, left: -10, bottom: 60 }}>
                  <XAxis dataKey="role" tick={{ fill: "#8888a0", fontSize: 10 }} axisLine={{ stroke: "rgba(255,255,255,0.08)" }} tickLine={false} angle={-45} textAnchor="end" interval={0} />
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
                  <Bar dataKey="salary" radius={[4, 4, 0, 0]} maxBarSize={32}>
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
            {data.visaOfficialUrl && (
              <a href={data.visaOfficialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent/80 transition-colors">
                <ExternalLink className="w-4 h-4" />
                Official immigration site
              </a>
            )}
          </div>
        </section>

        {/* ✅ Get Full Report CTA */}
        <section className="text-center py-8">
          <h2 className="font-heading text-2xl font-bold mb-3">{"Ready to move to " + country.name + "?"}</h2>
          <p className="text-text-muted mb-6 max-w-md mx-auto">Download a full PDF report with all salary data, cost of living, visa info, and quality scores.</p>
          <button
            onClick={handleGetReport}
            disabled={generatingPDF}
            className="cta-button px-8 py-4 rounded-2xl text-base inline-flex items-center gap-2 disabled:opacity-70"
          >
            {generatingPDF ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Get Full Report
              </>
            )}
          </button>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-xl font-bold">Explore Other Countries</h2>
            <a href={"/compare?a=" + country.slug} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-accent/20 bg-accent/5 text-accent text-sm hover:bg-accent/10 transition-colors">
              Compare countries
            </a>
          </div>
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

      {/* ✅ Hidden PDF report div — captured off-screen */}
      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        <div
          ref={reportRef}
          style={{
            width: "794px",
            padding: "48px",
            background: "#0a0a0f",
            color: "#f0f0f5",
            fontFamily: "sans-serif",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "32px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "24px" }}>
            <span style={{ fontSize: "56px" }}>{country.flagEmoji}</span>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: "32px", fontWeight: 800, margin: 0, color: "#f0f0f5" }}>{country.name} Relocation Report</h1>
              <p style={{ margin: "4px 0 0", color: "#8888a0", fontSize: "14px" }}>{country.continent} · {country.language} · {country.currency} · Generated by Origio</p>
            </div>
            <div style={{ textAlign: "center", background: moveScoreColor + "22", border: "2px solid " + moveScoreColor + "44", borderRadius: "16px", padding: "12px 20px" }}>
              <div style={{ fontSize: "28px", fontWeight: 800, color: moveScoreColor }}>{data.moveScore}</div>
              <div style={{ fontSize: "11px", color: "#8888a0", marginTop: "2px" }}>Move Score</div>
            </div>
          </div>

          {/* Score breakdown */}
          <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px", color: "#f0f0f5" }}>Score Breakdown</h2>
          <div style={{ background: "#111118", borderRadius: "12px", padding: "20px", marginBottom: "28px" }}>
            {scoreBreakdown.map((item) => (
              <div key={item.label} style={{ marginBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "13px", color: "#8888a0" }}>{item.label}</span>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: item.color }}>{Math.round(item.value * 10) / 10}/10</span>
                </div>
                <div style={{ height: "6px", background: "#1a1a24", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: (item.value / item.maxValue) * 100 + "%", background: item.color, borderRadius: "3px" }} />
                </div>
              </div>
            ))}
          </div>

          {/* Salaries */}
          <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px", color: "#f0f0f5" }}>Average Salaries ({country.currency})</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "28px" }}>
            {salaryData.map((s) => (
              <div key={s.role} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#111118", borderRadius: "8px", padding: "10px 14px" }}>
                <span style={{ fontSize: "12px", color: "#8888a0" }}>{s.role}</span>
                <span style={{ fontSize: "13px", fontWeight: 700, color: s.color }}>{currencySymbol}{Math.round(s.salary / 1000)}k/yr</span>
              </div>
            ))}
          </div>

          {/* Cost of Living */}
          <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px", color: "#f0f0f5" }}>Cost of Living</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
            {costItems.map((item) => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", background: "#111118", borderRadius: "8px", padding: "10px 14px" }}>
                <span style={{ fontSize: "12px", color: "#8888a0" }}>{item.label}</span>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#f0f0f5" }}>{currencySymbol}{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div style={{ background: "#111118", border: "1px solid #00d4c844", borderRadius: "10px", padding: "14px 18px", marginBottom: "28px", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "13px", color: "#8888a0" }}>Est. Monthly Total (city centre)</span>
            <span style={{ fontSize: "16px", fontWeight: 800, color: "#00d4c8" }}>{currencySymbol}{totalMonthlyCost.toLocaleString()}</span>
          </div>

          {/* Quality Scores */}
          <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px", color: "#f0f0f5" }}>Quality Scores</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px", marginBottom: "28px" }}>
            {[
              { label: "Quality of Life", value: data.scoreQualityOfLife, color: "#a78bfa" },
              { label: "Healthcare", value: data.scoreHealthcare, color: "#4ade80" },
              { label: "Safety", value: data.scoreSafety, color: "#60a5fa" },
              { label: "Internet Speed", value: data.scoreInternetSpeed, color: "#facc15" },
            ].map((s) => (
              <div key={s.label} style={{ background: "#111118", borderRadius: "10px", padding: "14px", textAlign: "center" }}>
                <div style={{ fontSize: "22px", fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: "11px", color: "#8888a0", marginTop: "4px" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tax */}
          <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px", color: "#f0f0f5" }}>Tax</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "28px" }}>
            <div style={{ background: "#111118", borderRadius: "10px", padding: "16px" }}>
              <div style={{ fontSize: "11px", color: "#8888a0", marginBottom: "6px" }}>Income Tax (mid bracket)</div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#f0f0f5" }}>{data.incomeTaxRateMid}%</div>
            </div>
            <div style={{ background: "#111118", borderRadius: "10px", padding: "16px" }}>
              <div style={{ fontSize: "11px", color: "#8888a0", marginBottom: "6px" }}>Social Security Rate</div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#f0f0f5" }}>{data.socialSecurityRate}%</div>
            </div>
          </div>

          {/* Visa */}
          <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px", color: "#f0f0f5" }}>Visa & Immigration</h2>
          <div style={{ background: "#111118", borderRadius: "12px", padding: "20px", marginBottom: "28px" }}>
            <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, color: visaColor, background: visaColor + "20", border: "1px solid " + visaColor + "44", marginBottom: "12px" }}>
              {getVisaLabel(data.visaDifficulty)}
            </div>
            <p style={{ fontSize: "13px", color: "#8888a0", lineHeight: 1.6, margin: "0 0 12px" }}>{data.visaNotes}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {data.visaPopularRoutes.map((route) => (
                <span key={route} style={{ padding: "3px 10px", borderRadius: "20px", border: "1px solid #00d4c844", color: "#00d4c8", background: "#00d4c810", fontSize: "11px" }}>{route}</span>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#00d4c8" }}>Origio</span>
            <span style={{ fontSize: "11px", color: "#8888a0" }}>Last verified: {data.lastVerified} · origio-one.vercel.app</span>
          </div>
        </div>
      </div>
    </div>
  );
}