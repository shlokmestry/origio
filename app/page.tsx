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

// ─── City card data ───────────────────────────────────────────────────────────
const FEATURE_CITIES = [
  {
    slug:    "lisbon",
    name:    "LISBON",
    country: "Portugal",
    cc:      "PT",
    rent:    "€1,240/mo",
    internet:"94 Mbps",
    safety:  "7.2",
    img:     "/lisbonmain.jpg",
    imgPos:  "center 55%",
  },
  {
    slug:    "berlin",
    name:    "BERLIN",
    country: "Germany",
    cc:      "DE",
    rent:    "€1,350/mo",
    internet:"88 Mbps",
    safety:  "6.8",
    img:     "/berlinmain.jpg",
    imgPos:  "center 40%",
  },
];

// ─── Cities Atlas section ─────────────────────────────────────────────────────
function CitiesSection() {
  const { ref, inView } = useInView(0.08);

  return (
    <section
      ref={ref}
      aria-label="Cities Atlas"
      style={{
        background:  "#08090f",
        paddingTop:  "calc(80px + clamp(48px, 7vh, 80px))",
        paddingBottom: "clamp(64px, 9vh, 100px)",
        paddingLeft:   "clamp(20px, 4vw, 56px)",
        paddingRight:  "clamp(20px, 4vw, 56px)",
      }}
    >
      {/* ── Section title ── */}
      <h2 style={{
        fontFamily:    "Cabinet Grotesk, sans-serif",
        fontWeight:    800,
        fontSize:      "clamp(28px, 4vw, 52px)",
        letterSpacing: "-0.03em",
        color:         "#ffffff",
        margin:        "0 0 clamp(24px, 3.5vh, 40px)",
        maxWidth:      1200,
        marginLeft:    "auto",
        marginRight:   "auto",
        lineHeight:    1,
      }}>
        WHERE WILL YOU LIVE?
      </h2>

      {/* ── Cards grid ── */}
      <div style={{
        display:             "grid",
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows:    "1fr auto",
        gap:                 12,
        maxWidth:            1200,
        margin:              "0 auto",
        opacity:             inView ? 1 : 0,
        transform:           inView ? "none" : "translateY(24px)",
        transition:          "opacity 0.7s ease 120ms, transform 0.7s ease 120ms",
      }}>
        {/* Large city card — spans 2 rows */}
        <div style={{ gridRow: "1 / 3" }}>
          <CityCard city={FEATURE_CITIES[0]} large />
        </div>

        {/* Smaller city card */}
        <div>
          <CityCard city={FEATURE_CITIES[1]} large={false} />
        </div>

        {/* Compare CTA card */}
        <div style={{
          background:  "#0e0e0e",
          border:      "1px solid #252525",
          padding:     "clamp(20px, 2.5vw, 32px)",
          display:     "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          minHeight:   140,
          position:    "relative",
          overflow:    "hidden",
        }}>
          {/* Coordinate background */}
          {[
            { text: "38.7169° N, 9.1399° W",  top: "8%",  left: "5%",   rotate: "-8deg",  size: 9,  op: 0.07 },
            { text: "52.5200° N, 13.4050° E", top: "18%", left: "38%",  rotate: "4deg",   size: 11, op: 0.10 },
            { text: "1.3521° N, 103.8198° E", top: "38%", left: "-2%",  rotate: "-4deg",  size: 8,  op: 0.06 },
            { text: "35.6762° N, 139.6503° E",top: "55%", left: "42%",  rotate: "7deg",   size: 10, op: 0.09 },
            { text: "48.8566° N, 2.3522° E",  top: "70%", left: "8%",   rotate: "-6deg",  size: 13, op: 0.12 },
            { text: "25.2048° N, 55.2708° E", top: "80%", left: "44%",  rotate: "3deg",   size: 8,  op: 0.07 },
            { text: "19.0760° N, 72.8777° E", top: "5%",  left: "62%",  rotate: "-3deg",  size: 9,  op: 0.06 },
            { text: "43.6532° N, 79.3832° W", top: "48%", left: "60%",  rotate: "9deg",   size: 10, op: 0.08 },
          ].map((c, i) => (
            <span key={i} style={{
              position:      "absolute",
              top:           c.top,
              left:          c.left,
              transform:     `rotate(${c.rotate})`,
              fontFamily:    "Satoshi, monospace",
              fontSize:      c.size,
              fontWeight:    500,
              letterSpacing: "0.08em",
              color:         `rgba(255,255,255,${c.op})`,
              whiteSpace:    "nowrap",
              userSelect:    "none",
              pointerEvents: "none",
            }}>
              {c.text}
            </span>
          ))}
          <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
            <p style={{
              fontFamily:    "Satoshi, sans-serif",
              fontSize:      10,
              fontWeight:    700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color:         "rgba(255,255,255,0.28)",
              margin:        "0 0 10px",
            }}>
              Tool
            </p>
            <h3 style={{
              fontFamily:    "Cabinet Grotesk, sans-serif",
              fontWeight:    800,
              fontSize:      "clamp(22px, 2.6vw, 36px)",
              letterSpacing: "-0.02em",
              lineHeight:    1.0,
              color:         "#ffffff",
              margin:        0,
            }}>
              COMPARE<br />ANY 2 CITIES
            </h3>
            <p style={{
              fontFamily: "Satoshi, sans-serif",
              fontSize:   12,
              color:      "rgba(255,255,255,0.35)",
              margin:     "10px 0 0",
              lineHeight: 1.55,
            }}>
              Rent. Internet. Safety.<br />Side by side.
            </p>
          <Link
            href="/cities/compare"
            style={{
              display:        "inline-flex",
              alignItems:     "center",
              gap:            8,
              marginTop:      20,
              padding:        "9px 18px",
              border:         "1px solid rgba(255,255,255,0.22)",
              color:          "rgba(255,255,255,0.75)",
              fontFamily:     "Satoshi, sans-serif",
              fontSize:       11,
              fontWeight:     700,
              letterSpacing:  "0.1em",
              textTransform:  "uppercase",
              textDecoration: "none",
              transition:     "border-color 0.15s, color 0.15s",
              alignSelf:      "flex-start",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "#00ffd5";
              (e.currentTarget as HTMLElement).style.color = "#00ffd5";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.22)";
              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.75)";
            }}
          >
            Compare →
          </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Individual city card ─────────────────────────────────────────────────────
function CityCard({ city, large }: { city: typeof FEATURE_CITIES[0]; large: boolean }) {
  return (
    <Link
      href={`/city/${city.slug}`}
      style={{
        display:        "block",
        position:       "relative",
        height:         large ? "clamp(340px, 46vw, 580px)" : "clamp(180px, 22vw, 290px)",
        overflow:       "hidden",
        textDecoration: "none",
        background:     "#111",
      }}
    >
      {/* Photo placeholder — user will supply images later */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={city.img}
        alt={city.name}
        style={{
          position:       "absolute",
          inset:          0,
          width:          "100%",
          height:         "100%",
          objectFit:      "cover",
          objectPosition: city.imgPos,
          transition:     "transform 0.5s ease",
        }}
        onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
      />

      {/* Gradient overlay */}
      <div style={{
        position:   "absolute",
        inset:      0,
        background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.35) 100%)",
      }} />

      {/* Top row: country tag + IN ATLAS badge */}
      <div style={{
        position:       "absolute",
        top:            0,
        left:           0,
        right:          0,
        padding:        "clamp(12px, 1.5vw, 18px) clamp(14px, 1.8vw, 22px)",
        display:        "flex",
        justifyContent: "space-between",
        alignItems:     "flex-start",
      }}>
        <p style={{
          fontFamily:    "Satoshi, sans-serif",
          fontSize:      10,
          fontWeight:    700,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color:         "rgba(255,255,255,0.65)",
          margin:        0,
        }}>
          {city.cc} · {city.country}
        </p>
        <p style={{
          fontFamily:    "Satoshi, sans-serif",
          fontSize:      9,
          fontWeight:    700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color:         "rgba(255,255,255,0.45)",
          margin:        0,
          border:        "1px solid rgba(255,255,255,0.2)",
          padding:       "3px 7px",
        }}>
          In Atlas
        </p>
      </div>

      {/* Bottom: city name + stats + CTA */}
      <div style={{
        position: "absolute",
        bottom:   0,
        left:     0,
        right:    0,
        padding:  "clamp(14px, 1.8vw, 22px) clamp(14px, 1.8vw, 22px) clamp(16px, 2vw, 24px)",
      }}>
        <h3 style={{
          fontFamily:    "Cabinet Grotesk, sans-serif",
          fontWeight:    800,
          fontSize:      large ? "clamp(40px, 6.5vw, 88px)" : "clamp(26px, 3.8vw, 52px)",
          letterSpacing: "-0.03em",
          lineHeight:    0.9,
          color:         "#ffffff",
          margin:        "0 0 clamp(10px, 1.4vw, 16px)",
        }}>
          {city.name}
        </h3>

        {/* Stats chips */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "clamp(10px, 1.4vw, 16px)" }}>
          {[
            { label: city.rent },
            { label: city.internet },
            { label: `Safety ${city.safety}` },
          ].map(chip => (
            <span key={chip.label} style={{
              fontFamily:    "Satoshi, sans-serif",
              fontSize:      11,
              fontWeight:    600,
              color:         "rgba(255,255,255,0.85)",
              background:    "rgba(0,0,0,0.55)",
              border:        "1px solid rgba(255,255,255,0.15)",
              padding:       "4px 10px",
              backdropFilter:"blur(4px)",
              letterSpacing: "0.02em",
            }}>
              {chip.label}
            </span>
          ))}
        </div>

        {/* CTA */}
        <span style={{
          display:       "inline-flex",
          alignItems:    "center",
          gap:           7,
          fontFamily:    "Satoshi, sans-serif",
          fontSize:      11,
          fontWeight:    700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color:         "#00ffd5",
          border:        "1px solid rgba(0,255,213,0.45)",
          padding:       "7px 14px",
        }}>
          View City →
        </span>
      </div>
    </Link>
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

      {/* ── SECTION 1: CITIES ATLAS ── */}
      <CitiesSection />

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

      {/* ── SECTION 3: COUNTRIES HERO ── */}
      <section
        ref={heroRef}
        style={{
          position:       "relative",
          minHeight:      "100vh",
          overflow:       "hidden",
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
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
            position:       "absolute",
            inset:          0,
            width:          "100%",
            height:         "100%",
            objectFit:      "cover",
            objectPosition: "center 30%",
            userSelect:     "none",
            pointerEvents:  "none",
          }}
        />

        {/* Dark overlay */}
        <div style={{
          position:      "absolute",
          inset:         0,
          background:    "rgba(8,8,8,0.62)",
          pointerEvents: "none",
        }} />

        {/* Top fade from globe */}
        <div style={{
          position:      "absolute",
          top:           0,
          left:          0,
          right:         0,
          height:        "30%",
          background:    "linear-gradient(to top, transparent, #0a0a0a)",
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
          <h2 style={{
            fontFamily:    "Cabinet Grotesk, sans-serif",
            fontWeight:    800,
            fontSize:      "clamp(14px, 5.2vw, 80px)",
            lineHeight:    1.0,
            letterSpacing: "-0.03em",
            color:         "#ffffff",
            marginBottom:  "clamp(20px, 3vh, 32px)",
          }}>
            Find Where You <FlickerWord />
          </h2>

          <p style={{
            fontFamily:   "Satoshi, sans-serif",
            fontSize:     "clamp(15px, 1.6vw, 18px)",
            color:        "rgba(255,255,255,0.52)",
            fontWeight:   400,
            lineHeight:   1.65,
            maxWidth:     440,
            marginBottom: "clamp(36px, 5vh, 56px)",
          }}>
            Salaries, visas, cost of living and quality of life ~ personalised to your job and passport.
          </p>

          <button
            onClick={() => router.push("/wizard")}
            style={{
              display:        "inline-flex",
              alignItems:     "center",
              justifyContent: "center",
              gap:            10,
              background:     "transparent",
              color:          "#00ffd5",
              fontFamily:     "Satoshi, sans-serif",
              fontSize:       "clamp(13px, 1.4vw, 15px)",
              fontWeight:     700,
              padding:        "clamp(13px, 1.6vh, 17px) clamp(36px, 5vw, 60px)",
              border:         "2px solid #00ffd5",
              cursor:         "pointer",
              letterSpacing:  "0.05em",
              textTransform:  "uppercase" as const,
              boxShadow:      "4px 4px 0 #00ffd5",
              transition:     "box-shadow 0.12s ease, background 0.12s ease",
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

      <Footer />
      {overlays}
    </div>
  );
}
