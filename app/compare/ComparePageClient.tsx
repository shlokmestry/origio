"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRightLeft, Lock, Sparkles } from "lucide-react";
import { CountryWithData, JobRole, JOB_ROLES } from "@/types";
import { supabase } from "@/lib/supabase";
import Nav from "@/components/Nav";
import Link from "next/link";

// ── helpers ────────────────────────────────────────────────────────────────

function getCurrencySymbol(currency: string): string {
  const s: Record<string, string> = {
    USD: "$", EUR: "€", GBP: "£", AUD: "A$", CAD: "C$",
    NZD: "NZ$", CHF: "CHF ", SGD: "S$", AED: "AED ",
    NOK: "kr ", SEK: "kr ", JPY: "¥", INR: "₹", BRL: "R$",
    MYR: "RM ", DKK: "kr ",
  };
  return s[currency] ?? currency + " ";
}

function getVisaLabel(d: number) {
  if (d <= 1) return "Easy";
  if (d <= 2) return "Straightforward";
  if (d <= 3) return "Moderate";
  if (d <= 4) return "Difficult";
  return "Very hard";
}

// Country colors
const COL_A = "#00ffd5";
const COL_B = "#facc15";
const COL_C = "#a78bfa";

// ── Row components ────────────────────────────────────────────────────────

function MetricRow({
  label,
  values,
  format,
  higherIsBetter,
  isPro,
}: {
  label: string;
  values: (number | null)[];
  format: (v: number) => string;
  higherIsBetter: boolean;
  isPro: boolean;
}) {
  const defined = values.filter((v): v is number => v !== null);
  const best = higherIsBetter ? Math.max(...defined) : Math.min(...defined);
  const worst = higherIsBetter ? Math.min(...defined) : Math.max(...defined);
  const colors = [COL_A, COL_B, COL_C];

  return (
    <div className="grid border-b border-[#111]" style={{ gridTemplateColumns: `180px repeat(${isPro ? 3 : 2}, 1fr)` }}>
      <div className="px-4 py-3.5 flex items-center">
        <span className="text-[11px] font-bold text-[#888880] uppercase tracking-wide">{label}</span>
      </div>
      {values.map((val, i) => {
        // Third column — blur gate for non-Pro
        if (i === 2 && !isPro) {
          return (
            <div key={i} className="px-4 py-3.5 flex items-center border-l border-[#111] relative overflow-hidden">
              <span className="text-[13px] font-extrabold font-heading blur-sm select-none text-[#888880]">
                ███
              </span>
            </div>
          );
        }
        if (val === null) return null;
        const isBest = val === best && defined.length > 1;
        const isWorst = val === worst && defined.length > 1 && best !== worst;
        return (
          <div key={i} className="px-4 py-3.5 flex items-center gap-2 border-l border-[#111]">
            <span
              className="font-heading text-[14px] font-extrabold"
              style={{ color: isBest ? colors[i] : isWorst ? "#444" : "#f0f0e8" }}
            >
              {format(val)}
            </span>
            {isBest && (
              <span className="text-[9px] font-extrabold uppercase tracking-widest px-1.5 py-0.5"
                style={{ color: colors[i], border: `1px solid ${colors[i]}40` }}>
                best
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SectionHeader({ label, isPro }: { label: string; isPro: boolean }) {
  return (
    <div className="grid border-b-2 border-[#1a1a1a] bg-[#0d0d0d]"
      style={{ gridTemplateColumns: `180px repeat(${isPro ? 3 : 2}, 1fr)` }}>
      <div className="px-4 py-2.5 col-span-full">
        <p className="text-[10px] font-bold text-[#888880] uppercase tracking-[0.2em]">{label}</p>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────

export default function ComparePageClient() {
  const searchParams = useSearchParams();
  const fetchedRef = useRef(false);

  const [allCountries, setAllCountries] = useState<CountryWithData[]>([]);
  const [slugA, setSlugA] = useState<string | null>(null);
  const [slugB, setSlugB] = useState<string | null>(null);
  const [slugC, setSlugC] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<JobRole>("softwareEngineer");
  const [isPro, setIsPro] = useState(false);
  const [proChecked, setProChecked] = useState(false);

  // Check Pro status
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data } = await supabase.from("profiles").select("is_pro").eq("id", session.user.id).single();
        setIsPro(data?.is_pro ?? false);
      }
      setProChecked(true);
    });
  }, []);

  // Fetch countries + read URL params
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetch("/api/countries")
      .then(res => res.json())
      .then((data: CountryWithData[]) => {
        setAllCountries(data);
        const validSlugs = data.map(c => c.slug);
        const pA = searchParams.get("a");
        const pB = searchParams.get("b");
        const pC = searchParams.get("c");
        setSlugA(pA && validSlugs.includes(pA) ? pA : "portugal");
        setSlugB(pB && validSlugs.includes(pB) ? pB : "germany");
        setSlugC(pC && validSlugs.includes(pC) ? pC : validSlugs[2] ?? null);
      })
      .catch(err => console.error("Failed to fetch countries:", err));
  }, [searchParams]);

  const countryA = allCountries.find(c => c.slug === slugA) ?? null;
  const countryB = allCountries.find(c => c.slug === slugB) ?? null;
  const countryC = allCountries.find(c => c.slug === slugC) ?? null;
  const currentRole = JOB_ROLES.find(r => r.key === selectedRole) ?? JOB_ROLES[0];

  const globeCountries = allCountries.map(c => ({
    slug: c.slug, name: c.name, flagEmoji: c.flagEmoji,
    lat: c.lat, lng: c.lng, moveScore: c.data.moveScore,
    salarySoftwareEngineer: c.data.salarySoftwareEngineer,
    costRentCityCentre: c.data.costRentCityCentre,
    scoreQualityOfLife: c.data.scoreQualityOfLife,
    visaDifficulty: c.data.visaDifficulty,
    incomeTaxRateMid: c.data.incomeTaxRateMid,
  }));

  const symA = getCurrencySymbol(countryA?.currency ?? "EUR");
  const symB = getCurrencySymbol(countryB?.currency ?? "EUR");
  const symC = getCurrencySymbol(countryC?.currency ?? "EUR");

  // salary values — null if column not shown
  const salaryVals = [
    countryA ? countryA.data[currentRole.salaryKey] as number : null,
    countryB ? countryB.data[currentRole.salaryKey] as number : null,
    isPro && countryC ? countryC.data[currentRole.salaryKey] as number : null,
  ];

  const col = isPro ? 3 : 2;
  const gridCols = `180px repeat(${col}, 1fr)`;

  if (!proChecked) return <div className="min-h-screen bg-[#0a0a0a]" />;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f0f0e8]">
      <Nav countries={globeCountries} onCountrySelect={() => {}} />

      {/* Header + selectors */}
      <div className="border-b border-[#1a1a1a] bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <p className="text-[10px] font-bold text-[#888880] uppercase tracking-[0.2em] mb-2">
            {isPro ? "3-country comparison" : "2-country comparison"}
          </p>
          <h1 className="font-heading text-[40px] font-extrabold uppercase tracking-tight mb-8">
            Compare Countries
          </h1>

          {/* Role selector */}
          <div className="mb-6">
            <p className="text-[10px] font-bold text-[#888880] uppercase tracking-widest mb-2">Job role</p>
            <select
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value as JobRole)}
              className="px-3 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] focus:border-accent text-[#f0f0e8] text-sm font-bold outline-none appearance-none cursor-pointer transition-colors"
            >
              {JOB_ROLES.map(r => <option key={r.key} value={r.key}>{r.emoji} {r.label}</option>)}
            </select>
          </div>

          {/* Country selector row */}
          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${col}, 1fr)` }}>

            {/* Country A */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 flex-shrink-0" style={{ background: COL_A }} />
                <p className="text-[10px] font-bold text-[#888880] uppercase tracking-widest">Country A</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={slugA ?? ""}
                  onChange={e => setSlugA(e.target.value)}
                  className="flex-1 px-3 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] focus:border-accent text-[#f0f0e8] text-sm font-bold outline-none appearance-none cursor-pointer transition-colors"
                >
                  {allCountries.map(c => <option key={c.slug} value={c.slug}>{c.flagEmoji} {c.name}</option>)}
                </select>
                <button
                  onClick={() => { const t = slugA; setSlugA(slugB); setSlugB(t); }}
                  className="p-2.5 border border-[#2a2a2a] hover:border-[#444] transition-colors flex-shrink-0"
                  title="Swap A and B"
                >
                  <ArrowRightLeft className="w-4 h-4 text-[#888880]" />
                </button>
              </div>
            </div>

            {/* Country B */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 flex-shrink-0" style={{ background: COL_B }} />
                <p className="text-[10px] font-bold text-[#888880] uppercase tracking-widest">Country B</p>
              </div>
              <select
                value={slugB ?? ""}
                onChange={e => setSlugB(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] focus:border-accent text-[#f0f0e8] text-sm font-bold outline-none appearance-none cursor-pointer transition-colors"
              >
                {allCountries.map(c => <option key={c.slug} value={c.slug}>{c.flagEmoji} {c.name}</option>)}
              </select>
            </div>

            {/* Country C — Pro only */}
            {isPro && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2.5 h-2.5 flex-shrink-0" style={{ background: COL_C }} />
                  <p className="text-[10px] font-bold text-[#888880] uppercase tracking-widest">Country C</p>
                </div>
                <select
                  value={slugC ?? ""}
                  onChange={e => setSlugC(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] focus:border-accent text-[#f0f0e8] text-sm font-bold outline-none appearance-none cursor-pointer transition-colors"
                >
                  {allCountries.map(c => <option key={c.slug} value={c.slug}>{c.flagEmoji} {c.name}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Pro upsell if not Pro */}
          {!isPro && (
            <div className="mt-5 flex items-center gap-4 border border-[#1a1a1a] px-5 py-3">
              <Lock className="w-3.5 h-3.5 text-[#888880] flex-shrink-0" />
              <p className="text-[11px] text-[#888880] flex-1">
                Add a third country to your comparison.
              </p>
              <Link href="/pro"
                className="flex items-center gap-1.5 px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-widest bg-accent text-[#0a0a0a] flex-shrink-0"
                style={{ boxShadow: "2px 2px 0 #00aa90" }}>
                <Sparkles className="w-3 h-3" /> Pro · €19.99
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Comparison table */}
      {countryA && countryB && (
        <div className="max-w-6xl mx-auto px-6 py-10">

          {/* Column headers */}
          <div className="grid mb-0 border border-[#1a1a1a] border-b-0" style={{ gridTemplateColumns: gridCols }}>
            <div className="px-4 py-4 border-r border-[#111]" />
            {[
              { country: countryA, color: COL_A },
              { country: countryB, color: COL_B },
              ...(isPro && countryC ? [{ country: countryC, color: COL_C }] : []),
              ...(isPro && !countryC ? [{ country: null, color: COL_C }] : []),
            ].map(({ country, color }, i) => (
              <div key={i} className="px-4 py-4 border-r border-[#111] last:border-0">
                {country ? (
                  <div>
                    <p className="text-2xl mb-1">{country.flagEmoji}</p>
                    <p className="font-heading text-[13px] font-extrabold uppercase tracking-tight" style={{ color }}>
                      {country.name}
                    </p>
                    <p className="text-[10px] text-[#888880] mt-0.5">{country.currency}</p>
                  </div>
                ) : (
                  <div className="text-[#333] text-sm">—</div>
                )}
              </div>
            ))}
          </div>

          {/* Table body */}
          <div className="border border-[#1a1a1a]">

            {/* Salary */}
            <SectionHeader label="Salary" isPro={isPro} />
            <MetricRow label={`${currentRole.label}`} isPro={isPro} higherIsBetter={true}
              format={(v) => v.toLocaleString()}
              values={salaryVals} />

            {/* Cost of living */}
            <SectionHeader label="Cost of Living (monthly)" isPro={isPro} />
            <MetricRow label="Rent — city centre" isPro={isPro} higherIsBetter={false}
              format={(v) => v.toLocaleString()}
              values={[countryA.data.costRentCityCentre, countryB.data.costRentCityCentre, isPro && countryC ? countryC.data.costRentCityCentre : null]} />
            <MetricRow label="Groceries" isPro={isPro} higherIsBetter={false}
              format={(v) => v.toLocaleString()}
              values={[countryA.data.costGroceriesMonthly, countryB.data.costGroceriesMonthly, isPro && countryC ? countryC.data.costGroceriesMonthly : null]} />
            <MetricRow label="Transport" isPro={isPro} higherIsBetter={false}
              format={(v) => v.toLocaleString()}
              values={[countryA.data.costTransportMonthly, countryB.data.costTransportMonthly, isPro && countryC ? countryC.data.costTransportMonthly : null]} />
            <MetricRow label="Utilities" isPro={isPro} higherIsBetter={false}
              format={(v) => v.toLocaleString()}
              values={[countryA.data.costUtilitiesMonthly, countryB.data.costUtilitiesMonthly, isPro && countryC ? countryC.data.costUtilitiesMonthly : null]} />
            <MetricRow label="Eating out (per meal)" isPro={isPro} higherIsBetter={false}
              format={(v) => v.toLocaleString()}
              values={[countryA.data.costEatingOut, countryB.data.costEatingOut, isPro && countryC ? countryC.data.costEatingOut : null]} />

            {/* Tax */}
            <SectionHeader label="Tax" isPro={isPro} />
            <MetricRow label="Income tax (mid)" isPro={isPro} higherIsBetter={false}
              format={(v) => v + "%"}
              values={[countryA.data.incomeTaxRateMid, countryB.data.incomeTaxRateMid, isPro && countryC ? countryC.data.incomeTaxRateMid : null]} />
            <MetricRow label="Social security" isPro={isPro} higherIsBetter={false}
              format={(v) => v + "%"}
              values={[countryA.data.socialSecurityRate, countryB.data.socialSecurityRate, isPro && countryC ? countryC.data.socialSecurityRate : null]} />

            {/* Quality scores */}
            <SectionHeader label="Quality Scores" isPro={isPro} />
            <MetricRow label="Quality of life" isPro={isPro} higherIsBetter={true}
              format={(v) => v + "/10"}
              values={[countryA.data.scoreQualityOfLife, countryB.data.scoreQualityOfLife, isPro && countryC ? countryC.data.scoreQualityOfLife : null]} />
            <MetricRow label="Healthcare" isPro={isPro} higherIsBetter={true}
              format={(v) => v + "/10"}
              values={[countryA.data.scoreHealthcare, countryB.data.scoreHealthcare, isPro && countryC ? countryC.data.scoreHealthcare : null]} />
            <MetricRow label="Safety" isPro={isPro} higherIsBetter={true}
              format={(v) => v + "/10"}
              values={[countryA.data.scoreSafety, countryB.data.scoreSafety, isPro && countryC ? countryC.data.scoreSafety : null]} />
            <MetricRow label="Internet speed" isPro={isPro} higherIsBetter={true}
              format={(v) => v + "/10"}
              values={[countryA.data.scoreInternetSpeed, countryB.data.scoreInternetSpeed, isPro && countryC ? countryC.data.scoreInternetSpeed : null]} />

            {/* Visa */}
            <SectionHeader label="Visa" isPro={isPro} />
            <MetricRow label="Difficulty (1=easy)" isPro={isPro} higherIsBetter={false}
              format={(v) => `${v}/5 · ${getVisaLabel(v)}`}
              values={[countryA.data.visaDifficulty, countryB.data.visaDifficulty, isPro && countryC ? countryC.data.visaDifficulty : null]} />
            <MetricRow label="Move score" isPro={isPro} higherIsBetter={true}
              format={(v) => v + "/10"}
              values={[countryA.data.moveScore, countryB.data.moveScore, isPro && countryC ? countryC.data.moveScore : null]} />
          </div>

          {/* Visa notes — free, always two columns */}
          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            {[
              { country: countryA, color: COL_A },
              { country: countryB, color: COL_B },
            ].map(({ country, color }) => (
              <div key={country.slug} className="border border-[#1a1a1a] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{country.flagEmoji}</span>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color }}>
                    {country.name} · Visa
                  </p>
                </div>
                <p className="text-[11px] text-[#888880] leading-relaxed mb-3">{country.data.visaNotes}</p>
                {country.data.visaPopularRoutes?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {country.data.visaPopularRoutes.map(r => (
                      <span key={r} className="text-[9px] font-bold px-2 py-0.5 border uppercase tracking-wider"
                        style={{ borderColor: color + "40", color }}>
                        {r}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pro: show countryC visa notes too */}
          {isPro && countryC && (
            <div className="mt-4 border border-[#1a1a1a] p-5 sm:w-1/2">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{countryC.flagEmoji}</span>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: COL_C }}>
                  {countryC.name} · Visa
                </p>
              </div>
              <p className="text-[11px] text-[#888880] leading-relaxed mb-3">{countryC.data.visaNotes}</p>
              {countryC.data.visaPopularRoutes?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {countryC.data.visaPopularRoutes.map(r => (
                    <span key={r} className="text-[9px] font-bold px-2 py-0.5 border uppercase tracking-wider"
                      style={{ borderColor: COL_C + "40", color: COL_C }}>
                      {r}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bottom links */}
          <div className="mt-10 pt-8 border-t border-[#1a1a1a] flex flex-wrap gap-4">
            {[countryA, countryB, ...(isPro && countryC ? [countryC] : [])].map((c, i) => (
              <Link key={c.slug} href={`/country/${c.slug}`}
                className="text-[11px] font-bold uppercase tracking-widest hover:text-accent transition-colors"
                style={{ color: [COL_A, COL_B, COL_C][i] }}>
                {c.flagEmoji} Full {c.name} report →
              </Link>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}