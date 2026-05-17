"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Globe from "@/components/Globe";
import CountryPanel from "@/components/CountryPanel";
import WizardMatchesPanel from "@/components/WizardMatchesPanel";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { CountryWithData, GlobeCountry, JobRole } from "@/types";
import { CountryMatch } from "@/lib/wizard";
import { ArrowLeft } from "lucide-react";

// ─── Slow country cycle → settles on "Belong" ─────────────────────────────
const CYCLE_WORDS = ["Portugal", "Germany", "Japan", "Canada", "Singapore"];

function FlickerWord() {
  const [word, setWord]       = useState(CYCLE_WORDS[0]);
  const [visible, setVisible] = useState(false);
  const [done, setDone]       = useState(false);

  useEffect(() => {
    // Brief delay before first word appears
    const start = setTimeout(() => {
      setVisible(true);
      let idx = 0;

      function next() {
        // Fade out current word
        setVisible(false);
        setTimeout(() => {
          idx++;
          if (idx >= CYCLE_WORDS.length) {
            // Final word: "Belong" — italic cyan, slower fade in
            setWord("Belong");
            setDone(true);
            setVisible(true);
          } else {
            setWord(CYCLE_WORDS[idx]);
            setVisible(true);
            // Each country visible for 1.8s
            setTimeout(next, 1800);
          }
        }, 500); // fade-out duration
      }

      // First country visible for 1.8s
      setTimeout(next, 1800);
    }, 500);

    return () => clearTimeout(start);
  }, []);

  return (
    <span style={{
      opacity:    visible ? 1 : 0,
      transition: done
        ? "opacity 0.9s ease, color 0.6s ease"
        : "opacity 0.45s ease",
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
      const scale = (window.innerWidth * 0.97) / el.scrollWidth;
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
      transform:       "scaleY(1.2)",
      transformOrigin: "center center",
      userSelect:      "none",
    }}>
      Find Where You <FlickerWord />
    </div>
  );
}

// ─── Paper plane + dotted trail ────────────────────────────────────────────
function PaperPlane({ containerRef }: { containerRef: React.RefObject<HTMLElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const planeRef  = useRef<HTMLDivElement>(null);
  const stateRef  = useRef({
    x: 0, y: 0,
    vx: 0, vy: 0,
    angle: 0,
    angularVel: 0,
    trail: [] as { x: number; y: number }[],
    frameCount: 0,
    nextGustIn: 200,
    initialized: false,
  });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    const planeEl  = planeRef.current;
    const heroEl   = containerRef.current;
    if (!canvasEl || !planeEl || !heroEl) return;

    const canvas = canvasEl;
    const plane  = planeEl;
    const hero   = heroEl;
    const ctx    = canvas.getContext("2d")!;
    const s      = stateRef.current;

    const DRAG         = 0.008;
    const LIFT         = 0.014;
    const GRAVITY      = 0.022;
    const ANG_DAMPING  = 0.94;
    const MAX_ANG_VEL  = 0.028;
    const TARGET_SPEED = 1.6;
    const SLIP         = 0.05;
    const PW           = 48;
    const EDGE         = 140;
    const TRAIL_MAX    = 220;
    const TRAIL_SKIP   = 2;

    function resize() {
      const w = hero.offsetWidth, h = hero.offsetHeight;
      canvas.width = w; canvas.height = h;
      if (!s.initialized) {
        s.initialized = true;
        s.x = w * 0.18;
        s.y = h * 0.35;
        s.angle = 0.15;
        s.vx = Math.cos(s.angle) * TARGET_SPEED;
        s.vy = Math.sin(s.angle) * TARGET_SPEED;
      }
    }

    function applyGust() {
      const strength = (Math.random() - 0.48) * 0.038;
      s.angularVel += strength;
      s.angularVel = Math.max(-MAX_ANG_VEL, Math.min(MAX_ANG_VEL, s.angularVel));
    }

    function applyEdgeAvoidance() {
      const w = hero.offsetWidth, h = hero.offsetHeight;
      const m = EDGE;
      if (s.x < m)     s.angularVel -= 0.006 * ((m - s.x) / m);
      if (s.x > w - m) s.angularVel += 0.006 * ((s.x - (w - m)) / m);
      if (s.y < m)     s.angularVel += 0.005 * ((m - s.y) / m);
      if (s.y > h - m) s.angularVel -= 0.005 * ((s.y - (h - m)) / m);
    }

    function tick() {
      const w = hero.offsetWidth, h = hero.offsetHeight;
      s.frameCount++;

      if (s.frameCount >= s.nextGustIn) {
        applyGust();
        s.frameCount = 0;
        s.nextGustIn = 180 + Math.random() * 300;
      }

      applyEdgeAvoidance();

      s.angularVel *= ANG_DAMPING;
      s.angle      += s.angularVel;

      const speed  = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
      const liftX  = -Math.sin(s.angle) * LIFT * speed;
      const liftY  =  Math.cos(s.angle) * LIFT * speed;
      const dragX  = -s.vx * DRAG;
      const dragY  = -s.vy * DRAG;
      const gravY  =  GRAVITY;
      const speedErr = TARGET_SPEED - speed;
      const thrustX  = Math.cos(s.angle) * speedErr * 0.03;
      const thrustY  = Math.sin(s.angle) * speedErr * 0.03;
      const noseX = Math.cos(s.angle);
      const noseY = Math.sin(s.angle);
      s.vx += (noseX * speed - s.vx) * SLIP + dragX + liftX + thrustX;
      s.vy += (noseY * speed - s.vy) * SLIP + dragY + liftY + gravY + thrustY;

      s.x += s.vx;
      s.y += s.vy;

      if (s.x < PW)     { s.x = PW;     s.vx =  Math.abs(s.vx) * 0.7;  s.angle = -s.angle * 0.5;    s.angularVel *= -0.4; }
      if (s.x > w - PW) { s.x = w - PW; s.vx = -Math.abs(s.vx) * 0.7;  s.angle = Math.PI - s.angle; s.angularVel *= -0.4; }
      if (s.y < PW)     { s.y = PW;     s.vy =  Math.abs(s.vy) * 0.6;  s.angularVel *= -0.35; }
      if (s.y > h - PW) { s.y = h - PW; s.vy = -Math.abs(s.vy) * 0.6;  s.angularVel *= -0.35; }

      plane.style.left      = `${s.x - PW / 2}px`;
      plane.style.top       = `${s.y - PW / 2}px`;
      plane.style.transform = `rotate(${s.angle * 180 / Math.PI}deg)`;

      if (s.frameCount % TRAIL_SKIP === 0) {
        const tailX = s.x - Math.cos(s.angle) * (PW * 0.48);
        const tailY = s.y - Math.sin(s.angle) * (PW * 0.48);
        s.trail.push({ x: tailX, y: tailY });
        if (s.trail.length > TRAIL_MAX) s.trail.shift();
      }

      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < s.trail.length; i++) {
        if (i % 3 !== 0) continue;
        const t        = s.trail[i];
        const progress = i / s.trail.length;
        const r        = 0.8 + progress * 1.6;
        const opacity  = progress * 0.28;
        ctx.beginPath();
        ctx.arc(t.x, t.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${opacity})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener("resize", resize);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [containerRef]);

  return (
    <>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 3 }} />
      <div ref={planeRef} style={{ position: "absolute", width: 48, height: 48, pointerEvents: "none", zIndex: 4 }}>
        <svg viewBox="0 0 64 64" style={{ width: "100%", height: "100%" }}>
          <polygon points="60,32 4,10 20,32 4,54" fill="white" opacity="0.92" />
          <polygon points="60,32 4,10 28,36" fill="rgba(255,255,255,0.38)" />
          <line x1="60" y1="32" x2="20" y2="32" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
        </svg>
      </div>
    </>
  );
}


// ─── Main ──────────────────────────────────────────────────────────────────
export default function Home() {
  const router  = useRouter();
  const heroRef = useRef<HTMLElement>(null);

  const [selectedSlug, setSelectedSlug]         = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry]   = useState<CountryWithData | null>(null);
  const [showHero, setShowHero]                 = useState(true);
  const [allCountries, setAllCountries]         = useState<CountryWithData[]>([]);
  const [selectedRole, setSelectedRole]         = useState<JobRole>("softwareEngineer");
  const [highlightedSlugs, setHighlightedSlugs] = useState<string[]>([]);
  const [wizardMatches, setWizardMatches]       = useState<CountryMatch[]>([]);
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
    const matchesRaw = sessionStorage.getItem("wizardMatches");
    if (raw) {
      const slugs: string[] = JSON.parse(raw);
      setHighlightedSlugs(slugs);
      setShowHero(false);
      sessionStorage.removeItem("highlightedCountries");
      if (matchesRaw) setWizardMatches(JSON.parse(matchesRaw));
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

  const handleClosePanel    = useCallback(() => { setSelectedSlug(null); setSelectedCountry(null); }, []);
  const handleBackToHome    = useCallback(() => {
    setSelectedSlug(null); setSelectedCountry(null);
    setShowHero(true); setHighlightedSlugs([]); setWizardMatches([]);
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
      {wizardMatches.length > 0 && !selectedSlug && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60">
          <WizardMatchesPanel
            matches={wizardMatches} allCountries={allCountries} selectedRole={selectedRole}
            onCountrySelect={slug => { handleCountrySelect(slug); setWizardMatches([]); }}
            onClose={() => { setWizardMatches([]); setHighlightedSlugs([]); }}
          />
        </div>
      )}
      <div className="fixed bottom-0 right-0 z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <CountryPanel country={selectedCountry} onClose={handleClosePanel} selectedRole={selectedRole} onRoleChange={setSelectedRole} />
        </div>
      </div>
      {!showHero && !selectedSlug && wizardMatches.length === 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3">
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
          position: "relative",
          minHeight: "100vh",
          background: "#0a0a0a",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "120px 0 80px",
        }}
      >
        <div className="hero-gradient-bg" />
        <PaperPlane containerRef={heroRef} />

        <div style={{
          position: "relative", zIndex: 5,
          display: "flex", flexDirection: "column", alignItems: "center", width: "100%",
        }}>
          <div style={{ width: "100%", overflow: "visible", paddingBottom: "0.18em", marginBottom: 48 }}>
            <StretchHeadline />
          </div>

          <p style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "clamp(14px, 1.5vw, 18px)",
            color: "rgba(255,255,255,0.4)",
            fontWeight: 400,
            lineHeight: 1.6,
            textAlign: "center",
            maxWidth: 480,
            marginBottom: 44,
          }}>
            Salaries, visas, cost of living and quality of life
            personalised to your job and passport.
          </p>

          <button
            onClick={() => router.push("/wizard")}
            className="hero-cta-white"
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              background: "#ffffff", color: "#0a0a0a",
              fontFamily: "Inter, sans-serif",
              fontSize: 15, fontWeight: 700,
              padding: "15px 56px", borderRadius: 100,
              border: "none", cursor: "pointer",
              letterSpacing: "0.02em",
              boxShadow: "0 2px 24px rgba(255,255,255,0.12)",
            }}
          >
            Find My Country
          </button>
        </div>
      </section>

      {/* ── SECTION 2: GLOBE ── */}
      <section
        style={{
          width: "100%", height: "100svh", minHeight: 520,
          position: "relative", background: "#0a0a0a",
        }}
        aria-label="Interactive globe"
      >
        <div className="hero-gradient-bg" />
        <p style={{
          position: "absolute", top: 20, left: 24, zIndex: 10,
          fontSize: 9, fontFamily: "monospace",
          color: "rgba(255,255,255,0.18)",
          textTransform: "uppercase", letterSpacing: "0.3em",
          pointerEvents: "none",
        }}>
          Drag · click a country
        </p>
        <div style={{ position: "absolute", inset: 0, touchAction: "none" }}>
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