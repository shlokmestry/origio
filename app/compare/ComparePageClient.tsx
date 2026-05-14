"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRightLeft, Lock, Star } from "lucide-react";
import { CountryWithData, JobRole, JOB_ROLES } from "@/types";
import { supabase } from "@/lib/supabase";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import Link from "next/link";

// ── constants ────────────────────────────────────────────────────────────────

const COL_A = "#4de6cc";
const COL_B = "#f0c84a";
const COL_C = "#c4b5fd";

// ── helpers ──────────────────────────────────────────────────────────────────

function getVisaLabel(d: number) {
  if (d <= 1) return "Easy";
  if (d <= 2) return "Straightforward";
  if (d <= 3) return "Moderate";
  if (d <= 4) return "Difficult";
  return "Very hard";
}

// ── MiniBar ──────────────────────────────────────────────────────────────────

function MiniBar({ pct, color, show }: { pct: number; color: string; show: boolean }) {
  if (!show) return null;
  return (
    <div className="mt-1.5 h-0.5 w-16 bg-white/5 overflow-hidden">
      <div
        className="h-full transition-all duration-500"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

// ── MetricCell ───────────────────────────────────────────────────────────────

function MetricCell({
  value,
  formatted,
  isBest,
  isWorst,
  color,
  pct,
  showBar,
  locked,
}: {
  value: number | null;
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
      <div className="px-5 py-3.5 border-l border-white/[0.04] relative overflow-hidden flex flex-col justify-center">
        <div className="blur-sm select-none pointer-events-none">
          <div className="font-serif text-[21px] leading-tight text-white/20">—</div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 flex items-center justify-center border border-white/[0.14] bg-white/[0.04]">
            <Lock className="w-2.5 h-2.5 text-white/35" />
          </div>
        </div>
      </div>
    );
  }

  if (value === null) return null;

  const textColor = isBest ? color : isWorst ? "rgba(255,255,255,0.2)" : "#fff";

  return (
    <div
      className="px-5 py-3.5 border-l border-white/[0.04] flex flex-col justify-center transition-colors duration-200"
      style={{ background: isBest ? "rgba(255,255,255,0.025)" : undefined }}
    >
      <div className="font-serif text-[21px] leading-tight" style={{ color: textColor }}>
        {formatted}
      </div>
      {isBest ? (
        <span
          className="mt-1 inline-block text-[8px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 border"
          style={{ color, borderColor: color + "55" }}
        >
          best
        </span>
      ) : (
        <div className="h-[20px]" />
      )}
      <MiniBar pct={pct} color={isBest ? color : "rgba(255,255,255,0.1)"} show={showBar} />
    </div>
  );
}

// ── MetricRow ─────────────────────────────────────────────────────────────────

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
  const best = higherIsBetter ? Math.max(...defined) : Math.min(...defined);
  const worst = higherIsBetter ? Math.min(...defined) : Math.max(...defined);
  const maxV = Math.max(...defined.map(Math.abs)) || 1;
  const colors = [COL_A, COL_B, COL_C];

  const cols = isPro ? 3 : 2;

  return (
    <div
      className="grid border-b border-white/[0.04] last:border-0"
      style={{ gridTemplateColumns: `168px repeat(${cols}, 1fr)` }}
    >
      <div className="px-5 py-3.5 flex items-start pt-4 border-r border-white/[0.04]">
        <span className="text-[11px] font-semibold text-white/40 leading-snug">{label}</span>
      </div>

      {values.map((val, i) => {
        if (i === 2 && !isPro) {
          return <MetricCell key={i} value={0} formatted="" isBest={false} isWorst={false} color={COL_C} pct={0} showBar={false} locked />;
        }
        if (val === null) return null;
        const isBest = val === best && defined.length > 1;
        const isWorst = val === worst && defined.length > 1 && best !== worst;
        const pct = Math.round((Math.abs(val) / maxV) * 100);
        return (
          <MetricCell
            key={i}
            value={val}
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

// ── SectionHeader ─────────────────────────────────────────────────────────────

function SectionHeader({ label, isPro }: { label: string; isPro: boolean }) {
  const cols = isPro ? 3 : 2;
  return (
    <div
      className="grid border-b border-white/[0.06] bg-white/[0.022]"
      style={{ gridTemplateColumns: `168px repeat(${cols}, 1fr)` }}
    >
      <div className="col-span-full px-5 py-2.5">
        <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.22em]">{label}</p>
      </div>
    </div>
  );
}

// ── ColHeader ─────────────────────────────────────────────────────────────────

function ColHeader({
  country,
  color,
  locked,
}: {
  country: CountryWithData | null;
  color: string;
  locked?: boolean;
}) {
  if (locked) {
    return (
      <div className="px-5 py-4 border-l border-white/[0.04] flex items-center justify-center opacity-25">
        <Lock className="w-4 h-4 text-white/40" />
      </div>
    );
  }
  if (!country) return <div className="px-5 py-4 border-l border-white/[0.04] text-white/20">—</div>;

  return (
    <div className="px-5 py-4 border-l border-white/[0.04]">
      <div className="text-3xl mb-1.5 leading-none">{country.flagEmoji}</div>
      <div className="text-[13px] font-extrabold uppercase tracking-wide" style={{ color }}>
        {country.name}
      </div>
      <div className="text-[10px] font-semibold text-white/40 mt-0.5 tracking-widest">{country.currency}</div>
    </div>
  );
}

// ── VisaCard ──────────────────────────────────────────────────────────────────

function VisaCard({ country, color }: { country: CountryWithData; color: string }) {
  return (
    <div className="bg-[#0d0d10] border border-white/[0.08] p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{country.flagEmoji}</span>
        <span className="text-[12px] font-extrabold uppercase tracking-[0.09em]" style={{ color }}>
          {country.name}
        </span>
      </div>
      <p className="text-[13px] font-medium text-white/40 leading-[1.68] mb-4">{country.data.visaNotes}</p>
      {country.data.visaPopularRoutes?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {country.data.visaPopularRoutes.map((r: string) => (
            <span
              key={r}
              className="text-[10px] font-bold px-3 py-1 border uppercase tracking-[0.08em]"
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

// ── Main ──────────────────────────────────────────────────────────────────────

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
      .then((res) => res.json())
      .then((data: CountryWithData[]) => {
        setAllCountries(data);
        const validSlugs = data.map((c) => c.slug);
        const pA = searchParams.get("a");
        const pB = searchParams.get("b");
        const pC = searchParams.get("c");
        setSlugA(pA && validSlugs.includes(pA) ? pA : "portugal");
        setSlugB(pB && validSlugs.includes(pB) ? pB : "germany");
        setSlugC(pC && validSlugs.includes(pC) ? pC : validSlugs[2] ?? null);
      })
      .catch((err) => console.error("Failed to fetch countries:", err));
  }, [searchParams]);

  const countryA = allCountries.find((c) => c.slug === slugA) ?? null;
  const countryB = allCountries.find((c) => c.slug === slugB) ?? null;
  const countryC = allCountries.find((c) => c.slug === slugC) ?? null;
  const currentRole = JOB_ROLES.find((r) => r.key === selectedRole) ?? JOB_ROLES[0];

  const globeCountries = allCountries.map((c) => ({
    slug: c.slug,
    name: c.name,
    flagEmoji: c.flagEmoji,
    lat: c.lat,
    lng: c.lng,
    moveScore: c.data.moveScore,
    salarySoftwareEngineer: c.data.salarySoftwareEngineer,
    costRentCityCentre: c.data.costRentCityCentre,
    scoreQualityOfLife: c.data.scoreQualityOfLife,
    visaDifficulty: c.data.visaDifficulty,
    incomeTaxRateMid: c.data.incomeTaxRateMid,
  }));

  const v = (country: CountryWithData | null, key: string) =>
    country ? (country.data[key as keyof typeof country.data] as number) : null;

  const cols = isPro ? 3 : 2;
  const gridCols = `168px repeat(${cols}, 1fr)`;

  const selectClass =
    "w-full appearance-none bg-white/[0.04] border border-white/[0.08] px-3 py-2.5 text-sm font-semibold text-white outline-none cursor-pointer transition-colors hover:border-white/20 focus:border-white/25 focus:bg-white/[0.06]";

  if (!proChecked) return <div className="min-h-screen bg-[#050508]" />;

  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Nav countries={globeCountries} onCountrySelect={() => {}} />

      {/* ── Page header ── */}
      <div className="border-b border-white/[0.08]">
        <div className="max-w-[1060px] mx-auto px-10 pt-28 pb-10">
          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/40 mb-3">
            Side by Side
          </p>
          <h1
            className="text-[clamp(40px,5vw,60px)] font-normal leading-none text-white mb-3"
            style={{ fontFamily: "var(--font-heading, 'DM Serif Display', Georgia, serif)" }}
          >
            Compare
          </h1>
          <p className="text-[14px] font-medium text-white/40 leading-relaxed max-w-lg mb-10">
            Stack countries against each other across salary, cost of living, tax, and visa difficulty.
          </p>

          {/* ── Selectors card ── */}
          <div
            className="bg-[#0d0d10] border border-white/[0.08] overflow-hidden mb-8"
            style={{
              display: "grid",
              gridTemplateColumns: isPro
                ? "auto 1px 1fr 1fr 1fr 1px auto"
                : "auto 1px 1fr 1fr 1px auto",
              alignItems: "stretch",
            }}
          >
            {/* Role */}
            <div className="flex flex-col justify-center gap-2 px-5 py-5 min-w-0">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
                Role
              </span>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as JobRole)}
                className={selectClass}
              >
                {JOB_ROLES.map((r) => (
                  <option key={r.key} value={r.key}>
                    {r.emoji} {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* divider */}
            <div className="bg-white/[0.08] self-stretch my-4" />

            {/* Country A */}
            <div className="flex flex-col justify-center gap-2 px-5 py-5 min-w-0">
              <span className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
                <span className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ background: COL_A }} />
                Country A
              </span>
              <div className="flex items-center gap-1.5">
                <select
                  value={slugA ?? ""}
                  onChange={(e) => setSlugA(e.target.value)}
                  className={selectClass + " flex-1"}
                >
                  {allCountries.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.flagEmoji} {c.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    const t = slugA;
                    setSlugA(slugB);
                    setSlugB(t);
                  }}
                  className="w-9 h-9 flex-shrink-0 flex items-center justify-center border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                  title="Swap A ↔ B"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-white/40" />
                </button>
              </div>
            </div>

            {/* Country B */}
            <div className="flex flex-col justify-center gap-2 px-5 py-5 min-w-0">
              <span className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
                <span className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ background: COL_B }} />
                Country B
              </span>
              <select
                value={slugB ?? ""}
                onChange={(e) => setSlugB(e.target.value)}
                className={selectClass}
              >
                {allCountries.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.flagEmoji} {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Country C — pro only */}
            {isPro ? (
              <div className="flex flex-col justify-center gap-2 px-5 py-5 min-w-0">
                <span className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
                  <span className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ background: COL_C }} />
                  Country C
                </span>
                <select
                  value={slugC ?? ""}
                  onChange={(e) => setSlugC(e.target.value)}
                  className={selectClass}
                >
                  {allCountries.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.flagEmoji} {c.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <></>
            )}

            {/* divider */}
            <div className="bg-white/[0.08] self-stretch my-4" />

            {/* Pro CTA or pro badge */}
            <div className="flex items-center px-5 py-5">
              {isPro ? (
                <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  <Star className="w-3 h-3" /> Pro
                </div>
              ) : (
                <Link
                  href="/pro"
                  className="flex items-center gap-2 bg-white text-[#0a0a0a] px-5 py-2.5 text-[12px] font-bold tracking-[0.04em] whitespace-nowrap hover:bg-white/90 transition-colors"
                >
                  <Star className="w-3 h-3" />
                  Unlock Pro
                </Link>
              )}
            </div>
          </div>

          {/* Free upsell strip */}
          {!isPro && (
            <div className="flex items-center gap-4 border border-white/[0.08] bg-white/[0.02] px-5 py-3.5 mb-0">
              <Lock className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
              <p className="text-[11px] text-white/40 flex-1">
                Add a third country. Compare salary, taxes, and cost of living side-by-side with Pro.
              </p>
              <Link
                href="/pro"
                className="flex items-center gap-1.5 bg-white text-[#0a0a0a] px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap hover:bg-white/90 transition-colors"
              >
                Get Pro · €19.99
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Sticky col headers ── */}
      {countryA && countryB && (
        <div
          className="sticky top-0 z-20 border-b border-white/[0.14] bg-[#050508]"
          style={{ gridTemplateColumns: gridCols, display: "grid" }}
        >
          <div className="max-w-[1060px] mx-auto px-10 w-full" style={{ display: "contents" }}>
            <div className="px-5 py-4" />
            <ColHeader country={countryA} color={COL_A} />
            <ColHeader country={countryB} color={COL_B} />
            {isPro ? (
              <ColHeader country={countryC} color={COL_C} />
            ) : (
              <ColHeader country={null} color={COL_C} locked />
            )}
          </div>
        </div>
      )}

      {/* ── Compare table ── */}
      {countryA && countryB && (
        <div className="max-w-[1060px] mx-auto px-10 py-10 flex-1 w-full">
          <div className="border border-white/[0.08] overflow-hidden">

            {/* ── SALARY ── */}
            <SectionHeader label="Salary" isPro={isPro} />
            <MetricRow
              label={currentRole.label}
              isPro={isPro}
              higherIsBetter
              showBar
              format={(v) => v.toLocaleString()}
              values={[
                v(countryA, currentRole.salaryKey),
                v(countryB, currentRole.salaryKey),
                isPro ? v(countryC, currentRole.salaryKey) : null,
              ]}
            />

            {/* ── COST OF LIVING ── */}
            <SectionHeader label="Cost of Living — Monthly" isPro={isPro} />
            <MetricRow label="Rent · city centre" isPro={isPro} higherIsBetter={false}
              format={(v) => v.toLocaleString() + "/mo"}
              values={[v(countryA, "costRentCityCentre"), v(countryB, "costRentCityCentre"), isPro ? v(countryC, "costRentCityCentre") : null]} />
            <MetricRow label="Groceries" isPro={isPro} higherIsBetter={false}
              format={(v) => v.toLocaleString() + "/mo"}
              values={[v(countryA, "costGroceriesMonthly"), v(countryB, "costGroceriesMonthly"), isPro ? v(countryC, "costGroceriesMonthly") : null]} />
            <MetricRow label="Transport" isPro={isPro} higherIsBetter={false}
              format={(v) => v.toLocaleString() + "/mo"}
              values={[v(countryA, "costTransportMonthly"), v(countryB, "costTransportMonthly"), isPro ? v(countryC, "costTransportMonthly") : null]} />
            <MetricRow label="Utilities" isPro={isPro} higherIsBetter={false}
              format={(v) => v.toLocaleString() + "/mo"}
              values={[v(countryA, "costUtilitiesMonthly"), v(countryB, "costUtilitiesMonthly"), isPro ? v(countryC, "costUtilitiesMonthly") : null]} />
            <MetricRow label="Eating out / meal" isPro={isPro} higherIsBetter={false}
              format={(v) => v.toLocaleString() + "/meal"}
              values={[v(countryA, "costEatingOut"), v(countryB, "costEatingOut"), isPro ? v(countryC, "costEatingOut") : null]} />

            {/* ── TAX ── */}
            <SectionHeader label="Tax" isPro={isPro} />
            <MetricRow label="Income tax — mid bracket" isPro={isPro} higherIsBetter={false}
              format={(v) => v + "%"}
              values={[v(countryA, "incomeTaxRateMid"), v(countryB, "incomeTaxRateMid"), isPro ? v(countryC, "incomeTaxRateMid") : null]} />
            <MetricRow label="Social security" isPro={isPro} higherIsBetter={false}
              format={(v) => v + "%"}
              values={[v(countryA, "socialSecurityRate"), v(countryB, "socialSecurityRate"), isPro ? v(countryC, "socialSecurityRate") : null]} />

            {/* ── QUALITY OF LIFE ── */}
            <SectionHeader label="Quality of Life" isPro={isPro} />
            <MetricRow label="Overall" isPro={isPro} higherIsBetter showBar
              format={(v) => v + "/10"}
              values={[v(countryA, "scoreQualityOfLife"), v(countryB, "scoreQualityOfLife"), isPro ? v(countryC, "scoreQualityOfLife") : null]} />
            <MetricRow label="Healthcare" isPro={isPro} higherIsBetter showBar
              format={(v) => v + "/10"}
              values={[v(countryA, "scoreHealthcare"), v(countryB, "scoreHealthcare"), isPro ? v(countryC, "scoreHealthcare") : null]} />
            <MetricRow label="Safety" isPro={isPro} higherIsBetter showBar
              format={(v) => v + "/10"}
              values={[v(countryA, "scoreSafety"), v(countryB, "scoreSafety"), isPro ? v(countryC, "scoreSafety") : null]} />
            <MetricRow label="Internet speed" isPro={isPro} higherIsBetter showBar
              format={(v) => v + "/10"}
              values={[v(countryA, "scoreInternetSpeed"), v(countryB, "scoreInternetSpeed"), isPro ? v(countryC, "scoreInternetSpeed") : null]} />

            {/* ── VISA ── */}
            <SectionHeader label="Visa" isPro={isPro} />
            <MetricRow label="Difficulty (1 = easy)" isPro={isPro} higherIsBetter={false}
              format={(v) => `${getVisaLabel(v)} · ${v}/5`}
              values={[v(countryA, "visaDifficulty"), v(countryB, "visaDifficulty"), isPro ? v(countryC, "visaDifficulty") : null]} />
            <MetricRow label="Move score" isPro={isPro} higherIsBetter showBar
              format={(v) => v + "/10"}
              values={[v(countryA, "moveScore"), v(countryB, "moveScore"), isPro ? v(countryC, "moveScore") : null]} />
          </div>

          {/* ── Visa notes ── */}
          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/40 mt-10 mb-4">
            Visa Notes
          </p>
          <div className={`grid gap-3.5 ${isPro && countryC ? "grid-cols-3" : "grid-cols-2"}`}>
            <VisaCard country={countryA} color={COL_A} />
            <VisaCard country={countryB} color={COL_B} />
            {isPro && countryC && <VisaCard country={countryC} color={COL_C} />}
          </div>

          {/* ── Pro banner (free only) ── */}
          {!isPro && (
            <div className="mt-7 flex items-center gap-5 flex-wrap bg-[#0d0d10] border border-white/[0.08] px-6 py-5">
              <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center border border-white/[0.14] bg-white/[0.05] text-lg">
                ✦
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-[19px] font-normal text-white mb-1"
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
                className="flex items-center gap-2 bg-white text-[#0a0a0a] px-5 py-2.5 text-[12px] font-bold tracking-[0.04em] hover:bg-white/90 transition-colors whitespace-nowrap"
              >
                Get Pro · €19.99
              </Link>
            </div>
          )}

          {/* ── Bottom links ── */}
          <div className="mt-10 pt-8 border-t border-white/[0.08] flex flex-wrap gap-5">
            {[
              { country: countryA, color: COL_A },
              { country: countryB, color: COL_B },
              ...(isPro && countryC ? [{ country: countryC, color: COL_C }] : []),
            ].map(({ country, color }) => (
              <Link
                key={country.slug}
                href={`/country/${country.slug}`}
                className="text-[11px] font-bold uppercase tracking-widest transition-colors hover:opacity-70"
                style={{ color }}
              >
                {country.flagEmoji} Full {country.name} report →
              </Link>
            ))}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}