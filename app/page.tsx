"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Globe from "@/components/Globe";
import CountryPanel from "@/components/CountryPanel";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { CountryWithData, GlobeCountry, JobRole } from "@/types";

// ─── Word cycle → settles on "Belong" ────────────────────────────────────────
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
      color:      done ? "#00ffd5" : "rgba(255,255,255,0.82)",
      display:    "inline",
    }}>
      {word}
    </span>
  );
}

// ─── useInView helper ─────────────────────────────────────────────────────────
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

// ─── Cities teaser section ────────────────────────────────────────────────────
function CitiesSection() {
  const { ref, inView } = useInView(0.1);

  return (
    <section
      ref={ref}
      aria-label="Explore cities"
      style={{
        background:    "#0a0a0a",
        padding:       "clamp(72px, 10vh, 112px) clamp(16px, 3vw, 40px)",
        display:       "flex",
        flexDirection: "column",
        alignItems:    "center",
        borderTop:     "1px solid #1a1a1a",
      }}
    >
      {/* Photo — wider, with border */}
      <div style={{
        position:     "relative",
        width:        "100%",
        maxWidth:     1040,
        marginBottom: "clamp(32px, 5vh, 52px)",
        opacity:      inView ? 1 : 0,
        transform:    inView ? "translateY(0)" : "translateY(20px)",
        transition:   "opacity 0.7s cubic-bezier(0.16,1,0.3,1) 80ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) 80ms",
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/manincity.jpg"
          alt="Person standing in a city at night"
          style={{
            width:          "100%",
            height:         "clamp(320px, 44vw, 560px)",
            objectFit:      "cover",
            objectPosition: "center 40%",
            display:        "block",
            border:         "2px solid rgba(240,240,232,0.14)",
            boxShadow:      "5px 5px 0 rgba(240,240,232,0.05)",
          }}
        />

        {/* Text overlay at bottom */}
        <div style={{
          position:   "absolute",
          bottom:     0,
          left:       0,
          right:      0,
          padding:    "clamp(20px, 3.5vw, 44px)",
          background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.45) 55%, transparent 100%)",
        }}>
          <p style={{
            fontFamily:    "Cabinet Grotesk, sans-serif",
            fontWeight:    800,
            fontSize:      "clamp(28px, 4.5vw, 60px)",
            letterSpacing: "-0.03em",
            lineHeight:    1.05,
            color:         "#f0f0e8",
            margin:        0,
          }}>
            Explore{" "}
            <Link
              href="/cities"
              style={{
                color:                   "inherit",
                textDecoration:          "underline",
                textDecorationColor:     "rgba(240,240,232,0.45)",
                textUnderlineOffset:     "5px",
                textDecorationThickness: "2px",
                transition:              "text-decoration-color 0.15s ease",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.textDecorationColor = "#00ffd5"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.textDecorationColor = "rgba(240,240,232,0.45)"}
            >
              Cities
            </Link>
          </p>

          {/* Click hint — tiny annotation below */}
          <Link
            href="/cities"
            aria-hidden
            tabIndex={-1}
            style={{
              display:        "inline-flex",
              alignItems:     "center",
              gap:            5,
              marginTop:      8,
              textDecoration: "none",
            }}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden style={{ opacity: 0.4 }}>
              <path d="M1 10L10 1M10 1H4M10 1V7" stroke="#f0f0e8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{
              fontFamily:    "Satoshi, sans-serif",
              fontSize:      10,
              letterSpacing: "0.1em",
              color:         "rgba(240,240,232,0.35)",
              textTransform: "uppercase" as const,
            }}>
              click to explore
            </span>
          </Link>
        </div>
      </div>

      {/* Sub-line */}
      <p style={{
        fontFamily:  "Satoshi, sans-serif",
        fontSize:    "clamp(13px, 1.4vw, 15px)",
        color:       "rgba(240,240,232,0.32)",
        lineHeight:  1.65,
        maxWidth:    460,
        textAlign:   "center",
        margin:      0,
        opacity:     inView ? 1 : 0,
        transition:  "opacity 0.5s ease 200ms",
      }}>
        20+ cities across your matched countries. Rent, internet, liveability — side by side.
      </p>
    </section>
  );
}



// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const router  = useRouter();
  const heroRef = useRef<HTMLElement>(null);

  const [selectedSlug, setSelectedSlug]         = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry]   = useState<CountryWithData | null>(null);
  const [showHero, setShowHero]                 = useState(true);
  const [allCountries, setAllCountries]         = useState<CountryWithData[]>([]);
  const [selectedRole, setSelectedRole]         = useState<JobRole>("softwareEngineer");
  const [highlightedSlugs, setHighlightedSlugs] = useState<string[]>([]);
  const [savedSlugs, setSavedSlugs]             = useState<string[]>([]);
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
      {!showHero && !selectedSlug && <></>}
    </>
  );

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh" }}>
      <Nav countries={globeCountries} onCountrySelect={handleCountrySelect} />

      {/* ── SECTION 1: HERO (photo background) ── */}
      <section
        ref={heroRef}
        style={{
          position:   "relative",
          minHeight:  "100vh",
          overflow:   "hidden",
          display:    "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Background photo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/manstandingalone.jpg"
          alt=""
          aria-hidden
          style={{
            position:   "absolute",
            inset:      0,
            width:      "100%",
            height:     "100%",
            objectFit:  "cover",
            objectPosition: "center 30%",
            userSelect: "none",
            pointerEvents: "none",
          }}
        />

        {/* Dark overlay */}
        <div style={{
          position:   "absolute",
          inset:      0,
          background: "rgba(8,8,8,0.62)",
          pointerEvents: "none",
        }} />

        {/* Bottom fade to match globe section */}
        <div style={{
          position:   "absolute",
          bottom:     0,
          left:       0,
          right:      0,
          height:     "30%",
          background: "linear-gradient(to bottom, transparent, #0a0a0a)",
          pointerEvents: "none",
        }} />

        {/* Content */}
        <div style={{
          position:      "relative",
          zIndex:        5,
          display:       "flex",
          flexDirection: "column",
          alignItems:    "center",
          textAlign:     "center",
          padding:       "clamp(80px, 12vh, 140px) clamp(24px, 6vw, 80px) clamp(60px, 8vh, 100px)",
          width:         "100%",
        }}>
          <h1 style={{
            fontFamily:    "Cabinet Grotesk, sans-serif",
            fontWeight:    800,
            fontSize:      "clamp(14px, 5.2vw, 80px)",
            lineHeight:    1.0,
            letterSpacing: "-0.03em",
            color:         "#ffffff",
            marginBottom:  "clamp(20px, 3vh, 32px)",
            whiteSpace:    "nowrap",
          }}>
            Find Where You <FlickerWord />
          </h1>

          <p style={{
            fontFamily:  "Satoshi, sans-serif",
            fontSize:    "clamp(15px, 1.6vw, 18px)",
            color:       "rgba(255,255,255,0.52)",
            fontWeight:  400,
            lineHeight:  1.65,
            maxWidth:    440,
            marginBottom: "clamp(36px, 5vh, 56px)",
          }}>
            Salaries, visas, cost of living and quality of life — personalised to your job and passport.
          </p>

          <button
            onClick={() => router.push("/wizard")}
            style={{
              display:       "inline-flex",
              alignItems:    "center",
              justifyContent: "center",
              gap:           10,
              background:    "transparent",
              color:         "#00ffd5",
              fontFamily:    "Satoshi, sans-serif",
              fontSize:      "clamp(13px, 1.4vw, 15px)",
              fontWeight:    700,
              padding:       "clamp(13px, 1.6vh, 17px) clamp(36px, 5vw, 60px)",
              border:        "2px solid #00ffd5",
              cursor:        "pointer",
              letterSpacing: "0.05em",
              textTransform: "uppercase" as const,
              boxShadow:     "4px 4px 0 #00ffd5",
              transition:    "box-shadow 0.12s ease, background 0.12s ease",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,255,213,0.07)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "2px 2px 0 #00ffd5";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "4px 4px 0 #00ffd5";
            }}
          >
            Find My Country
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
              <path d="M2 6.5h9M7 2.5l4 4-4 4" stroke="#00ffd5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
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

      {/* ── SECTION 3: CITIES TEASER ── */}
      <CitiesSection />

      <Footer />
      {overlays}
    </div>
  );
}
