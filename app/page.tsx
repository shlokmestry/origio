"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Globe from "@/components/Globe";
import CountryPanel from "@/components/CountryPanel";
import WizardMatchesPanel from "@/components/WizardMatchesPanel";
import Nav from "@/components/Nav";
import { CountryWithData, GlobeCountry, JobRole } from "@/types";
import { CountryMatch } from "@/lib/wizard";
import { MapPin, Sparkles, Briefcase, Globe2, FileText, TrendingUp } from "lucide-react";

const featuredGuides = [
  {
    title: "Best Countries for Software Engineers",
    slug: "software-engineers",
    description:
      "Compare top countries for engineers by salary, tax, visas, and quality of life.",
  },
  {
    title: "Best Countries for Product Managers",
    slug: "product-managers",
    description:
      "See which countries offer the best mix of PM salary, career growth, and relocation potential.",
  },
  {
    title: "Best Countries for Designers",
    slug: "designers",
    description:
      "Explore the strongest countries for designers looking at pay, lifestyle, and market maturity.",
  },
];

export default function Home() {
  const router = useRouter();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryWithData | null>(null);
  const [showHero, setShowHero] = useState(true);
  const [allCountries, setAllCountries] = useState<CountryWithData[]>([]);
  const [selectedRole, setSelectedRole] = useState<JobRole>("softwareEngineer");
  const [highlightedSlugs, setHighlightedSlugs] = useState<string[]>([]);
  const [wizardMatches, setWizardMatches] = useState<CountryMatch[]>([]);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetch("/api/countries")
      .then((res) => res.json())
      .then((data) => setAllCountries(data))
      .catch((err) => console.error("Failed to fetch countries:", err));
  }, []);

  useEffect(() => {
    const raw = sessionStorage.getItem("highlightedCountries");
    const matchesRaw = sessionStorage.getItem("wizardMatches");
    if (raw) {
      const slugs: string[] = JSON.parse(raw);
      setHighlightedSlugs(slugs);
      setShowHero(false);
      sessionStorage.removeItem("highlightedCountries");
      if (matchesRaw) {
        setWizardMatches(JSON.parse(matchesRaw));
      }
      if (slugs[0]) {
        setTimeout(() => {
          const country = allCountries.find((c) => c.slug === slugs[0]);
          if (country) {
            setSelectedSlug(slugs[0]);
            setSelectedCountry(country);
          }
        }, 1000);
      }
    }
  }, [allCountries]);

  const globeCountries = useMemo<GlobeCountry[]>(
    () =>
      allCountries.map((c) => ({
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
      })),
    [allCountries]
  );

  const trendingCountries = useMemo(
    () =>
      [...allCountries]
        .sort((a, b) => b.data.moveScore - a.data.moveScore)
        .slice(0, 5),
    [allCountries]
  );

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
    <main className="relative w-screen min-h-screen overflow-hidden bg-bg-primary">
      <Nav countries={globeCountries} onCountrySelect={handleCountrySelect} />

      <Globe
        countries={globeCountries}
        onCountrySelect={handleCountrySelect}
        selectedSlug={selectedSlug}
        highlightedSlugs={highlightedSlugs}
      />

      {showHero && (
        <>
          <div
            className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-bg-primary/90 via-bg-primary/40 to-transparent"
            style={{ zIndex: 5, pointerEvents: "none" }}
          />

          <div
            className="absolute bottom-0 left-0 right-0 p-4 sm:p-10 lg:p-16"
            style={{ zIndex: 6, pointerEvents: "none" }}
          >
            <div className="max-w-2xl">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/20 bg-accent/5 text-accent text-xs font-medium mb-6 animate-fade-up"
                style={{ animationDelay: "0.1s", opacity: 0 }}
              >
                <MapPin className="w-3 h-3" />
                <span>
                  Real data across {allCountries.length} countries · 20 job roles · trusted by expats
                </span>
              </div>

              <h1
                className="font-heading text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-[0.95] tracking-tight mb-6 animate-fade-up"
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
                Salaries, visas, cost of living and quality of life — personalised to your job and passport.
              </p>

              <div
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8 animate-fade-up"
                style={{ animationDelay: "0.6s", opacity: 0, pointerEvents: "auto" }}
              >
                <button
                  onClick={() => router.push("/wizard")}
                  className="cta-button px-8 py-4 rounded-2xl text-base tracking-wide animate-pulse-glow flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Find My Country
                </button>
                <button
                  onClick={() => setShowHero(false)}
                  className="px-8 py-4 rounded-2xl text-base tracking-wide border border-border hover:border-accent/30 text-text-muted hover:text-text-primary transition-colors"
                >
                  Explore the Globe
                </button>
              </div>

              {trendingCountries.length > 0 && (
                <div
                  className="mb-8 animate-fade-up"
                  style={{ animationDelay: "0.7s", opacity: 0, pointerEvents: "auto" }}
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1.5 text-xs text-text-muted flex-shrink-0">
                      <TrendingUp className="w-3 h-3" />
                      <span>Trending</span>
                    </div>
                    {trendingCountries.map((country) => (
                      <button
                        key={country.slug}
                        onClick={() => handleCountrySelect(country.slug)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bg-elevated border border-border hover:border-accent/30 hover:bg-accent/5 transition-all group"
                      >
                        <span className="text-sm">{country.flagEmoji}</span>
                        <span className="text-xs text-text-muted group-hover:text-text-primary transition-colors">
                          {country.name}
                        </span>
                        <span className="text-xs font-bold text-accent">
                          {country.data.moveScore}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div
                className="flex flex-wrap items-center gap-3 animate-fade-up"
                style={{ animationDelay: "0.8s", opacity: 0 }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                  </div>
                  <span className="text-xs text-text-muted">Take the quiz</span>
                </div>
                <div className="w-4 h-px bg-border flex-shrink-0" />
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                    <Globe2 className="w-3.5 h-3.5 text-accent" />
                  </div>
                  <span className="text-xs text-text-muted">See your matches</span>
                </div>
                <div className="w-4 h-px bg-border flex-shrink-0" />
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-3.5 h-3.5 text-accent" />
                  </div>
                  <span className="text-xs text-text-muted">Plan your move</span>
                </div>
                <div className="w-4 h-px bg-border flex-shrink-0" />
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-3.5 h-3.5 text-accent" />
                  </div>
                  <span className="text-xs text-text-muted">Get your report</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {wizardMatches.length > 0 && !selectedSlug && (
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
      )}

      <CountryPanel
        country={selectedCountry}
        onClose={handleClosePanel}
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
      />

      {!showHero && !selectedSlug && wizardMatches.length === 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 animate-fade-in">
          <div className="glass-panel rounded-full px-6 py-3 flex items-center gap-3 shadow-xl shadow-black/30">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-sm text-text-muted">
              {highlightedSlugs.length > 0
                ? "Your matched countries are highlighted"
                : "Click a country to explore"}
            </span>
          </div>
        </div>
      )}

      <section className="relative z-20 mx-auto max-w-6xl px-4 pb-16 pt-8 sm:pt-10 lg:pt-12">
        <div className="mb-6 max-w-2xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Career guides
          </p>
          <h2 className="mb-3 font-heading text-2xl font-extrabold text-text-primary sm:text-3xl">
            Explore the best countries by role
          </h2>
          <p className="text-sm leading-7 text-text-muted sm:text-base">
            These guides help people compare relocation options by role before diving into salary and take-home details.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {featuredGuides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/best-countries-for/${guide.slug}`}
              className="group rounded-2xl border border-border bg-bg-elevated/80 p-5 backdrop-blur-sm transition-all hover:border-accent/30 hover:bg-accent/5"
            >
              <p className="mb-3 text-xs uppercase tracking-wider text-text-muted">
                Guide
              </p>
              <h3 className="mb-2 font-heading text-xl font-bold text-text-primary transition-colors group-hover:text-accent">
                {guide.title}
              </h3>
              <p className="mb-4 text-sm leading-6 text-text-muted">
                {guide.description}
              </p>
              <span className="text-sm font-semibold text-accent">
                Read guide →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}