"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import RankedBarChart, { type RankedCostRow, type RankedEntity } from "@/components/RankedBarChart";
import { FlagIcon } from "@/components/FlagIcon";
import { slugToIso } from "@/lib/flagCodes";
import { CountryWithData } from "@/types";
import styles from "@/app/cities/compare/compare.module.css";

type CostKey = "rent" | "groc" | "dine" | "util" | "gym" | "cowork" | "transport";
type CurrencyKey = "eur" | "usd" | "gbp" | "jpy";

const COUNTRY_MAX = 4;
const REGION_ORDER = ["Europe", "Asia", "Americas", "Middle East & Africa", "Oceania"];

const TO_EUR: Record<string, number> = {
  EUR: 1, GBP: 1.18, USD: 0.93, AED: 0.25, JPY: 0.0062,
  SGD: 0.70, AUD: 0.60, CAD: 0.68, THB: 0.027, MXN: 0.048,
  PLN: 0.23, CZK: 0.041, HUF: 0.0026, RON: 0.20, BGN: 0.51,
  HRK: 0.13, RSD: 0.0085, TRY: 0.031, BRL: 0.18, COP: 0.00023,
  IDR: 0.000058, MYR: 0.20, ZAR: 0.050, GEL: 0.34, VND: 0.000037,
  TWD: 0.028, KES: 0.0072, ARS: 0.00092, CHF: 1.05, NOK: 0.086,
  SEK: 0.089, DKK: 0.134, NZD: 0.55, KRW: 0.00067, INR: 0.011,
};

const RATES: Record<CurrencyKey, number> = { eur: 1, usd: 1.07, gbp: 0.85, jpy: 165 };
const SYMBOL: Record<CurrencyKey, string> = { eur: "€", usd: "$", gbp: "£", jpy: "¥" };
const CURR_LABEL: Record<CurrencyKey, string> = { eur: "EUR €", usd: "USD $", gbp: "GBP £", jpy: "JPY ¥" };
const CURR_CYCLE: CurrencyKey[] = ["eur", "usd", "gbp", "jpy"];

const COST_ROWS: RankedCostRow<CostKey>[] = [
  { key: "rent", label: "Rent", color: "#a8651e" },
  { key: "groc", label: "Groceries", color: "#5f6d2d" },
  { key: "dine", label: "Dining", color: "#1f5a4d" },
  { key: "util", label: "Utilities", color: "#3b485c" },
  { key: "gym", label: "Gym", color: "#6f3e6b" },
  { key: "cowork", label: "Coworking", color: "#a04c2a" },
  { key: "transport", label: "Transit", color: "#b03c4e" },
];

function fmt(n: number, currency: CurrencyKey): string {
  return SYMBOL[currency] + Math.round(n * RATES[currency]).toLocaleString();
}

function fmtCompact(n: number, currency: CurrencyKey): string {
  const v = Math.round(n * RATES[currency]);
  if (v >= 1000) return SYMBOL[currency] + (v / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return SYMBOL[currency] + v;
}

function regionFor(country: CountryWithData): string {
  if (country.continent === "Europe") return "Europe";
  if (country.continent === "Asia") return "Asia";
  if (country.continent === "North America" || country.continent === "South America") return "Americas";
  if (country.continent === "Oceania") return "Oceania";
  return "Middle East & Africa";
}

function toRankedCountry(country: CountryWithData): RankedEntity<CostKey> {
  const rate = TO_EUR[country.currency] ?? 1;
  const toEur = (n: number) => Math.round(n * rate);
  return {
    slug: country.slug,
    code: country.currency,
    name: country.name,
    meta: country.continent,
    flag: country.flagEmoji,
    iso: slugToIso(country.slug),
    costs: {
      rent: toEur(country.data.costRentCityCentre),
      groc: toEur(country.data.costGroceriesMonthly),
      dine: toEur(country.data.costEatingOut * 20),
      util: toEur(country.data.costUtilitiesMonthly),
      gym: null,
      cowork: null,
      transport: toEur(country.data.costTransportMonthly),
    },
  };
}

export default function ComparePageClient() {
  const searchParams = useSearchParams();
  const [allCountries, setAllCountries] = useState<CountryWithData[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [currency, setCurrency] = useState<CurrencyKey>("eur");
  const [isolated, setIsolated] = useState<CostKey | null>(null);
  const [countrySearch, setCountrySearch] = useState("");
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    fetch("/api/countries")
      .then(r => r.json())
      .then((data: CountryWithData[]) => {
        setAllCountries(data);
        const valid = data.map(c => c.slug);
        const fromCountries = searchParams.get("countries");
        const fromOld = [searchParams.get("a"), searchParams.get("b"), searchParams.get("c")].filter(Boolean).join(",");
        const raw = fromCountries || fromOld;
        const slugs = raw
          ? raw.split(",").filter(s => /^[a-z0-9-]+$/.test(s) && valid.includes(s))
          : [];
        const defaults = ["portugal", "germany", "austria"].filter(s => valid.includes(s));
        const seeded = [...slugs, ...defaults].filter((s, i, a) => a.indexOf(s) === i);
        setSelected(seeded.slice(0, COUNTRY_MAX));
      })
      .catch(console.error);
  }, [searchParams]);

  useEffect(() => {
    if (typeof window === "undefined" || selected.length < 2) return;
    const url = new URL(window.location.href);
    url.searchParams.set("countries", selected.join(","));
    url.searchParams.delete("a");
    url.searchParams.delete("b");
    url.searchParams.delete("c");
    if (currency !== "eur") url.searchParams.set("currency", currency);
    else url.searchParams.delete("currency");
    if (isolated) url.searchParams.set("iso", isolated);
    else url.searchParams.delete("iso");
    window.history.replaceState(null, "", url.toString());
  }, [selected, currency, isolated]);

  useEffect(() => {
    const c = searchParams.get("currency");
    if (CURR_CYCLE.includes(c as CurrencyKey)) setCurrency(c as CurrencyKey);
    const iso = searchParams.get("iso");
    if (iso && COST_ROWS.some(r => r.key === iso)) setIsolated(iso as CostKey);
  }, [searchParams]);

  const picks = useMemo(
    () => selected.map(s => allCountries.find(c => c.slug === s)).filter(Boolean) as CountryWithData[],
    [selected, allCountries]
  );

  const rankedCountries = useMemo(() => picks.map(toRankedCountry), [picks]);

  const filteredCountries = useMemo(() => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return allCountries;
    return allCountries.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q) ||
      c.continent.toLowerCase().includes(q) ||
      c.currency.toLowerCase().includes(q)
    );
  }, [allCountries, countrySearch]);

  const globeCountries = allCountries.map(c => ({
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
  }));

  const toggleCountry = useCallback((slug: string) => {
    setSelected(prev => {
      if (prev.includes(slug)) {
        if (prev.length <= 2) return prev;
        return prev.filter(s => s !== slug);
      }
      if (prev.length >= COUNTRY_MAX) return prev;
      return [...prev, slug];
    });
  }, []);

  const nextCurrency = useCallback(() => {
    setCurrency(prev => CURR_CYCLE[(CURR_CYCLE.indexOf(prev) + 1) % CURR_CYCLE.length]);
  }, []);

  const reset = useCallback(() => {
    const valid = allCountries.map(c => c.slug);
    setSelected(["portugal", "germany", "austria"].filter(s => valid.includes(s)));
    setCurrency("eur");
    setIsolated(null);
    setCountrySearch("");
  }, [allCountries]);

  const copyLink = useCallback(() => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    navigator.clipboard.writeText(url).catch(() => {});
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 1600);
  }, []);

  const copyTable = useCallback(() => {
    if (rankedCountries.length < 2) return;
    const lines = [["Category", ...rankedCountries.map(p => p.name)].join("\t")];
    COST_ROWS.forEach(r => {
      lines.push([r.label, ...rankedCountries.map(p => p.costs[r.key] == null ? "—" : fmt(p.costs[r.key]!, currency))].join("\t"));
    });
    lines.push(["TOTAL / MO", ...rankedCountries.map(p => fmt(COST_ROWS.reduce((s, r) => s + (p.costs[r.key] ?? 0), 0), currency))].join("\t"));
    navigator.clipboard.writeText(lines.join("\n")).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }, [rankedCountries, currency]);

  const downloadCSV = useCallback(() => {
    if (rankedCountries.length < 2) return;
    const rows = [['Category', ...rankedCountries.map(p => p.name)].map(v => `"${v}"`).join(",")];
    COST_ROWS.forEach(r => {
      rows.push([r.label, ...rankedCountries.map(p => p.costs[r.key] == null ? "" : fmt(p.costs[r.key]!, currency))].map(v => `"${v}"`).join(","));
    });
    rows.push(["TOTAL / MO", ...rankedCountries.map(p => fmt(COST_ROWS.reduce((s, r) => s + (p.costs[r.key] ?? 0), 0), currency))].map(v => `"${v}"`).join(","));
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `origio-country-compare-${rankedCountries.map(p => p.slug).join("-")}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [rankedCountries, currency]);

  return (
    <div className={styles.page}>
      <Nav countries={globeCountries} onCountrySelect={() => {}} />

      <main className={styles.folio} style={{ paddingTop: 80 }}>
        <div className={styles.compareToggleWrap}>
          <div className={styles.compareToggle}>
            <Link href="/compare/countries" className={`${styles.compareToggleItem} ${styles.compareToggleItemActive}`}>Compare Countries</Link>
            <Link href="/compare/cities" className={styles.compareToggleItem}>Compare Cities</Link>
          </div>
        </div>

        <div className={styles.mathHead}>
          <span className={styles.mathSolid}>Country </span>
          <span className={styles.mathOutline}>vs Country</span>
        </div>

        <section className={`${styles.raceSub} ${styles.fu}`}>
          <div className={styles.raceSubL}>
            Choose up to four countries. Compare monthly burn first. Salary, tax and visa still decide the final move. Currency{" "}
            <button type="button" className={styles.currToggle} onClick={nextCurrency}>
              {CURR_LABEL[currency]} ⇄
            </button>
          </div>
        </section>

        <section className={styles.pickStrip}>
          <p className={styles.pickSeoLine}>
            Compare rent, groceries, utilities, transport and eating out across {allCountries.length} countries.
          </p>
          <p className={styles.pickSeoLine}>
            Stored country data, normalized to {currency.toUpperCase()}. Dining = 20 meals/month. Estimates, not live quotes.
          </p>
          <div className={styles.selectedBar}>
            <div className={styles.selectedBarL}>
              <span className={styles.pickLbl}><span className={styles.pickLblArr}>→</span> Selected countries</span>
              <div className={styles.selectedPills}>
                {picks.map(c => {
                  const minReached = selected.length <= 2;
                  return (
                    <button
                      key={c.slug}
                      type="button"
                      className={styles.selectedPill}
                      disabled={minReached}
                      onClick={() => toggleCountry(c.slug)}
                    >
                      {slugToIso(c.slug) ? <FlagIcon code={slugToIso(c.slug)!} size="sm" className={styles.chFlag} /> : <span className={styles.chFlag}>{c.flagEmoji}</span>}
                      {c.name}
                      <span className={styles.selectedPillX}>×</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className={styles.selectedBarR}>
              <span className={styles.pickCap}><span className={styles.pickCapNum}>{selected.length}</span> of {COUNTRY_MAX} selected</span>
              <button type="button" className={styles.legendAction} onClick={copyLink}>{linkCopied ? "✓ Link copied" : "↗ Share"}</button>
              <button type="button" className={`${styles.legendAction} ${styles.legendActionGhost}`} onClick={reset}>↻ Clear all</button>
            </div>
          </div>

          <div className={styles.pickHeader}>
            <span className={styles.pickLbl}><span className={styles.pickLblArr}>→</span> Country picker</span>
            <div className={styles.pickTools}>
              <input
                type="text"
                value={countrySearch}
                onChange={e => setCountrySearch(e.target.value)}
                className={styles.pickSearch}
                placeholder="Search country or region"
              />
              {countrySearch && (
                <button type="button" className={styles.pickSearchClear} onClick={() => setCountrySearch("")}>×</button>
              )}
            </div>
          </div>

          <div className={styles.pickGroups}>
            {REGION_ORDER.map(region => {
              const regionCountries = filteredCountries.filter(c => regionFor(c) === region);
              if (!regionCountries.length) return null;
              return (
                <div key={region} className={styles.pickGroup}>
                  <span className={styles.pickGroupLabel}>{region}</span>
                  <div className={styles.pickGroupCities}>
                    {regionCountries.map(c => {
                      const isOn = selected.includes(c.slug);
                      const atMax = selected.length >= COUNTRY_MAX && !isOn;
                      const minReached = selected.length <= 2 && isOn;
                      return (
                        <button
                          key={c.slug}
                          type="button"
                          className={`${styles.pickChip}${isOn ? " " + styles.pickChipOn : ""}`}
                          disabled={atMax || minReached}
                          onClick={() => toggleCountry(c.slug)}
                        >
                          {slugToIso(c.slug) ? <FlagIcon code={slugToIso(c.slug)!} size="sm" className={styles.chFlag} /> : <span className={styles.chFlag}>{c.flagEmoji}</span>}
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.legendRow}>
            <span className={styles.legendLbl}><span className={styles.legendLblArr}>↳</span> Show only</span>
            {COST_ROWS.map(r => (
              <button
                key={r.key}
                type="button"
                className={[
                  styles.legendKey,
                  isolated === r.key ? styles.legendKeyOn : "",
                  isolated && isolated !== r.key ? styles.legendKeyDim : "",
                ].filter(Boolean).join(" ")}
                onClick={() => setIsolated(prev => prev === r.key ? null : r.key)}
              >
                <span className={styles.lkSw} style={{ background: r.color }} />
                {r.label}
              </button>
            ))}
            <span className={styles.legendSpacer} />
            <button type="button" className={`${styles.legendAction} ${styles.legendActionGhost}`} onClick={copyTable}>
              {copied ? "✓ Copied" : "⬇ Copy data"}
            </button>
            <button type="button" className={`${styles.legendAction} ${styles.legendActionGhost}`} onClick={downloadCSV}>↓ CSV</button>
          </div>
        </section>

        <RankedBarChart
          entities={rankedCountries}
          costRows={COST_ROWS}
          isolated={isolated}
          currencyLabel={currency.toUpperCase()}
          formatMoney={(n) => fmt(n, currency)}
          formatCompact={(n) => fmtCompact(n, currency)}
          emptyLabel="Pick at least two countries above."
          verdictNoun="country"
        />
      </main>
      <Footer />
    </div>
  );
}
