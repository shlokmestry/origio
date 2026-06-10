"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

// ─── Design tokens ────────────────────────────────────────────────────────────
const BG   = "#0a0a0a";
const FG   = "#f0f0e8";
const MINT = "#00ffd5";
const DIM  = "#555550";
const SURF = "#111111";
const BORD = "#2a2a2a";
const SANS = "'Satoshi', system-ui, sans-serif";
const HEAD = "'Cabinet Grotesk', sans-serif";

// ─── Passport dataset ─────────────────────────────────────────────────────────
// visaFree: Henley Passport Index 2024 (visa-free + visa-on-arrival)
// population: approx. millions of citizens holding this passport
// rank: global rank out of 199 passports
const PASSPORTS = [
  { slug: "argentina",      name: "Argentina",      flag: "🇦🇷", visaFree: 171, population: 45,    rank: 24  },
  { slug: "australia",      name: "Australia",      flag: "🇦🇺", visaFree: 185, population: 26.5,  rank: 14  },
  { slug: "austria",        name: "Austria",        flag: "🇦🇹", visaFree: 188, population: 9,     rank: 7   },
  { slug: "belgium",        name: "Belgium",        flag: "🇧🇪", visaFree: 186, population: 11.6,  rank: 10  },
  { slug: "brazil",         name: "Brazil",         flag: "🇧🇷", visaFree: 173, population: 215,   rank: 22  },
  { slug: "canada",         name: "Canada",         flag: "🇨🇦", visaFree: 184, population: 38.8,  rank: 16  },
  { slug: "chile",          name: "Chile",          flag: "🇨🇱", visaFree: 175, population: 19.5,  rank: 20  },
  { slug: "china",          name: "China",          flag: "🇨🇳", visaFree: 85,  population: 1400,  rank: 68  },
  { slug: "cyprus",         name: "Cyprus",         flag: "🇨🇾", visaFree: 173, population: 1.2,   rank: 22  },
  { slug: "denmark",        name: "Denmark",        flag: "🇩🇰", visaFree: 188, population: 5.9,   rank: 7   },
  { slug: "estonia",        name: "Estonia",        flag: "🇪🇪", visaFree: 186, population: 1.4,   rank: 10  },
  { slug: "finland",        name: "Finland",        flag: "🇫🇮", visaFree: 189, population: 5.5,   rank: 5   },
  { slug: "france",         name: "France",         flag: "🇫🇷", visaFree: 190, population: 68,    rank: 3   },
  { slug: "germany",        name: "Germany",        flag: "🇩🇪", visaFree: 190, population: 84,    rank: 3   },
  { slug: "ghana",          name: "Ghana",          flag: "🇬🇭", visaFree: 63,  population: 33,    rank: 78  },
  { slug: "hungary",        name: "Hungary",        flag: "🇭🇺", visaFree: 186, population: 10,    rank: 10  },
  { slug: "india",          name: "India",          flag: "🇮🇳", visaFree: 58,  population: 1400,  rank: 82  },
  { slug: "indonesia",      name: "Indonesia",      flag: "🇮🇩", visaFree: 77,  population: 275,   rank: 71  },
  { slug: "ireland",        name: "Ireland",        flag: "🇮🇪", visaFree: 188, population: 5.1,   rank: 7   },
  { slug: "italy",          name: "Italy",          flag: "🇮🇹", visaFree: 190, population: 60,    rank: 3   },
  { slug: "japan",          name: "Japan",          flag: "🇯🇵", visaFree: 193, population: 125,   rank: 1   },
  { slug: "malaysia",       name: "Malaysia",       flag: "🇲🇾", visaFree: 179, population: 33,    rank: 18  },
  { slug: "mexico",         name: "Mexico",         flag: "🇲🇽", visaFree: 162, population: 130,   rank: 27  },
  { slug: "netherlands",    name: "Netherlands",    flag: "🇳🇱", visaFree: 188, population: 17.5,  rank: 7   },
  { slug: "new-zealand",    name: "New Zealand",    flag: "🇳🇿", visaFree: 185, population: 5,     rank: 14  },
  { slug: "nigeria",        name: "Nigeria",        flag: "🇳🇬", visaFree: 46,  population: 225,   rank: 98  },
  { slug: "norway",         name: "Norway",         flag: "🇳🇴", visaFree: 186, population: 5.4,   rank: 10  },
  { slug: "pakistan",       name: "Pakistan",       flag: "🇵🇰", visaFree: 33,  population: 230,   rank: 103 },
  { slug: "philippines",    name: "Philippines",    flag: "🇵🇭", visaFree: 67,  population: 115,   rank: 76  },
  { slug: "poland",         name: "Poland",         flag: "🇵🇱", visaFree: 187, population: 41,    rank: 9   },
  { slug: "portugal",       name: "Portugal",       flag: "🇵🇹", visaFree: 186, population: 10.3,  rank: 10  },
  { slug: "romania",        name: "Romania",        flag: "🇷🇴", visaFree: 174, population: 19,    rank: 21  },
  { slug: "serbia",         name: "Serbia",         flag: "🇷🇸", visaFree: 138, population: 7,     rank: 40  },
  { slug: "singapore",      name: "Singapore",      flag: "🇸🇬", visaFree: 192, population: 5.9,   rank: 2   },
  { slug: "south-africa",   name: "South Africa",   flag: "🇿🇦", visaFree: 104, population: 60,    rank: 56  },
  { slug: "south-korea",    name: "South Korea",    flag: "🇰🇷", visaFree: 189, population: 51.7,  rank: 5   },
  { slug: "spain",          name: "Spain",          flag: "🇪🇸", visaFree: 190, population: 47,    rank: 3   },
  { slug: "sweden",         name: "Sweden",         flag: "🇸🇪", visaFree: 189, population: 10.4,  rank: 5   },
  { slug: "switzerland",    name: "Switzerland",    flag: "🇨🇭", visaFree: 186, population: 8.7,   rank: 10  },
  { slug: "thailand",       name: "Thailand",       flag: "🇹🇭", visaFree: 81,  population: 72,    rank: 66  },
  { slug: "turkey",         name: "Turkey",         flag: "🇹🇷", visaFree: 111, population: 85,    rank: 50  },
  { slug: "uae",            name: "UAE",            flag: "🇦🇪", visaFree: 185, population: 1.1,   rank: 12  },
  { slug: "ukraine",        name: "Ukraine",        flag: "🇺🇦", visaFree: 148, population: 44,    rank: 35  },
  { slug: "united-kingdom", name: "United Kingdom", flag: "🇬🇧", visaFree: 187, population: 67,    rank: 9   },
  { slug: "usa",            name: "United States",  flag: "🇺🇸", visaFree: 186, population: 335,   rank: 10  },
  { slug: "vietnam",        name: "Vietnam",        flag: "🇻🇳", visaFree: 55,  population: 98,    rank: 90  },
] as const;

const WORLD_POP   = 8000; // million
const MAX_RANK    = 199;
const MAX_VF      = 193; // Japan's score, the ceiling

// ─── Helpers ──────────────────────────────────────────────────────────────────
type Passport = typeof PASSPORTS[number];

function getPowerTier(vf: number): { label: string; color: string; desc: string } {
  if (vf >= 180) return { label: "ELITE",   color: MINT,      desc: "Top-tier global access" };
  if (vf >= 140) return { label: "STRONG",  color: "#a3e635", desc: "Well above average"     };
  if (vf >= 100) return { label: "AVERAGE", color: "#facc15", desc: "Middle of the pack"     };
  return               { label: "WEAK",    color: "#ef4444", desc: "Significantly restricted" };
}

function formatPop(pop: number): string {
  if (pop >= 1000) return `${(pop / 1000).toFixed(1)}B`;
  if (pop >= 1)    return `${pop % 1 === 0 ? pop : pop.toFixed(1)}M`;
  return `${(pop * 1000).toFixed(0)}K`;
}

function getRarity(pop: number): { pct: string; rarer: string; share: number } {
  const share    = (pop / WORLD_POP) * 100;
  const rarerNum = 100 - share;
  const rarer    = rarerNum >= 99.9 ? "99.9%+" : rarerNum >= 99 ? `${rarerNum.toFixed(1)}%` : `${Math.round(rarerNum)}%`;
  const pct      = share < 0.1 ? "<0.1%" : share < 1 ? `${share.toFixed(2)}%` : `${share.toFixed(1)}%`;
  return { pct, rarer, share };
}

// ─── Count-up animation hook ──────────────────────────────────────────────────
function useCountUp(target: number, active: boolean, duration = 900): number {
  const [count, setCount]   = useState(0);
  const rafRef              = useRef<number | null>(null);
  const startRef            = useRef<number | null>(null);

  useEffect(() => {
    if (!active) { setCount(0); return; }
    startRef.current = null;
    const step = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const p = Math.min((ts - startRef.current) / duration, 1);
      const e = 1 - Math.pow(1 - p, 4); // ease-out-quart
      setCount(Math.round(target * e));
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, active, duration]);

  return count;
}

// ─── Tier bar ─────────────────────────────────────────────────────────────────
const TIER_BANDS = [
  { label: "WEAK",    min: 0,   max: 99,  color: "#ef4444" },
  { label: "AVERAGE", min: 100, max: 139, color: "#facc15" },
  { label: "STRONG",  min: 140, max: 179, color: "#a3e635" },
  { label: "ELITE",   min: 180, max: 193, color: MINT      },
];

function TierBar({ visaFree }: { visaFree: number }) {
  const pct = (visaFree / MAX_VF) * 100;
  return (
    <div style={{ marginTop: 32 }}>
      <p style={{ fontFamily: SANS, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: DIM, marginBottom: 12 }}>
        Global range — 0 to 193 countries
      </p>
      {/* Track */}
      <div style={{ position: "relative", height: 6, background: BORD, marginBottom: 20 }}>
        {/* Coloured fill up to this passport's score */}
        <div
          style={{
            position: "absolute", top: 0, left: 0, height: "100%",
            width: `${pct}%`,
            background: getPowerTier(visaFree).color,
            transition: "width 1s cubic-bezier(0.16,1,0.3,1)",
          }}
        />
        {/* Tick mark */}
        <div style={{
          position: "absolute", top: -5, left: `${pct}%`,
          transform: "translateX(-50%)",
          width: 2, height: 16, background: FG,
        }} />
      </div>
      {/* Tier labels */}
      <div style={{ display: "flex", gap: 4 }}>
        {TIER_BANDS.map(b => {
          const active = visaFree >= b.min && visaFree <= b.max;
          return (
            <div key={b.label} style={{
              flex: (b.max - b.min + 1),
              padding: "6px 8px",
              border: `1px solid ${active ? b.color : BORD}`,
              background: active ? `${b.color}18` : "transparent",
              transition: "all 0.4s ease",
            }}>
              <p style={{ fontFamily: HEAD, fontSize: 10, letterSpacing: "0.14em", color: active ? b.color : DIM, margin: 0 }}>
                {b.label}
              </p>
              <p style={{ fontFamily: SANS, fontSize: 10, color: active ? FG : DIM, margin: "2px 0 0", opacity: active ? 1 : 0.6 }}>
                {b.min}–{b.max}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Share card (screenshot-friendly) ────────────────────────────────────────
function ShareCard({ passport }: { passport: Passport }) {
  const tier    = getPowerTier(passport.visaFree);
  const rarity  = getRarity(passport.population);

  return (
    <div
      id="passport-share-card"
      style={{
        background: "#0d0d0d",
        border: `2px solid ${MINT}`,
        boxShadow: `4px 4px 0 ${MINT}`,
        padding: "28px 32px",
        maxWidth: 420,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <span style={{ fontFamily: HEAD, fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: MINT }}>
          ORIGIO · PASSPORT POWER
        </span>
        <span style={{ fontFamily: SANS, fontSize: 10, color: DIM }}>
          findorigio.com
        </span>
      </div>

      {/* Country */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
        <span style={{ fontSize: 36, lineHeight: 1 }}>{passport.flag}</span>
        <div>
          <p style={{ fontFamily: HEAD, fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: FG, margin: 0, lineHeight: 1 }}>
            {passport.name.toUpperCase()}
          </p>
          <p style={{ fontFamily: SANS, fontSize: 11, color: DIM, margin: "4px 0 0" }}>
            Ranked #{passport.rank} of {MAX_RANK} passports
          </p>
        </div>
      </div>

      {/* Main stat + tier */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 20, paddingBottom: 20, borderBottom: `1px solid ${BORD}` }}>
        <div>
          <p style={{ fontFamily: HEAD, fontSize: 52, fontWeight: 800, letterSpacing: "-0.04em", color: FG, margin: 0, lineHeight: 1 }}>
            {passport.visaFree}
          </p>
          <p style={{ fontFamily: SANS, fontSize: 11, color: DIM, margin: "6px 0 0", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            countries visa-free
          </p>
        </div>
        <div style={{
          padding: "6px 12px",
          border: `1px solid ${tier.color}`,
          background: `${tier.color}18`,
          marginBottom: 4,
        }}>
          <span style={{ fontFamily: HEAD, fontSize: 13, letterSpacing: "0.12em", color: tier.color }}>
            {tier.label}
          </span>
        </div>
      </div>

      {/* Rarity */}
      <p style={{ fontFamily: HEAD, fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em", color: MINT, margin: "0 0 6px" }}>
        Rarer than {rarity.rarer} of the world
      </p>
      <p style={{ fontFamily: SANS, fontSize: 13, color: DIM, margin: 0 }}>
        {formatPop(passport.population)} holders · {rarity.pct} of world population
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PassportPowerClient() {
  const [search,       setSearch]       = useState("");
  const [selected,     setSelected]     = useState<Passport | null>(null);
  const [showDrop,     setShowDrop]     = useState(false);
  const [revealed,     setRevealed]     = useState(false);
  const [copied,       setCopied]       = useState(false);
  const inputRef                        = useRef<HTMLInputElement>(null);
  const dropRef                         = useRef<HTMLDivElement>(null);
  const resultRef                       = useRef<HTMLDivElement>(null);

  const visaCount = useCountUp(selected?.visaFree ?? 0, revealed);

  const filtered = PASSPORTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const pick = useCallback((p: Passport) => {
    setSelected(p);
    setSearch(p.name);
    setShowDrop(false);
    setRevealed(false);
    // small delay so count-up fires after mount
    setTimeout(() => setRevealed(true), 80);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
  }, []);

  // close dropdown on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (
        dropRef.current && !dropRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) setShowDrop(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const handleShare = useCallback(async () => {
    if (!selected) return;
    const url = `${window.location.origin}/passport-power?passport=${selected.slug}`;
    const text = `${selected.flag} ${selected.name} passport: ${selected.visaFree} countries visa-free. Rarer than ${getRarity(selected.population).rarer} of the world.`;

    if (navigator.share) {
      try { await navigator.share({ title: "Passport Power — Origio", text, url }); return; }
      catch {}
    }

    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  }, [selected]);

  const tier   = selected ? getPowerTier(selected.visaFree) : null;
  const rarity = selected ? getRarity(selected.population)  : null;

  return (
    <div style={{ minHeight: "100vh", background: BG, color: FG, fontFamily: SANS }}>
      <Nav countries={[]} onCountrySelect={() => {}} />

      {/* ─── Hero ──────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "88px 24px 0" }}>

        <div style={{ marginBottom: 56 }}>
          <p style={{
            fontFamily: SANS, fontSize: 11, letterSpacing: "0.22em",
            textTransform: "uppercase", color: DIM, marginBottom: 20,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ color: MINT, fontSize: 8 }}>●</span>
            Passport Power · Free tool
          </p>

          <h1 style={{
            fontFamily: HEAD,
            fontSize: "clamp(38px, 7vw, 80px)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 0.95,
            color: FG,
            margin: "0 0 24px",
            textWrap: "balance" as React.CSSProperties["textWrap"],
          } as React.CSSProperties}>
            How powerful
            <br />
            is your passport.
            <br />
            <span style={{ color: MINT }}>How rare.</span>
          </h1>

          <p style={{ fontFamily: SANS, fontSize: 15, color: DIM, lineHeight: 1.7, maxWidth: 500, margin: 0 }}>
            Select your passport. See your visa-free score, global rank, and exactly how few people on earth carry the same document.
          </p>
        </div>

        {/* ─── Selector ──────────────────────────────────────────────────── */}
        <div style={{ maxWidth: 480, marginBottom: 64, position: "relative" }}>
          <label style={{
            fontFamily: SANS, fontSize: 10, letterSpacing: "0.18em",
            textTransform: "uppercase", color: DIM, display: "block", marginBottom: 10,
          }}>
            Your passport
          </label>

          <input
            ref={inputRef}
            type="text"
            placeholder="Type your country…"
            value={showDrop ? search : (selected ? selected.name : search)}
            onFocus={() => { setShowDrop(true); setSearch(""); }}
            onBlur={() => setTimeout(() => setShowDrop(false), 150)}
            onChange={e => { setSearch(e.target.value); setShowDrop(true); }}
            style={{
              width: "100%",
              fontFamily: SANS,
              fontSize: 16,
              color: FG,
              background: SURF,
              border: `1px solid ${selected ? MINT : BORD}`,
              padding: "14px 18px",
              outline: "none",
              boxShadow: selected ? `3px 3px 0 ${MINT}` : "none",
              transition: "border-color 0.2s, box-shadow 0.2s",
              borderRadius: 0,
            }}
          />

          {/* Dropdown */}
          {showDrop && filtered.length > 0 && (
            <div
              ref={dropRef}
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "#111",
                border: `1px solid ${BORD}`,
                borderTop: "none",
                maxHeight: 300,
                overflowY: "auto",
                zIndex: 50,
              }}
            >
              {filtered.map(p => (
                <button
                  key={p.slug}
                  onMouseDown={() => pick(p)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "11px 18px",
                    background: "transparent",
                    border: "none",
                    borderBottom: `1px solid ${BORD}`,
                    color: FG,
                    fontFamily: SANS,
                    fontSize: 14,
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#1a1a1a")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ fontSize: 20 }}>{p.flag}</span>
                  <span>{p.name}</span>
                  <span style={{ marginLeft: "auto", fontFamily: HEAD, fontSize: 11, color: getPowerTier(p.visaFree).color, letterSpacing: "0.1em" }}>
                    {getPowerTier(p.visaFree).label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ─── Results ───────────────────────────────────────────────────── */}
        {selected && tier && rarity && (
          <div
            ref={resultRef}
            style={{
              opacity: revealed ? 1 : 0,
              transform: revealed ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.5s ease, transform 0.5s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            {/* Country header */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              marginBottom: 40,
              paddingBottom: 32,
              borderBottom: `1px solid ${BORD}`,
            }}>
              <span style={{ fontSize: 48, lineHeight: 1 }}>{selected.flag}</span>
              <div>
                <h2 style={{
                  fontFamily: HEAD,
                  fontSize: "clamp(28px, 4vw, 48px)",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  color: FG,
                  margin: 0,
                  lineHeight: 1,
                }}>
                  {selected.name.toUpperCase()}
                </h2>
                <p style={{ fontFamily: SANS, fontSize: 12, color: DIM, margin: "8px 0 0", letterSpacing: "0.08em" }}>
                  RANKED #{selected.rank} OF {MAX_RANK} PASSPORTS WORLDWIDE
                </p>
              </div>
            </div>

            {/* Stats grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 2,
              marginBottom: 48,
            }}>
              {/* Visa-free count — the big number */}
              <div style={{
                background: SURF,
                border: `1px solid ${BORD}`,
                padding: "28px 28px 24px",
                gridColumn: "span 1",
              }}>
                <p style={{ fontFamily: SANS, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: DIM, margin: "0 0 12px" }}>
                  Visa-free access
                </p>
                <p style={{
                  fontFamily: HEAD,
                  fontSize: "clamp(52px, 8vw, 80px)",
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  color: FG,
                  margin: 0,
                  lineHeight: 1,
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {visaCount}
                </p>
                <p style={{ fontFamily: SANS, fontSize: 11, color: DIM, margin: "8px 0 0", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  countries
                </p>
              </div>

              {/* Power tier */}
              <div style={{
                background: `${tier.color}0d`,
                border: `1px solid ${tier.color}`,
                boxShadow: `3px 3px 0 ${tier.color}`,
                padding: "28px 28px 24px",
              }}>
                <p style={{ fontFamily: SANS, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: DIM, margin: "0 0 12px" }}>
                  Power tier
                </p>
                <p style={{
                  fontFamily: HEAD,
                  fontSize: "clamp(36px, 5vw, 56px)",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  color: tier.color,
                  margin: 0,
                  lineHeight: 1,
                }}>
                  {tier.label}
                </p>
                <p style={{ fontFamily: SANS, fontSize: 11, color: DIM, margin: "8px 0 0" }}>
                  {tier.desc}
                </p>
              </div>

              {/* Rarity — the hook */}
              <div style={{
                background: SURF,
                border: `1px solid ${BORD}`,
                padding: "28px 28px 24px",
                gridColumn: "1 / -1",
              }}>
                <p style={{ fontFamily: SANS, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: DIM, margin: "0 0 16px" }}>
                  Passport rarity
                </p>
                <p style={{
                  fontFamily: HEAD,
                  fontSize: "clamp(22px, 3.5vw, 36px)",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: MINT,
                  margin: "0 0 12px",
                  lineHeight: 1.1,
                  textWrap: "balance" as React.CSSProperties["textWrap"],
                } as React.CSSProperties}>
                  Rarer than {rarity.rarer} of the world.
                </p>
                <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
                  <div>
                    <p style={{ fontFamily: HEAD, fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", color: FG, margin: 0, lineHeight: 1 }}>
                      {formatPop(selected.population)}
                    </p>
                    <p style={{ fontFamily: SANS, fontSize: 11, color: DIM, margin: "5px 0 0", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      passport holders
                    </p>
                  </div>
                  <div>
                    <p style={{ fontFamily: HEAD, fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", color: FG, margin: 0, lineHeight: 1 }}>
                      {rarity.pct}
                    </p>
                    <p style={{ fontFamily: SANS, fontSize: 11, color: DIM, margin: "5px 0 0", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      of world population
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tier bar */}
            <TierBar visaFree={selected.visaFree} />

            {/* Divider */}
            <div style={{ height: 1, background: BORD, margin: "48px 0" }} />

            {/* Share card */}
            <div style={{ marginBottom: 40 }}>
              <p style={{
                fontFamily: SANS, fontSize: 11, letterSpacing: "0.18em",
                textTransform: "uppercase", color: DIM, marginBottom: 20,
              }}>
                Share your result
              </p>
              <ShareCard passport={selected} />
              <button
                onClick={handleShare}
                style={{
                  marginTop: 16,
                  padding: "13px 28px",
                  background: "transparent",
                  border: `1px solid ${MINT}`,
                  boxShadow: `3px 3px 0 ${MINT}`,
                  color: MINT,
                  fontFamily: HEAD,
                  fontSize: 12,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = `${MINT}18`)}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                {copied ? "Copied to clipboard" : "Share result"}
              </button>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: BORD, margin: "0 0 56px" }} />
          </div>
        )}

        {/* ─── CTA ───────────────────────────────────────────────────────── */}
        <div style={{
          padding: "48px 0 80px",
          borderTop: selected ? "none" : `1px solid ${BORD}`,
        }}>
          <p style={{
            fontFamily: HEAD, fontSize: "clamp(20px, 3vw, 32px)", fontWeight: 700,
            letterSpacing: "-0.02em", color: FG, margin: "0 0 12px", lineHeight: 1.15,
          }}>
            {selected
              ? `See which countries actually suit a ${selected.name} passport.`
              : "See which countries fit your passport, budget and priorities."}
          </p>
          <p style={{ fontFamily: SANS, fontSize: 14, color: DIM, margin: "0 0 28px", maxWidth: 460, lineHeight: 1.7 }}>
            Origio scores 25 countries against your job, salary expectations and deal breakers. Free to start.
          </p>
          <Link href="/wizard" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 28px",
            background: MINT,
            color: "#0a0a0a",
            fontFamily: HEAD,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            textDecoration: "none",
            boxShadow: `4px 4px 0 ${FG}`,
            transition: "box-shadow 0.15s, transform 0.15s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.boxShadow = `2px 2px 0 ${FG}`;
            (e.currentTarget as HTMLAnchorElement).style.transform = "translate(2px,2px)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.boxShadow = `4px 4px 0 ${FG}`;
            (e.currentTarget as HTMLAnchorElement).style.transform = "translate(0,0)";
          }}
          >
            Start free
            <span style={{ fontSize: 16 }}>→</span>
          </Link>

          <p style={{ fontFamily: SANS, fontSize: 12, color: DIM, margin: "16px 0 0" }}>
            No account needed to see your top 3 matches.
          </p>
        </div>
      </div>

      {/* ─── Reduced motion ────────────────────────────────────────────────── */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          * { transition: none !important; animation: none !important; }
        }
      `}</style>

      <Footer />
    </div>
  );
}
