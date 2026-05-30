"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Globe from "@/components/Globe";
import CountryPanel from "@/components/CountryPanel";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import AuroraBackground from "@/components/AuroraBackground";
import { supabase } from "@/lib/supabase";
import { CountryWithData, GlobeCountry, JobRole } from "@/types";
import { ArrowLeft } from "lucide-react";

// ─── Slow country cycle → settles on "Belong" ─────────────────────────────
const CYCLE_WORDS = ["Portugal", "Germany", "Japan", "Canada", "Singapore"];

function FlickerWord() {
  const [word, setWord]       = useState(CYCLE_WORDS[0]);
  const [visible, setVisible] = useState(false);
  const [done, setDone]       = useState(false);

  useEffect(() => {
    const start = setTimeout(() => {
      setVisible(true);
      let idx = 0;

      function next() {
        setVisible(false);
        setTimeout(() => {
          idx++;
          if (idx >= CYCLE_WORDS.length) {
            setWord("Belong");
            setDone(true);
            setVisible(true);
          } else {
            setWord(CYCLE_WORDS[idx]);
            setVisible(true);
            setTimeout(next, 800);
          }
        }, 400);
      }

      setTimeout(next, 800);
    }, 400);

    return () => clearTimeout(start);
  }, []);

  return (
    <span style={{
      opacity:    visible ? 1 : 0,
      transition: done ? "opacity 0.9s ease, color 0.6s ease" : "opacity 0.35s ease",
      fontStyle: "normal",
      color:      done ? "#00ffd5" : "rgba(255,255,255,0.75)",
      display:    "inline",
    }}>
      {word}
    </span>
  );
}

// ─── Full-width stretched headline ─────────────────────────────────────────
function StretchHeadline() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    function fit() {
      if (!el) return;
      el.style.fontSize = "100px";
      const containerW = el.parentElement?.offsetWidth ?? window.innerWidth;
      const scale = (containerW * 0.96) / el.scrollWidth;
      el.style.fontSize = `${Math.floor(100 * scale)}px`;
    }
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  return (
    <div ref={ref} style={{
      fontFamily:      "Cabinet Grotesk, sans-serif",
      fontWeight:      800,
      lineHeight:      1.0,
      letterSpacing:   "-0.02em",
      color:           "#ffffff",
      whiteSpace:      "nowrap",
      textAlign:       "center",
      width:           "100%",
      transform:       "scaleY(1.15)",
      transformOrigin: "center center",
      userSelect:      "none",
    }}>
      Find Where You <FlickerWord />
    </div>
  );
}

// ─── useInView helper ──────────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── Find My City section ─────────────────────────────────────────────────
function FindMyCitySection() {
  const { ref, inView } = useInView(0.2);

  return (
    <section
      ref={ref}
      aria-label="Explore cities"
      style={{
        background:     "#0f0f0f",
        borderTop:      "1px solid #1a1a1a",
        padding:        "clamp(72px, 10vh, 112px) 24px",
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        textAlign:      "center",
        position:       "relative",
        overflow:       "hidden",
      }}
    >
      {/* Subtle horizontal rule above */}
      <div style={{
        position:   "absolute",
        top:        0,
        left:       "50%",
        transform:  "translateX(-50%)",
        width:      "clamp(40px, 8vw, 80px)",
        height:     2,
        background: "#00ffd5",
        opacity:    0.6,
      }} />

      <p style={{
        fontFamily:    "Satoshi, sans-serif",
        fontSize:      11,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color:         "rgba(240,240,232,0.3)",
        marginBottom:  "clamp(20px, 3vh, 32px)",
        opacity:       inView ? 1 : 0,
        transition:    "opacity 0.5s ease",
      }}>
        cities
      </p>

      <h2 style={{
        fontFamily:    "Cabinet Grotesk, sans-serif",
        fontWeight:    800,
        fontSize:      "clamp(36px, 6vw, 72px)",
        lineHeight:    1.0,
        letterSpacing: "-0.03em",
        color:         "#f0f0e8",
        marginBottom:  "clamp(16px, 2.5vh, 24px)",
        textWrap:      "balance",
        opacity:       inView ? 1 : 0,
        transform:     inView ? "translateY(0)" : "translateY(16px)",
        transition:    "opacity 0.6s cubic-bezier(0.16,1,0.3,1) 80ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) 80ms",
      }}>
        Now find your city
      </h2>

      <p style={{
        fontFamily:  "Satoshi, sans-serif",
        fontSize:    "clamp(14px, 1.6vw, 17px)",
        color:       "rgba(240,240,232,0.45)",
        lineHeight:  1.65,
        maxWidth:    420,
        marginBottom: "clamp(32px, 4.5vh, 52px)",
        textWrap:    "pretty",
        opacity:     inView ? 1 : 0,
        transform:   inView ? "translateY(0)" : "translateY(12px)",
        transition:  "opacity 0.6s cubic-bezier(0.16,1,0.3,1) 160ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) 160ms",
      }}>
        Explore 50+ cities across your matched countries. Rent, salaries, liveability and internet speed — side by side.
      </p>

      <Link
        href="/cities"
        style={{
          display:        "inline-flex",
          alignItems:     "center",
          gap:            10,
          background:     "transparent",
          color:          "#00ffd5",
          fontFamily:     "Satoshi, sans-serif",
          fontSize:       "clamp(13px, 1.4vw, 15px)",
          fontWeight:     700,
          padding:        "clamp(12px, 1.5vh, 16px) clamp(32px, 4vw, 52px)",
          border:         "2px solid #00ffd5",
          boxShadow:      "3px 3px 0 #00ffd5",
          cursor:         "pointer",
          letterSpacing:  "0.04em",
          textDecoration: "none",
          textTransform:  "uppercase",
          opacity:        inView ? 1 : 0,
          transform:      inView ? "translateY(0)" : "translateY(8px)",
          transition:     "opacity 0.5s ease 260ms, transform 0.5s ease 260ms, box-shadow 0.15s ease, background 0.15s ease",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = "rgba(0,255,213,0.08)";
          (e.currentTarget as HTMLElement).style.boxShadow = "2px 2px 0 #00ffd5";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = "transparent";
          (e.currentTarget as HTMLElement).style.boxShadow = "3px 3px 0 #00ffd5";
        }}
      >
        Explore cities
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M2 7h10M8 3l4 4-4 4" stroke="#00ffd5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </section>
  );
}

// ─── Score Methodology section ────────────────────────────────────────────
const SCORE_FACTORS = [
  { label: "Salary after tax",  weight: 30, example: "€3,100/mo in Portugal",    color: "#00ffd5" },
  { label: "Cost of living",    weight: 25, example: "€1,400/mo all-in in Lisbon", color: "#a78bfa" },
  { label: "Visa accessibility", weight: 20, example: "EU passport: score 9/10",  color: "#60a5fa" },
  { label: "Quality of life",   weight: 15, example: "Netherlands: 84/100",       color: "#34d399" },
  { label: "Safety index",      weight: 10, example: "Japan: 97/100",             color: "#f472b6" },
] as const;

function ScoreMethodologySection() {
  const { ref, inView } = useInView(0.15);

  return (
    <section
      ref={ref}
      aria-label="How scoring works"
      style={{
        background:  "#0a0a0a",
        borderTop:   "1px solid #1a1a1a",
        padding:     "clamp(72px, 10vh, 112px) 24px",
      }}
    >
      <div style={{ maxWidth: 680, margin: "0 auto" }}>

        {/* Header row */}
        <div style={{
          display:       "flex",
          alignItems:    "baseline",
          justifyContent: "space-between",
          flexWrap:      "wrap",
          gap:           12,
          marginBottom:  "clamp(36px, 5vh, 56px)",
          opacity:       inView ? 1 : 0,
          transition:    "opacity 0.5s ease",
        }}>
          <h2 style={{
            fontFamily:    "Cabinet Grotesk, sans-serif",
            fontWeight:    800,
            fontSize:      "clamp(24px, 3.5vw, 40px)",
            letterSpacing: "-0.02em",
            lineHeight:    1.1,
            color:         "#f0f0e8",
            margin:        0,
            textWrap:      "balance",
          }}>
            The algorithm
          </h2>
          <Link
            href="/about"
            style={{
              fontFamily:    "Satoshi, sans-serif",
              fontSize:      13,
              color:         "rgba(240,240,232,0.35)",
              textDecoration: "none",
              letterSpacing: "0.02em",
              transition:    "color 0.15s ease",
              whiteSpace:    "nowrap",
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#00ffd5"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(240,240,232,0.35)"}
          >
            Full methodology →
          </Link>
        </div>

        {/* Factor rows */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {SCORE_FACTORS.map((f, i) => (
            <div
              key={f.label}
              style={{
                borderTop:  "1px solid #1a1a1a",
                padding:    "clamp(16px, 2.5vh, 22px) 0",
                display:    "grid",
                gridTemplateColumns: "1fr auto",
                alignItems: "center",
                gap:        "12px 24px",
                opacity:    inView ? 1 : 0,
                transform:  inView ? "translateX(0)" : "translateX(-10px)",
                transition: `opacity 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 90}ms, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 90}ms`,
              }}
            >
              {/* Left: label + bar + example */}
              <div>
                <div style={{
                  display:       "flex",
                  alignItems:    "center",
                  gap:           12,
                  marginBottom:  8,
                }}>
                  <span style={{
                    fontFamily: "Cabinet Grotesk, sans-serif",
                    fontWeight: 700,
                    fontSize:   "clamp(14px, 1.8vw, 16px)",
                    color:      "#f0f0e8",
                    lineHeight: 1.2,
                  }}>
                    {f.label}
                  </span>
                  <span style={{
                    fontFamily:  "Satoshi, sans-serif",
                    fontSize:    11,
                    color:       "rgba(240,240,232,0.28)",
                    letterSpacing: "0.02em",
                  }}>
                    {f.example}
                  </span>
                </div>

                {/* Animated bar */}
                <div style={{
                  height:     4,
                  background: "#1a1a1a",
                  position:   "relative",
                  overflow:   "hidden",
                }}>
                  <div style={{
                    position:         "absolute",
                    inset:            0,
                    background:       f.color,
                    transformOrigin:  "left center",
                    transform:        inView ? `scaleX(${f.weight / 100})` : "scaleX(0)",
                    transition:       `transform 0.8s cubic-bezier(0.16,1,0.3,1) ${200 + i * 90}ms`,
                    opacity:          0.75,
                  }} />
                </div>
              </div>

              {/* Right: weight */}
              <span style={{
                fontFamily:  "Cabinet Grotesk, sans-serif",
                fontWeight:  700,
                fontSize:    "clamp(18px, 2.5vw, 26px)",
                color:       f.color,
                letterSpacing: "-0.01em",
                lineHeight:  1,
                opacity:     0.9,
                flexShrink:  0,
              }}>
                {f.weight}%
              </span>
            </div>
          ))}

          {/* Last border */}
          <div style={{ borderTop: "1px solid #1a1a1a" }} />
        </div>

        {/* Footnote */}
        <p style={{
          fontFamily:  "Satoshi, sans-serif",
          fontSize:    12,
          color:       "rgba(240,240,232,0.2)",
          marginTop:   "clamp(20px, 3vh, 28px)",
          lineHeight:  1.6,
          opacity:     inView ? 1 : 0,
          transition:  "opacity 0.5s ease 600ms",
        }}>
          Weights adjust based on your priorities from the wizard. A &quot;visa-first&quot; answer shifts Visa Accessibility to 35%.
        </p>
      </div>
    </section>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────
export default function Home() {
  const router  = useRouter();
  const heroRef = useRef<HTMLElement>(null);

  const [selectedSlug, setSelectedSlug]       = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryWithData | null>(null);
  const [showHero, setShowHero]               = useState(true);
  const [allCountries, setAllCountries]       = useState<CountryWithData[]>([]);
  const [selectedRole, setSelectedRole]       = useState<JobRole>("softwareEngineer");
  const [highlightedSlugs, setHighlightedSlugs] = useState<string[]>([]);
  const [savedSlugs, setSavedSlugs]           = useState<string[]>([]);
  const fetchedRef = useRef(false);

  useEffect(() => {
    document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetch("/api/countries").then(r => r.json()).then(d => setAllCountries(d)).catch(console.error);
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data } = await supabase.from("saved_countries").select("country_slug").eq("user_id", session.user.id);
        setSavedSlugs((data ?? []).map((r: any) => r.country_slug));
      } else setSavedSlugs([]);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const raw = sessionStorage.getItem("highlightedCountries");
    if (raw) {
      const slugs: string[] = JSON.parse(raw);
      setHighlightedSlugs(slugs);
      setShowHero(false);
      sessionStorage.removeItem("highlightedCountries");
      sessionStorage.removeItem("wizardMatches");
      if (slugs[0]) {
        setTimeout(() => {
          const country = allCountries.find(c => c.slug === slugs[0]);
          if (country) { setSelectedSlug(slugs[0]); setSelectedCountry(country); }
        }, 1000);
      }
    }
  }, [allCountries]);

  const globeCountries = useMemo<GlobeCountry[]>(() =>
    allCountries.map(c => ({
      slug: c.slug, name: c.name, flagEmoji: c.flagEmoji,
      lat: c.lat, lng: c.lng, moveScore: c.data.moveScore,
      salarySoftwareEngineer: c.data.salarySoftwareEngineer,
      costRentCityCentre: c.data.costRentCityCentre,
      scoreQualityOfLife: c.data.scoreQualityOfLife,
      visaDifficulty: c.data.visaDifficulty,
      incomeTaxRateMid: c.data.incomeTaxRateMid,
    })), [allCountries]);

  const handleCountrySelect = useCallback((slug: string) => {
    setSelectedSlug(slug);
    const country = allCountries.find(c => c.slug === slug);
    if (country) { setSelectedCountry(country); setShowHero(false); }
  }, [allCountries]);

  const handleClosePanel = useCallback(() => { setSelectedSlug(null); setSelectedCountry(null); }, []);
  const handleBackToHome = useCallback(() => {
    setSelectedSlug(null); setSelectedCountry(null);
    setShowHero(true); setHighlightedSlugs([]);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedSlug) handleClosePanel();
        else if (!showHero) handleBackToHome();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleClosePanel, handleBackToHome, selectedSlug, showHero]);

  const overlays = (
    <>
      <div className="fixed bottom-0 right-0 z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <CountryPanel country={selectedCountry} onClose={handleClosePanel} selectedRole={selectedRole} onRoleChange={setSelectedRole} />
        </div>
      </div>
      {!showHero && !selectedSlug && (
        <></>
      )}
    </>
  );

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh" }}>
      <Nav countries={globeCountries} onCountrySelect={handleCountrySelect} />

      {/* ── SECTION 1: HERO ── */}
      <section
        ref={heroRef}
        style={{
          position:       "relative",
          minHeight:      "100vh",
          background:     "#0a0a0a",
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          justifyContent: "center",
          padding:        "clamp(80px,12vh,140px) 0 clamp(60px,8vh,100px)",
        }}
      >
        <AuroraBackground />

        <div style={{
          position:      "relative",
          zIndex:        5,
          display:       "flex",
          flexDirection: "column",
          alignItems:    "center",
          width:         "100%",
          padding:       "0 16px",
        }}>
          <div style={{
            width:         "100%",
            overflow:      "visible",
            paddingBottom: "0.18em",
            marginBottom:  "clamp(28px,4vh,52px)",
          }}>
            <StretchHeadline />
          </div>

          <p style={{
            fontFamily:   "Satoshi, sans-serif",
            fontSize:     "clamp(14px, 1.5vw, 18px)",
            color:        "rgba(255,255,255,0.42)",
            fontWeight:   400,
            lineHeight:   1.65,
            textAlign:    "center",
            maxWidth:     460,
            marginBottom: "clamp(32px,4vh,48px)",
            padding:      "0 8px",
          }}>
            Salaries, visas, cost of living and quality of life
            personalised to your job and passport.
          </p>

          <button
            onClick={() => router.push("/wizard")}
            style={{
              display:       "inline-flex",
              alignItems:    "center",
              justifyContent: "center",
              background:    "#ffffff",
              color:         "#0a0a0a",
              fontFamily:    "Satoshi, sans-serif",
              fontSize:      "clamp(13px,1.4vw,15px)",
              fontWeight:    700,
              padding:       "clamp(12px,1.5vh,16px) clamp(36px,5vw,60px)",
              border:        "none",
              cursor:        "pointer",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              boxShadow:     "3px 3px 0 rgba(255,255,255,0.35)",
            }}
          >
            Find My Country
          </button>
        </div>
      </section>

      {/* ── SECTION 2: GLOBE ── */}
      <section
        className="globe-section"
        style={{
          width:      "100%",
          height:     "100svh",
          minHeight:  480,
          position:   "relative",
          background: "#0a0a0a",
        }}
        aria-label="Interactive globe"
      >
        <AuroraBackground />

        <p style={{
          position:      "absolute",
          top:           16,
          left:          20,
          zIndex:        10,
          fontSize:      9,
          fontFamily:    "Satoshi, sans-serif",
          color:         "rgba(255,255,255,0.18)",
          textTransform: "uppercase",
          letterSpacing: "0.3em",
          pointerEvents: "none",
        }}>
          Drag · click a country
        </p>
        <div style={{ position: "absolute", inset: 0, touchAction: "none", zIndex: 5 }}>
          <Globe
            countries={globeCountries}
            onCountrySelect={handleCountrySelect}
            selectedSlug={selectedSlug}
            highlightedSlugs={highlightedSlugs}
            savedSlugs={savedSlugs}
          />
        </div>
      </section>

      {/* ── SECTION 3: FIND MY CITY ── */}
      <FindMyCitySection />

      {/* ── SECTION 4: SCORE METHODOLOGY ── */}
      <ScoreMethodologySection />

      <Footer />
      {overlays}
    </div>
  );
}