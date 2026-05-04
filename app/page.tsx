"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Globe from "@/components/Globe";
import CountryPanel from "@/components/CountryPanel";
import WizardMatchesPanel from "@/components/WizardMatchesPanel";
import Nav from "@/components/Nav";
import { supabase } from "@/lib/supabase";
import { CountryWithData, GlobeCountry, JobRole } from "@/types";
import { CountryMatch } from "@/lib/wizard";
import { ArrowLeft } from "lucide-react";

function ResultStrip() {
  const examples = [
    { flag: "🇩🇰", name: "Denmark",     match: 92, salary: "€74k", tax: "39%", rent: "€1,800", color: "#00ffd5" },
    { flag: "🇳🇱", name: "Netherlands", match: 88, salary: "€68k", tax: "37%", rent: "€1,600", color: "#facc15" },
    { flag: "🇮🇪", name: "Ireland",     match: 81, salary: "€71k", tax: "41%", rent: "€2,100", color: "#a78bfa" },
  ];

  return (
    <div className="mt-8">
      <p className="text-[9px] font-bold text-[#333330] uppercase tracking-[0.25em] mb-3">
        Example · Software engineer · Irish passport
      </p>
      <div className="flex flex-col gap-px border border-[#1a1a1a]">
        {examples.map((c, i) => (
          <div
            key={c.name}
            className="flex items-center gap-3 px-4 py-3 bg-[#0d0d0d]"
            style={{ borderLeft: `2px solid ${c.color}` }}
          >
            <span className="font-mono text-[10px] font-bold w-4 flex-shrink-0" style={{ color: c.color }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-sm flex-shrink-0">{c.flag}</span>
            <span className="font-heading text-[11px] font-extrabold uppercase tracking-tight text-[#f0f0e8] flex-1">
              {c.name}
            </span>
            <div className="flex items-center gap-2 text-[10px] font-mono text-[#555550]">
              <span>{c.salary}</span>
              <span className="text-[#222]">·</span>
              <span>{c.tax} tax</span>
              <span className="text-[#222]">·</span>
              <span style={{ color: c.color }}>{c.match}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryWithData | null>(null);
  const [showHero, setShowHero] = useState(true);
  const [allCountries, setAllCountries] = useState<CountryWithData[]>([]);
  const [selectedRole, setSelectedRole] = useState<JobRole>("softwareEngineer");
  const [highlightedSlugs, setHighlightedSlugs] = useState<string[]>([]);
  const [wizardMatches, setWizardMatches] = useState<CountryMatch[]>([]);
  const [savedSlugs, setSavedSlugs] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!isMobile) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobile]);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetch("/api/countries").then((r) => r.json()).then((d) => setAllCountries(d)).catch(console.error);
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
          const country = allCountries.find((c) => c.slug === slugs[0]);
          if (country) { setSelectedSlug(slugs[0]); setSelectedCountry(country); }
        }, 1000);
      }
    }
  }, [allCountries]);

  const globeCountries = useMemo<GlobeCountry[]>(
    () => allCountries.map((c) => ({
      slug: c.slug, name: c.name, flagEmoji: c.flagEmoji,
      lat: c.lat, lng: c.lng, moveScore: c.data.moveScore,
      salarySoftwareEngineer: c.data.salarySoftwareEngineer,
      costRentCityCentre: c.data.costRentCityCentre,
      scoreQualityOfLife: c.data.scoreQualityOfLife,
      visaDifficulty: c.data.visaDifficulty,
      incomeTaxRateMid: c.data.incomeTaxRateMid,
    })),
    [allCountries]
  );

  const topCountries = useMemo(
    () => [...allCountries].sort((a, b) => b.data.moveScore - a.data.moveScore).slice(0, 5),
    [allCountries]
  );

  const handleCountrySelect = useCallback((slug: string) => {
    setSelectedSlug(slug);
    const country = allCountries.find((c) => c.slug === slug);
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

  const heroContent = (
    <div className="animate-fade-up" style={{ opacity: 0, animationDelay: "0.15s", animationFillMode: "forwards" }}>
      <p className="text-[10px] font-bold text-[#444440] uppercase tracking-[0.25em] mb-6">
        25 countries · 20 job roles · real data
      </p>

      {/* Mixed serif + sans headline */}
      <h1 className="mb-6" style={{ lineHeight: 1 }}>
        <span
          className="block text-[#f0f0e8]"
          style={{
            fontFamily: "DM Serif Display, Georgia, serif",
            fontSize: "clamp(40px, 5.5vw, 64px)",
            fontWeight: 400,
            fontStyle: "italic",
            lineHeight: 1.05,
          }}
        >
          Where does your
        </span>
        <span
          className="block font-heading font-extrabold uppercase tracking-tight"
          style={{ fontSize: "clamp(40px, 5.5vw, 64px)", lineHeight: 0.95, color: "#00ffd5" }}
        >
          salary go further?
        </span>
      </h1>

      <p className="text-[#666660] text-sm max-w-xs leading-relaxed mb-8">
        Take-home pay. Visa routes. Cost of living.<br />
        Ranked for your job and passport.
      </p>

      <div className="flex items-center gap-5 mb-2">
        <button onClick={() => router.push("/wizard")} className="cta-button px-7 py-3.5 text-[11px] font-bold uppercase tracking-widest">
          Run the ranking
        </button>
        <span className="text-[10px] font-bold text-[#333330] uppercase tracking-widest">8 questions · free</span>
      </div>

      <ResultStrip />

      {topCountries.length > 0 && (
        <div className="animate-fade-up mt-6" style={{ opacity: 0, animationDelay: "0.5s", animationFillMode: "forwards" }}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-[#333330] uppercase tracking-widest">↑ Highest rated</span>
            {topCountries.map((country) => (
              <button key={country.slug} onClick={() => handleCountrySelect(country.slug)} className="brutal-tag">
                <span>{country.flagEmoji}</span>
                <span>{country.name}</span>
                <span className="font-mono font-bold" style={{ color: "#00ffd5" }}>{country.data.moveScore}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const globeEl = (
    <Globe countries={globeCountries} onCountrySelect={handleCountrySelect}
      selectedSlug={selectedSlug} highlightedSlugs={highlightedSlugs} savedSlugs={savedSlugs} />
  );

  const hintBar = !showHero && !selectedSlug && wizardMatches.length === 0 && (
    <div className="flex items-center gap-3">
      <button onClick={handleBackToHome}
        className="bg-[#111111] border-2 border-[#2a2a2a] px-4 py-3 flex items-center gap-2 text-sm font-bold text-[#666660] hover:text-[#f0f0e8] hover:border-[#f0f0e8] transition-colors uppercase tracking-wide"
        style={{ boxShadow: "4px 4px 0 #2a2a2a" }}>
        <ArrowLeft className="w-3.5 h-3.5" /> Home
      </button>
      <div className="bg-[#111111] border-2 border-[#2a2a2a] px-6 py-3 flex items-center gap-3" style={{ boxShadow: "4px 4px 0 #2a2a2a" }}>
        <div className="w-2 h-2 bg-accent" />
        <span className="text-sm font-bold text-[#666660] uppercase tracking-wide">
          {highlightedSlugs.length > 0 ? "Your matched countries are highlighted" : "Click a country to explore"}
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* ── MOBILE ── */}
      <main className="md:hidden min-h-screen bg-[#0a0a0a] flex flex-col">
        <div className="relative z-50"><Nav countries={globeCountries} onCountrySelect={handleCountrySelect} /></div>
        <div className="w-full mt-14" style={{ height: "100vw", minHeight: 320, maxHeight: 500 }}>{globeEl}</div>
        {showHero && <div className="px-6 py-8">{heroContent}</div>}
        {wizardMatches.length > 0 && !selectedSlug && (
          <div className="relative z-40">
            <WizardMatchesPanel matches={wizardMatches} allCountries={allCountries} selectedRole={selectedRole}
              onCountrySelect={(slug) => { handleCountrySelect(slug); setWizardMatches([]); }}
              onClose={() => { setWizardMatches([]); setHighlightedSlugs([]); }} />
          </div>
        )}
        <div className="relative z-40">
          <CountryPanel country={selectedCountry} onClose={handleClosePanel} selectedRole={selectedRole} onRoleChange={setSelectedRole} />
        </div>
        {!showHero && !selectedSlug && wizardMatches.length === 0 && (
          <div className="flex justify-center py-4 z-30">{hintBar}</div>
        )}
      </main>

      {/* ── DESKTOP — asymmetric: hero left, globe fills right ── */}
      <main className="hidden md:block fixed inset-0 bg-[#0a0a0a] overflow-hidden">
        <div className="fixed inset-0 z-0">{globeEl}</div>

        {!showHero && !selectedSlug && wizardMatches.length === 0 && (
          <div className="fixed inset-0 z-[2] cursor-default" onClick={handleBackToHome} />
        )}

        <div className="relative z-50">
          <Nav countries={globeCountries} onCountrySelect={handleCountrySelect} />
        </div>

        {showHero && (
          <>
            {/* Left gradient — hero lives here, globe visible right */}
            <div className="fixed top-0 left-0 bottom-0 w-[52%] pointer-events-none" style={{
              zIndex: 5,
              background: "linear-gradient(to right, rgba(10,10,10,0.99) 0%, rgba(10,10,10,0.92) 70%, transparent 100%)",
            }} />
            <div className="fixed bottom-0 left-0 right-0 h-24 pointer-events-none" style={{
              zIndex: 5,
              background: "linear-gradient(to top, rgba(10,10,10,0.7) 0%, transparent 100%)",
            }} />
            {/* Hero — vertically centered left column */}
            <div className="fixed top-14 left-0 bottom-0 z-10 flex items-center" style={{ width: "48%" }}>
              <div className="px-10 py-8 max-w-lg">{heroContent}</div>
            </div>
          </>
        )}

        {wizardMatches.length > 0 && !selectedSlug && (
          <div className="relative z-40">
            <WizardMatchesPanel matches={wizardMatches} allCountries={allCountries} selectedRole={selectedRole}
              onCountrySelect={(slug) => { handleCountrySelect(slug); setWizardMatches([]); }}
              onClose={() => { setWizardMatches([]); setHighlightedSlugs([]); }} />
          </div>
        )}
        <div className="relative z-40">
          <CountryPanel country={selectedCountry} onClose={handleClosePanel} selectedRole={selectedRole} onRoleChange={setSelectedRole} />
        </div>
        {!showHero && !selectedSlug && wizardMatches.length === 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 animate-fade-in">{hintBar}</div>
        )}
      </main>
    </>
  );
}