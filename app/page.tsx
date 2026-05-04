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
import { ArrowRight, ArrowLeft } from "lucide-react";
import BelongFlicker from "@/components/BelongFlicker";

// ── Hero background: drifting country names ──
const HERO_COUNTRIES = [
  "DENMARK", "NETHERLANDS", "CANADA", "GERMANY", "SINGAPORE",
  "AUSTRALIA", "SWITZERLAND", "SWEDEN", "PORTUGAL", "JAPAN",
  "UAE", "FRANCE", "IRELAND", "NEW ZEALAND", "SPAIN",
  "FINLAND", "NORWAY", "AUSTRIA", "BELGIUM", "CZECHIA",
];

const COLUMNS = [
  { names: [0, 5, 10, 15], left: "4%",  duration: 35, delay: 0,   opacity: 0.04, size: "clamp(32px,4vw,56px)"   },
  { names: [1, 6, 11, 16], left: "20%", duration: 28, delay: -8,  opacity: 0.07, size: "clamp(40px,5vw,72px)"   },
  { names: [2, 7, 12, 17], left: "40%", duration: 42, delay: -14, opacity: 0.03, size: "clamp(28px,3.5vw,48px)" },
  { names: [3, 8, 13, 18], left: "62%", duration: 32, delay: -5,  opacity: 0.06, size: "clamp(36px,4.5vw,64px)" },
  { names: [4, 9, 14, 19], left: "80%", duration: 38, delay: -20, opacity: 0.04, size: "clamp(30px,3.8vw,52px)" },
];

function HeroDriftBackground() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
      style={{ zIndex: 1 }}
    >
      {COLUMNS.map((col, ci) => {
        const words = [
          ...col.names.map((i) => HERO_COUNTRIES[i]),
          ...col.names.map((i) => HERO_COUNTRIES[i]),
        ];
        return (
          <div
            key={ci}
            className="absolute top-0 flex flex-col gap-8"
            style={{
              left: col.left,
              opacity: col.opacity,
              animation: `hero-drift ${col.duration}s linear ${col.delay}s infinite`,
            }}
          >
            {words.map((name, wi) => (
              <span
                key={wi}
                className="font-heading font-extrabold uppercase text-[#00ffd5] whitespace-nowrap"
                style={{ fontSize: col.size, letterSpacing: "-0.03em", lineHeight: 1 }}
              >
                {name}
              </span>
            ))}
          </div>
        );
      })}
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
  const fetchedRef = useRef(false);

  useEffect(() => {
    document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetch("/api/countries")
      .then((r) => r.json())
      .then((d) => setAllCountries(d))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data } = await supabase
          .from("saved_countries")
          .select("country_slug")
          .eq("user_id", session.user.id);
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
    () => [...allCountries].sort((a, b) => b.data.moveScore - a.data.moveScore).slice(0, 10),
    [allCountries]
  );

  const handleCountrySelect = useCallback((slug: string) => {
    setSelectedSlug(slug);
    const country = allCountries.find((c) => c.slug === slug);
    if (country) { setSelectedCountry(country); setShowHero(false); }
  }, [allCountries]);

  const handleClosePanel = useCallback(() => {
    setSelectedSlug(null); setSelectedCountry(null);
  }, []);

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
            matches={wizardMatches}
            allCountries={allCountries}
            selectedRole={selectedRole}
            onCountrySelect={(slug) => { handleCountrySelect(slug); setWizardMatches([]); }}
            onClose={() => { setWizardMatches([]); setHighlightedSlugs([]); }}
          />
        </div>
      )}
      <div className="fixed bottom-0 right-0 z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <CountryPanel
            country={selectedCountry}
            onClose={handleClosePanel}
            selectedRole={selectedRole}
            onRoleChange={setSelectedRole}
          />
        </div>
      </div>
      {!showHero && !selectedSlug && wizardMatches.length === 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3">
          <button
            onClick={handleBackToHome}
            className="bg-[#111111] border-2 border-[#2a2a2a] px-4 py-3 flex items-center gap-2 text-sm font-bold text-[#666660] hover:text-[#f0f0e8] hover:border-[#f0f0e8] transition-colors uppercase tracking-wide"
            style={{ boxShadow: "4px 4px 0 #2a2a2a" }}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Home
          </button>
          <div
            className="bg-[#111111] border-2 border-[#2a2a2a] px-6 py-3 flex items-center gap-3"
            style={{ boxShadow: "4px 4px 0 #2a2a2a" }}
          >
            <div className="w-2 h-2 bg-accent" />
            <span className="text-sm font-bold text-[#666660] uppercase tracking-wide">
              {highlightedSlugs.length > 0 ? "Your matched countries are highlighted" : "Click a country to explore"}
            </span>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Sticky nav */}
      <div className="sticky top-0 z-50">
        <Nav countries={globeCountries} onCountrySelect={handleCountrySelect} />
      </div>

      {/* ── SECTION 1: Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 md:px-16 py-24 border-b border-[#111] overflow-hidden">

        {/* Drifting country names background */}
        <HeroDriftBackground />

        {/* Radial vignette — keeps centre clear for text */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 2,
            background: "radial-gradient(ellipse 65% 60% at 50% 50%, rgba(10,10,10,0.97) 0%, rgba(10,10,10,0.75) 60%, transparent 100%)",
          }}
        />

        {/* Hero content */}
        <div
          className="relative w-full max-w-3xl mx-auto text-center animate-fade-up"
          style={{ zIndex: 3, opacity: 0, animationDelay: "0.1s", animationFillMode: "forwards" }}
        >
          <h1 className="mb-6">
  <span
    className="block text-[#f0f0e8] whitespace-nowrap"
    style={{
      fontFamily: "DM Serif Display, Georgia, serif",
      fontSize: "clamp(36px, 6.5vw, 96px)",
      fontWeight: 400,
      fontStyle: "italic",
      lineHeight: 1.05,
    }}
  >
    Find where you <BelongFlicker />
  </span>
</h1>

          <p
            className="mx-auto text-[#555550] leading-relaxed mb-10"
            style={{ fontSize: "clamp(15px, 1.5vw, 18px)", maxWidth: "34ch" }}
          >
            The platform that helps you compare salaries, visas, and cost of living for your exact job and passport.
          </p>

          <button
            onClick={() => router.push("/wizard")}
            className="cta-button group inline-flex items-center gap-3 px-8 py-4 text-[11px] font-bold uppercase tracking-widest"
          >
            Run the ranking
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* ── SECTION 2: Globe ── */}
      <section
        className="w-full border-b border-[#111] relative"
        style={{ height: "100svh", minHeight: 500 }}
      >
        <div className="absolute top-6 left-6 z-10 pointer-events-none">
          <p className="font-mono text-[9px] text-[#222] uppercase tracking-[0.25em]">
            Drag to explore · click a country
          </p>
        </div>
        <Globe
          countries={globeCountries}
          onCountrySelect={handleCountrySelect}
          selectedSlug={selectedSlug}
          highlightedSlugs={highlightedSlugs}
          savedSlugs={savedSlugs}
        />
      </section>

      {/* ── SECTION 3: Top countries ── */}
      <section className="border-b border-[#111] px-6 md:px-16 lg:px-24 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-baseline justify-between mb-8">
            <div>
              <p className="font-mono text-[9px] text-[#333330] uppercase tracking-[0.3em] mb-2">
                Live rankings
              </p>
              <h2
                className="font-heading font-extrabold uppercase text-[#f0f0e8]"
                style={{ fontSize: "clamp(24px, 4vw, 48px)", letterSpacing: "-0.02em", lineHeight: 1 }}
              >
                Top countries right now
              </h2>
            </div>
            <button
              onClick={() => router.push("/wizard")}
              className="hidden md:flex items-center gap-2 text-[10px] font-mono font-bold text-[#333330] hover:text-[#00ffd5] uppercase tracking-widest transition-colors"
            >
              Get your ranking <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {topCountries.length === 0 ? (
            <div className="flex flex-col gap-px">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-[#0d0d0d] border border-[#1a1a1a] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-px">
              {topCountries.map((country, i) => (
                <button
                  key={country.slug}
                  onClick={() => handleCountrySelect(country.slug)}
                  className="group flex items-center gap-4 md:gap-6 px-5 py-4 bg-[#0d0d0d] border border-[#1a1a1a] hover:border-[#2a2a2a] hover:bg-[#111] active:border-[#00ffd5] transition-all text-left w-full"
                >
                  <span className="font-mono text-[10px] font-bold text-[#1e1e1e] w-5 flex-shrink-0 group-hover:text-[#333] transition-colors">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-xl md:text-2xl flex-shrink-0">{country.flagEmoji}</span>
                  <span className="font-heading text-[13px] md:text-[15px] font-extrabold uppercase tracking-tight text-[#f0f0e8] flex-1">
                    {country.name}
                  </span>
                  <div className="hidden md:flex items-center gap-6 text-[10px] font-mono text-[#333330]">
                    <span>€{Math.round(country.data.salarySoftwareEngineer / 1000)}k avg</span>
                    <span className="text-[#1a1a1a]">·</span>
                    <span>{country.data.incomeTaxRateMid}% tax</span>
                    <span className="text-[#1a1a1a]">·</span>
                    <span>€{Math.round(country.data.costRentCityCentre / 100) * 100}/mo rent</span>
                  </div>
                  <span
                    className="font-mono text-[13px] font-bold flex-shrink-0 ml-auto"
                    style={{ color: "#00ffd5" }}
                  >
                    {country.data.moveScore}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="mt-8 md:hidden">
            <button
              onClick={() => router.push("/wizard")}
              className="cta-button group flex items-center gap-3 px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest w-full justify-center"
            >
              Get your personalised ranking <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: Footer ── */}
      <Footer />

      {overlays}
    </div>
  );
}