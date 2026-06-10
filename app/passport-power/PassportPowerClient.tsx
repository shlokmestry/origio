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

// ─── Full Henley Passport Index 2024 dataset ──────────────────────────────────
// score = visa-free + visa-on-arrival + eTA (Henley 2024 Q3)
// vf = visa-free only · voa = visa on arrival · evisa = eVisa/eTA (approximate splits)
// population = approx. millions of citizens holding this passport
export type Passport = {
  rank: number;
  name: string;
  flag: string;
  score: number;
  vf: number;
  voa: number;
  evisa: number;
  population: number;
  slug: string;
};

const ALL_PASSPORTS: Passport[] = [
  // Rank 1 — 194
  { rank:1,  name:"Japan",          flag:"🇯🇵", score:194, vf:131, voa:47, evisa:16, population:125,   slug:"japan"          },
  { rank:1,  name:"Singapore",      flag:"🇸🇬", score:194, vf:133, voa:44, evisa:17, population:5.9,   slug:"singapore"      },
  // Rank 2 — 193
  { rank:2,  name:"France",         flag:"🇫🇷", score:193, vf:132, voa:43, evisa:18, population:68,    slug:"france"         },
  { rank:2,  name:"Germany",        flag:"🇩🇪", score:193, vf:132, voa:43, evisa:18, population:84,    slug:"germany"        },
  { rank:2,  name:"Italy",          flag:"🇮🇹", score:193, vf:132, voa:43, evisa:18, population:60,    slug:"italy"          },
  { rank:2,  name:"Spain",          flag:"🇪🇸", score:193, vf:132, voa:43, evisa:18, population:47,    slug:"spain"          },
  // Rank 3 — 192
  { rank:3,  name:"Austria",        flag:"🇦🇹", score:192, vf:131, voa:43, evisa:18, population:9,     slug:"austria"        },
  { rank:3,  name:"Finland",        flag:"🇫🇮", score:192, vf:131, voa:43, evisa:18, population:5.5,   slug:"finland"        },
  { rank:3,  name:"Ireland",        flag:"🇮🇪", score:192, vf:131, voa:43, evisa:18, population:5.1,   slug:"ireland"        },
  { rank:3,  name:"Luxembourg",     flag:"🇱🇺", score:192, vf:131, voa:43, evisa:18, population:0.67,  slug:"luxembourg"     },
  { rank:3,  name:"Netherlands",    flag:"🇳🇱", score:192, vf:131, voa:43, evisa:18, population:17.5,  slug:"netherlands"    },
  { rank:3,  name:"South Korea",    flag:"🇰🇷", score:192, vf:131, voa:43, evisa:18, population:51.7,  slug:"south-korea"    },
  { rank:3,  name:"Sweden",         flag:"🇸🇪", score:192, vf:131, voa:43, evisa:18, population:10.4,  slug:"sweden"         },
  // Rank 4 — 191
  { rank:4,  name:"Belgium",        flag:"🇧🇪", score:191, vf:130, voa:42, evisa:19, population:11.6,  slug:"belgium"        },
  { rank:4,  name:"Denmark",        flag:"🇩🇰", score:191, vf:130, voa:42, evisa:19, population:5.9,   slug:"denmark"        },
  { rank:4,  name:"New Zealand",    flag:"🇳🇿", score:191, vf:130, voa:42, evisa:19, population:5,     slug:"new-zealand"    },
  { rank:4,  name:"Norway",         flag:"🇳🇴", score:191, vf:130, voa:42, evisa:19, population:5.4,   slug:"norway"         },
  { rank:4,  name:"Switzerland",    flag:"🇨🇭", score:191, vf:130, voa:42, evisa:19, population:8.7,   slug:"switzerland"    },
  { rank:4,  name:"United Kingdom", flag:"🇬🇧", score:191, vf:130, voa:42, evisa:19, population:67,    slug:"united-kingdom" },
  // Rank 5 — 190
  { rank:5,  name:"Australia",      flag:"🇦🇺", score:190, vf:129, voa:42, evisa:19, population:26.5,  slug:"australia"      },
  { rank:5,  name:"Portugal",       flag:"🇵🇹", score:190, vf:129, voa:42, evisa:19, population:10.3,  slug:"portugal"       },
  // Rank 6 — 189
  { rank:6,  name:"Czechia",        flag:"🇨🇿", score:189, vf:128, voa:42, evisa:19, population:10.9,  slug:"czechia"        },
  { rank:6,  name:"Greece",         flag:"🇬🇷", score:189, vf:128, voa:42, evisa:19, population:10.4,  slug:"greece"         },
  // Rank 7 — 188
  { rank:7,  name:"Malta",          flag:"🇲🇹", score:188, vf:127, voa:42, evisa:19, population:0.54,  slug:"malta"          },
  { rank:7,  name:"Poland",         flag:"🇵🇱", score:188, vf:127, voa:42, evisa:19, population:41,    slug:"poland"         },
  // Rank 8 — 187
  { rank:8,  name:"Canada",         flag:"🇨🇦", score:187, vf:126, voa:42, evisa:19, population:38.8,  slug:"canada"         },
  { rank:8,  name:"Hungary",        flag:"🇭🇺", score:187, vf:126, voa:42, evisa:19, population:10,    slug:"hungary"        },
  { rank:8,  name:"United States",  flag:"🇺🇸", score:187, vf:126, voa:42, evisa:19, population:335,   slug:"usa"            },
  // Rank 9 — 186
  { rank:9,  name:"Estonia",        flag:"🇪🇪", score:186, vf:125, voa:42, evisa:19, population:1.4,   slug:"estonia"        },
  { rank:9,  name:"Lithuania",      flag:"🇱🇹", score:186, vf:125, voa:42, evisa:19, population:2.8,   slug:"lithuania"      },
  { rank:9,  name:"Slovakia",       flag:"🇸🇰", score:186, vf:125, voa:42, evisa:19, population:5.5,   slug:"slovakia"       },
  { rank:9,  name:"Slovenia",       flag:"🇸🇮", score:186, vf:125, voa:42, evisa:19, population:2.1,   slug:"slovenia"       },
  // Rank 10 — 185
  { rank:10, name:"Iceland",        flag:"🇮🇸", score:185, vf:124, voa:42, evisa:19, population:0.37,  slug:"iceland"        },
  { rank:10, name:"Latvia",         flag:"🇱🇻", score:185, vf:124, voa:42, evisa:19, population:1.8,   slug:"latvia"         },
  // Rank 11 — 184
  { rank:11, name:"Cyprus",         flag:"🇨🇾", score:184, vf:122, voa:42, evisa:20, population:1.2,   slug:"cyprus"         },
  { rank:11, name:"Romania",        flag:"🇷🇴", score:184, vf:122, voa:42, evisa:20, population:19,    slug:"romania"        },
  // Rank 12 — 183
  { rank:12, name:"UAE",            flag:"🇦🇪", score:183, vf:116, voa:47, evisa:20, population:1.1,   slug:"uae"            },
  // Rank 13 — 179
  { rank:13, name:"Malaysia",       flag:"🇲🇾", score:179, vf:114, voa:46, evisa:19, population:33,    slug:"malaysia"       },
  // Rank 14 — 177
  { rank:14, name:"Chile",          flag:"🇨🇱", score:177, vf:113, voa:44, evisa:20, population:19.5,  slug:"chile"          },
  // Rank 15 — 174
  { rank:15, name:"Brazil",         flag:"🇧🇷", score:174, vf:110, voa:43, evisa:21, population:215,   slug:"brazil"         },
  // Rank 16 — 172
  { rank:16, name:"Argentina",      flag:"🇦🇷", score:172, vf:109, voa:42, evisa:21, population:45,    slug:"argentina"      },
  // Rank 17 — 162
  { rank:17, name:"Mexico",         flag:"🇲🇽", score:162, vf:102, voa:40, evisa:20, population:130,   slug:"mexico"         },
  // Rank 18 — 148
  { rank:18, name:"Ukraine",        flag:"🇺🇦", score:148, vf:93,  voa:38, evisa:17, population:44,    slug:"ukraine"        },
  // Rank 19 — 138
  { rank:19, name:"Serbia",         flag:"🇷🇸", score:138, vf:87,  voa:35, evisa:16, population:7,     slug:"serbia"         },
  // Rank 20 — 111
  { rank:20, name:"Turkey",         flag:"🇹🇷", score:111, vf:70,  voa:30, evisa:11, population:85,    slug:"turkey"         },
  // Rank 21 — 104
  { rank:21, name:"South Africa",   flag:"🇿🇦", score:104, vf:66,  voa:27, evisa:11, population:60,    slug:"south-africa"   },
  // Rank 22 — 85
  { rank:22, name:"China",          flag:"🇨🇳", score:85,  vf:54,  voa:22, evisa:9,  population:1400,  slug:"china"          },
  // Rank 23 — 81
  { rank:23, name:"Thailand",       flag:"🇹🇭", score:81,  vf:51,  voa:21, evisa:9,  population:72,    slug:"thailand"       },
  // Rank 24 — 77
  { rank:24, name:"Indonesia",      flag:"🇮🇩", score:77,  vf:49,  voa:20, evisa:8,  population:275,   slug:"indonesia"      },
  // Rank 25 — 67
  { rank:25, name:"Philippines",    flag:"🇵🇭", score:67,  vf:43,  voa:17, evisa:7,  population:115,   slug:"philippines"    },
  // Rank 26 — 63
  { rank:26, name:"Ghana",          flag:"🇬🇭", score:63,  vf:40,  voa:16, evisa:7,  population:33,    slug:"ghana"          },
  // Rank 27 — 58
  { rank:27, name:"India",          flag:"🇮🇳", score:58,  vf:37,  voa:15, evisa:6,  population:1400,  slug:"india"          },
  // Rank 28 — 55
  { rank:28, name:"Vietnam",        flag:"🇻🇳", score:55,  vf:35,  voa:14, evisa:6,  population:98,    slug:"vietnam"        },
  // Rank 29 — 46
  { rank:29, name:"Nigeria",        flag:"🇳🇬", score:46,  vf:29,  voa:12, evisa:5,  population:225,   slug:"nigeria"        },
  // Rank 30 — 33
  { rank:30, name:"Pakistan",       flag:"🇵🇰", score:33,  vf:21,  voa:8,  evisa:4,  population:230,   slug:"pakistan"       },
];

const WORLD_POP = 8000;
const MAX_SCORE = 194;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getRarity(pop: number) {
  const share    = (pop / WORLD_POP) * 100;
  const rarerNum = 100 - share;
  const rarer    = rarerNum >= 99.9 ? "99.9%+" : rarerNum >= 99 ? `${rarerNum.toFixed(1)}%` : `${Math.round(rarerNum)}%`;
  const pct      = share < 0.1 ? "<0.1%" : share < 1 ? `${share.toFixed(2)}%` : `${share.toFixed(1)}%`;
  const holders  = pop >= 1000 ? `${(pop/1000).toFixed(1)}B` : pop >= 1 ? `${pop % 1 === 0 ? pop : pop.toFixed(1)}M` : `${(pop*1000).toFixed(0)}K`;
  return { rarer, pct, holders };
}

function getTierColor(score: number): string {
  if (score >= 180) return MINT;
  if (score >= 140) return "#a3e635";
  if (score >= 100) return "#facc15";
  return "#ef4444";
}

function getTierLabel(score: number): string {
  if (score >= 180) return "ELITE";
  if (score >= 140) return "STRONG";
  if (score >= 100) return "AVERAGE";
  return "WEAK";
}

// ─── Count-up hook ────────────────────────────────────────────────────────────
function useCountUp(target: number, active: boolean, delay = 0, duration = 1000): number {
  const [count, setCount] = useState(0);
  const rafRef            = useRef<number | null>(null);
  const startRef          = useRef<number | null>(null);

  useEffect(() => {
    if (!active) { setCount(0); return; }
    const t = setTimeout(() => {
      startRef.current = null;
      const step = (ts: number) => {
        if (!startRef.current) startRef.current = ts;
        const p = Math.min((ts - startRef.current) / duration, 1);
        const e = 1 - Math.pow(1 - p, 4);
        setCount(Math.round(target * e));
        if (p < 1) rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    }, delay);
    return () => { clearTimeout(t); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, active, delay, duration]);

  return count;
}

// ─── Hero card ────────────────────────────────────────────────────────────────
// CSS animations injected at page level; no SVG calc() hacks.
function HeroCard({
  passport, position, active, onSelect,
}: {
  passport: Passport;
  position: 1 | 2 | 3;
  active: boolean;
  onSelect: (p: Passport) => void;
}) {
  const color = position === 1 ? MINT : position === 2 ? "#a3e635" : "#facc15";
  const delay = (position - 1) * 150;
  const count = useCountUp(passport.score, active, delay + 300);
  const rarity = getRarity(passport.population);

  const icons: Record<1|2|3, string> = { 1: "⚡", 2: "🔑", 3: "🌍" };
  const animClass = `hero-card-${position}`;

  return (
    <button
      onClick={() => onSelect(passport)}
      className={animClass}
      style={{
        flex: position === 1 ? "1.15" : "1",
        background: SURF,
        border: `1px solid ${color}`,
        padding: "24px 20px 20px",
        textAlign: "left",
        cursor: "pointer",
        color: FG,
        opacity: active ? 1 : 0,
        transform: active ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.45s ease ${delay}ms, transform 0.55s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Scan-line overlay animation */}
      <div className={`scan-line-${position}`} style={{
        position: "absolute", left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent, ${color}60, transparent)`,
        pointerEvents: "none",
      }} />

      {/* Rank badge + icon */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{
          fontFamily: SANS, fontSize: 9, letterSpacing: "0.2em",
          textTransform: "uppercase", color,
          border: `1px solid ${color}`, padding: "3px 8px",
        }}>
          RANK #{passport.rank}
        </span>
        <span style={{ fontSize: 18 }}>{icons[position]}</span>
      </div>

      {/* Flag + name */}
      <div style={{ marginBottom: 18 }}>
        <span style={{ fontSize: 28, display: "block", marginBottom: 8 }}>{passport.flag}</span>
        <p style={{
          fontFamily: HEAD, fontSize: 18, fontWeight: 800,
          letterSpacing: "-0.02em", color: FG, margin: 0, lineHeight: 1,
        }}>
          {passport.name.toUpperCase()}
        </p>
      </div>

      {/* Score */}
      <p style={{
        fontFamily: HEAD,
        fontSize: position === 1 ? 56 : 48,
        fontWeight: 800,
        letterSpacing: "-0.04em",
        color,
        margin: 0,
        lineHeight: 1,
        fontVariantNumeric: "tabular-nums",
      }}>
        {count}
      </p>
      <p style={{ fontFamily: SANS, fontSize: 10, color: DIM, margin: "6px 0 14px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
        destinations
      </p>

      {/* Fill bar */}
      <div style={{ height: 2, background: BORD }}>
        <div style={{
          height: "100%", background: color,
          width: active ? `${(passport.score / MAX_SCORE) * 100}%` : "0%",
          transition: `width 1.1s cubic-bezier(0.16,1,0.3,1) ${delay + 500}ms`,
        }} />
      </div>

      {/* Rarity */}
      <p style={{ fontFamily: SANS, fontSize: 11, color: DIM, margin: "12px 0 0", lineHeight: 1.5 }}>
        <span style={{ color: FG }}>{rarity.holders}</span> holders ·{" "}
        <span style={{ color }}>rarer than {rarity.rarer}</span>
      </p>
    </button>
  );
}

// ─── Passport modal ────────────────────────────────────────────────────────────
function PassportModal({ passport, onClose }: { passport: Passport; onClose: () => void }) {
  const rarity = getRarity(passport.population);
  const color  = getTierColor(passport.score);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.8)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
        animation: "pp-backdrop 0.2s ease forwards",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#0f0f0f",
          border: `1px solid ${color}`,
          boxShadow: `4px 4px 0 ${color}`,
          width: "100%",
          maxWidth: 540,
          maxHeight: "88vh",
          overflowY: "auto",
          padding: "32px",
          animation: "pp-modal 0.28s cubic-bezier(0.16,1,0.3,1) forwards",
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

        {/* Country header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
          <span style={{ fontSize: 40 }}>{passport.flag}</span>
          <div>
            <p style={{ fontFamily: HEAD, fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", color: FG, margin: 0, lineHeight: 1 }}>
              {passport.name.toUpperCase()}
            </p>
            <p style={{ fontFamily: SANS, fontSize: 11, color: DIM, margin: "6px 0 0", letterSpacing: "0.08em" }}>
              HENLEY PASSPORT INDEX 2024 · RANK #{passport.rank} OF 199
            </p>
          </div>
        </div>

        {/* Tier + score */}
        <div style={{ padding: "14px 16px", border: `1px solid ${color}`, background: `${color}0d`, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontFamily: HEAD, fontSize: 12, letterSpacing: "0.12em", color }}>{getTierLabel(passport.score)}</span>
            <span style={{ fontFamily: HEAD, fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", color: FG }}>
              {passport.score}
              <span style={{ fontSize: 12, color: DIM, fontWeight: 400 }}> / {MAX_SCORE}</span>
            </span>
          </div>
          <div style={{ height: 3, background: BORD }}>
            <div style={{ height: "100%", background: color, width: `${(passport.score / MAX_SCORE) * 100}%` }} />
          </div>
        </div>

        {/* Visa breakdown */}
        <p style={{ fontFamily: SANS, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: DIM, margin: "0 0 10px" }}>
          Access breakdown
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, marginBottom: 24 }}>
          {[
            { label: "Visa-free",       value: passport.vf,    sub: "No application", color: MINT      },
            { label: "Visa on arrival", value: passport.voa,   sub: "At the border",  color: "#a3e635" },
            { label: "eVisa / eTA",     value: passport.evisa, sub: "Online only",    color: "#facc15" },
          ].map(item => (
            <div key={item.label} style={{ background: SURF, padding: "12px 12px 10px", border: `1px solid ${BORD}` }}>
              <p style={{ fontFamily: HEAD, fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", color: item.color, margin: 0, lineHeight: 1 }}>
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
        <div style={{ background: SURF, border: `1px solid ${BORD}`, padding: "16px", marginBottom: 22 }}>
          <p style={{ fontFamily: HEAD, fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", color: MINT, margin: "0 0 10px", lineHeight: 1.2 }}>
            Rarer than {rarity.rarer} of the world.
          </p>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[
              { val: rarity.holders, label: "Holders" },
              { val: rarity.pct,     label: "Of world pop" },
              { val: `#${passport.rank}`, label: "Global rank" },
            ].map(s => (
              <div key={s.label}>
                <p style={{ fontFamily: HEAD, fontSize: 20, fontWeight: 700, color: FG, margin: 0, lineHeight: 1 }}>{s.val}</p>
                <p style={{ fontFamily: SANS, fontSize: 10, color: DIM, margin: "4px 0 0", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Link href="/wizard" style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 18px",
          background: MINT, color: "#0a0a0a",
          fontFamily: HEAD, fontSize: 12, fontWeight: 700,
          letterSpacing: "0.12em", textTransform: "uppercase",
          textDecoration: "none",
          boxShadow: `3px 3px 0 ${FG}`,
        }}>
          <span>See which countries suit this passport</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}

// ─── Ranked list row ──────────────────────────────────────────────────────────
function RankRow({ passport, onSelect }: { passport: Passport; onSelect: (p: Passport) => void }) {
  const color = getTierColor(passport.score);
  const [hov, setHov] = useState(false);

  return (
    <button
      onClick={() => onSelect(passport)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: "100%",
        display: "grid",
        gridTemplateColumns: "44px 30px 1fr 60px 100px",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        background: hov ? SURF : "transparent",
        border: "none",
        borderBottom: `1px solid ${BORD}`,
        color: FG,
        cursor: "pointer",
        textAlign: "left",
        transition: "background 0.1s",
      }}
    >
      <span style={{ fontFamily: HEAD, fontSize: 11, fontWeight: 700, color: DIM, letterSpacing: "0.06em" }}>
        #{passport.rank}
      </span>
      <span style={{ fontSize: 20, lineHeight: 1 }}>{passport.flag}</span>
      <span style={{ fontFamily: SANS, fontSize: 14, color: FG }}>{passport.name}</span>
      <span style={{ fontFamily: HEAD, fontSize: 14, fontWeight: 700, letterSpacing: "-0.02em", color, textAlign: "right" }}>
        {passport.score}
      </span>
      <div style={{ height: 2, background: BORD }}>
        <div style={{ height: "100%", background: color, width: `${(passport.score / MAX_SCORE) * 100}%` }} />
      </div>
    </button>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function PassportPowerClient() {
  const [heroActive, setHeroActive] = useState(false);
  const [selected,   setSelected]   = useState<Passport | null>(null);

  const top1 = ALL_PASSPORTS[0]; // Japan
  const top2 = ALL_PASSPORTS[1]; // Singapore
  const top3 = ALL_PASSPORTS[2]; // France

  useEffect(() => {
    const t = setTimeout(() => setHeroActive(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleSelect = useCallback((p: Passport) => setSelected(p), []);
  const handleClose  = useCallback(() => setSelected(null), []);

  return (
    <div style={{ minHeight: "100vh", background: BG, color: FG, fontFamily: SANS }}>
      <Nav countries={[]} onCountrySelect={() => {}} />

      <style>{`
        @keyframes pp-backdrop { from { opacity:0; } to { opacity:1; } }
        @keyframes pp-modal    { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }

        /* Scan line floats down each hero card */
        @keyframes scan-1 { 0%,100%{top:0%}  50%{top:100%} }
        @keyframes scan-2 { 0%,100%{top:20%} 50%{top:90%}  }
        @keyframes scan-3 { 0%,100%{top:40%} 50%{top:80%}  }
        .scan-line-1 { animation: scan-1 3s ease-in-out 1.2s infinite; }
        .scan-line-2 { animation: scan-2 3.6s ease-in-out 1.6s infinite; }
        .scan-line-3 { animation: scan-3 4.2s ease-in-out 2s infinite; }

        /* Pulsing glow on hero cards */
        @keyframes glow-1 { 0%,100%{ box-shadow:0 0 0 1px ${MINT},  3px 3px 0 ${MINT};  } 50%{ box-shadow:0 0 16px 1px ${MINT}44, 3px 3px 0 ${MINT};  } }
        @keyframes glow-2 { 0%,100%{ box-shadow:0 0 0 1px #a3e635, 3px 3px 0 #a3e635; } 50%{ box-shadow:0 0 12px 1px #a3e63544, 3px 3px 0 #a3e635; } }
        @keyframes glow-3 { 0%,100%{ box-shadow:0 0 0 1px #facc15, 3px 3px 0 #facc15; } 50%{ box-shadow:0 0 10px 1px #facc1544, 3px 3px 0 #facc15; } }
        .hero-card-1 { animation: glow-1 2.8s ease-in-out 1.5s infinite; }
        .hero-card-2 { animation: glow-2 3.2s ease-in-out 1.8s infinite; }
        .hero-card-3 { animation: glow-3 3.6s ease-in-out 2.1s infinite; }

        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition:none!important; animation:none!important; } }
      `}</style>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "88px 24px 0" }}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 44 }}>
          <p style={{
            fontFamily: SANS, fontSize: 11, letterSpacing: "0.22em",
            textTransform: "uppercase", color: DIM, marginBottom: 16,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ color: MINT, fontSize: 8 }}>●</span>
            Passport Power · Henley Index 2024
          </p>
          <h1 style={{
            fontFamily: HEAD,
            fontSize: "clamp(36px, 6vw, 72px)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 0.95,
            color: FG,
            margin: "0 0 16px",
          } as React.CSSProperties}>
            The world&apos;s
            <br />
            <span style={{ color: MINT }}>strongest passports.</span>
          </h1>
          <p style={{ fontFamily: SANS, fontSize: 14, color: DIM, lineHeight: 1.7, maxWidth: 480, margin: 0 }}>
            Ranked by visa-free access across 199 countries. Click any passport to see the full breakdown.
          </p>
        </div>

        {/* ── Top 3 showcase ─────────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 2, marginBottom: 12 }}>
          <HeroCard passport={top1} position={1} active={heroActive} onSelect={handleSelect} />
          <HeroCard passport={top2} position={2} active={heroActive} onSelect={handleSelect} />
          <HeroCard passport={top3} position={3} active={heroActive} onSelect={handleSelect} />
        </div>

        <p style={{ fontFamily: SANS, fontSize: 11, color: DIM, margin: "0 0 36px", letterSpacing: "0.04em" }}>
          Click any passport for the full breakdown
        </p>

        {/* ── Ranked list ────────────────────────────────────────────────── */}
        <div>
          <div style={{
            display: "grid", gridTemplateColumns: "44px 30px 1fr 60px 100px",
            gap: 12, padding: "8px 16px", borderBottom: `1px solid ${BORD}`,
          }}>
            {["RANK", "", "COUNTRY", "SCORE", "ACCESS"].map((h, i) => (
              <span key={i} style={{
                fontFamily: SANS, fontSize: 9, letterSpacing: "0.16em",
                textTransform: "uppercase", color: DIM,
                textAlign: i === 3 ? "right" : "left",
              }}>{h}</span>
            ))}
          </div>
          {ALL_PASSPORTS.map(p => (
            <RankRow key={p.slug} passport={p} onSelect={handleSelect} />
          ))}
        </div>

        {/* ── CTA ────────────────────────────────────────────────────────── */}
        <div style={{ padding: "52px 0 80px", borderTop: `1px solid ${BORD}`, marginTop: 40 }}>
          <p style={{
            fontFamily: HEAD, fontSize: "clamp(18px, 2.5vw, 28px)", fontWeight: 700,
            letterSpacing: "-0.02em", color: FG, margin: "0 0 10px", lineHeight: 1.2,
          }}>
            Know which countries actually fit your passport, salary and priorities.
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
