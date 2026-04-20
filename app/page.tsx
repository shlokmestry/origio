"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Globe from "@/components/Globe";
import CountryPanel from "@/components/CountryPanel";
import WizardMatchesPanel from "@/components/WizardMatchesPanel";
import Nav from "@/components/Nav";
import CommandSearch from "@/components/CommandSearch";
import { supabase } from "@/lib/supabase";
import { CountryWithData, GlobeCountry, JobRole } from "@/types";
import { CountryMatch } from "@/lib/wizard";
import { Briefcase, Globe2, FileText, TrendingUp, Sparkles } from "lucide-react";

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
  const [searchOpen, setSearchOpen] = useState(false);
  const fetchedRef = useRef(false);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Fetch countries
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetch("/api/countries")
      .then((res) => res.json())
      .then((data) => setAllCountries(data))
      .catch((err) => console.error("Failed to fetch countries:", err));
  }, []);

  // Saved countries for pin highlighting
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

  // Wizard highlights from session
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

  const trendingCountries = useMemo(
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

  // Keyboard shortcuts — after handleClosePanel is declared
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        handleClosePanel();
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleClosePanel]);

  return (
    <main className="fixed inset-0 bg-bg-primary overflow-hidden">

      {/* Globe */}
      <div className="fixed inset-0 z-0">
        <Globe
          countries={globeCountries}
          onCountrySelect={handleCountrySelect}
          selectedSlug={selectedSlug}
          highlightedSlugs={highlightedSlugs}
          savedSlugs={savedSlugs}
        />
      </div>

      {/* Nav */}
      <div className="relative z-50">
        <Nav
          countries={globeCountries}
          onCountrySelect={handleCountrySelect}
          onSearchOpen={() => setSearchOpen(true)}
        />
      </div>

      {/* Command search modal */}
      <CommandSearch
        countries={globeCountries}
        onCountrySelect={(slug) => {
          handleCountrySelect(slug);
          setSearchOpen(false);
        }}
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      {/* Hero overlay */}
      {showHero && (
        <>
          <div
            className="fixed bottom-0 left-0 right-0 h-3/4 pointer-events-none"
            style={{
              zIndex: 5,
              background: "linear-gradient(to top, rgba(10,10,15,0.95) 0%, rgba(10,10,15,0.6) 40%, transparent 100%)",
            }}
          />
          <div className="fixed bottom-0 left-0 right-0 z-10 px-6 pb-8 sm:pb-12 max-w-2xl">

            <div
              className="mb-5 animate-fade-up"
              style={{ opacity: 0, animationDelay: "0.1s", animationFillMode: "forwards" }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/20 bg-accent/5 text-accent text-xs font-medium mb-4">
                <Globe2 className="w-3 h-3" />
                Real data across 25 countries · 20 job roles · trusted by expats
              </div>

              <h1 className="font-heading text-5xl sm:text-6xl font-extrabold tracking-tight leading-[0.95] text-text-primary mb-3">
                Find Where<br />
                You <span className="gradient-text">Belong</span>
              </h1>
              <p className="text-text-muted text-base sm:text-lg max-w-md leading-relaxed">
                Salaries, visas, cost of living and quality of life —<br className="hidden sm:block" />
                personalised to your job and passport.
              </p>
            </div>

            {/* CTA */}
            <div
              className="mb-6 animate-fade-up"
              style={{ opacity: 0, animationDelay: "0.5s", animationFillMode: "forwards" }}
            >
              <button
                onClick={() => router.push("/wizard")}
                className="cta-button px-6 py-3 rounded-xl text-sm font-medium"
              >
                Find My Country
              </button>
            </div>

            {/* Trending */}
            {trendingCountries.length > 0 && (
              <div
                className="animate-fade-up"
                style={{ opacity: 0, animationDelay: "0.65s", animationFillMode: "forwards" }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-text-muted flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Trending
                  </span>
                  {trendingCountries.map((country) => (
                    <button
                      key={country.slug}
                      onClick={() => handleCountrySelect(country.slug)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg-elevated/60 border border-border hover:border-accent/30 text-xs transition-all group"
                    >
                      <span>{country.flagEmoji}</span>
                      <span className="text-text-muted group-hover:text-text-primary transition-colors">{country.name}</span>
                      <span className="text-accent font-bold">{country.data.moveScore}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step hints */}
            <div
              className="hidden sm:flex flex-wrap items-center gap-3 mt-5 animate-fade-up"
              style={{ animationDelay: "0.8s", opacity: 0, animationFillMode: "forwards" }}
            >
              {[
                { icon: Sparkles, label: "Take the quiz" },
                { icon: Globe2, label: "See your matches" },
                { icon: Briefcase, label: "Plan your move" },
                { icon: FileText, label: "Get your report" },
              ].map((item, i) => (
                <>
                  {i > 0 && <div key={`sep-${i}`} className="w-4 h-px bg-border flex-shrink-0" />}
                  <div key={item.label} className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-3.5 h-3.5 text-accent" />
                    </div>
                    <span className="text-xs text-text-muted">{item.label}</span>
                  </div>
                </>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Wizard matches panel */}
      {wizardMatches.length > 0 && !selectedSlug && (
        <div className="relative z-40">
          <WizardMatchesPanel
            matches={wizardMatches}
            allCountries={allCountries}
            selectedRole={selectedRole}
            onCountrySelect={(slug) => {
              handleCountrySelect(slug);
              setWizardMatches([]);
            }}
            onClose={() => {
              setWizardMatches([]);
              setHighlightedSlugs([]);
            }}
          />
        </div>
      )}

      {/* Country panel */}
      <div className="relative z-40">
        <CountryPanel
          country={selectedCountry}
          onClose={handleClosePanel}
          selectedRole={selectedRole}
          onRoleChange={setSelectedRole}
        />
      </div>

      {/* Explore hint */}
      {!showHero && !selectedSlug && wizardMatches.length === 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 animate-fade-in">
          <div className="glass-panel rounded-full px-6 py-3 flex items-center gap-3 shadow-xl shadow-black/30">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-sm text-text-muted">
              {highlightedSlugs.length > 0 ? "Your matched countries are highlighted" : "Click a country to explore"}
            </span>
          </div>
        </div>
      )}
    </main>
  );
}