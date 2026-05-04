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

// ── Static example result preview ─────────────────────────────────────────
function ResultPreview() {
  const examples = [
    { flag: "🇩🇰", name: "Denmark",     match: 92, salary: "€74,000", qol: 9.3, color: "#00ffd5" },
    { flag: "🇳🇱", name: "Netherlands", match: 88, salary: "€68,000", qol: 8.8, color: "#facc15" },
    { flag: "🇮🇪", name: "Ireland",     match: 81, salary: "€71,000", qol: 8.5, color: "#a78bfa" },
  ];

  return (
    <div
      className="animate-fade-up"
      style={{ opacity: 0, animationDelay: "0.45s", animationFillMode: "forwards" }}
    >
      <p className="text-[9px] font-bold text-[#444440] uppercase tracking-[0.2em] mb-2">
        Example · Software engineer · Irish passport
      </p>
      <div className="flex flex-col gap-1.5 max-w-sm">
        {examples.map((c, i) => (
          <div
            key={c.name}
            className="flex items-center gap-3 px-3 py-2.5 bg-[#111111] border border-[#1a1a1a]"
            style={{ borderLeftColor: c.color, borderLeftWidth: 2 }}
          >
            <span
              className="font-heading text-[10px] font-extrabold w-4 text-right flex-shrink-0"
              style={{ color: c.color }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-base flex-shrink-0">{c.flag}</span>
            <span className="font-heading text-xs font-extrabold uppercase tracking-tight text-[#f0f0e8] flex-1">
              {c.name}
            </span>
            <div className="flex items-center gap-3 text-[10px] font-bold text-[#666660]">
              <span>{c.salary}/yr</span>
              <span className="text-[#333]">·</span>
              <span>QoL {c.qol}</span>
              <span className="text-[#333]">·</span>
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
    if (!isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobile]);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetch("/api/countries")
      .then((res) => res.json())
      .then((data) => setAllCountries(data))
      .catch((err) => console.error("Failed to fetch countries:", err));
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data } = await supabase
          .from("saved_countries")
          .select("country_slug")
          .eq("user_id", session.user.id);
        setSavedSlugs((data ?? []).map((r: any) => r.country_slug));
      } else {
        setSavedSlugs([]);
      }
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
      slug: c.slug,
      name: c.name,
      flagEmoji: c.flagEmoji,
      lat: c.lat,
      lng: c.lng,
      moveScore: c.data.moveScore,
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

  const handleCountrySelect = useCallback(
    (slug: string) => {
      setSelectedSlug(slug);
      const country = allCountries.find((c) => c.slug === slug);
      if (country) { setSelectedCountry(country); setShowHero(false); }
    },
    [allCountries]
  );

  const handleClosePanel = useCallback(() => {
    setSelectedSlug(null);
    setSelectedCountry(null);
  }, []);

  const handleBackToHome = useCallback(() => {
    setSelectedSlug(null);
    setSelectedCountry(null);
    setShowHero(true);
    setHighlightedSlugs([]);
    setWizardMatches([]);
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
    <div
      className="animate-fade-up"
      style={{ opacity: 0, animationDelay: "0.15s", animationFillMode: "forwards" }}
    >
      {/* Badge */}
      <div className="inline-flex items-center gap-2 border-2 border-accent text-accent text-[11px] font-bold px-3 py-1.5 mb-5 uppercase tracking-widest">
        <div className="w-1.5 h-1.5 bg-accent" />
        Real data · 25 countries · 20 job roles
      </div>

      <h1 className="font-heading text-5xl sm:text-6xl font-extrabold tracking-tight leading-[0.95] text-text-primary mb-4">
        25 countries.<br />
        Ranked <span className="text-accent">for you.</span>
      </h1>

      <p className="text-text-muted text-base sm:text-lg max-w-md leading-relaxed mb-6">
        Take-home pay. Visa routes. Cost of living.<br className="hidden sm:block" />
        Ranked for your job and passport.
      </p>

      {/* CTA */}
      <div className="mb-5">
        <button
          onClick={() => router.push("/wizard")}
          className="cta-button px-8 py-3.5 text-sm font-bold"
        >
          Run the ranking
        </button>
        <p className="text-[10px] font-bold text-[#444440] uppercase tracking-widest mt-2.5">
          8 questions · free
        </p>
      </div>

      {/* Result preview */}
      <ResultPreview />

      {/* Top countries */}
      {topCountries.length > 0 && (
        <div
          className="animate-fade-up mt-5"
          style={{ opacity: 0, animationDelay: "0.6s", animationFillMode: "forwards" }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-widest">
              ↑ Top rated
            </span>
            {topCountries.map((country) => (
              <button
                key={country.slug}
                onClick={() => handleCountrySelect(country.slug)}
                className="brutal-tag"
              >
                <span>{country.flagEmoji}</span>
                <span>{country.name}</span>
                <span className="text-accent font-bold">{country.data.moveScore}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const globeEl = (
    <Globe
      countries={globeCountries}
      onCountrySelect={handleCountrySelect}
      selectedSlug={selectedSlug}
      highlightedSlugs={highlightedSlugs}
      savedSlugs={savedSlugs}
    />
  );

  const hintBar = !showHero && !selectedSlug && wizardMatches.length === 0 && (
    <div className="flex items-center gap-3">
      <button
        onClick={handleBackToHome}
        className="bg-[#111111] border-2 border-[#2a2a2a] px-4 py-3 flex items-center gap-2 text-sm font-bold text-text-muted hover:text-text-primary hover:border-text-primary transition-colors uppercase tracking-wide"
        style={{ boxShadow: "4px 4px 0 #2a2a2a" }}
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Home
      </button>
      <div className="bg-[#111111] border-2 border-[#2a2a2a] px-6 py-3 flex items-center gap-3" style={{ boxShadow: "4px 4px 0 #2a2a2a" }}>
        <div className="w-2 h-2 bg-accent" />
        <span className="text-sm font-bold text-text-muted uppercase tracking-wide">
          {highlightedSlugs.length > 0 ? "Your matched countries are highlighted" : "Click a country to explore"}
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* ── MOBILE ── */}
      <main className="md:hidden min-h-screen bg-bg-primary flex flex-col">
        <div className="relative z-50">
          <Nav countries={globeCountries} onCountrySelect={handleCountrySelect} />
        </div>

        <div className="w-full mt-14" style={{ height: "100vw", minHeight: 320, maxHeight: 500 }}>
          {globeEl}
        </div>

        {showHero && (
          <div className="px-6 py-8">
            {heroContent}
          </div>
        )}

        {wizardMatches.length > 0 && !selectedSlug && (
          <div className="relative z-40">
            <WizardMatchesPanel
              matches={wizardMatches}
              allCountries={allCountries}
              selectedRole={selectedRole}
              onCountrySelect={(slug) => { handleCountrySelect(slug); setWizardMatches([]); }}
              onClose={() => { setWizardMatches([]); setHighlightedSlugs([]); }}
            />
          </div>
        )}

        <div className="relative z-40">
          <CountryPanel
            country={selectedCountry}
            onClose={handleClosePanel}
            selectedRole={selectedRole}
            onRoleChange={setSelectedRole}
          />
        </div>

        {!showHero && !selectedSlug && wizardMatches.length === 0 && (
          <div className="flex justify-center py-4 z-30">
            {hintBar}
          </div>
        )}
      </main>

      {/* ── DESKTOP ── */}
      <main className="hidden md:block fixed inset-0 bg-bg-primary overflow-hidden">

        <div className="fixed inset-0 z-0">
          {globeEl}
        </div>

        {!showHero && !selectedSlug && wizardMatches.length === 0 && (
          <div
            className="fixed inset-0 z-[2] cursor-default"
            onClick={handleBackToHome}
          />
        )}

        <div className="relative z-50">
          <Nav countries={globeCountries} onCountrySelect={handleCountrySelect} />
        </div>

        {showHero && (
          <>
            <div
              className="fixed bottom-0 left-0 right-0 h-3/4 pointer-events-none"
              style={{
                zIndex: 5,
                background: "linear-gradient(to top, rgba(10,10,10,0.97) 0%, rgba(10,10,10,0.7) 50%, transparent 100%)",
              }}
            />
            <div className="fixed bottom-0 left-0 right-0 z-10 px-6 pb-8 sm:pb-10 max-w-2xl">
              {heroContent}
            </div>
          </>
        )}

        {wizardMatches.length > 0 && !selectedSlug && (
          <div className="relative z-40">
            <WizardMatchesPanel
              matches={wizardMatches}
              allCountries={allCountries}
              selectedRole={selectedRole}
              onCountrySelect={(slug) => { handleCountrySelect(slug); setWizardMatches([]); }}
              onClose={() => { setWizardMatches([]); setHighlightedSlugs([]); }}
            />
          </div>
        )}

        <div className="relative z-40">
          <CountryPanel
            country={selectedCountry}
            onClose={handleClosePanel}
            selectedRole={selectedRole}
            onRoleChange={setSelectedRole}
          />
        </div>

        {!showHero && !selectedSlug && wizardMatches.length === 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 animate-fade-in">
            {hintBar}
          </div>
        )}
      </main>
    </>
  );
}