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

// ─── Passport data (Henley 2025 Q1) ──────────────────────────────────────────
export type Passport = {
  rank: number; name: string; flag: string;
  score: number; vf: number; voa: number; evisa: number;
  population: number; slug: string;
};

const ALL_PASSPORTS: Passport[] = [
  // Rank 1 — score 194
  { rank:1,  name:"France",           flag:"🇫🇷", score:194, vf:134, voa:42, evisa:18, population:68,    slug:"france"           },
  { rank:1,  name:"Germany",          flag:"🇩🇪", score:194, vf:134, voa:42, evisa:18, population:84,    slug:"germany"          },
  { rank:1,  name:"Italy",            flag:"🇮🇹", score:194, vf:134, voa:42, evisa:18, population:60,    slug:"italy"            },
  { rank:1,  name:"Japan",            flag:"🇯🇵", score:194, vf:134, voa:42, evisa:18, population:125,   slug:"japan"            },
  { rank:1,  name:"Singapore",        flag:"🇸🇬", score:194, vf:134, voa:42, evisa:18, population:5.9,   slug:"singapore"        },
  { rank:1,  name:"Spain",            flag:"🇪🇸", score:194, vf:134, voa:42, evisa:18, population:47,    slug:"spain"            },
  // Rank 2 — score 193
  { rank:2,  name:"Finland",          flag:"🇫🇮", score:193, vf:133, voa:42, evisa:18, population:5.5,   slug:"finland"          },
  { rank:2,  name:"South Korea",      flag:"🇰🇷", score:193, vf:133, voa:42, evisa:18, population:51.7,  slug:"south-korea"      },
  { rank:2,  name:"Sweden",           flag:"🇸🇪", score:193, vf:133, voa:42, evisa:18, population:10.4,  slug:"sweden"           },
  // Rank 3 — score 192
  { rank:3,  name:"Austria",          flag:"🇦🇹", score:192, vf:132, voa:42, evisa:18, population:9,     slug:"austria"          },
  { rank:3,  name:"Denmark",          flag:"🇩🇰", score:192, vf:132, voa:42, evisa:18, population:5.9,   slug:"denmark"          },
  { rank:3,  name:"Ireland",          flag:"🇮🇪", score:192, vf:132, voa:42, evisa:18, population:5.1,   slug:"ireland"          },
  { rank:3,  name:"Luxembourg",       flag:"🇱🇺", score:192, vf:132, voa:42, evisa:18, population:0.67,  slug:"luxembourg"       },
  { rank:3,  name:"Netherlands",      flag:"🇳🇱", score:192, vf:132, voa:42, evisa:18, population:17.5,  slug:"netherlands"      },
  { rank:3,  name:"Norway",           flag:"🇳🇴", score:192, vf:132, voa:42, evisa:18, population:5.4,   slug:"norway"           },
  { rank:3,  name:"United Kingdom",   flag:"🇬🇧", score:192, vf:132, voa:42, evisa:18, population:67,    slug:"united-kingdom"   },
  // Rank 4 — score 191
  { rank:4,  name:"Belgium",          flag:"🇧🇪", score:191, vf:131, voa:42, evisa:18, population:11.6,  slug:"belgium"          },
  { rank:4,  name:"New Zealand",      flag:"🇳🇿", score:191, vf:131, voa:42, evisa:18, population:5,     slug:"new-zealand"      },
  { rank:4,  name:"Portugal",         flag:"🇵🇹", score:191, vf:131, voa:42, evisa:18, population:10.3,  slug:"portugal"         },
  { rank:4,  name:"Switzerland",      flag:"🇨🇭", score:191, vf:131, voa:42, evisa:18, population:8.7,   slug:"switzerland"      },
  // Rank 5 — score 190
  { rank:5,  name:"Australia",        flag:"🇦🇺", score:190, vf:130, voa:42, evisa:18, population:26.5,  slug:"australia"        },
  { rank:5,  name:"Czechia",          flag:"🇨🇿", score:190, vf:130, voa:42, evisa:18, population:10.9,  slug:"czechia"          },
  { rank:5,  name:"Hungary",          flag:"🇭🇺", score:190, vf:130, voa:42, evisa:18, population:10,    slug:"hungary"          },
  // Rank 6 — score 189
  { rank:6,  name:"Canada",           flag:"🇨🇦", score:189, vf:129, voa:42, evisa:18, population:38.8,  slug:"canada"           },
  { rank:6,  name:"Greece",           flag:"🇬🇷", score:189, vf:129, voa:42, evisa:18, population:10.4,  slug:"greece"           },
  { rank:6,  name:"Malta",            flag:"🇲🇹", score:189, vf:129, voa:42, evisa:18, population:0.54,  slug:"malta"            },
  { rank:6,  name:"Poland",           flag:"🇵🇱", score:189, vf:129, voa:42, evisa:18, population:41,    slug:"poland"           },
  // Rank 7 — score 188
  { rank:7,  name:"Iceland",          flag:"🇮🇸", score:188, vf:128, voa:42, evisa:18, population:0.37,  slug:"iceland"          },
  { rank:7,  name:"United States",    flag:"🇺🇸", score:188, vf:128, voa:42, evisa:18, population:335,   slug:"usa"              },
  // Rank 8 — score 187
  { rank:8,  name:"Estonia",          flag:"🇪🇪", score:187, vf:127, voa:42, evisa:18, population:1.4,   slug:"estonia"          },
  { rank:8,  name:"Latvia",           flag:"🇱🇻", score:187, vf:127, voa:42, evisa:18, population:1.8,   slug:"latvia"           },
  { rank:8,  name:"Lithuania",        flag:"🇱🇹", score:187, vf:127, voa:42, evisa:18, population:2.8,   slug:"lithuania"        },
  { rank:8,  name:"Slovakia",         flag:"🇸🇰", score:187, vf:127, voa:42, evisa:18, population:5.5,   slug:"slovakia"         },
  { rank:8,  name:"Slovenia",         flag:"🇸🇮", score:187, vf:127, voa:42, evisa:18, population:2.1,   slug:"slovenia"         },
  // Rank 9 — score 186
  { rank:9,  name:"Cyprus",           flag:"🇨🇾", score:186, vf:126, voa:42, evisa:18, population:1.2,   slug:"cyprus"           },
  { rank:9,  name:"Romania",          flag:"🇷🇴", score:186, vf:126, voa:42, evisa:18, population:19,    slug:"romania"          },
  // Rank 10 — score 185
  { rank:10, name:"UAE",              flag:"🇦🇪", score:185, vf:116, voa:49, evisa:20, population:1.1,   slug:"uae"              },
  // Rank 11 — score 183
  { rank:11, name:"Malaysia",         flag:"🇲🇾", score:183, vf:115, voa:47, evisa:21, population:33,    slug:"malaysia"         },
  // Extra between 11-12
  { rank:11, name:"Taiwan",           flag:"🇹🇼", score:183, vf:115, voa:47, evisa:21, population:23.6,  slug:"taiwan"           },
  { rank:12, name:"Croatia",          flag:"🇭🇷", score:181, vf:118, voa:44, evisa:19, population:3.9,   slug:"croatia"          },
  { rank:12, name:"Israel",           flag:"🇮🇱", score:181, vf:118, voa:44, evisa:19, population:9.7,   slug:"israel"           },
  // Rank 12 — score 178
  { rank:13, name:"Chile",            flag:"🇨🇱", score:178, vf:113, voa:44, evisa:21, population:19.5,  slug:"chile"            },
  { rank:13, name:"Uruguay",          flag:"🇺🇾", score:178, vf:113, voa:44, evisa:21, population:3.5,   slug:"uruguay"          },
  // Rank 13 — score 175
  { rank:14, name:"Brazil",           flag:"🇧🇷", score:175, vf:111, voa:43, evisa:21, population:215,   slug:"brazil"           },
  { rank:14, name:"Costa Rica",       flag:"🇨🇷", score:175, vf:111, voa:43, evisa:21, population:5.2,   slug:"costa-rica"       },
  { rank:14, name:"Panama",           flag:"🇵🇦", score:175, vf:111, voa:43, evisa:21, population:4.4,   slug:"panama"           },
  // Rank 14 — score 172
  { rank:15, name:"Argentina",        flag:"🇦🇷", score:172, vf:109, voa:42, evisa:21, population:45,    slug:"argentina"        },
  { rank:15, name:"Paraguay",         flag:"🇵🇾", score:172, vf:109, voa:42, evisa:21, population:7.4,   slug:"paraguay"         },
  // Rank 15 — score 162
  { rank:16, name:"Mexico",           flag:"🇲🇽", score:162, vf:102, voa:40, evisa:20, population:130,   slug:"mexico"           },
  { rank:16, name:"Peru",             flag:"🇵🇪", score:162, vf:102, voa:40, evisa:20, population:33,    slug:"peru"             },
  { rank:16, name:"Trinidad & Tobago",flag:"🇹🇹", score:162, vf:102, voa:40, evisa:20, population:1.5,   slug:"trinidad-tobago"  },
  // Rank 16 — score 148
  { rank:17, name:"Albania",          flag:"🇦🇱", score:148, vf:93,  voa:38, evisa:17, population:2.8,   slug:"albania"          },
  { rank:17, name:"Colombia",         flag:"🇨🇴", score:148, vf:93,  voa:38, evisa:17, population:52,    slug:"colombia"         },
  { rank:17, name:"North Macedonia",  flag:"🇲🇰", score:148, vf:93,  voa:38, evisa:17, population:2.1,   slug:"north-macedonia"  },
  { rank:17, name:"Serbia",           flag:"🇷🇸", score:148, vf:93,  voa:38, evisa:17, population:7,     slug:"serbia"           },
  { rank:17, name:"Ukraine",          flag:"🇺🇦", score:148, vf:93,  voa:38, evisa:17, population:44,    slug:"ukraine"          },
  // Rank 17 — score 138
  { rank:18, name:"Bosnia",           flag:"🇧🇦", score:138, vf:87,  voa:35, evisa:16, population:3.3,   slug:"bosnia"           },
  { rank:18, name:"Ecuador",          flag:"🇪🇨", score:138, vf:87,  voa:35, evisa:16, population:18,    slug:"ecuador"          },
  { rank:18, name:"Georgia",          flag:"🇬🇪", score:138, vf:87,  voa:35, evisa:16, population:3.7,   slug:"georgia"          },
  { rank:18, name:"Moldova",          flag:"🇲🇩", score:138, vf:87,  voa:35, evisa:16, population:2.6,   slug:"moldova"          },
  { rank:18, name:"Russia",           flag:"🇷🇺", score:119, vf:75,  voa:30, evisa:14, population:144,   slug:"russia"           },
  // Rank 18 — score 111
  { rank:19, name:"Honduras",         flag:"🇭🇳", score:116, vf:73,  voa:30, evisa:13, population:10.3,  slug:"honduras"         },
  { rank:19, name:"Kazakhstan",       flag:"🇰🇿", score:116, vf:73,  voa:30, evisa:13, population:19.4,  slug:"kazakhstan"       },
  { rank:19, name:"Turkey",           flag:"🇹🇷", score:111, vf:70,  voa:29, evisa:12, population:85,    slug:"turkey"           },
  // Rank 19 — score 104
  { rank:20, name:"Jordan",           flag:"🇯🇴", score:108, vf:68,  voa:28, evisa:12, population:10.2,  slug:"jordan"           },
  { rank:20, name:"Morocco",          flag:"🇲🇦", score:108, vf:68,  voa:28, evisa:12, population:37,    slug:"morocco"          },
  { rank:20, name:"Saudi Arabia",     flag:"🇸🇦", score:108, vf:68,  voa:28, evisa:12, population:35,    slug:"saudi-arabia"     },
  { rank:20, name:"South Africa",     flag:"🇿🇦", score:104, vf:66,  voa:27, evisa:11, population:60,    slug:"south-africa"     },
  { rank:20, name:"Tunisia",          flag:"🇹🇳", score:104, vf:66,  voa:27, evisa:11, population:12,    slug:"tunisia"          },
  // Rank 20 — score 85
  { rank:21, name:"China",            flag:"🇨🇳", score:85,  vf:54,  voa:22, evisa:9,  population:1400,  slug:"china"            },
  { rank:21, name:"Kenya",            flag:"🇰🇪", score:85,  vf:54,  voa:22, evisa:9,  population:55,    slug:"kenya"            },
  { rank:21, name:"Sri Lanka",        flag:"🇱🇰", score:85,  vf:54,  voa:22, evisa:9,  population:22,    slug:"sri-lanka"        },
  { rank:21, name:"Tanzania",         flag:"🇹🇿", score:84,  vf:53,  voa:22, evisa:9,  population:65,    slug:"tanzania"         },
  // Rank 21 — score 81
  { rank:22, name:"Lebanon",          flag:"🇱🇧", score:81,  vf:51,  voa:21, evisa:9,  population:6.8,   slug:"lebanon"          },
  { rank:22, name:"Tajikistan",       flag:"🇹🇯", score:81,  vf:51,  voa:21, evisa:9,  population:9.9,   slug:"tajikistan"       },
  { rank:22, name:"Thailand",         flag:"🇹🇭", score:81,  vf:51,  voa:21, evisa:9,  population:72,    slug:"thailand"         },
  // Rank 22 — score 77
  { rank:23, name:"Ethiopia",         flag:"🇪🇹", score:78,  vf:49,  voa:20, evisa:9,  population:126,   slug:"ethiopia"         },
  { rank:23, name:"Indonesia",        flag:"🇮🇩", score:77,  vf:49,  voa:20, evisa:8,  population:275,   slug:"indonesia"        },
  { rank:23, name:"Uganda",           flag:"🇺🇬", score:77,  vf:49,  voa:20, evisa:8,  population:48,    slug:"uganda"           },
  // Rank 23 — score 67
  { rank:24, name:"Egypt",            flag:"🇪🇬", score:67,  vf:43,  voa:17, evisa:7,  population:105,   slug:"egypt"            },
  { rank:24, name:"Philippines",      flag:"🇵🇭", score:67,  vf:43,  voa:17, evisa:7,  population:115,   slug:"philippines"      },
  // Rank 24 — score 63
  { rank:25, name:"Cameroon",         flag:"🇨🇲", score:63,  vf:40,  voa:16, evisa:7,  population:28,    slug:"cameroon"         },
  { rank:25, name:"Ghana",            flag:"🇬🇭", score:63,  vf:40,  voa:16, evisa:7,  population:33,    slug:"ghana"            },
  { rank:25, name:"Venezuela",        flag:"🇻🇪", score:63,  vf:40,  voa:16, evisa:7,  population:28,    slug:"venezuela"        },
  // Rank 25 — score 58
  { rank:26, name:"Bangladesh",       flag:"🇧🇩", score:58,  vf:37,  voa:15, evisa:6,  population:170,   slug:"bangladesh"       },
  { rank:26, name:"India",            flag:"🇮🇳", score:58,  vf:37,  voa:15, evisa:6,  population:1400,  slug:"india"            },
  { rank:26, name:"Zimbabwe",         flag:"🇿🇼", score:58,  vf:37,  voa:15, evisa:6,  population:16,    slug:"zimbabwe"         },
  // Rank 26 — score 55
  { rank:27, name:"Nepal",            flag:"🇳🇵", score:55,  vf:35,  voa:14, evisa:6,  population:30,    slug:"nepal"            },
  { rank:27, name:"Vietnam",          flag:"🇻🇳", score:55,  vf:35,  voa:14, evisa:6,  population:98,    slug:"vietnam"          },
  // Rank 27 — score 46
  { rank:28, name:"DRC",              flag:"🇨🇩", score:46,  vf:29,  voa:12, evisa:5,  population:100,   slug:"drc"              },
  { rank:28, name:"Nigeria",          flag:"🇳🇬", score:46,  vf:29,  voa:12, evisa:5,  population:225,   slug:"nigeria"          },
  // Rank 28 — score 33
  { rank:29, name:"Pakistan",         flag:"🇵🇰", score:33,  vf:21,  voa:8,  evisa:4,  population:230,   slug:"pakistan"         },
  { rank:29, name:"Sudan",            flag:"🇸🇩", score:33,  vf:21,  voa:8,  evisa:4,  population:46,    slug:"sudan"            },
  // Bottom tier
  { rank:30, name:"Yemen",            flag:"🇾🇪", score:28,  vf:18,  voa:7,  evisa:3,  population:34,    slug:"yemen"            },
  { rank:30, name:"Syria",            flag:"🇸🇾", score:25,  vf:16,  voa:6,  evisa:3,  population:22,    slug:"syria"            },
  { rank:30, name:"Iraq",             flag:"🇮🇶", score:28,  vf:18,  voa:7,  evisa:3,  population:42,    slug:"iraq"             },
  { rank:30, name:"Afghanistan",      flag:"🇦🇫", score:26,  vf:17,  voa:6,  evisa:3,  population:40,    slug:"afghanistan"      },
];

// Sort by score desc then name asc
const SORTED_PASSPORTS = [...ALL_PASSPORTS].sort((a, b) =>
  b.score !== a.score ? b.score - a.score : a.name.localeCompare(b.name)
);

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

function tierColor(score: number) {
  if (score >= 180) return MINT;
  if (score >= 140) return "#a3e635";
  if (score >= 100) return "#facc15";
  return "#ef4444";
}

function tierLabel(score: number) {
  if (score >= 180) return "ELITE";
  if (score >= 140) return "STRONG";
  if (score >= 100) return "AVERAGE";
  return "WEAK";
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
  const color  = MINT; // all top cards use MINT
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
      {isCenter && (
        <style>{`
          @keyframes electric-border {
            0%   { box-shadow: 0 0 4px ${MINT}30, 3px 3px 0 ${MINT}; border-color: ${MINT}60; }
            20%  { box-shadow: 0 0 14px ${MINT}80, 0 0 28px ${MINT}40, 4px 4px 0 ${MINT}; border-color: ${MINT}; }
            22%  { box-shadow: 0 0 4px ${MINT}20, 3px 3px 0 ${MINT}; border-color: ${MINT}50; }
            40%  { box-shadow: 0 0 18px ${MINT}90, 0 0 36px ${MINT}50, 4px 4px 0 ${MINT}; border-color: ${MINT}; }
            42%  { box-shadow: 0 0 4px ${MINT}30, 3px 3px 0 ${MINT}; border-color: ${MINT}60; }
            100% { box-shadow: 0 0 4px ${MINT}30, 3px 3px 0 ${MINT}; border-color: ${MINT}60; }
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
        `}</style>
      )}

      <button
        type="button"
        onClick={() => onSelect(passport)}
        style={{
          flex,
          display: "block",
          background: SURF,
          border: `1px solid ${isCenter ? MINT + "60" : color}`,
          boxShadow: isCenter ? undefined : `3px 3px 0 ${color}`,
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
        {/* Lightning bolts — only on center card */}
        {isCenter && (
          <>
            <div style={{
              position: "absolute", top: 10, left: 10,
              pointerEvents: "none",
              animation: "bolt-tl 5s ease-out infinite",
            }}>
              <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
                <path d="M7 0L0 11h5l-1 9 8-12H7l1-8z" fill={MINT} />
              </svg>
            </div>
            <div style={{
              position: "absolute", top: 10, right: 10,
              pointerEvents: "none",
              animation: "bolt-tr 5s ease-out infinite",
            }}>
              <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
                <path d="M7 0L0 11h5l-1 9 8-12H7l1-8z" fill={MINT} />
              </svg>
            </div>
          </>
        )}

        {/* Rank badge */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{
            fontFamily: SANS, fontSize: 9, letterSpacing: "0.2em",
            textTransform: "uppercase", color,
            border: `1px solid ${color}`, padding: "3px 8px",
          }}>
            RANK #{passport.rank}
          </span>
        </div>

        {/* Flag + name */}
        <span style={{ fontSize: flagSize, display: "block", marginBottom: 8 }}>{passport.flag}</span>
        <p style={{
          fontFamily: HEAD, fontSize: isCenter ? 18 : 15, fontWeight: 800,
          letterSpacing: "-0.02em", color: FG, margin: "0 0 16px", lineHeight: 1,
        }}>
          {passport.name.toUpperCase()}
        </p>

        {/* Score */}
        <p style={{
          fontFamily: HEAD, fontSize: scoreFSize, fontWeight: 800,
          letterSpacing: "-0.04em", color, margin: 0, lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
          display: "flex", alignItems: "baseline", gap: 4,
        } as React.CSSProperties}>
          {count}
          <span style={{ fontSize: isCenter ? 16 : 14, color: DIM, fontWeight: 400 }}>/194</span>
        </p>
        <p style={{ fontFamily: SANS, fontSize: 10, color: DIM, margin: "6px 0 14px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          destinations
        </p>

        {/* Fill bar */}
        <div style={{ height: 2, background: BORD, marginBottom: 12 }}>
          <div style={{ height: "100%", background: color, width: `${(passport.score / MAX_SCORE) * 100}%` }} />
        </div>

        {/* Mini stats */}
        <p style={{ fontFamily: SANS, fontSize: 10, color: DIM, margin: "0 0 8px" }}>
          <span style={{ color: FG }}>{passport.vf}</span> visa-free
          {" · "}
          <span style={{ color: FG }}>{passport.voa}</span> on arrival
          {" · "}
          <span style={{ color: FG }}>{passport.evisa}</span> eVisa
        </p>

        {/* Rarity */}
        <p style={{ fontFamily: SANS, fontSize: 11, color: DIM, margin: 0 }}>
          <span style={{ color: FG }}>{rarity.holders}</span> holders ·{" "}
          <span style={{ color }}>rarer than {rarity.rarer}</span>
        </p>
      </button>
    </>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function PassportModal({ passport, onClose }: { passport: Passport; onClose: () => void }) {
  const rarity  = getRarity(passport.population);
  const color   = tierColor(passport.score);

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
          width: "100%", maxWidth: 520,
          maxHeight: "88vh", overflowY: "auto",
          padding: "32px",
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
          <span style={{ fontSize: 38 }}>{passport.flag}</span>
          <div>
            <p style={{ fontFamily: HEAD, fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: FG, margin: 0, lineHeight: 1 }}>
              {passport.name.toUpperCase()}
            </p>
            <p style={{ fontFamily: SANS, fontSize: 11, color: DIM, margin: "5px 0 0", letterSpacing: "0.08em" }}>
              HENLEY 2025 Q1 · RANK #{passport.rank} OF 199
            </p>
          </div>
        </div>

        {/* Tier + score */}
        <div style={{ padding: "14px 16px", border: `1px solid ${color}`, background: `${color}12`, marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontFamily: HEAD, fontSize: 12, letterSpacing: "0.12em", color }}>{tierLabel(passport.score)}</span>
            <span style={{ fontFamily: HEAD, fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", color: FG }}>
              {passport.score}
              <span style={{ fontSize: 12, color: DIM, fontWeight: 400 }}> / {MAX_SCORE}</span>
            </span>
          </div>
          <div style={{ height: 3, background: BORD }}>
            <div style={{ height: "100%", background: color, width: `${(passport.score / MAX_SCORE) * 100}%` }} />
          </div>
        </div>

        {/* Breakdown */}
        <p style={{ fontFamily: SANS, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: DIM, margin: "0 0 10px" }}>
          Access breakdown
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, marginBottom: 20 }}>
          {[
            { label: "Visa-free",       value: passport.vf,    sub: "No application", c: MINT      },
            { label: "Visa on arrival", value: passport.voa,   sub: "At the border",  c: "#a3e635" },
            { label: "eVisa / eTA",     value: passport.evisa, sub: "Online only",    c: "#facc15" },
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
          <p style={{ fontFamily: HEAD, fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", color: MINT, margin: "0 0 12px", lineHeight: 1.2 }}>
            Rarer than {rarity.rarer} of the world.
          </p>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[
              { val: rarity.holders,    label: "Holders"      },
              { val: rarity.pct,        label: "Of world pop" },
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
        <Link
          href="/wizard"
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
    <button
      type="button"
      onClick={() => onSelect(passport)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
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

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PassportPowerClient() {
  const [selected, setSelected] = useState<Passport | null>(null);

  // Podium picks:
  // center (#1): Japan
  // left   (#2): Singapore
  // right  (#3): France
  const top1 = ALL_PASSPORTS.find(p => p.slug === "japan")!;
  const top2 = ALL_PASSPORTS.find(p => p.slug === "singapore")!;
  const top3 = ALL_PASSPORTS.find(p => p.slug === "france")!;

  const handleSelect = (p: Passport) => setSelected(p);
  const handleClose  = useCallback(() => setSelected(null), []);

  return (
    <div style={{ minHeight: "100vh", background: BG, color: FG, fontFamily: SANS }}>
      <Nav countries={[]} onCountrySelect={() => {}} />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "88px 24px 0" }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{
            fontFamily: SANS, fontSize: 11, letterSpacing: "0.22em",
            textTransform: "uppercase", color: DIM, marginBottom: 16,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ color: MINT, fontSize: 8 }}>●</span>
            Passport Power · Henley Index 2025 Q1
          </p>
          <h1 style={{
            fontFamily: HEAD, fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 800,
            letterSpacing: "-0.03em", lineHeight: 0.95, color: FG, margin: "0 0 16px",
          } as React.CSSProperties}>
            The world&apos;s<br />
            <span style={{ color: MINT }}>strongest passports.</span>
          </h1>
          <p style={{ fontFamily: SANS, fontSize: 14, color: DIM, lineHeight: 1.7, maxWidth: 480, margin: 0 }}>
            Ranked by visa-free access across 199 countries. Click any passport for the full breakdown.
          </p>
        </div>

        {/* Podium — [Singapore] [Japan] [France] */}
        <div style={{ display: "flex", gap: 2, marginBottom: 36, alignItems: "flex-end" }}>
          <HeroCard passport={top2} position={2} onSelect={handleSelect} />
          <HeroCard passport={top1} position={1} onSelect={handleSelect} />
          <HeroCard passport={top3} position={3} onSelect={handleSelect} />
        </div>

        {/* Ranked list */}
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
          {SORTED_PASSPORTS.map(p => (
            <RankRow key={p.slug} passport={p} onSelect={handleSelect} />
          ))}
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
