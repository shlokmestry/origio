"use client";

import Link from "next/link";
import { useState, useMemo } from "react";

export type CityListItem = {
  id: string;
  slug: string;
  name: string;
  country_name: string;
  flag_emoji: string;
  continent: string;
  currency: string;
  monument_image_url: string | null;
  tagline: string | null;
  city_data: Array<{
    move_score: number | null;
    cost_rent_city_centre: number | null;
  }>;
};


interface CitiesIndexClientProps {
  cities: CityListItem[];
}

type ContinentFilter = "all" | string;

const getCurrencySymbol = (currency: string) => {
  const map: Record<string, string> = {
    EUR: "€", GBP: "£", USD: "$", JPY: "¥",
    SGD: "$", AUD: "$", CAD: "$", AED: "د.إ",
  };
  return map[currency] ?? currency;
};

export default function CitiesIndexClient({ cities }: CitiesIndexClientProps) {
  const [continentFilter, setContinentFilter] = useState<ContinentFilter>("all");
  const [maxRent, setMaxRent] = useState<number>(5000);

  const continents = useMemo(() => {
    return Array.from(new Set(cities.map((c) => c.continent))).sort();
  }, [cities]);

  const filteredCities = useMemo(() => {
    return cities.filter((city) => {
      const continentMatch =
        continentFilter === "all" || city.continent === continentFilter;
      const rent = city.city_data?.[0]?.cost_rent_city_centre ?? 0;
      const budgetMatch = maxRent === 5000 || rent <= maxRent;
      return continentMatch && budgetMatch;
    });
  }, [cities, continentFilter, maxRent]);

  return (
    <div className="cities-index">
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #0a0a0a;
          --fg: #f0f0e8;
          --accent: #00ffd5;
          --dim: rgba(240,240,232,0.5);
          --rule: rgba(240,240,232,0.1);
          --serif: 'DM Serif Display', Georgia, serif;
          --mono: 'Space Mono', monospace;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: var(--bg);
          color: var(--fg);
        }

        .cities-index { min-height: 100vh; }

        .page {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 36px;
        }

        nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          background: rgba(10,10,10,0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--rule);
          height: 52px;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 36px;
        }

        .nav-logo {
          text-decoration: none; color: var(--fg);
          font-size: 10px; font-weight: 800;
          letter-spacing: 0.16em; text-transform: uppercase;
        }

        .nav-center {
          font-size: 9px; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--dim);
        }

        .nav-right { display: flex; gap: 8px; }

        .nav-btn {
          padding: 5px 13px;
          border: 1px solid var(--rule);
          background: transparent; color: var(--dim);
          font-size: 10px; font-weight: 600;
          text-transform: uppercase; cursor: pointer;
          text-decoration: none;
          transition: all 0.2s;
        }

        .nav-btn:hover { border-color: var(--fg); color: var(--fg); }

        .hero {
          padding-top: 160px;
          padding-bottom: 64px;
          border-bottom: 1px solid var(--rule);
        }

        .hero-head {
          font-family: var(--serif);
          font-size: clamp(44px, 5vw, 72px);
          font-weight: 400; line-height: 1;
          margin-bottom: 16px; letter-spacing: -0.02em;
        }

        .hero-subhead {
          font-size: 18px; color: var(--dim);
          max-width: 600px; font-weight: 300; line-height: 1.6;
        }

        .filters {
          display: flex; gap: 40px; flex-wrap: wrap;
          padding: 48px 0 64px; align-items: flex-end;
        }

        .filter-group { display: flex; flex-direction: column; gap: 12px; }

        .filter-label {
          font-size: 9px; font-weight: 700;
          letter-spacing: 0.16em; text-transform: uppercase;
          color: var(--dim);
        }

        .filter-options { display: flex; gap: 8px; flex-wrap: wrap; }

        .filter-btn {
          padding: 8px 14px;
          border: 1px solid var(--rule);
          background: transparent; color: var(--dim);
          font-size: 12px; font-weight: 500;
          text-transform: capitalize; cursor: pointer;
          transition: all 0.2s;
        }

        .filter-btn:hover { border-color: var(--fg); color: var(--fg); }
        .filter-btn.active {
          background: var(--accent); border-color: var(--accent);
          color: var(--bg); font-weight: 700;
        }

        .cities-count {
          font-size: 12px; color: var(--dim);
          margin-bottom: 32px;
          letter-spacing: 0.06em;
        }

        .cities-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 28px;
          margin-bottom: 120px;
        }

        .city-card {
          position: relative; aspect-ratio: 16/9;
          overflow: hidden; background: #1a1a1a;
          border: 1px solid var(--rule);
          box-shadow: 3px 3px 0 rgba(255,255,255,0.04);
          cursor: pointer;
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1),
                      box-shadow 0.3s cubic-bezier(0.4,0,0.2,1);
          text-decoration: none; display: block;
        }

        .city-card:hover {
          transform: translateY(-4px);
          box-shadow: 3px 8px 32px rgba(0,255,213,0.12);
        }

        .city-card:hover .city-card-img {
          transform: scale(1.05);
        }

        .city-card-img {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .city-card-placeholder {
          width: 100%; height: 100%;
          background: #111;
          display: flex; align-items: center; justify-content: center;
          font-size: 48px;
        }

        .city-card-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(10,10,10,0.85) 0%, transparent 55%);
        }

        .city-card-badge {
          position: absolute; top: 12px; right: 12px;
          background: var(--accent); color: var(--bg);
          padding: 6px 10px;
          font-size: 11px; font-weight: 700;
        }

        .city-card-content {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 20px 24px;
        }

        .city-card-country {
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 8px;
        }

        .city-card-flag { font-size: 16px; }

        .city-card-country-name {
          font-size: 10px; color: rgba(240,240,232,0.55);
          font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .city-card-name {
          font-family: var(--serif);
          font-size: 28px; font-weight: 400;
          color: #f0f0e8;
          margin-bottom: 6px; line-height: 1;
        }

        .city-card-tagline {
          font-size: 11px; color: var(--accent);
          font-weight: 600;
        }

        .city-card-rent {
          font-size: 11px; color: rgba(240,240,232,0.4);
          margin-top: 6px;
        }

        /* CTA */
        .cta-section {
          text-align: center;
          padding: 80px 0 120px;
          border-top: 1px solid var(--rule);
        }

        .cta-head {
          font-family: var(--serif);
          font-size: clamp(32px, 3.5vw, 48px);
          margin-bottom: 20px;
        }

        .cta-text {
          color: var(--dim); font-size: 16px;
          margin-bottom: 40px; font-weight: 300;
          max-width: 520px; margin-left: auto; margin-right: auto;
          line-height: 1.6;
        }

        .cta-btn {
          padding: 14px 32px;
          background: var(--accent); color: var(--bg);
          font-weight: 700; text-transform: uppercase;
          font-size: 12px; letter-spacing: 0.1em;
          border: none; cursor: pointer;
          text-decoration: none; display: inline-block;
          transition: all 0.2s;
        }

        .cta-btn:hover {
          box-shadow: 0 8px 24px rgba(0,255,213,0.3);
          transform: scale(1.02);
        }

        @media (max-width: 768px) {
          .page { padding: 0 16px; }
          nav { padding: 0 16px; }
          .hero { padding-top: 100px; }
          .filters { gap: 28px; }
          .cities-grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 16px;
          }
          .city-card-name { font-size: 22px; }
        }
      `}</style>

      <nav>
        <Link href="/" className="nav-logo">ORIGIO</Link>
        <span className="nav-center">Cities</span>
        <div className="nav-right">
          <a href="/wizard" className="nav-btn">Wizard</a>
          <Link href="/blog" className="nav-btn">Blog</Link>
        </div>
      </nav>

      <div className="page">
        <section className="hero">
          <h1 className="hero-head">Find your city.</h1>
          <p className="hero-subhead">
            The world's best cities for relocation — accurate data on cost of
            living, salaries, neighbourhoods, and what it actually feels like
            to live there.
          </p>
        </section>

        {/* FILTERS */}
        <section className="filters">
          <div className="filter-group">
            <span className="filter-label">Region</span>
            <div className="filter-options">
              <button
                className={`filter-btn ${continentFilter === "all" ? "active" : ""}`}
                onClick={() => setContinentFilter("all")}
              >
                All
              </button>
              {continents.map((c) => (
                <button
                  key={c}
                  className={`filter-btn ${continentFilter === c ? "active" : ""}`}
                  onClick={() => setContinentFilter(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <span className="filter-label">
              Max rent: {maxRent === 5000 ? "Any" : `€${maxRent}/mo`}
            </span>
            <input
              type="range"
              min={500}
              max={5000}
              step={250}
              value={maxRent}
              onChange={(e) => setMaxRent(Number(e.target.value))}
              style={{ width: 160, accentColor: "var(--accent)" }}
            />
          </div>
        </section>

        {/* GRID */}
        <p className="cities-count">
          {filteredCities.length} {filteredCities.length === 1 ? "city" : "cities"}
        </p>

        <div className="cities-grid">
          {filteredCities.map((city) => (
            <Link key={city.id} href={`/city/${city.slug}`} className="city-card">
              {city.monument_image_url ? (
                <img
                  className="city-card-img"
                  src={city.monument_image_url}
                  alt={city.name}
                  loading="lazy"
                />
              ) : (
                <div className="city-card-placeholder">
                  {city.flag_emoji}
                </div>
              )}

              <div className="city-card-overlay" />

              <div className="city-card-badge">
                {city.city_data?.[0]?.move_score ?? "—"}/10
              </div>

              <div className="city-card-content">
                <div className="city-card-country">
                  <span className="city-card-flag">{city.flag_emoji}</span>
                  <span className="city-card-country-name">{city.country_name}</span>
                </div>
                <h2 className="city-card-name">{city.name}</h2>
                {city.tagline && (
                  <p className="city-card-tagline">{city.tagline}</p>
                )}
                {city.city_data?.[0]?.cost_rent_city_centre && (
                  <p className="city-card-rent">
                    1BR centre: {getCurrencySymbol(city.currency)}
                    {city.city_data[0].cost_rent_city_centre}/mo
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <section className="cta-section">
          <h2 className="cta-head">Not sure where to start?</h2>
          <p className="cta-text">
            Take the Origio wizard to get personalised recommendations based on
            your role, budget, and passport.
          </p>
          <a href="/wizard" className="cta-btn">
            Start the wizard →
          </a>
        </section>
      </div>
    </div>
  );
}