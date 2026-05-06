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

// ─── Flicker word ──────────────────────────────────────────────────────────
const FLICKER_WORDS = [
  "India", "UK", "Ireland", "Australia", "America",
  "Canada", "Germany", "Japan", "Portugal", "Singapore",
];

function FlickerWord() {
  const [word, setWord]       = useState("Belong");
  const [visible, setVisible] = useState(true);
  const [done, setDone]       = useState(false);
  const s = useRef({ count: 0, idx: 0, started: false });

  useEffect(() => {
    if (s.current.started) return;
    s.current.started = true;
    const TOTAL = 18;
    let tid: ReturnType<typeof setTimeout>;

    function flicker() {
      if (s.current.count >= TOTAL) {
        setVisible(false);
        tid = setTimeout(() => { setWord("Belong"); setVisible(true); setDone(true); }, 70);
        return;
      }
      setVisible(false);
      tid = setTimeout(() => {
        setWord(FLICKER_WORDS[s.current.idx % FLICKER_WORDS.length]);
        s.current.idx++;
        s.current.count++;
        setVisible(true);
        const p = s.current.count / TOTAL;
        tid = setTimeout(flicker, p < 0.5 ? 280 : p < 0.8 ? 160 : 90);
      }, 70);
    }

    tid = setTimeout(flicker, 600);
    return () => clearTimeout(tid);
  }, []);

  return (
    <span style={{
      opacity:    visible ? 1 : 0,
      transition: "opacity 0.06s ease",
      fontStyle:  done ? "italic" : "normal",
      color:      done ? "#00ffd5" : "#ffffff",
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
    // Position
    x: 0, y: 0,
    // Velocity
    vx: 2.2, vy: -0.8,
    // Angle (radians, 0 = pointing right)
    angle: 0,
    // Angular velocity — gives natural banking
    angularVel: 0,
    // Lift/drag physics
    speed: 2.2,
    trail: [] as { x: number; y: number }[],
    frameCount: 0,
    nextInputIn: 180,   // frames until next "gust" input
  });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    const planeEl  = planeRef.current;
    const heroEl   = containerRef.current;
    if (!canvasEl || !planeEl || !heroEl) return;

    const canvas: HTMLCanvasElement = canvasEl;
    const plane:  HTMLDivElement    = planeEl;
    const hero:   HTMLElement       = heroEl;
    const ctx = canvas.getContext("2d")!;
    const s   = stateRef.current;

    // Paper plane constants
    const DRAG         = 0.012;   // air resistance — slows over time
    const LIFT         = 0.018;   // lift keeps it from stalling
    const GRAVITY      = 0.035;   // gentle downward pull
    const ANG_DAMPING  = 0.92;    // angular velocity decays (stops spinning)
    const MAX_ANG_VEL  = 0.04;    // max rotation speed
    const TARGET_SPEED = 2.4;     // natural cruise speed
    const PW           = 52;      // plane size
    const EDGE         = 110;

    function resize() {
      const w = hero.offsetWidth, h = hero.offsetHeight;
      canvas.width = w; canvas.height = h;
      if (s.x === 0) {
        s.x = w * 0.3;
        s.y = h * 0.4;
        // Launch angle: slightly up-right
        s.angle = -0.3;
        s.vx = Math.cos(s.angle) * TARGET_SPEED;
        s.vy = Math.sin(s.angle) * TARGET_SPEED;
      }
    }

    function applyGust() {
      // Random angular impulse — feels like a gust of wind banking the plane
      const gustStrength = (Math.random() - 0.5) * 0.06;
      s.angularVel += gustStrength;
      // Clamp
      s.angularVel = Math.max(-MAX_ANG_VEL, Math.min(MAX_ANG_VEL, s.angularVel));
    }

    function applyEdgeAvoidance() {
      const w = hero.offsetWidth, h = hero.offsetHeight;
      // Soft walls — angular nudge away from edges
      const m = EDGE;
      if (s.x < m)       s.angularVel -= 0.008 * ((m - s.x) / m);
      if (s.x > w - m)   s.angularVel += 0.008 * ((s.x - (w - m)) / m);
      if (s.y < m)       s.angularVel += 0.006 * ((m - s.y) / m);
      if (s.y > h - m)   s.angularVel -= 0.006 * ((s.y - (h - m)) / m);
    }

    function tick() {
      const w = hero.offsetWidth, h = hero.offsetHeight;
      s.frameCount++;

      // Random gusts every N frames
      if (s.frameCount >= s.nextInputIn) {
        applyGust();
        s.frameCount  = 0;
        s.nextInputIn = 120 + Math.random() * 240;
      }

      // Edge avoidance every frame
      applyEdgeAvoidance();

      // Update angle from angular velocity
      s.angularVel *= ANG_DAMPING;
      s.angle      += s.angularVel;

      // Derive velocity direction from angle — plane flies nose-forward
      const currentSpeed = Math.sqrt(s.vx * s.vx + s.vy * s.vy);

      // Lift: perpendicular to motion, scales with speed
      const liftX = -Math.sin(s.angle) * LIFT * currentSpeed;
      const liftY =  Math.cos(s.angle) * LIFT * currentSpeed;

      // Drag: opposes motion
      const dragX = -s.vx * DRAG;
      const dragY = -s.vy * DRAG;

      // Gravity: always pulls down
      const gravX = 0;
      const gravY = GRAVITY;

      // Speed correction — gently maintain cruise speed
      const speedErr  = TARGET_SPEED - currentSpeed;
      const thrustX   = Math.cos(s.angle) * speedErr * 0.04;
      const thrustY   = Math.sin(s.angle) * speedErr * 0.04;

      // Steer velocity toward nose direction (plane can't fly sideways)
      const noseX = Math.cos(s.angle);
      const noseY = Math.sin(s.angle);
      const slip  = 0.08; // how quickly velocity aligns to nose
      s.vx += (noseX * currentSpeed - s.vx) * slip + dragX + liftX + gravX + thrustX;
      s.vy += (noseY * currentSpeed - s.vy) * slip + dragY + liftY + gravY + thrustY;

      // Move
      s.x += s.vx;
      s.y += s.vy;

      // Hard bounce off walls — flip angular velocity for natural rebound
      if (s.x < PW)     { s.x = PW;     s.vx = Math.abs(s.vx);  s.angle = -s.angle * 0.6; s.angularVel *= -0.5; }
      if (s.x > w - PW) { s.x = w - PW; s.vx = -Math.abs(s.vx); s.angle = Math.PI - s.angle; s.angularVel *= -0.5; }
      if (s.y < PW)     { s.y = PW;     s.vy = Math.abs(s.vy);  s.angularVel *= -0.4; }
      if (s.y > h - PW) { s.y = h - PW; s.vy = -Math.abs(s.vy) * 0.7; s.angularVel *= -0.4; }

      // DOM
      plane.style.left      = `${s.x - PW / 2}px`;
      plane.style.top       = `${s.y - PW / 2}px`;
      plane.style.transform = `rotate(${s.angle * 180 / Math.PI}deg)`;

      // Trail — emitted from TAIL of plane
      const tailX = s.x - Math.cos(s.angle) * (PW * 0.5);
      const tailY = s.y - Math.sin(s.angle) * (PW * 0.5);
      s.trail.push({ x: tailX, y: tailY });
      if (s.trail.length > 110) s.trail.shift();

      // Draw trail
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < s.trail.length; i++) {
        if (i % 4 !== 0) continue;
        const t        = s.trail[i];
        const progress = i / s.trail.length;
        const r        = 1.0 + progress * 1.8;
        ctx.beginPath();
        ctx.arc(t.x, t.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${progress * 0.38})`;
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
      <canvas ref={canvasRef} style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:3 }} />
      <div ref={planeRef} style={{ position:"absolute", width:52, height:52, pointerEvents:"none", zIndex:4 }}>
        <svg viewBox="0 0 64 64" style={{ width:"100%", height:"100%" }}>
          {/* Main body: nose=right(60,32), tail=left(4,10 & 4,54) */}
          <polygon points="60,32 4,10 20,32 4,54" fill="white" opacity="0.95" />
          {/* Folded belly panel */}
          <polygon points="60,32 4,10 28,36" fill="rgba(255,255,255,0.45)" />
          {/* Centre crease from nose to tail */}
          <line x1="60" y1="32" x2="20" y2="32" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
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

  const handleClosePanel = useCallback(() => { setSelectedSlug(null); setSelectedCountry(null); }, []);
  const handleBackToHome = useCallback(() => {
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
        {/* Animated gradient background */}
        <div className="hero-gradient-bg" />
        {/* Plane + trail behind everything */}
        <PaperPlane containerRef={heroRef} />

        {/* Text content — above plane */}
        <div style={{
          position: "relative", zIndex: 5,
          display: "flex", flexDirection: "column", alignItems: "center", width: "100%",
        }}>
          {/* Full-width stretched headline */}
          <div style={{ width: "100%", overflow: "visible", paddingBottom: "0.18em", marginBottom: 48 }}>
            <StretchHeadline />
          </div>

          {/* Subtitle */}
          <p style={{
            fontFamily: "Satoshi, sans-serif",
            fontSize: "clamp(16px, 1.8vw, 22px)",
            color: "rgba(255,255,255,0.48)",
            fontWeight: 400,
            lineHeight: 1.55,
            textAlign: "center",
            maxWidth: 520,
            marginBottom: 44,
          }}>
            Salaries, visas, cost of living and quality of life<br />
            personalised to your job and passport.
          </p>

          {/* White pill CTA */}
          <button
            onClick={() => router.push("/wizard")}
            className="hero-cta-white"
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              background: "#ffffff", color: "#0a0a0a",
              fontFamily: "Satoshi, sans-serif",
              fontSize: 16, fontWeight: 600,
              padding: "16px 64px", borderRadius: 100,
              border: "none", cursor: "pointer",
              letterSpacing: "0.01em",
              boxShadow: "0 2px 24px rgba(255,255,255,0.14)",
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
        {/* Animated gradient background */}
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