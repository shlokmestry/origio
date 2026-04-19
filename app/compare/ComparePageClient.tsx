"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Globe2, ArrowRightLeft, ChevronDown,
  DollarSign, Home, Shield, Wifi, Heart,
  TrendingUp, Receipt, Plane, Lock, Sparkles,
} from "lucide-react";
import { CountryWithData, JobRole, JOB_ROLES } from "@/types";
import { getVisaLabel, getVisaColor } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCurrencySymbol(currency: string): string {
  const s: Record<string, string> = {
    USD: "$", EUR: "€", GBP: "£", AUD: "A$", CAD: "C$",
    NZD: "NZ$", CHF: "CHF ", SGD: "S$", AED: "AED ",
    NOK: "kr ", SEK: "kr ", JPY: "¥", INR: "₹", BRL: "R$",
    MYR: "RM ", DKK: "kr ",
  };
  return s[currency] ?? currency + " ";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CompareBar({
  label, valueA, valueB, nameA, nameB, format, higherIsBetter,
}: { label: string; valueA: number; valueB: number; nameA: string; nameB: string; format: (v: number) => string; higherIsBetter: boolean }) {
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
        {[{ name: nameA, value: valueA, width: widthA, wins: aWins && !tie, color: "#00d4c8" },
          { name: nameB, value: valueB, width: widthB, wins: bWins && !tie, color: "#a78bfa" }
        ].map((row) => (
          <div key={row.name} className="flex items-center gap-3">
            <span className="text-xs text-text-muted w-20 text-right truncate">{row.name}</span>
            <div className="flex-1 h-6 bg-bg-primary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full flex items-center justify-end px-2 transition-all duration-500"
                style={{
                  width: row.width + "%",
                  background: row.wins ? row.color : tie ? "#8888a0" : "#8888a044",
                  minWidth: "40px",
                }}
              >
                <span className="text-xs font-bold text-bg-primary">{format(row.value)}</span>
              </div>
            </div>
          </div>
        ))}
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

function CountrySelector({ selected, onChange, excludeSlug, allCountries }: {
  selected: string | null; onChange: (slug: string) => void; excludeSlug: string | null; allCountries: CountryWithData[];
}) {
  return (
    <div className="relative">
      <select
        value={selected ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none px-4 py-3 pr-10 rounded-2xl bg-bg-elevated border border-border hover:border-accent/30 focus:border-accent/40 focus:outline-none text-text-primary text-sm transition-colors cursor-pointer"
      >
        <option value="" disabled className="bg-bg-elevated">Select a country</option>
        {allCountries
          .filter((c) => c.slug !== excludeSlug)
          .map((c) => (
            <option key={c.slug} value={c.slug} className="bg-bg-elevated">
              {c.flagEmoji} {c.name}
            </option>
          ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
    </div>
  );
}

// ─── Pro Gate Overlay ─────────────────────────────────────────────────────────

function ProGateOverlay() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass-panel border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Globe2 className="w-5 h-5 text-accent" />
            <span className="font-heading text-lg font-extrabold text-text-primary">Origio</span>
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-md w-full text-center space-y-8">
          {/* Icon */}
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-2xl bg-accent/10 border border-accent/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <ArrowRightLeft className="w-8 h-8 text-accent" />
            </div>
            <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-bg-primary border border-border flex items-center justify-center">
              <Lock className="w-3.5 h-3.5 text-accent" />
            </div>
          </div>

          {/* Copy */}
          <div>
            <h1 className="font-heading text-3xl font-extrabold text-text-primary mb-3">
              Pro feature
            </h1>
            <p className="text-text-muted leading-relaxed">
              Side-by-side comparison is available on Origio Pro. Compare any two countries across salary, cost of living, safety, taxes, and visa routes.
            </p>
          </div>

          {/* Blurred preview */}
          <div className="relative rounded-2xl border border-border overflow-hidden">
            <div className="p-5 space-y-3 select-none" style={{ filter: 'blur(5px)', opacity: 0.35, pointerEvents: 'none' }}>
              <div className="grid grid-cols-2 gap-3">
                {['🇩🇰 Denmark', '🇳🇱 Netherlands'].map(c => (
                  <div key={c} className="p-3 rounded-xl bg-bg-elevated border border-border">
                    <p className="font-heading font-bold text-sm text-text-primary">{c}</p>
                    <p className="text-xs text-text-muted mt-1">Software Eng. · €68k/yr</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {['Quality of Life', 'Safety', 'Healthcare'].map(l => (
                  <div key={l} className="flex items-center gap-3 h-8">
                    <span className="text-xs text-text-muted w-28">{l}</span>
                    <div className="flex-1 h-4 bg-bg-elevated rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full" style={{ width: '80%' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* lock badge over preview */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bg-elevated border border-border text-xs text-text-muted">
                <Lock className="w-3 h-3" /> Locked
              </span>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-3">
            <Link href="/pro" className="cta-button w-full py-3.5 rounded-2xl text-base font-bold inline-flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              Upgrade to Pro — €5 one-time
            </Link>
            <Link href="/" className="block text-sm text-text-muted hover:text-text-primary transition-colors">
              Back to globe
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ComparePageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const fetchedRef = useRef(false);

  const [allCountries, setAllCountries] = useState<CountryWithData[]>([]);
  const [slugA, setSlugA] = useState<string | null>(null);
  const [slugB, setSlugB] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<JobRole>("softwareEngineer");

  // Auth state
  const [isPro, setIsPro] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Check pro status on mount
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

  // Wait for auth check before rendering anything
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  // Not pro — show gate
  if (!isPro) {
    return <ProGateOverlay />;
  }

  // Pro user — full compare page
  const countryA = allCountries.find((c) => c.slug === slugA) || null;
  const countryB = allCountries.find((c) => c.slug === slugB) || null;
  const bothSelected = countryA && countryB;
  const symA = countryA ? getCurrencySymbol(countryA.currency) : "€";
  const symB = countryB ? getCurrencySymbol(countryB.currency) : "€";
  const currentRole = JOB_ROLES.find((r) => r.key === selectedRole) ?? JOB_ROLES[0];

  const handleSwap = () => {
    const tmp = slugA;
    setSlugA(slugB);
    setSlugB(tmp);
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass-panel border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Globe2 className="w-5 h-5 text-accent" />
            <span className="font-heading text-lg font-extrabold text-text-primary">Origio</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-accent bg-accent/10 border border-accent/20 px-2.5 py-1 rounded-full font-bold">
            <Sparkles className="w-3 h-3" /> Pro
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

        {/* Country pickers */}
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Country A</label>
            <CountrySelector selected={slugA} onChange={setSlugA} excludeSlug={slugB} allCountries={allCountries} />
          </div>
          <button onClick={handleSwap} className="self-center p-3 rounded-xl border border-border hover:border-accent/30 transition-colors mb-0.5">
            <ArrowRightLeft className="w-5 h-5 text-text-muted" />
          </button>
          <div className="flex-1">
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Country B</label>
            <CountrySelector selected={slugB} onChange={setSlugB} excludeSlug={slugA} allCountries={allCountries} />
          </div>
        </div>

        {/* Role selector */}
        {bothSelected && (
          <div className="space-y-2">
            <label className="text-xs text-text-muted uppercase tracking-wider block">Your Job Role</label>
            <div className="relative max-w-sm">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as JobRole)}
                className="w-full appearance-none px-4 py-3 pr-10 rounded-xl bg-bg-elevated border border-border hover:border-accent/30 focus:border-accent/40 focus:outline-none text-text-primary text-sm transition-colors cursor-pointer"
              >
                {JOB_ROLES.map((role) => (
                  <option key={role.key} value={role.key} className="bg-bg-elevated">
                    {role.emoji} {role.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            </div>
          </div>
        )}

        {bothSelected && (
          <div className="space-y-10">

            {/* Country header cards */}
            <div className="grid grid-cols-2 gap-4">
              {[countryA, countryB].map((c, i) => (
                <div key={c.slug} className="p-5 rounded-2xl bg-bg-surface border border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{c.flagEmoji}</span>
                    <div>
                      <p className="font-heading font-bold text-text-primary">{c.name}</p>
                      <p className="text-xs text-text-muted">{c.continent}</p>
                    </div>
                  </div>
                  <div className="text-xs text-text-muted space-y-1">
                    <p>Currency: <span className="text-text-primary">{c.currency}</span></p>
                    <p>Language: <span className="text-text-primary">{c.language}</span></p>
                    <p>Move Score: <span className="text-text-primary font-bold">{c.data.moveScore}/10</span></p>
                  </div>
                </div>
              ))}
            </div>

            {/* Salary */}
            <section>
              <h2 className="font-heading text-xl font-bold mb-6 text-text-primary">Salary — {currentRole.label}</h2>
              <div className="p-6 rounded-2xl bg-bg-surface border border-border grid grid-cols-2 gap-6">
                {[{ c: countryA, sym: symA }, { c: countryB, sym: symB }].map(({ c, sym }) => (
                  <div key={c.slug}>
                    <p className="text-xs text-text-muted mb-1">{c.name}</p>
                    <p className="font-heading text-2xl font-extrabold text-text-primary">
                      {sym}{(c.data[currentRole.salaryKey] as number).toLocaleString()}
                    </p>
                    <p className="text-xs text-text-muted">per year</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Cost of living */}
            <section>
              <h2 className="font-heading text-xl font-bold mb-6 text-text-primary">Cost of Living</h2>
              <div className="p-6 rounded-2xl bg-bg-surface border border-border space-y-5">
                <CompareBar label="Rent — City Centre" valueA={countryA.data.costRentCityCentre} valueB={countryB.data.costRentCityCentre} nameA={countryA.name} nameB={countryB.name} format={(v) => getCurrencySymbol(countryA.currency) + v.toLocaleString()} higherIsBetter={false} />
                <CompareBar label="Rent — Outside Centre" valueA={countryA.data.costRentOutside} valueB={countryB.data.costRentOutside} nameA={countryA.name} nameB={countryB.name} format={(v) => getCurrencySymbol(countryA.currency) + v.toLocaleString()} higherIsBetter={false} />
                <CompareBar label="Groceries / month" valueA={countryA.data.costGroceriesMonthly} valueB={countryB.data.costGroceriesMonthly} nameA={countryA.name} nameB={countryB.name} format={(v) => getCurrencySymbol(countryA.currency) + v.toLocaleString()} higherIsBetter={false} />
                <CompareBar label="Transport / month" valueA={countryA.data.costTransportMonthly} valueB={countryB.data.costTransportMonthly} nameA={countryA.name} nameB={countryB.name} format={(v) => getCurrencySymbol(countryA.currency) + v.toLocaleString()} higherIsBetter={false} />
              </div>
            </section>

            {/* Quality scores */}
            <section>
              <h2 className="font-heading text-xl font-bold mb-6 text-text-primary">Quality of Life</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <ScoreCard label="Quality of Life" valueA={countryA.data.scoreQualityOfLife} valueB={countryB.data.scoreQualityOfLife} icon={Heart} />
                <ScoreCard label="Healthcare" valueA={countryA.data.scoreHealthcare} valueB={countryB.data.scoreHealthcare} icon={Plane} />
                <ScoreCard label="Safety" valueA={countryA.data.scoreSafety} valueB={countryB.data.scoreSafety} icon={Shield} />
                <ScoreCard label="Internet" valueA={countryA.data.scoreInternetSpeed} valueB={countryB.data.scoreInternetSpeed} icon={Wifi} />
              </div>
            </section>

            {/* Tax */}
            <section>
              <h2 className="font-heading text-xl font-bold mb-6 text-text-primary">Tax</h2>
              <div className="p-6 rounded-2xl bg-bg-surface border border-border space-y-5">
                <CompareBar label="Income Tax (mid bracket)" valueA={countryA.data.incomeTaxRateMid} valueB={countryB.data.incomeTaxRateMid} nameA={countryA.name} nameB={countryB.name} format={(v) => v + "%"} higherIsBetter={false} />
                <CompareBar label="Social Security" valueA={countryA.data.socialSecurityRate} valueB={countryB.data.socialSecurityRate} nameA={countryA.name} nameB={countryB.name} format={(v) => v + "%"} higherIsBetter={false} />
              </div>
            </section>

            {/* Visa */}
            <section>
              <h2 className="font-heading text-xl font-bold mb-6 text-text-primary">Visa</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[countryA, countryB].map((c) => {
                  const vColor = getVisaColor(c.data.visaDifficulty);
                  return (
                    <div key={c.slug} className="p-5 rounded-2xl bg-bg-surface border border-border space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{c.flagEmoji}</span>
                          <span className="font-heading font-bold text-text-primary">{c.name}</span>
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

            {/* Links to full pages */}
            <section className="flex flex-col sm:flex-row gap-4">
              <a href={"/country/" + countryA.slug} className="flex-1 text-center py-3 rounded-2xl border border-border hover:border-accent/30 transition-colors text-sm text-text-muted hover:text-text-primary">
                View full {countryA.name} page
              </a>
              <a href={"/country/" + countryB.slug} className="flex-1 text-center py-3 rounded-2xl border border-border hover:border-accent/30 transition-colors text-sm text-text-muted hover:text-text-primary">
                View full {countryB.name} page
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-accent" />
            <span className="font-heading text-sm font-bold text-text-primary">Origio</span>
          </div>
          <div className="flex items-center gap-5 text-xs text-text-muted">
            <a href="/faq" className="hover:text-text-primary transition-colors">FAQ</a>
            <a href="/about" className="hover:text-text-primary transition-colors">About</a>
            <a href="/contact" className="hover:text-text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}