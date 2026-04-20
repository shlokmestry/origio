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
  const fetchedRef = useRef(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClosePanel();
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
        <Nav countries={globeCountries} onCountrySelect={handleCountrySelect} />
      </div>

      {/* Hero overlay */}
      {showHero && (
        <>
          {/* Dark gradient from bottom */}
          <div
            className="fixed bottom-0 left-0 right-0 h-3/4 pointer-events-none"
            style={{
              zIndex: 5,
              background: "linear-gradient(to top, rgba(10,10,10,0.97) 0%, rgba(10,10,10,0.7) 50%, transparent 100%)",
            }}
          />

          <div className="fixed bottom-0 left-0 right-0 z-10 px-6 pb-8 sm:pb-10 max-w-2xl">

            {/* Step row */}
            <div
              className="hidden sm:flex items-stretch border-2 border-[#2a2a2a] mb-6 animate-fade-up"
              style={{ opacity: 0, animationDelay: "0.05s", animationFillMode: "forwards" }}
            >
              {[
                { num: "01", label: "Take the quiz" },
                { num: "02", label: "See your matches" },
                { num: "03", label: "Plan your move" },
                { num: "04", label: "Get your report" },
              ].map((item, i) => (
                <div key={item.num} className={`flex items-center gap-2.5 px-4 py-2.5 ${i < 3 ? "border-r-2 border-[#2a2a2a]" : ""}`}>
                  <span className="w-5 h-5 border-2 border-accent text-accent font-heading font-bold text-[10px] flex items-center justify-center flex-shrink-0">{item.num}</span>
                  <span className="text-xs font-bold text-text-muted uppercase tracking-wide">{item.label}</span>
                </div>
              ))}
            </div>

            <div
              className="animate-fade-up"
              style={{ opacity: 0, animationDelay: "0.15s", animationFillMode: "forwards" }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 border-2 border-accent text-accent text-[11px] font-bold px-3 py-1.5 mb-5 uppercase tracking-widest">
                <div className="w-1.5 h-1.5 bg-accent" />
                Real data · 25 countries · 20 job roles
              </div>

              {/* Headline */}
              <h1 className="font-heading text-5xl sm:text-6xl font-extrabold tracking-tight leading-[0.95] text-text-primary mb-4">
                Find Where<br />
                You <span className="gradient-text">Belong</span>
              </h1>

              <p className="text-text-muted text-base sm:text-lg max-w-md leading-relaxed mb-6">
                Salaries, visas, cost of living and quality of life —<br className="hidden sm:block" />
                personalised to your job and passport.
              </p>

              {/* CTA */}
              <button
                onClick={() => router.push("/wizard")}
                className="cta-button px-8 py-3.5 text-sm font-bold mb-6"
              >
                Find My Country
              </button>
            </div>

            {/* Trending */}
            {trendingCountries.length > 0 && (
              <div
                className="animate-fade-up"
                style={{ opacity: 0, animationDelay: "0.3s", animationFillMode: "forwards" }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                    <TrendingUp className="w-3 h-3" /> Trending
                  </span>
                  {trendingCountries.map((country) => (
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
          <div className="bg-[#111111] border-2 border-[#2a2a2a] px-6 py-3 flex items-center gap-3" style={{ boxShadow: "4px 4px 0 #2a2a2a" }}>
            <div className="w-2 h-2 bg-accent" />
            <span className="text-sm font-bold text-text-muted uppercase tracking-wide">
              {highlightedSlugs.length > 0 ? "Your matched countries are highlighted" : "Click a country to explore"}
            </span>
          </div>
        </div>
      )}
    </main>
  );
}