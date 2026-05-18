"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
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
      fontStyle:  done ? "italic" : "normal",
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
      fontFamily:      "DM Serif Display, Georgia, serif",
      fontWeight:      400,
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
        <div className="home-hint-bar fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3">
          <button
            onClick={handleBackToHome}
            className="bg-[#1a1a1a] border border-white/10 px-4 py-2.5 flex items-center gap-2 text-xs font-bold text-white/50 hover:text-white hover:border-white/25 transition-colors rounded-full uppercase tracking-widest"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-3 h-3" /> Home
          </button>
          <div className="bg-[#1a1a1a] border border-white/10 px-5 py-2.5 flex items-center gap-2.5 rounded-full">
            <div className="w-1.5 h-1.5 bg-[#00ffd5] rounded-full" />
            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">
              {highlightedSlugs.length > 0 ? "Your matches are highlighted" : "Click a country to explore"}
            </span>
          </div>
        </div>
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
            fontFamily:   "Inter, sans-serif",
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
              display:        "inline-flex",
              alignItems:     "center",
              justifyContent: "center",
              background:     "#ffffff",
              color:          "#0a0a0a",
              fontFamily:     "Inter, sans-serif",
              fontSize:       "clamp(13px,1.4vw,15px)",
              fontWeight:     700,
              padding:        "clamp(12px,1.5vh,16px) clamp(36px,5vw,60px)",
              borderRadius:   100,
              border:         "none",
              cursor:         "pointer",
              letterSpacing:  "0.02em",
              boxShadow:      "0 2px 24px rgba(255,255,255,0.12)",
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
          fontFamily:    "monospace",
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

      <Footer />
      {overlays}
    </div>
  );
}