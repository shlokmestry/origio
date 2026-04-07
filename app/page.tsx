// app/page.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import Globe from "@/components/Globe";
import CountryPanel from "@/components/CountryPanel";
import Nav from "@/components/Nav";
import { CountryWithData, GlobeCountry } from "@/types";
import { MapPin, ChevronDown } from "lucide-react";

export default function Home() {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryWithData | null>(null);
  const [showHero, setShowHero] = useState(true);
  const [allCountries, setAllCountries] = useState<CountryWithData[]>([]);

  // Fetch from Supabase API on mount
  useEffect(() => {
    fetch('/api/countries')
      .then((res) => res.json())
      .then((data) => setAllCountries(data))
      .catch((err) => console.error('Failed to fetch countries:', err))
  }, [])

  const globeCountries: GlobeCountry[] = allCountries.map((c) => ({
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
  }));

  const handleCountrySelect = useCallback(
    (slug: string) => {
      setSelectedSlug(slug);
      const country = allCountries.find((c) => c.slug === slug);
      if (country) {
        setSelectedCountry(country);
        setShowHero(false);
      }
    },
    [allCountries]
  );

  const handleClosePanel = useCallback(() => {
    setSelectedSlug(null);
    setSelectedCountry(null);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
      }
      if (e.key === "Escape") {
        handleClosePanel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClosePanel]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-bg-primary">
      <Nav countries={globeCountries} onCountrySelect={handleCountrySelect} />

      <Globe
        countries={globeCountries}
        onCountrySelect={handleCountrySelect}
        selectedSlug={selectedSlug}
      />

      {showHero && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-bg-primary/90 via-bg-primary/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-16 pointer-events-auto">
            <div className="max-w-2xl">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/20 bg-accent/5 text-accent text-xs font-medium mb-6 animate-fade-up"
                style={{ animationDelay: "0.1s", opacity: 0 }}
              >
                <MapPin className="w-3 h-3" />
                <span>Explore {allCountries.length} countries with real data</span>
              </div>

              <h1
                className="font-heading text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[0.95] tracking-tight mb-6 animate-fade-up"
                style={{ animationDelay: "0.2s", opacity: 0 }}
              >
                Find Where
                <br />
                <span className="gradient-text">You Belong</span>
              </h1>

              <p
                className="text-lg sm:text-xl text-text-muted max-w-lg leading-relaxed mb-8 animate-fade-up"
                style={{ animationDelay: "0.4s", opacity: 0 }}
              >
                Explore opportunities, salaries, visas and life quality across
                every country — personalised to you.
              </p>

              <div
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-fade-up"
                style={{ animationDelay: "0.6s", opacity: 0 }}
              >
                <button
                  onClick={() => setShowHero(false)}
                  className="cta-button px-8 py-4 rounded-2xl text-base tracking-wide animate-pulse-glow"
                >
                  Start Exploring
                </button>
                <p className="text-sm text-text-muted flex items-center gap-1">
                  <span>or click any country on the globe</span>
                  <ChevronDown className="w-4 h-4 animate-bounce" />
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <CountryPanel country={selectedCountry} onClose={handleClosePanel} />

      {!showHero && !selectedSlug && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 animate-fade-in">
          <div className="glass-panel rounded-full px-6 py-3 flex items-center gap-3 shadow-xl shadow-black/30">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-sm text-text-muted">Click a country to explore</span>
          </div>
        </div>
      )}
    </main>
  );
}