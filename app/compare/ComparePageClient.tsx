"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { ArrowRightLeft, Lock, Star } from "lucide-react";
import { CountryWithData, JobRole, JOB_ROLES } from "@/types";
import { supabase } from "@/lib/supabase";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import Link from "next/link";
import { getVisaLabel } from "@/lib/utils";
import { getPassportStrength, PASSPORT_TIER_LABEL, resolveEffectivePassports } from "@/lib/wizard";

// ── constants ─────────────────────────────────────────────────────────────────

const COL_A = "#4de6cc";
const COL_B = "#f0c84a";
const COL_C = "#c4b5fd";

const LABEL_W = 200; // px — label column width, shared everywhere

// ── helpers ───────────────────────────────────────────────────────────────────

// ── ChevronDown SVG ───────────────────────────────────────────────────────────

const Chevron = () => (
  <svg
    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30"
    viewBox="0 0 10 6" fill="none" stroke="currentColor"
    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
  >
    <path d="M1 1l4 4 4-4" />
  </svg>
);

// ── shared select className ───────────────────────────────────────────────────

const SEL = [
  "appearance-none w-full truncate",
  "bg-[#111114] border border-white/[0.1]",
  "text-white text-[13px] font-semibold",
  "outline-none cursor-pointer",
  "px-3 py-2 pr-8",
  "hover:border-white/20 focus:border-white/25 transition-colors",
].join(" ");

// ── ValCell ───────────────────────────────────────────────────────────────────

function ValCell({
  formatted,
  isBest,
  isWorst,
  color,
  pct,
  showBar,
  locked,
}: {
  formatted?: string;
  isBest: boolean;
  isWorst: boolean;
  color: string;
  pct: number;
  showBar: boolean;
  locked?: boolean;
}) {
  const baseClass = "border-l border-white/[0.05] flex flex-col justify-center px-6";
  const MIN_H = 80;

  if (locked) {
    return (
      <div className={baseClass + " items-center"} style={{ minHeight: MIN_H }}>
        <div className="w-7 h-7 flex items-center justify-center border border-white/[0.12] bg-white/[0.04]">
          <Lock className="w-3 h-3 text-white/30" />
        </div>
      </div>
    );
  }

  const valColor = isBest ? color : isWorst ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.82)";

  return (
    <div
      className={baseClass}
      style={{
        minHeight: MIN_H,
        background: isBest ? "rgba(255,255,255,0.016)" : undefined,
      }}
    >
      {/* number */}
      <div
        style={{
          fontFamily: "var(--font-heading, 'DM Serif Display', Georgia, serif)",
          fontSize: 22,
          lineHeight: 1,
          color: valColor,
          marginBottom: 4,
        }}
      >
        {formatted}
      </div>

      {/* best pill or spacer */}
      {isBest ? (
        <span
          style={{
            display: "inline-block",
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color,
            border: `1px solid ${color}55`,
            padding: "2px 6px",
            marginBottom: 6,
            width: "fit-content",
          }}
        >
          best
        </span>
      ) : (
        <div style={{ height: 20 }} />
      )}

      {/* mini bar */}
      {showBar && (
        <div style={{ height: 1, width: 56, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: isBest ? color : "rgba(255,255,255,0.1)",
              transition: "width 0.4s ease",
            }}
          />
        </div>
      )}
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
  const best = defined.length ? (higherIsBetter ? Math.max(...defined) : Math.min(...defined)) : 0;
  const worst =
    defined.length > 1 ? (higherIsBetter ? Math.min(...defined) : Math.max(...defined)) : best;
  const maxV = Math.max(...defined.map(Math.abs), 1);

  const gridCols = `${LABEL_W}px repeat(3, 1fr)`;

  return (
    <div className="grid border-b border-white/[0.04] last:border-b-0" style={{ gridTemplateColumns: gridCols }}>
      {/* label */}
      <div
        className="border-r border-white/[0.05] flex items-center px-5"
        style={{ minHeight: 80 }}
      >
        <span className="text-[11px] font-medium text-white/40 leading-snug">{label}</span>
      </div>

      {/* col A */}
      {(() => {
        const val = values[0];
        if (val === null) return <div className="border-l border-white/[0.05]" />;
        const isBest = val === best && defined.length > 1;
        const isWorst = val === worst && defined.length > 1 && best !== worst;
        return (
          <ValCell
            formatted={format(val)}
            isBest={isBest} isWorst={isWorst} color={COL_A}
            pct={Math.round((Math.abs(val) / maxV) * 100)}
            showBar={showBar ?? false}
          />
        );
      })()}

      {/* col B */}
      {(() => {
        const val = values[1];
        if (val === null) return <div className="border-l border-white/[0.05]" />;
        const isBest = val === best && defined.length > 1;
        const isWorst = val === worst && defined.length > 1 && best !== worst;
        return (
          <ValCell
            formatted={format(val)}
            isBest={isBest} isWorst={isWorst} color={COL_B}
            pct={Math.round((Math.abs(val) / maxV) * 100)}
            showBar={showBar ?? false}
          />
        );
      })()}

      {/* col C — locked or real */}
      {isPro ? (() => {
        const val = values[2];
        if (val === null) return <div className="border-l border-white/[0.05]" />;
        const isBest = val === best && defined.length > 1;
        const isWorst = val === worst && defined.length > 1 && best !== worst;
        return (
          <ValCell
            formatted={format(val)}
            isBest={isBest} isWorst={isWorst} color={COL_C}
            pct={Math.round((Math.abs(val) / maxV) * 100)}
            showBar={showBar ?? false}
          />
        );
      })() : (
        <ValCell formatted="" isBest={false} isWorst={false} color={COL_C} pct={0} showBar={false} locked />
      )}
    </div>
  );
}

// ── SectionRow ────────────────────────────────────────────────────────────────

function SectionRow({ label, isPro }: { label: string; isPro: boolean }) {
  return (
    <div
      className="grid border-b border-white/[0.05]"
      style={{
        gridTemplateColumns: `${LABEL_W}px repeat(3, 1fr)`,
        background: "rgba(255,255,255,0.016)",
      }}
    >
      <div className="col-span-full px-5 py-2.5">
        <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-white/35">{label}</span>
      </div>
    </div>
  );
}

// ── VisaCard ──────────────────────────────────────────────────────────────────

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

// ── Main ──────────────────────────────────────────────────────────────────────

export default function ComparePageClient() {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [allCountries, setAllCountries] = useState<CountryWithData[]>([]);
  const [slugA, setSlugA] = useState<string | null>(null);
  const [slugB, setSlugB] = useState<string | null>(null);
  const [slugC, setSlugC] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<JobRole>("softwareEngineer");
  const [isPro, setIsPro] = useState(false);
  const [passportCtx, setPassportCtx] = useState<{ tier: 1|2|3|4; rawTier: 1|2|3|4; upgraded: boolean; hasDual: boolean } | null>(null);
  // FIX: start true so we never render a black screen while checking
  const [proChecked, setProChecked] = useState(true);

  // FIX: re-run on pathname change so soft nav works
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("is_pro, passport_slug, second_passport_slug")
          .eq("id", session.user.id)
          .single();
        setIsPro(data?.is_pro ?? false);
        // build passport context for visa-adjusted display
        if (data?.passport_slug) {
          const { primary, secondary } = resolveEffectivePassports(data.passport_slug, data.second_passport_slug ?? undefined);
          const tier = Math.min(getPassportStrength(primary), secondary ? getPassportStrength(secondary) : 4) as 1|2|3|4;
          const rawTier = getPassportStrength(data.passport_slug);
          setPassportCtx({ tier, rawTier, upgraded: !!secondary && tier < rawTier, hasDual: !!data.second_passport_slug });
        } else {
          // fallback: try sessionStorage answers
          try {
            const raw = sessionStorage.getItem("wizardAnswers");
            if (raw) {
              const a = JSON.parse(raw);
              if (a?.passport) {
                const { primary, secondary } = resolveEffectivePassports(a.passport.toLowerCase(), (a.secondPassport ?? "").toLowerCase() || undefined);
                const tier = Math.min(getPassportStrength(primary), secondary ? getPassportStrength(secondary) : 4) as 1|2|3|4;
                setPassportCtx({ tier, rawTier: getPassportStrength(a.passport.toLowerCase()), upgraded: !!secondary && tier < getPassportStrength(a.passport.toLowerCase()), hasDual: !!a.secondPassport });
              }
            }
          } catch { /* ignore */ }
        }
      } else {
        setIsPro(false);
        // anon: try sessionStorage for passport context
        try {
          const raw = sessionStorage.getItem("wizardAnswers");
          if (raw) {
            const a = JSON.parse(raw);
            if (a?.passport) {
              const { primary, secondary } = resolveEffectivePassports(a.passport.toLowerCase(), (a.secondPassport ?? "").toLowerCase() || undefined);
              const tier = Math.min(getPassportStrength(primary), secondary ? getPassportStrength(secondary) : 4) as 1|2|3|4;
              setPassportCtx({ tier, rawTier: getPassportStrength(a.passport.toLowerCase()), upgraded: !!secondary && tier < getPassportStrength(a.passport.toLowerCase()), hasDual: !!a.secondPassport });
            }
          }
        } catch { /* ignore */ }
      }
      setProChecked(true);
    });
  }, [pathname]); // re-check on every nav

  // FIX: removed fetchedRef so countries re-fetch on soft nav
  useEffect(() => {
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
  }, [pathname, searchParams]); // re-fetch on every nav

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
    c ? ((c.data as unknown as Record<string, unknown>)[k] as number) ?? null : null;

  const trio = (k: string): (number | null)[] => [
    g(countryA, k),
    g(countryB, k),
    isPro ? g(countryC, k) : null,
  ];

  const TABLE_GRID = `${LABEL_W}px repeat(3, 1fr)`;

  // FIX: removed black-screen guard — render shell immediately, data fills in
  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col" style={{ fontFamily: "Inter, sans-serif" }}>
      <style>{`
        @media (max-width: 700px) {
          .cmp-selectors-grid { grid-template-columns: 1fr 1fr !important; }
          .cmp-table-outer { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .cmp-table-inner { min-width: 580px; }
          .cmp-visa-grid   { grid-template-columns: 1fr !important; }
          .cmp-page-header { padding: 100px 20px 24px !important; }
          .cmp-table-wrap  { padding: 20px 16px 40px !important; }
        }
        @media (max-width: 480px) {
          .cmp-selectors-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <Nav countries={globeCountries} onCountrySelect={() => {}} />

      {/* ── PAGE HEADER ── */}
      <div className="border-b border-white/[0.07]">
        <div className="cmp-page-header max-w-[1100px] mx-auto px-8 pt-28 pb-10">
          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/40 mb-3">
            Side by Side
          </p>
          <h1
            style={{
              fontFamily: "var(--font-heading, 'DM Serif Display', Georgia, serif)",
              fontSize: "clamp(44px, 5.5vw, 68px)",
              fontWeight: 400,
              lineHeight: 1,
              color: "#fff",
              marginBottom: 12,
            }}
          >
            Compare
          </h1>
          <p className="text-[14px] font-medium text-white/40 leading-relaxed max-w-lg mb-10">
            Stack countries against each other across salary, cost of living, tax, and visa difficulty.
          </p>

          {/* ── SELECTORS CARD ── */}
          <div className="bg-[#0d0d10] border border-white/[0.09] p-5 mb-0">
            <div
              className="cmp-selectors-grid grid gap-4 mb-4"
              style={{
                gridTemplateColumns: isPro
                  ? "1fr 1fr 1fr 1fr"
                  : "1fr 1fr 1fr",
              }}
            >
              {/* Role */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">Role</span>
                <div className="relative">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as JobRole)}
                    className={SEL}
                  >
                    {JOB_ROLES.map((r) => (
                      <option key={r.key} value={r.key}>{r.emoji} {r.label}</option>
                    ))}
                  </select>
                  <Chevron />
                </div>
              </div>

              {/* Country A */}
              <div className="flex flex-col gap-1.5">
                <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: COL_A }} />
                  Country A
                </span>
                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1 min-w-0">
                    <select
                      value={slugA ?? ""}
                      onChange={(e) => setSlugA(e.target.value)}
                      className={SEL}
                    >
                      {allCountries.map((c) => (
                        <option key={c.slug} value={c.slug}>{c.flagEmoji} {c.name}</option>
                      ))}
                    </select>
                    <Chevron />
                  </div>
                  <button
                    onClick={() => { const t = slugA; setSlugA(slugB); setSlugB(t); }}
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.08] transition-colors"
                    title="Swap A ↔ B"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-white/35" />
                  </button>
                </div>
              </div>

              {/* Country B */}
              <div className="flex flex-col gap-1.5">
                <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: COL_B }} />
                  Country B
                </span>
                <div className="relative">
                  <select
                    value={slugB ?? ""}
                    onChange={(e) => setSlugB(e.target.value)}
                    className={SEL}
                  >
                    {allCountries.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.flagEmoji} {c.name}</option>
                    ))}
                  </select>
                  <Chevron />
                </div>
              </div>

              {/* Country C — pro only */}
              {isPro ? (
                <div className="flex flex-col gap-1.5">
                  <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: COL_C }} />
                    Country C
                  </span>
                  <div className="relative">
                    <select
                      value={slugC ?? ""}
                      onChange={(e) => setSlugC(e.target.value)}
                      className={SEL}
                    >
                      {allCountries.map((c) => (
                        <option key={c.slug} value={c.slug}>{c.flagEmoji} {c.name}</option>
                      ))}
                    </select>
                    <Chevron />
                  </div>
                </div>
              ) : null}
            </div>

            {/* Row 2: Pro CTA */}
            <div className="flex items-center justify-between pt-3 border-t border-white/[0.07]">
              {!isPro ? (
                <>
                  <p className="text-[11px] text-white/35 font-medium">
                    Add a third country with Pro.
                  </p>
                  <Link
                    href="/pro"
                    className="flex items-center gap-2 bg-white text-[#0a0a0a] px-5 py-2 text-[12px] font-bold tracking-wide whitespace-nowrap hover:bg-white/90 transition-colors"
                    style={{ borderRadius: 100 }}
                  >
                    <Star className="w-3.5 h-3.5" fill="currentColor" />
                    Unlock Pro
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                  <Star className="w-3 h-3" /> Pro active
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── STICKY COL HEADERS ── */}
      {countryA && countryB && (
        <div className="sticky top-0 z-20 border-b border-white/[0.1] bg-[#050508]">
          <div className="max-w-[1100px] mx-auto px-8">
            <div style={{ display: "grid", gridTemplateColumns: TABLE_GRID }}>
              <div style={{ minHeight: 72 }} />

              {/* Country A header */}
              <div className="border-l border-white/[0.05] px-6 py-4">
                <div style={{ fontSize: 26, lineHeight: 1, marginBottom: 6 }}>{countryA.flagEmoji}</div>
                <div style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.07em", color: COL_A }}>
                  {countryA.name}
                </div>
                <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", marginTop: 2 }}>
                  {countryA.currency}
                </div>
              </div>

              {/* Country B header */}
              <div className="border-l border-white/[0.05] px-6 py-4">
                <div style={{ fontSize: 26, lineHeight: 1, marginBottom: 6 }}>{countryB.flagEmoji}</div>
                <div style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.07em", color: COL_B }}>
                  {countryB.name}
                </div>
                <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", marginTop: 2 }}>
                  {countryB.currency}
                </div>
              </div>

              {/* Country C header */}
              {isPro && countryC ? (
                <div className="border-l border-white/[0.05] px-6 py-4">
                  <div style={{ fontSize: 26, lineHeight: 1, marginBottom: 6 }}>{countryC.flagEmoji}</div>
                  <div style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.07em", color: COL_C }}>
                    {countryC.name}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", marginTop: 2 }}>
                    {countryC.currency}
                  </div>
                </div>
              ) : (
                <div className="border-l border-white/[0.05] flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 opacity-25">
                    <Lock className="w-4 h-4 text-white/50" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TABLE ── */}
      {countryA && countryB && (
        <div className="cmp-table-wrap max-w-[1100px] mx-auto px-8 py-10 flex-1 w-full">
          <div className="cmp-table-outer">
            <div className="cmp-table-inner border border-white/[0.07] overflow-hidden">

            <SectionRow label="Salary" isPro={isPro} />
            <MetricRow
              label={role.label} isPro={isPro} higherIsBetter showBar
              format={(v) => v.toLocaleString()}
              values={[g(countryA, role.salaryKey), g(countryB, role.salaryKey), isPro ? g(countryC, role.salaryKey) : null]}
            />

            <SectionRow label="Cost of Living" isPro={isPro} />
            <MetricRow label="Rent · city centre" isPro={isPro} higherIsBetter={false} format={(v) => v.toLocaleString() + "/mo"} values={trio("costRentCityCentre")} />
            <MetricRow label="Groceries" isPro={isPro} higherIsBetter={false} format={(v) => v.toLocaleString() + "/mo"} values={trio("costGroceriesMonthly")} />
            <MetricRow label="Transport" isPro={isPro} higherIsBetter={false} format={(v) => v.toLocaleString() + "/mo"} values={trio("costTransportMonthly")} />
            <MetricRow label="Utilities" isPro={isPro} higherIsBetter={false} format={(v) => v.toLocaleString() + "/mo"} values={trio("costUtilitiesMonthly")} />
            <MetricRow label="Eating out" isPro={isPro} higherIsBetter={false} format={(v) => v.toLocaleString() + "/meal"} values={trio("costEatingOut")} />

            <SectionRow label="Tax" isPro={isPro} />
            <MetricRow label="Income tax (mid-bracket)" isPro={isPro} higherIsBetter={false} format={(v) => v + "%"} values={trio("incomeTaxRateMid")} />
            <MetricRow label="Social security" isPro={isPro} higherIsBetter={false} format={(v) => v + "%"} values={trio("socialSecurityRate")} />

            <SectionRow label="Quality of Life" isPro={isPro} />
            <MetricRow label="Overall" isPro={isPro} higherIsBetter showBar format={(v) => v + "/10"} values={trio("scoreQualityOfLife")} />
            <MetricRow label="Healthcare" isPro={isPro} higherIsBetter showBar format={(v) => v + "/10"} values={trio("scoreHealthcare")} />
            <MetricRow label="Safety" isPro={isPro} higherIsBetter showBar format={(v) => v + "/10"} values={trio("scoreSafety")} />
            <MetricRow label="Internet speed" isPro={isPro} higherIsBetter showBar format={(v) => v + "/10"} values={trio("scoreInternetSpeed")} />

            <SectionRow label="Visa" isPro={isPro} />
            {passportCtx && (
              <div style={{ display: "grid", gridTemplateColumns: TABLE_GRID, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ width: LABEL_W }} />
                <div className="col-span-3 px-4 py-2 flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#00ffd5] border border-[#00ffd5]/30 px-2 py-0.5">
                    Tier {passportCtx.tier} passport
                  </span>
                  <span className="text-[10px] text-white/30">{PASSPORT_TIER_LABEL[passportCtx.tier].split("—")[1]?.trim()}</span>
                  {passportCtx.upgraded && <span className="text-[10px] text-yellow-400/60">↑ upgraded via second passport</span>}
                </div>
              </div>
            )}
            <MetricRow label="Difficulty" isPro={isPro} higherIsBetter={false} format={(v) => `${getVisaLabel(v)} · ${v}/5`} values={trio("visaDifficulty")} />
            <MetricRow label="Move score" isPro={isPro} higherIsBetter showBar format={(v) => v + "/10"} values={trio("moveScore")} />
          </div>
          </div>

          {/* ── VISA NOTES ── */}
          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/35 mt-10 mb-4">
            Visa Notes
          </p>
          <div className="cmp-visa-grid grid grid-cols-3 gap-3">
            <VisaCard country={countryA} color={COL_A} />
            <VisaCard country={countryB} color={COL_B} />
            {isPro && countryC ? (
              <VisaCard country={countryC} color={COL_C} />
            ) : (
              <div className="border border-dashed border-white/[0.07] flex flex-col items-center justify-center gap-3 p-6 text-center">
                <Lock className="w-4 h-4 text-white/20" />
                <p className="text-[11px] font-medium text-white/25">
                  Pro unlocks a third country visa breakdown
                </p>
                <Link
                  href="/pro"
                  className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                >
                  Get Pro →
                </Link>
              </div>
            )}
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
                <Star className="w-3.5 h-3.5" fill="currentColor" />
                Get Pro · €4.99
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