"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { FlagIcon } from "@/components/FlagIcon";
import { slugToIso } from "@/lib/flagCodes";
import { ALL_PASSPORTS, MAX_SCORE, SORTED_PASSPORTS, type Passport } from "./data";

// ─── Design tokens ────────────────────────────────────────────────────────────
const BG   = "#0a0a0a";
const FG   = "#f0f0e8";
const MINT = "#00ffd5";
const DIM  = "#555550";
const SURF = "#111111";
const BORD = "#2a2a2a";
const SANS = "'Satoshi', system-ui, sans-serif";
const HEAD = "'Cabinet Grotesk', sans-serif";
const WORLD_POP = 8000; // millions

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getRarity(pop: number) {
  const share    = (pop / WORLD_POP) * 100;
  const rarerNum = 100 - share;
  const pct      = share < 0.01 ? "<0.01%" : share < 1 ? `${share.toFixed(2)}%` : `${share.toFixed(1)}%`;

  // Holders formatted precisely
  const holders  = pop >= 1000
    ? `${(pop / 1000).toFixed(1)}B`
    : pop >= 1
    ? `${pop % 1 === 0 ? pop : pop.toFixed(1)}M`
    : pop >= 0.001
    ? `${(pop * 1000).toFixed(0)}K`
    : `~${Math.round(pop * 1_000_000).toLocaleString()}`;

  // Rarity tier based on honest population share
  let rarityTier: "ultra-rare" | "rare" | "uncommon" | "common" | "very-common";
  let rarityLabel: string;
  let rarityDesc: string;
  let rarityColor: string;

  if (share < 0.1) {
    rarityTier  = "ultra-rare";
    rarityLabel = "Ultra Rare";
    rarityDesc  = `Only ${holders} people in the world hold this passport`;
    rarityColor = "#D4AF37"; // gold
  } else if (share < 0.5) {
    rarityTier  = "rare";
    rarityLabel = "Rare";
    rarityDesc  = `${holders} holders — just ${pct} of the world's population`;
    rarityColor = "#a3e635";
  } else if (share < 2) {
    rarityTier  = "uncommon";
    rarityLabel = "Uncommon";
    rarityDesc  = `${holders} holders — ${pct} of the world`;
    rarityColor = "#facc15";
  } else if (share < 8) {
    rarityTier  = "common";
    rarityLabel = "Common";
    rarityDesc  = `${holders} holders — a widely-held passport at ${pct} of the world`;
    rarityColor = "#fb923c";
  } else {
    rarityTier  = "very-common";
    rarityLabel = "Very Common";
    rarityDesc  = `${holders} holders — one of the most common passports on Earth (${pct} of all people)`;
    rarityColor = "#ef4444";
  }

  return { pct, holders, sharePct: share, rarerNum, rarityTier, rarityLabel, rarityDesc, rarityColor };
}

const GOLD   = "#D4AF37";
const SILVER = "#A8AAAD";

function tierColor(score: number) {
  if (score >= 180) return GOLD;
  if (score >= 140) return SILVER;
  if (score >= 100) return "#facc15";
  return "#ef4444";
}

function tierLabel(score: number) {
  if (score >= 180) return "ELITE";
  if (score >= 140) return "STRONG";
  if (score >= 100) return "AVERAGE";
  return "WEAK";
}

const DELTA_2020: Record<string, number> = {
  singapore: 5, japan: 4, "south-korea": 3, uae: 12, sweden: 2,
  belgium: 1, denmark: 1, finland: 1, france: 1, germany: 1,
  ireland: 1, italy: 1, luxembourg: 1, netherlands: 1, norway: 1, spain: 1,
  austria: 2, greece: 2, malta: 1, portugal: 2, switzerland: 1,
  hungary: 3, poland: 2, "united-kingdom": -2, australia: 1, canada: 1,
  czechia: 2, latvia: 2, malaysia: 4, "new-zealand": 1, slovakia: 2, slovenia: 2,
  croatia: 3, estonia: 2, liechtenstein: 1, lithuania: 2, iceland: 1, usa: -3,
  bulgaria: 4, romania: 5, chile: 2, cyprus: 3, "hong-kong": -5,
  argentina: 2, brazil: 2, israel: -3, turkey: -2, russia: -10, china: 2,
  india: 4, "south-africa": 2, "saudi-arabia": 10, qatar: 8, nigeria: -2, pakistan: -3,
};

function getDelta(slug: string): number | null {
  return DELTA_2020[slug] ?? null;
}

// ─── Count-up hook ────────────────────────────────────────────────────────────
function useCountUp(target: number, delay = 0): number {
  const [count, setCount] = useState(0);
  const rafRef            = useRef<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      let start: number | null = null;
      const step = (ts: number) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / 900, 1);
        const e = 1 - Math.pow(1 - p, 4);
        setCount(Math.round(target * e));
        if (p < 1) rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    }, delay);
    return () => { clearTimeout(t); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, delay]);

  return count;
}

// ─── Hero card ────────────────────────────────────────────────────────────────
function HeroCard({ passport, position, onSelect }: {
  passport: Passport;
  position: 1 | 2 | 3;
  onSelect: (p: Passport) => void;
}) {
  const color  = tierColor(passport.score);
  const count  = useCountUp(passport.score, position === 1 ? 0 : position === 2 ? 200 : 400);
  const rarity = getRarity(passport.population);
  const isCenter = position === 1;

  const flagSize   = isCenter ? 32 : 26;
  const scoreFSize = isCenter ? 64 : 48;
  const minH       = isCenter ? 360 : 300;
  const pad        = isCenter ? "32px 24px 28px" : "24px 20px 20px";
  const flex       = isCenter ? "1.2" : "1";

  return (
    <>
      <style>{`
        @keyframes electric-border {
          0%   { box-shadow: 0 0 6px ${GOLD}40, 4px 4px 0 ${GOLD}; border-color: ${GOLD}70; }
          20%  { box-shadow: 0 0 20px ${GOLD}90, 0 0 40px ${GOLD}50, 5px 5px 0 ${GOLD}; border-color: ${GOLD}; }
          22%  { box-shadow: 0 0 6px ${GOLD}30, 4px 4px 0 ${GOLD}; border-color: ${GOLD}60; }
          40%  { box-shadow: 0 0 28px ${GOLD}ff, 0 0 56px ${GOLD}60, 5px 5px 0 ${GOLD}; border-color: ${GOLD}; }
          42%  { box-shadow: 0 0 6px ${GOLD}40, 4px 4px 0 ${GOLD}; border-color: ${GOLD}70; }
          100% { box-shadow: 0 0 6px ${GOLD}40, 4px 4px 0 ${GOLD}; border-color: ${GOLD}70; }
        }
        @keyframes bolt-tl {
          0%,60%  { opacity: 0; }
          65%  { opacity: 1; filter: brightness(2.5); }
          70%  { opacity: 0.3; filter: brightness(1); }
          75%  { opacity: 1; filter: brightness(3); }
          82%  { opacity: 0; }
          100% { opacity: 0; }
        }
        @keyframes bolt-tr {
          0%,63%  { opacity: 0; }
          68%  { opacity: 1; filter: brightness(2.5); }
          73%  { opacity: 0.3; filter: brightness(1); }
          78%  { opacity: 1; filter: brightness(3); }
          85%  { opacity: 0; }
          100% { opacity: 0; }
        }
        @keyframes gold-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      <button
        type="button"
        onClick={() => onSelect(passport)}
        style={{
          flex,
          display: "block",
          background: isCenter ? "#0e0c08" : SURF,
          border: `1px solid ${color}${isCenter ? "" : "99"}`,
          boxShadow: isCenter ? undefined : `3px 3px 0 ${color}60`,
          animation: isCenter ? "electric-border 5s ease-in-out infinite" : undefined,
          padding: pad,
          minHeight: minH,
          cursor: "pointer",
          userSelect: "none",
          textAlign: "left",
          font: "inherit",
          color: "inherit",
          position: "relative",
          overflow: "hidden",
          alignSelf: "flex-end",
        }}
      >
        {/* Gold radial glow behind Singapore */}
        {isCenter && (
          <div style={{
            position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)",
            width: 280, height: 280,
            background: `radial-gradient(circle, ${GOLD}18 0%, transparent 70%)`,
            pointerEvents: "none",
          }} />
        )}

        {/* Lightning bolts — only on center card */}
        {isCenter && (
          <>
            <div style={{ position: "absolute", top: 10, left: 10, pointerEvents: "none", animation: "bolt-tl 5s ease-out infinite" }}>
              <svg width="14" height="22" viewBox="0 0 12 20" fill="none">
                <path d="M7 0L0 11h5l-1 9 8-12H7l1-8z" fill={GOLD} />
              </svg>
            </div>
            <div style={{ position: "absolute", top: 10, right: 10, pointerEvents: "none", animation: "bolt-tr 5s ease-out infinite" }}>
              <svg width="14" height="22" viewBox="0 0 12 20" fill="none">
                <path d="M7 0L0 11h5l-1 9 8-12H7l1-8z" fill={GOLD} />
              </svg>
            </div>
          </>
        )}

        {/* Rank badge */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{
            fontFamily: SANS, fontSize: 9, letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: isCenter ? BG : color,
            background: isCenter ? GOLD : "transparent",
            border: `1px solid ${color}`,
            padding: "3px 8px",
            fontWeight: isCenter ? 700 : 400,
          }}>
            {isCenter ? "⚡ RANK #1 · WORLD'S BEST" : `RANK #${passport.rank}`}
          </span>
        </div>

        {/* Flag + name */}
        <div style={{ marginBottom: 8 }}>
          {slugToIso(passport.slug)
            ? <FlagIcon code={slugToIso(passport.slug)!} size={isCenter ? "lg" : "md"} />
            : <span style={{ fontSize: flagSize }}>{passport.flag}</span>}
        </div>
        <p style={{
          fontFamily: HEAD, fontSize: isCenter ? 20 : 15, fontWeight: 800,
          letterSpacing: "-0.02em", color: FG, margin: "0 0 16px", lineHeight: 1,
        }}>
          {passport.name.toUpperCase()}
        </p>

        {/* Score */}
        <p style={{
          fontFamily: HEAD, fontSize: scoreFSize, fontWeight: 800,
          letterSpacing: "-0.04em", margin: 0, lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
          display: "flex", alignItems: "baseline", gap: 4,
          ...(isCenter ? {
            background: `linear-gradient(90deg, ${GOLD}, #fffbe6, ${GOLD}cc, #f0c040, ${GOLD})`,
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "gold-shimmer 3s linear infinite",
          } : { color }),
        } as React.CSSProperties}>
          {count}
        </p>

        {/* Tier label + score bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, marginTop: 10 }}>
          <span style={{ fontFamily: SANS, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color }}>
            {tierLabel(passport.score)}
          </span>
          <span style={{ fontFamily: SANS, fontSize: 9, color: DIM }}>{passport.score} / {MAX_SCORE}</span>
        </div>
        <div style={{ height: 2, background: BORD, marginBottom: 14 }}>
          <div style={{ height: "100%", background: color, width: `${(passport.score / MAX_SCORE) * 100}%` }} />
        </div>

        {/* Mini stats */}
        <p style={{ fontFamily: SANS, fontSize: 10, color: DIM, margin: "0 0 12px" }}>
          <span style={{ color: FG }}>{passport.vf}</span> visa-free
          {" · "}
          <span style={{ color: FG }}>{passport.voa}</span> on arrival
          {" · "}
          <span style={{ color: FG }}>{passport.evisa}</span> eVisa
        </p>

        {/* Rarity — large + prominent */}
        <div style={{ borderTop: `1px solid ${color}22`, paddingTop: 12 }}>
          <p style={{
            fontFamily: HEAD, fontSize: isCenter ? 13 : 11, fontWeight: 700,
            color: rarity.rarityColor, margin: "0 0 4px", lineHeight: 1.2,
            letterSpacing: "0.06em", textTransform: "uppercase",
          }}>
            {rarity.rarityLabel}
          </p>
          <p style={{ fontFamily: SANS, fontSize: isCenter ? 12 : 10, color: FG, margin: 0, lineHeight: 1.5 }}>
            {rarity.rarityDesc}
          </p>
        </div>
      </button>
    </>
  );
}

// ─── Share button ────────────────────────────────────────────────────────────
function ShareButton({ passport, rarity }: { passport: Passport; rarity: ReturnType<typeof getRarity> }) {
  const [copied, setCopied] = useState(false);
  const color = tierColor(passport.score);
  const url = typeof window !== "undefined" ? `${window.location.origin}/passport-power/${passport.slug}` : `https://findorigio.com/passport-power/${passport.slug}`;
  const copy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontFamily: SANS, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: DIM, margin: "0 0 10px" }}>
        Share
      </p>

      {/* Card preview — this is what gets shared */}
      <div style={{
        background: "#080808",
        border: `1px solid ${color}`,
        padding: "20px",
        marginBottom: 8,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Subtle glow */}
        <div style={{
          position: "absolute", top: -40, right: -40,
          width: 120, height: 120,
          background: `radial-gradient(circle, ${color}20, transparent 70%)`,
          pointerEvents: "none",
        }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ fontFamily: SANS, fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: DIM, margin: "0 0 10px" }}>
              findorigio.com · passport power
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              {slugToIso(passport.slug)
                ? <FlagIcon code={slugToIso(passport.slug)!} size="md" />
                : <span style={{ fontSize: 22 }}>{passport.flag}</span>}
              <p style={{ fontFamily: HEAD, fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", color: FG, margin: 0 }}>
                {passport.name.toUpperCase()}
              </p>
            </div>
            <p style={{ fontFamily: HEAD, fontSize: 13, color, margin: "0 0 6px", letterSpacing: "0.06em" }}>
              RANK #{passport.rank} · {tierLabel(passport.score)}
            </p>
            <p style={{ fontFamily: SANS, fontSize: 12, color: DIM, margin: 0, lineHeight: 1.5 }}>
              <span style={{ color: rarity.rarityColor, fontWeight: 600 }}>{rarity.rarityLabel}</span>
              {" · "}{rarity.holders} holders
            </p>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <p style={{ fontFamily: HEAD, fontSize: 40, fontWeight: 800, letterSpacing: "-0.04em", color, margin: 0, lineHeight: 1 }}>
              {passport.score}
            </p>
            <p style={{ fontFamily: SANS, fontSize: 9, color: DIM, margin: "4px 0 0", letterSpacing: "0.1em" }}>
              DESTINATIONS
            </p>
          </div>
        </div>

        {/* Bar */}
        <div style={{ height: 2, background: BORD, marginTop: 16 }}>
          <div style={{ height: "100%", background: color, width: `${(passport.score / MAX_SCORE) * 100}%` }} />
        </div>
      </div>

      <button
        type="button"
        onClick={copy}
        style={{
          width: "100%",
          background: copied ? color : "transparent",
          border: `1px solid ${copied ? color : BORD}`,
          color: copied ? BG : FG,
          fontFamily: SANS, fontSize: 11, fontWeight: 700,
          padding: "11px 0", cursor: "pointer",
          letterSpacing: "0.14em", textTransform: "uppercase",
          transition: "all 0.2s",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}
      >
        {copied ? "✓ Link copied!" : "Copy link"}
      </button>
    </div>
  );
}

// ─── Notable easy-access destinations per passport ────────────────────────────
const NOTABLE_VF: Record<string, string[]> = {
  singapore: ["USA", "China", "Russia", "Brazil", "South Africa"],
  japan: ["USA", "China", "Russia", "Brazil", "India"],
  "south-korea": ["USA", "China", "Russia", "Brazil", "India"],
  uae: ["USA", "UK", "Russia", "China", "Brazil"],
  sweden: ["USA", "Brazil", "Russia", "South Africa", "Japan"],
  germany: ["USA", "Brazil", "Russia", "China", "India"],
  france: ["USA", "Brazil", "Russia", "China", "Japan"],
  "united-kingdom": ["USA", "Brazil", "Russia", "South Africa", "Japan"],
  usa: ["UK", "EU", "Japan", "Australia", "Brazil"],
  australia: ["UK", "EU", "Japan", "USA", "Brazil"],
  canada: ["UK", "EU", "Japan", "USA", "Brazil"],
  india: ["Nepal", "Bhutan", "Maldives", "Indonesia", "Mauritius"],
  china: ["Thailand", "Malaysia", "Serbia", "Maldives", "Morocco"],
  russia: ["Turkey", "Thailand", "Vietnam", "Egypt", "UAE"],
  nigeria: ["Benin", "Ghana", "Kenya", "Senegal", "Malaysia"],
  pakistan: ["Malaysia", "Nepal", "Indonesia", "Turkey", "Bangladesh"],
  brazil: ["EU", "USA", "Russia", "Japan", "South Africa"],
  mexico: ["EU", "UK", "Japan", "Brazil", "Argentina"],
  turkey: ["EU", "Russia", "Japan", "Brazil", "South Africa"],
  "south-africa": ["Kenya", "Mozambique", "Namibia", "Zimbabwe", "Malaysia"],
};
const DEFAULT_NOTABLE = ["Thailand", "Malaysia", "Turkey", "Morocco", "Kenya"];

function getPeers(p: Passport): Passport[] {
  return SORTED_PASSPORTS
    .filter(x => x.slug !== p.slug && Math.abs(x.score - p.score) <= 2)
    .slice(0, 4);
}

function getPercentile(score: number): number {
  const below = SORTED_PASSPORTS.filter(p => p.score < score).length;
  return Math.round((below / SORTED_PASSPORTS.length) * 100);
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function PassportModal({ passport, onClose }: { passport: Passport; onClose: () => void }) {
  const rarity  = getRarity(passport.population);
  const color   = tierColor(passport.score);
  const percentile = getPercentile(passport.score);
  const peers   = getPeers(passport);
  const notable = NOTABLE_VF[passport.slug] || DEFAULT_NOTABLE;
  const worldPct = Math.round((passport.vf / 195) * 100);
  const delta   = getDelta(passport.slug);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 99999,
        background: "rgba(0,0,0,0.85)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#0f0f0f",
          border: `1px solid ${color}`,
          boxShadow: `4px 4px 0 ${color}`,
          width: "100%", maxWidth: 680,
          maxHeight: "88vh", overflowY: "auto",
          padding: "clamp(16px, 4vw, 32px)",
          position: "relative",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 14, right: 14,
            background: "transparent", border: `1px solid ${BORD}`,
            color: DIM, fontFamily: SANS, fontSize: 11,
            padding: "3px 10px", cursor: "pointer", letterSpacing: "0.1em",
          }}
        >
          ESC
        </button>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
          {slugToIso(passport.slug)
            ? <FlagIcon code={slugToIso(passport.slug)!} size="lg" />
            : <span style={{ fontSize: 38 }}>{passport.flag}</span>}
          <div>
            <p style={{ fontFamily: HEAD, fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: FG, margin: 0, lineHeight: 1 }}>
              {passport.name.toUpperCase()}
            </p>
            <p style={{ fontFamily: SANS, fontSize: 11, color: DIM, margin: "5px 0 0", letterSpacing: "0.08em" }}>
              ACCESS SNAPSHOT · RANK #{passport.rank} OF 199
            </p>
          </div>
        </div>

        {/* Tier + percentile bar */}
        <div style={{ padding: "14px 16px", border: `1px solid ${color}`, background: `${color}12`, marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <span style={{ fontFamily: HEAD, fontSize: 13, letterSpacing: "0.12em", color, display: "block" }}>
                {tierLabel(passport.score)}
              </span>
              <span style={{ fontFamily: SANS, fontSize: 10, color: DIM }}>
                Top {100 - percentile}% of all passports
              </span>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontFamily: HEAD, fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", color: FG, display: "block", lineHeight: 1 }}>
                {passport.score}
              </span>
              <span style={{ fontFamily: SANS, fontSize: 10, color: DIM }}>{worldPct}% of the world</span>
            </div>
          </div>
          {/* Percentile spectrum — weakest (23) to strongest (192) */}
          <div style={{ position: "relative", height: 6, background: BORD, marginBottom: 6 }}>
            <div style={{
              position: "absolute", left: 0, top: 0, height: "100%",
              background: `linear-gradient(90deg, #ef4444, #facc15 40%, #a3e635 70%, ${MINT})`,
              width: "100%", opacity: 0.3,
            }} />
            <div style={{
              position: "absolute",
              left: `${((passport.score - 23) / (MAX_SCORE - 23)) * 100}%`,
              top: "50%", transform: "translate(-50%, -50%)",
              width: 10, height: 10,
              background: color, border: `2px solid ${BG}`,
              borderRadius: "50%",
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontFamily: SANS, fontSize: 9, color: "#333" }}>23 · Weakest</span>
            <span style={{ fontFamily: SANS, fontSize: 9, color: "#333" }}>192 · Strongest</span>
          </div>
        </div>

        {/* Breakdown */}
        <p style={{ fontFamily: SANS, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: DIM, margin: "0 0 10px" }}>
          Access breakdown
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 2, marginBottom: 20 }}>
          {[
            { label: "Visa-free",       value: passport.vf,    sub: "No application", c: MINT      },
            { label: "Visa on arrival", value: passport.voa,   sub: "At the border",  c: "#a3e635" },
            { label: "Online access",   value: passport.evisa, sub: "eVisa / eTA",    c: "#facc15" },
          ].map(item => (
            <div key={item.label} style={{ background: SURF, padding: "12px 12px 10px", border: `1px solid ${BORD}` }}>
              <p style={{ fontFamily: HEAD, fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", color: item.c, margin: 0, lineHeight: 1 }}>
                {item.value}
              </p>
              <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, color: FG, margin: "5px 0 2px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {item.label}
              </p>
              <p style={{ fontFamily: SANS, fontSize: 10, color: DIM, margin: 0 }}>{item.sub}</p>
            </div>
          ))}
        </div>

        {/* Rarity */}
        <p style={{ fontFamily: SANS, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: DIM, margin: "0 0 10px" }}>
          Passport rarity
        </p>
        <div style={{ background: SURF, border: `1px solid ${BORD}`, padding: "16px", marginBottom: 20 }}>
          {/* Rarity tier badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <span style={{
              fontFamily: SANS, fontSize: 9, fontWeight: 700, letterSpacing: "0.2em",
              textTransform: "uppercase", color: rarity.rarityColor,
              border: `1px solid ${rarity.rarityColor}`, padding: "2px 8px",
            }}>
              {rarity.rarityLabel}
            </span>
          </div>

          {/* Main rarity description */}
          <p style={{ fontFamily: HEAD, fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", color: rarity.rarityColor, margin: "0 0 4px", lineHeight: 1.2 }}>
            {rarity.rarityDesc}
          </p>

          {/* Population bar */}
          <div style={{ margin: "14px 0 14px" }}>
            <div style={{ height: 5, background: BORD, position: "relative", marginBottom: 6 }}>
              <div style={{
                position: "absolute", left: 0, top: 0, height: "100%",
                background: rarity.rarityColor,
                width: `${Math.max(0.4, Math.min(100, rarity.sharePct))}%`,
                minWidth: 3,
                transition: "width 0.6s ease",
              }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontFamily: SANS, fontSize: 10, color: DIM }}>
                <span style={{ color: FG }}>{rarity.pct}</span> of 8 billion people
              </span>
              <span style={{ fontFamily: SANS, fontSize: 10, color: DIM }}>100%</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", borderTop: `1px solid ${BORD}`, paddingTop: 12 }}>
            {[
              { val: rarity.holders,      label: "Holders"      },
              { val: rarity.pct,          label: "Of world pop" },
              { val: `#${passport.rank}`, label: "Global rank"  },
            ].map(s => (
              <div key={s.label}>
                <p style={{ fontFamily: HEAD, fontSize: 18, fontWeight: 700, color: FG, margin: 0, lineHeight: 1 }}>{s.val}</p>
                <p style={{ fontFamily: SANS, fontSize: 10, color: DIM, margin: "4px 0 0", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Momentum */}
        {delta !== null && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", border: `1px solid ${BORD}`, marginBottom: 20, background: `${delta > 0 ? "#4ade80" : "#ef4444"}08` }}>
            <span style={{ fontSize: 16 }}>{delta > 0 ? "📈" : "📉"}</span>
            <p style={{ fontFamily: SANS, fontSize: 12, color: FG, margin: 0 }}>
              {delta > 0 ? `Gained ${delta} places` : `Lost ${Math.abs(delta)} places`} since 2020
              <span style={{ color: DIM }}> — {delta >= 5 ? "one of the fastest rising passports" : delta <= -5 ? "significant decline" : "steady movement"}</span>
            </p>
          </div>
        )}

        {/* Notable access */}
        <p style={{ fontFamily: SANS, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: DIM, margin: "0 0 10px" }}>
          Notable easy access
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
          {notable.map(dest => (
            <span key={dest} style={{
              fontFamily: SANS, fontSize: 11, color: FG,
              padding: "5px 10px", border: `1px solid ${BORD}`,
              background: SURF,
            }}>
              ✓ {dest}
            </span>
          ))}
        </div>

        {/* Peer passports */}
        {peers.length > 0 && (
          <>
            <p style={{ fontFamily: SANS, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: DIM, margin: "0 0 10px" }}>
              Similar passports
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 6, marginBottom: 20 }}>
              {peers.map(peer => (
                <div key={peer.slug} style={{
                  padding: "12px 14px", border: `1px solid ${BORD}`,
                  background: SURF, display: "flex", flexDirection: "column", gap: 6,
                }}>
                  {slugToIso(peer.slug)
                    ? <FlagIcon code={slugToIso(peer.slug)!} size="sm" />
                    : <span style={{ fontSize: 20 }}>{peer.flag}</span>}
                  <span style={{ fontFamily: SANS, fontSize: 12, color: FG, lineHeight: 1.2 }}>{peer.name}</span>
                  <span style={{ fontFamily: HEAD, fontSize: 16, fontWeight: 700, color: tierColor(peer.score), letterSpacing: "-0.02em" }}>{peer.score}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Share */}
        <ShareButton passport={passport} rarity={rarity} />

        {/* CTA */}
        <Link
          href={`/wizard?passport=${passport.slug}`}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 18px", background: MINT, color: "#0a0a0a",
            fontFamily: HEAD, fontSize: 12, fontWeight: 700,
            letterSpacing: "0.12em", textTransform: "uppercase",
            textDecoration: "none", boxShadow: `3px 3px 0 ${FG}`,
          }}
        >
          <span>See which countries suit this passport</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}

// ─── List row ─────────────────────────────────────────────────────────────────
function RankRow({ passport, onSelect }: { passport: Passport; onSelect: (p: Passport) => void }) {
  const color = tierColor(passport.score);
  const [hov, setHov] = useState(false);

  return (
    <>
      <style>{`
        @media (max-width: 480px) {
          .rank-row { grid-template-columns: 36px 26px 1fr 52px !important; }
          .rank-row-access { display: none !important; }
          .rank-list-header { grid-template-columns: 36px 26px 1fr 52px !important; }
          .rank-list-access-col { display: none !important; }
        }
      `}</style>
    <button
      type="button"
      onClick={() => onSelect(passport)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="rank-row"
      style={{
        display: "grid",
        gridTemplateColumns: "44px 30px 1fr 60px 100px",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        width: "100%",
        background: hov ? SURF : "transparent",
        border: "none",
        borderBottom: `1px solid ${BORD}`,
        cursor: "pointer",
        transition: "background 0.1s",
        userSelect: "none",
        textAlign: "left",
        font: "inherit",
        color: "inherit",
      }}
    >
      <span style={{ fontFamily: HEAD, fontSize: 11, fontWeight: 700, color: DIM, letterSpacing: "0.06em" }}>
        #{passport.rank}
      </span>
      <span style={{ lineHeight: 1 }}>
        {slugToIso(passport.slug)
          ? <FlagIcon code={slugToIso(passport.slug)!} size="sm" />
          : <span style={{ fontSize: 20 }}>{passport.flag}</span>}
      </span>
      <span style={{ fontFamily: SANS, fontSize: 14, color: FG }}>{passport.name}</span>
      <div style={{ textAlign: "right" }}>
        <span style={{ fontFamily: HEAD, fontSize: 14, fontWeight: 700, letterSpacing: "-0.02em", color, display: "block" }}>
          {passport.score}
        </span>
        {(() => { const d = getDelta(passport.slug); return d !== null ? (
          <span style={{ fontFamily: SANS, fontSize: 9, color: d > 0 ? "#4ade80" : "#ef4444" }}>
            {d > 0 ? `▲${d}` : `▼${Math.abs(d)}`}
          </span>
        ) : null; })()}
      </div>
      <div className="rank-row-access" style={{ height: 2, background: BORD }}>
        <div style={{ height: "100%", background: color, width: `${(passport.score / MAX_SCORE) * 100}%` }} />
      </div>
    </button>
    </>
  );
}

// ─── Passport context notes ──────────────────────────────────────────────────
const FUN_FACTS = [
  { flag: "🌐", text: "Passport access changes during the year. Treat every score as a snapshot, not live border advice." },
  { flag: "🛂", text: "Visa-free, visa-on-arrival and eVisa access are different. Border rules can still depend on purpose, stay length and documents." },
  { flag: "🇸🇬", text: "Singapore sits at the top of this snapshot, with the widest reported access score in the table." },
  { flag: "🇦🇫", text: "Afghanistan sits at the bottom of this snapshot, showing the widest mobility gap against the top passport." },
  { flag: "🇬🇧", text: "Post-Brexit, UK passport holders kept visa-free Schengen access for tourism but lost the right to live and work freely across the EU." },
  { flag: "🌍", text: "The gap between the strongest and weakest passport is 169 destinations — Singapore (192) vs Afghanistan (23)." },
  { flag: "🇻🇦", text: "Vatican City passports are issued only to a small group of officials, diplomats and senior clergy." },
  { flag: "🇧🇷", text: "Brazil and Argentina rank above India and China in this access snapshot." },
  { flag: "🇵🇹", text: "Portugal's Golden Visa real estate route — once Europe's most popular residency-by-investment path — was closed in October 2023." },
  { flag: "🇷🇺", text: "Practical access can differ from headline score when countries suspend agreements or add extra checks." },
];

function FactsTickerInline() {
  const [idx, setIdx]   = useState(() => Math.floor(Math.random() * FUN_FACTS.length));
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setFade(false);
      setTimeout(() => { setIdx(i => (i + 1) % FUN_FACTS.length); setFade(true); }, 400);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const fact = FUN_FACTS[idx];

  return (
    <div style={{
      border: `1px solid ${BORD}`, padding: "18px",
      background: "#0c0c0c", height: "100%", boxSizing: "border-box",
      display: "flex", flexDirection: "column", gap: 12,
    }}>
      <style>{`@keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
      <p style={{
        fontFamily: SANS, fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase",
        color: DIM, margin: 0, display: "flex", alignItems: "center", gap: 6,
      }}>
        <span style={{ width: 6, height: 6, background: MINT, borderRadius: "50%", display: "inline-block", animation: "pulse-dot 2s ease-in-out infinite" }} />
        Did you know
      </p>
      <div style={{ flex: 1, opacity: fade ? 1 : 0, transition: "opacity 0.4s ease" }}>
        <span style={{ fontSize: 22, display: "block", marginBottom: 8 }}>{fact.flag}</span>
        <p style={{ fontFamily: SANS, fontSize: 13, color: FG, lineHeight: 1.6, margin: 0 }}>{fact.text}</p>
      </div>
      <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
        {FUN_FACTS.map((_, i) => (
          <div key={i} style={{ width: i === idx ? 14 : 4, height: 3, background: i === idx ? MINT : BORD, transition: "all 0.4s ease" }} />
        ))}
      </div>
    </div>
  );
}

function FactsTicker() {
  const [idx, setIdx]       = useState(() => Math.floor(Math.random() * FUN_FACTS.length));
  const [fade, setFade]     = useState(true);
  const [open, setOpen]     = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % FUN_FACTS.length);
        setFade(true);
      }, 400);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const fact = FUN_FACTS[idx];

  return (
    <div style={{
      position: "fixed",
      bottom: 24,
      right: 24,
      zIndex: 9000,
      width: 280,
    }}
    className="facts-ticker-float"
    >
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @media (max-width: 640px) {
          .facts-ticker-float { display: none !important; }
        }
      `}</style>

      {/* Collapsed pill */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 16px",
            background: SURF, border: `1px solid ${BORD}`,
            color: FG, cursor: "pointer", fontFamily: SANS,
            fontSize: 11, letterSpacing: "0.12em",
            boxShadow: "0 4px 24px rgba(0,0,0,0.6)",
            float: "right",
          }}
        >
          <span style={{
            width: 6, height: 6, background: MINT, borderRadius: "50%", flexShrink: 0,
            animation: "pulse-dot 2s ease-in-out infinite",
          }} />
          DID YOU KNOW
        </button>
      )}

      {/* Expanded card */}
      {open && (
        <div style={{
          border: `1px solid ${BORD}`,
          padding: "18px",
          background: "#0c0c0c",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          boxShadow: "0 8px 40px rgba(0,0,0,0.7)",
          position: "relative",
        }}>
          {/* Header row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{
              fontFamily: SANS, fontSize: 9, letterSpacing: "0.2em",
              textTransform: "uppercase", color: DIM, margin: 0,
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{
                display: "inline-block", width: 6, height: 6,
                background: MINT, borderRadius: "50%",
                animation: "pulse-dot 2s ease-in-out infinite",
              }} />
              Did you know
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                background: "none", border: "none", color: DIM,
                cursor: "pointer", fontFamily: SANS, fontSize: 14,
                lineHeight: 1, padding: 0,
              }}
            >
              ×
            </button>
          </div>

          {/* Fact */}
          <div style={{ opacity: fade ? 1 : 0, transition: "opacity 0.4s ease" }}>
            <span style={{ fontSize: 22, display: "block", marginBottom: 8 }}>{fact.flag}</span>
            <p style={{ fontFamily: SANS, fontSize: 13, color: FG, lineHeight: 1.6, margin: 0 }}>
              {fact.text}
            </p>
          </div>

          {/* Progress pips */}
          <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            {FUN_FACTS.map((_, i) => (
              <div key={i} style={{
                width: i === idx ? 14 : 4, height: 3,
                background: i === idx ? MINT : BORD,
                transition: "all 0.4s ease",
              }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
function PassportPowerInner() {
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<Passport | null>(() => {
    const slug = searchParams.get("passport");
    return slug ? (ALL_PASSPORTS.find(p => p.slug === slug) ?? null) : null;
  });
  const [listSearch, setListSearch] = useState("");
  const [listGrouped, setListGrouped] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Podium picks:
  // center (#1): Singapore (thunder)
  // left   (#2): Japan
  // right  (#2): UAE
  const top1 = ALL_PASSPORTS.find(p => p.slug === "singapore")!;
  const top2 = ALL_PASSPORTS.find(p => p.slug === "japan")!;
  const top3 = ALL_PASSPORTS.find(p => p.slug === "uae")!;

  const handleSelect = (p: Passport) => setSelected(p);
  const handleClose  = useCallback(() => setSelected(null), []);

  return (
    <div style={{ minHeight: "100vh", background: BG, color: FG, fontFamily: SANS }}>
      <Nav countries={[]} onCountrySelect={() => {}} />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "72px 16px 0" : "88px 24px 0" }}>

        {/* Header */}
        {isMobile ? (
          <div style={{ marginBottom: 28 }}>
            <h1 style={{
              fontFamily: HEAD, fontSize: "clamp(32px, 9vw, 52px)", fontWeight: 800,
              letterSpacing: "-0.03em", lineHeight: 0.95, color: FG, margin: "0 0 14px",
            } as React.CSSProperties}>
              Not all passports<br />
              <span style={{ color: MINT }}>are equal.</span>
            </h1>
            <p style={{ fontFamily: SANS, fontSize: 13, color: DIM, lineHeight: 1.7, margin: 0 }}>
              192 reported destinations or 23. Passport access changes. Check official rules before travel.
            </p>
          </div>
        ) : (
          <div style={{ position: "relative", marginBottom: 40, minHeight: 200 }}>
            <div style={{ maxWidth: "58%", minWidth: 0 }}>
              <h1 style={{
                fontFamily: HEAD, fontSize: "clamp(36px, 5vw, 68px)", fontWeight: 800,
                letterSpacing: "-0.03em", lineHeight: 0.95, color: FG, margin: "0 0 16px",
              } as React.CSSProperties}>
                Not all passports<br />
                <span style={{ color: MINT }}>are equal.</span>
              </h1>
              <p style={{ fontFamily: SANS, fontSize: 14, color: DIM, lineHeight: 1.7, margin: 0 }}>
                192 reported destinations or 23. Passport access changes. Check official rules before travel.
              </p>
            </div>
            <div style={{ position: "absolute", top: 0, right: "min(calc(450px - 50vw), 0px)", width: 260 }}>
              <FactsTickerInline />
            </div>
          </div>
        )}

        {/* Podium — [Japan] [Singapore] [UAE] */}
        {isMobile ? (
          <div style={{ marginBottom: 28 }}>
            <HeroCard passport={top1} position={1} onSelect={handleSelect} />
          </div>
        ) : (
          <div style={{ display: "flex", gap: 2, marginBottom: 36, alignItems: "flex-end" }}>
            <HeroCard passport={top2} position={2} onSelect={handleSelect} />
            <HeroCard passport={top1} position={1} onSelect={handleSelect} />
            <HeroCard passport={top3} position={3} onSelect={handleSelect} />
          </div>
        )}

        {/* Ranked list */}
        <div>
          {/* List controls */}
          <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
            <input
              type="text"
              placeholder="Search 199 passports…"
              value={listSearch}
              onChange={e => setListSearch(e.target.value)}
              style={{
                flex: 1, fontFamily: SANS, fontSize: 13, color: FG,
                background: "#0f0f0f", border: `1px solid ${BORD}`,
                padding: "9px 14px", outline: "none",
              }}
            />
            <button
              type="button"
              onClick={() => setListGrouped(g => !g)}
              style={{
                fontFamily: SANS, fontSize: 11, letterSpacing: "0.1em",
                background: listGrouped ? MINT : "transparent",
                border: `1px solid ${listGrouped ? MINT : BORD}`,
                color: listGrouped ? BG : DIM,
                padding: "9px 16px", cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {listGrouped ? "TIERS ✓" : "TIERS"}
            </button>
          </div>

          <div className="rank-list-header" style={{
            display: "grid", gridTemplateColumns: "44px 30px 1fr 60px 100px",
            gap: 12, padding: "8px 16px", borderBottom: `1px solid ${BORD}`,
          }}>
            {["RANK", "", "COUNTRY", "SCORE", "ACCESS"].map((h, i) => (
              <span key={i} className={i === 4 ? "rank-list-access-col" : ""} style={{
                fontFamily: SANS, fontSize: 9, letterSpacing: "0.16em",
                textTransform: "uppercase", color: DIM,
                textAlign: i === 3 ? "right" : "left",
              }}>{h}</span>
            ))}
          </div>

          {listGrouped ? (
            ([
              { tier: 1 as const, label: "ELITE",   range: "180+",    min: 180, max: 999, tc: GOLD       },
              { tier: 2 as const, label: "STRONG",  range: "140–179", min: 140, max: 179, tc: SILVER     },
              { tier: 3 as const, label: "AVERAGE", range: "100–139", min: 100, max: 139, tc: "#facc15"  },
              { tier: 4 as const, label: "WEAK",    range: "<100",    min: 0,   max: 99,  tc: "#ef4444"  },
            ]).map(({ tier, label, range, min, max, tc }) => {
              const group = SORTED_PASSPORTS.filter(p =>
                p.score >= min && p.score <= max &&
                p.name.toLowerCase().includes(listSearch.toLowerCase())
              );
              if (!group.length) return null;
              return (
                <div key={tier}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 16px", borderBottom: `1px solid ${BORD}`,
                    background: `${tc}08`,
                  }}>
                    <span style={{ width: 6, height: 6, background: tc, flexShrink: 0 }} />
                    <span style={{ fontFamily: SANS, fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: tc }}>
                      {label} · {range} · {group.length} passports
                    </span>
                  </div>
                  {group.map(p => <RankRow key={p.slug} passport={p} onSelect={handleSelect} />)}
                </div>
              );
            })
          ) : (
            SORTED_PASSPORTS
              .filter(p => p.name.toLowerCase().includes(listSearch.toLowerCase()))
              .map(p => <RankRow key={p.slug} passport={p} onSelect={handleSelect} />)
          )}
        </div>

        {/* CTA */}
        <div style={{ padding: "52px 0 80px", borderTop: `1px solid ${BORD}`, marginTop: 40 }}>
          <p style={{
            fontFamily: HEAD, fontSize: "clamp(18px, 2.5vw, 28px)", fontWeight: 700,
            letterSpacing: "-0.02em", color: FG, margin: "0 0 10px", lineHeight: 1.2,
          }}>
            Know which countries fit your passport, salary and priorities.
          </p>
          <p style={{ fontFamily: SANS, fontSize: 14, color: DIM, margin: "0 0 24px", lineHeight: 1.7 }}>
            Origio scores 25 destinations against your job, budget and deal breakers.
          </p>
          <Link href="/wizard" style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "14px 28px", background: MINT, color: "#0a0a0a",
            fontFamily: HEAD, fontSize: 12, fontWeight: 700,
            letterSpacing: "0.12em", textTransform: "uppercase",
            textDecoration: "none", boxShadow: `4px 4px 0 ${FG}`,
          }}>
            Start free →
          </Link>
          <p style={{ fontFamily: SANS, fontSize: 12, color: DIM, margin: "14px 0 0" }}>
            No account needed · top 3 matches free
          </p>
        </div>

      </div>

      {selected && <PassportModal passport={selected} onClose={handleClose} />}

      <Footer />
    </div>
  );
}

export default function PassportPowerClient() {
  return (
    <Suspense>
      <PassportPowerInner />
    </Suspense>
  );
}
