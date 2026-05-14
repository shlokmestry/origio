"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRightLeft, Lock, Star } from "lucide-react";
import { CountryWithData, JobRole, JOB_ROLES } from "@/types";
import { supabase } from "@/lib/supabase";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import Link from "next/link";

// ── constants ─────────────────────────────────────────────────────────────────

const COL_A = "#4de6cc";
const COL_B = "#f0c84a";
const COL_C = "#c4b5fd";

// ── helpers ───────────────────────────────────────────────────────────────────

function getVisaLabel(d: number) {
  if (d <= 1) return "Easy";
  if (d <= 2) return "Moderate";
  if (d <= 3) return "Challenging";
  if (d <= 4) return "Difficult";
  return "Very Hard";
}

function fmt(v: number) {
  return v.toLocaleString("en-US");
}

// ── sub-components ────────────────────────────────────────────────────────────

/** Single value cell inside a metric row */
function ValCell({
  val,
  formatted,
  isBest,
  isWorst,
  color,
  pct,
  showBar,
  locked,
}: {
  val: number | null;
  formatted: string;
  isBest: boolean;
  isWorst: boolean;
  color: string;
  pct: number;
  showBar: boolean;
  locked?: boolean;
}) {
  if (locked) {
    return (
      <div className="relative flex items-center justify-center border-l border-white/[0.05]" style={{ minHeight: 72 }}>
        <div className="w-7 h-7 flex items-center justify-center border border-white/[0.12] bg-white/[0.04]">
          <Lock className="w-3 h-3 text-white/30" />
        </div>
      </div>
    );
  }

  if (val === null) return null;

  const valColor = isBest ? color : isWorst ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.85)";

  return (
    <div
      className="flex flex-col justify-center px-6 py-4 border-l border-white/[0.05]"
      style={{ background: isBest ? "rgba(255,255,255,0.018)" : undefined, minHeight: 72 }}
    >
      {/* value */}
      <div
        className="leading-none mb-1"
        style={{
          fontFamily: "var(--font-heading, 'DM Serif Display', Georgia, serif)",
          fontSize: 22,
          color: valColor,
        }}
      >
        {formatted}
      </div>

      {/* best pill */}
      {isBest ? (
        <span
          className="inline-block text-[8px] font-black uppercase tracking-[0.22em] px-2 py-0.5 border w-fit mb-1"
          style={{ color, borderColor: color + "55" }}
        >
          best
        </span>
      ) : (
        <div style={{ height: 18 }} />
      )}

      {/* mini bar */}
      {showBar && (
        <div className="h-px w-14 bg-white/[0.07] overflow-hidden mt-0.5">
          <div
            className="h-full"
            style={{
              width: `${pct}%`,
              background: isBest ? color : "rgba(255,255,255,0.12)",
              transition: "width 0.4s ease",
            }}
          />
        </div>
      )}
    </div>
  );
}

/** One full metric row: label + 2 or 3 value cells */
function MetricRow({
  label,
  values,
  format,
  higherIsBetter,
  isPro,
  showBar,
}: {
  label: string;
  values: (number | null)[];
  format: (v: number) => string;
  higherIsBetter: boolean;
  isPro: boolean;
  showBar?: boolean;
}) {
  const defined = values.filter((v): v is number => v !== null);
  const best = defined.length ? (higherIsBetter ? Math.max(...defined) : Math.min(...defined)) : 0;
  const worst = defined.length > 1 ? (higherIsBetter ? Math.min(...defined) : Math.max(...defined)) : best;
  const maxV = Math.max(...defined.map(Math.abs), 1);
  const colors = [COL_A, COL_B, COL_C];
  const cols = isPro ? 3 : 2;

  return (
    <div
      className="grid border-b border-white/[0.04] last:border-0"
      style={{ gridTemplateColumns: `180px repeat(${cols}, 1fr)` }}
    >
      {/* label */}
      <div className="flex items-center px-5 border-r border-white/[0.05]" style={{ minHeight: 72 }}>
        <span className="text-[11px] font-medium text-white/40 leading-snug">{label}</span>
      </div>

      {/* values */}
      {values.map((val, i) => {
        if (i === 2 && !isPro) {
          return <ValCell key={i} val={null} formatted="" isBest={false} isWorst={false} color={COL_C} pct={0} showBar={false} locked />;
        }
        if (val === null) return null;
        const isBest = val === best && defined.length > 1;
        const isWorst = val === worst && defined.length > 1 && best !== worst;
        const pct = Math.round((Math.abs(val) / maxV) * 100);
        return (
          <ValCell
            key={i}
            val={val}
            formatted={format(val)}
            isBest={isBest}
            isWorst={isWorst}
            color={colors[i]}
            pct={pct}
            showBar={showBar ?? false}
          />
        );
      })}
    </div>
  );
}

/** Section divider row */
function SectionRow({ label, isPro }: { label: string; isPro: boolean }) {
  const cols = isPro ? 3 : 2;
  return (
    <div
      className="grid border-b border-white/[0.05]"
      style={{
        gridTemplateColumns: `180px repeat(${cols}, 1fr)`,
        background: "rgba(255,255,255,0.018)",
      }}
    >
      <div className="col-span-full px-5 py-2.5">
        <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-white/35">{label}</span>
      </div>
    </div>
  );
}

/** Sticky column header row */
function ColHeaderRow({
  countryA,
  countryB,
  countryC,
  isPro,
}: {
  countryA: CountryWithData | null;
  countryB: CountryWithData | null;
  countryC: CountryWithData | null;
  isPro: boolean;
}) {
  const cols = isPro ? 3 : 2;
  const entries = [
    { c: countryA, col: COL_A },
    { c: countryB, col: COL_B },
    ...(isPro ? [{ c: countryC, col: COL_C }] : [{ c: null as CountryWithData | null, col: COL_C }]),
  ];

  return (
    <div
      className="sticky top-0 z-20 border-b border-white/[0.1] bg-[#050508]"
      style={{
        display: "grid",
        gridTemplateColumns: `180px repeat(${cols}, 1fr)`,
      }}
    >
      <div className="px-5 py-4" />
      {entries.map(({ c, col }, i) => {
        if (!c && !isPro && i === 2) {
          return (
            <div key={i} className="flex items-center justify-center px-5 py-4 border-l border-white/[0.05] opacity-20">
              <Lock className="w-4 h-4 text-white/50" />
            </div>
          );
        }
        if (!c) return <div key={i} className="px-5 py-4 border-l border-white/[0.05] text-white/20 text-sm">—</div>;
        return (
          <div key={i} className="px-6 py-4 border-l border-white/[0.05]">
            <div className="text-[28px] leading-none mb-1.5">{c.flagEmoji}</div>
            <div className="text-[12px] font-black uppercase tracking-[0.07em]" style={{ color: col }}>
              {c.name}
            </div>
            <div className="text-[10px] font-semibold text-white/35 tracking-widest mt-0.5">{c.currency}</div>
          </div>
        );
      })}
    </div>
  );
}

/** Visa notes card */
function VisaCard({ country, color }: { country: CountryWithData; color: string }) {
  return (
    <div className="border border-white/[0.07] bg-[#0d0d10] p-6">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xl leading-none">{country.flagEmoji}</span>
        <span className="text-[11px] font-black uppercase tracking-[0.1em]" style={{ color }}>
          {country.name}
        </span>
      </div>
      <p className="text-[12px] font-medium text-white/40 leading-[1.7] mb-4">{country.data.visaNotes}</p>
      {country.data.visaPopularRoutes?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {country.data.visaPopularRoutes.map((r: string) => (
            <span
              key={r}
              className="text-[9px] font-black px-2.5 py-1 border uppercase tracking-[0.1em]"
              style={{ color, borderColor: color + "40" }}
            >
              {r}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── select style ──────────────────────────────────────────────────────────────

const SEL =
  "appearance-none bg-[#0d0d10] border border-white/[0.1] text-white text-[13px] font-semibold outline-none cursor-pointer px-3 py-2 pr-8 transition-colors hover:border-white/20 focus:border-white/25 w-full truncate";

// ── main ──────────────────────────────────────────────────────────────────────

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

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("is_pro")
          .eq("id", session.user.id)
          .single();
        setIsPro(data?.is_pro ?? false);
      }
      setProChecked(true);
    });
  }, []);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetch("/api/countries")
      .then((r) => r.json())
      .then((data: CountryWithData[]) => {
        setAllCountries(data);
        const valid = data.map((c) => c.slug);
        const pA = searchParams.get("a");
        const pB = searchParams.get("b");
        const pC = searchParams.get("c");
        setSlugA(pA && valid.includes(pA) ? pA : "portugal");
        setSlugB(pB && valid.includes(pB) ? pB : "germany");
        setSlugC(pC && valid.includes(pC) ? pC : valid[2] ?? null);
      })
      .catch(console.error);
  }, [searchParams]);

  const countryA = allCountries.find((c) => c.slug === slugA) ?? null;
  const countryB = allCountries.find((c) => c.slug === slugB) ?? null;
  const countryC = allCountries.find((c) => c.slug === slugC) ?? null;
  const role = JOB_ROLES.find((r) => r.key === selectedRole) ?? JOB_ROLES[0];

  const globeCountries = allCountries.map((c) => ({
    slug: c.slug, name: c.name, flagEmoji: c.flagEmoji,
    lat: c.lat, lng: c.lng, moveScore: c.data.moveScore,
    salarySoftwareEngineer: c.data.salarySoftwareEngineer,
    costRentCityCentre: c.data.costRentCityCentre,
    scoreQualityOfLife: c.data.scoreQualityOfLife,
    visaDifficulty: c.data.visaDifficulty,
    incomeTaxRateMid: c.data.incomeTaxRateMid,
  }));

  const g = (c: CountryWithData | null, k: string): number | null =>
    c ? (c.data[k as keyof typeof c.data] as number) ?? null : null;

  const trio = (k: string) =>
    [g(countryA, k), g(countryB, k), isPro ? g(countryC, k) : null] as (number | null)[];

  if (!proChecked) return <div className="min-h-screen bg-[#050508]" />;

  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col" style={{ fontFamily: "Inter, sans-serif" }}>
      <Nav countries={globeCountries} onCountrySelect={() => {}} />

      {/* ── PAGE HEADER ── */}
      <div className="border-b border-white/[0.07]">
        <div className="max-w-[1100px] mx-auto px-8 pt-28 pb-10">

          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/40 mb-3">Side by Side</p>
          <h1
            className="leading-none text-white mb-3"
            style={{
              fontFamily: "var(--font-heading, 'DM Serif Display', Georgia, serif)",
              fontSize: "clamp(44px,5.5vw,68px)",
              fontWeight: 400,
            }}
          >
            Compare
          </h1>
          <p className="text-[14px] font-medium text-white/40 leading-relaxed max-w-lg mb-10">
            Stack countries against each other across salary, cost of living, tax, and visa difficulty.
          </p>

          {/* ── SELECTORS ── */}
          <div
            className="bg-[#0d0d10] border border-white/[0.09] overflow-hidden"
            style={{
              display: "grid",
              gridTemplateColumns: isPro
                ? "minmax(150px,180px) 1px minmax(120px,1fr) minmax(120px,1fr) minmax(120px,1fr) 1px auto"
                : "minmax(150px,180px) 1px minmax(120px,1fr) minmax(120px,1fr) 1px auto",
              alignItems: "stretch",
            }}
          >
            {/* Role */}
            <div className="flex flex-col justify-center gap-1.5 px-4 py-4">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">Role</span>
              <div className="relative">
                <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value as JobRole)} className={SEL}>
                  {JOB_ROLES.map((r) => <option key={r.key} value={r.key}>{r.emoji} {r.label}</option>)}
                </select>
                <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1l4 4 4-4"/></svg>
              </div>
            </div>

            {/* divider */}
            <div className="bg-white/[0.07] self-stretch my-3" />

            {/* Country A */}
            <div className="flex flex-col justify-center gap-1.5 px-4 py-4">
              <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: COL_A }} />
                Country A
              </span>
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1 min-w-0">
                  <select value={slugA ?? ""} onChange={(e) => setSlugA(e.target.value)} className={SEL}>
                    {allCountries.map((c) => <option key={c.slug} value={c.slug}>{c.flagEmoji} {c.name}</option>)}
                  </select>
                  <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1l4 4 4-4"/></svg>
                </div>
                <button
                  onClick={() => { const t = slugA; setSlugA(slugB); setSlugB(t); }}
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center border border-white/[0.09] bg-white/[0.03] hover:bg-white/[0.07] transition-colors"
                  title="Swap A ↔ B"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-white/35" />
                </button>
              </div>
            </div>

            {/* Country B */}
            <div className="flex flex-col justify-center gap-1.5 px-4 py-4">
              <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: COL_B }} />
                Country B
              </span>
              <div className="relative">
                <select value={slugB ?? ""} onChange={(e) => setSlugB(e.target.value)} className={SEL}>
                  {allCountries.map((c) => <option key={c.slug} value={c.slug}>{c.flagEmoji} {c.name}</option>)}
                </select>
                <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1l4 4 4-4"/></svg>
              </div>
            </div>

            {/* Country C */}
            {isPro ? (
              <div className="flex flex-col justify-center gap-1.5 px-4 py-4">
                <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: COL_C }} />
                  Country C
                </span>
                <div className="relative">
                  <select value={slugC ?? ""} onChange={(e) => setSlugC(e.target.value)} className={SEL}>
                    {allCountries.map((c) => <option key={c.slug} value={c.slug}>{c.flagEmoji} {c.name}</option>)}
                  </select>
                  <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1l4 4 4-4"/></svg>
                </div>
              </div>
            ) : (
              <div className="flex flex-col justify-center gap-1.5 px-4 py-4">
                <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-white/20">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 opacity-40" style={{ background: COL_C }} />
                  Country C
                </span>
                <div className="flex items-center gap-2 border border-dashed border-white/[0.08] px-3 py-2 text-[13px] font-semibold text-white/20">
                  <Lock className="w-3 h-3 flex-shrink-0 opacity-50" />
                  Pro only
                </div>
              </div>
            )}

            {/* divider */}
            <div className="bg-white/[0.07] self-stretch my-3" />

            {/* Pro CTA */}
            <div className="flex items-center px-4 py-4">
              {isPro ? (
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                  <Star className="w-3 h-3" /> Pro
                </div>
              ) : (
                <Link
                  href="/pro"
                  className="flex items-center gap-2 bg-white text-[#0a0a0a] px-4 py-2 text-[12px] font-bold tracking-wide whitespace-nowrap hover:bg-white/90 transition-colors"
                  style={{ borderRadius: 100 }}
                >
                  <Star className="w-3 h-3" fill="currentColor" />
                  Unlock Pro
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── STICKY COL HEADERS ── */}
      {countryA && countryB && (
        <ColHeaderRow countryA={countryA} countryB={countryB} countryC={countryC} isPro={isPro} />
      )}

      {/* ── TABLE + REST ── */}
      {countryA && countryB && (
        <div className="max-w-[1100px] mx-auto px-8 py-10 flex-1 w-full">

          <div className="border border-white/[0.07] overflow-hidden">

            <SectionRow label="Salary" isPro={isPro} />
            <MetricRow
              label={role.label} isPro={isPro} higherIsBetter showBar
              format={fmt}
              values={[g(countryA, role.salaryKey), g(countryB, role.salaryKey), isPro ? g(countryC, role.salaryKey) : null]}
            />

            <SectionRow label="Cost of Living" isPro={isPro} />
            <MetricRow label="Rent · city centre" isPro={isPro} higherIsBetter={false} format={(v) => fmt(v) + "/mo"} values={trio("costRentCityCentre")} />
            <MetricRow label="Groceries" isPro={isPro} higherIsBetter={false} format={(v) => fmt(v) + "/mo"} values={trio("costGroceriesMonthly")} />
            <MetricRow label="Transport" isPro={isPro} higherIsBetter={false} format={(v) => fmt(v) + "/mo"} values={trio("costTransportMonthly")} />
            <MetricRow label="Utilities" isPro={isPro} higherIsBetter={false} format={(v) => fmt(v) + "/mo"} values={trio("costUtilitiesMonthly")} />
            <MetricRow label="Eating out" isPro={isPro} higherIsBetter={false} format={(v) => fmt(v) + "/meal"} values={trio("costEatingOut")} />

            <SectionRow label="Tax" isPro={isPro} />
            <MetricRow label="Income tax (mid-bracket)" isPro={isPro} higherIsBetter={false} format={(v) => v + "%"} values={trio("incomeTaxRateMid")} />
            <MetricRow label="Social security" isPro={isPro} higherIsBetter={false} format={(v) => v + "%"} values={trio("socialSecurityRate")} />

            <SectionRow label="Quality of Life" isPro={isPro} />
            <MetricRow label="Overall" isPro={isPro} higherIsBetter showBar format={(v) => v + "/10"} values={trio("scoreQualityOfLife")} />
            <MetricRow label="Healthcare" isPro={isPro} higherIsBetter showBar format={(v) => v + "/10"} values={trio("scoreHealthcare")} />
            <MetricRow label="Safety" isPro={isPro} higherIsBetter showBar format={(v) => v + "/10"} values={trio("scoreSafety")} />
            <MetricRow label="Internet speed" isPro={isPro} higherIsBetter showBar format={(v) => v + "/10"} values={trio("scoreInternetSpeed")} />

            <SectionRow label="Visa" isPro={isPro} />
            <MetricRow label="Difficulty" isPro={isPro} higherIsBetter={false} format={(v) => `${getVisaLabel(v)} · ${v}/5`} values={trio("visaDifficulty")} />
            <MetricRow label="Move score" isPro={isPro} higherIsBetter showBar format={(v) => v + "/10"} values={trio("moveScore")} />
          </div>

          {/* ── VISA NOTES ── */}
          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/35 mt-10 mb-4">Visa Notes</p>
          <div className={`grid gap-3 ${isPro && countryC ? "grid-cols-3" : "grid-cols-2"}`}>
            <VisaCard country={countryA} color={COL_A} />
            <VisaCard country={countryB} color={COL_B} />
            {isPro && countryC && <VisaCard country={countryC} color={COL_C} />}
          </div>

          {/* ── PRO BANNER ── */}
          {!isPro && (
            <div className="mt-6 flex items-center gap-5 flex-wrap bg-[#0d0d10] border border-white/[0.07] px-6 py-5">
              <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center border border-white/[0.12] bg-white/[0.04] text-lg leading-none">
                ✦
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-[18px] font-normal text-white mb-1"
                  style={{ fontFamily: "var(--font-heading, 'DM Serif Display', Georgia, serif)" }}
                >
                  Add a third country
                </p>
                <p className="text-[12px] font-medium text-white/40 leading-relaxed">
                  Pro unlocks a third column, full visa checklists, cost-of-living breakdowns, and salary percentile data.
                </p>
              </div>
              <Link
                href="/pro"
                className="flex items-center gap-2 bg-white text-[#0a0a0a] px-5 py-2.5 text-[12px] font-bold tracking-wide whitespace-nowrap hover:bg-white/90 transition-colors"
                style={{ borderRadius: 100 }}
              >
                <Star className="w-3 h-3" fill="currentColor" />
                Get Pro · €19.99
              </Link>
            </div>
          )}

          {/* ── BOTTOM LINKS ── */}
          <div className="mt-10 pt-8 border-t border-white/[0.07] flex flex-wrap gap-6">
            {[
              { c: countryA, col: COL_A },
              { c: countryB, col: COL_B },
              ...(isPro && countryC ? [{ c: countryC, col: COL_C }] : []),
            ].map(({ c, col }) => (
              <Link
                key={c.slug}
                href={`/country/${c.slug}`}
                className="text-[11px] font-bold uppercase tracking-widest hover:opacity-60 transition-opacity"
                style={{ color: col }}
              >
                {c.flagEmoji} Full {c.name} report →
              </Link>
            ))}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}