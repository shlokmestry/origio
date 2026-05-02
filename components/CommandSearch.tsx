"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Search, X, TrendingUp, DollarSign, Shield, Receipt, ArrowRight } from "lucide-react";
import { GlobeCountry } from "@/types";
import { getScoreColor } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CommandSearchProps {
  countries: GlobeCountry[];
  onCountrySelect: (slug: string) => void;
  open: boolean;
  onClose: () => void;
}

interface QuickFilter {
  id: string;
  label: string;
  icon: React.ElementType;
  sort: (a: GlobeCountry, b: GlobeCountry) => number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const RECENT_KEY = "origio_recent_searches";
const MAX_RECENT = 3;

const PLACEHOLDERS = [
  "Search for Denmark...",
  "Try Singapore...",
  "Explore UAE...",
  "Find Portugal...",
  "Discover Norway...",
  "Search for Canada...",
];

const QUICK_FILTERS: QuickFilter[] = [
  {
    id: "salary",
    label: "Best salary",
    icon: DollarSign,
    sort: (a, b) => b.salarySoftwareEngineer - a.salarySoftwareEngineer,
  },
  {
    id: "visa",
    label: "Easiest visa",
    icon: Shield,
    sort: (a, b) => a.visaDifficulty - b.visaDifficulty,
  },
  {
    id: "tax",
    label: "Lowest tax",
    icon: Receipt,
    sort: (a, b) => a.incomeTaxRateMid - b.incomeTaxRateMid,
  },
  {
    id: "quality",
    label: "Quality of life",
    icon: TrendingUp,
    sort: (a, b) => b.scoreQualityOfLife - a.scoreQualityOfLife,
  },
];

// Static continent lookup — avoids adding continent to GlobeCountry type
const CONTINENT_MAP: Record<string, string> = {
  denmark: "Northern Europe",
  sweden: "Northern Europe",
  norway: "Northern Europe",
  finland: "Northern Europe",
  netherlands: "Western Europe",
  germany: "Western Europe",
  france: "Western Europe",
  switzerland: "Western Europe",
  austria: "Western Europe",
  belgium: "Western Europe",
  ireland: "Western Europe",
  "united-kingdom": "Western Europe",
  spain: "Southern Europe",
  portugal: "Southern Europe",
  italy: "Southern Europe",
  canada: "North America",
  usa: "North America",
  australia: "Oceania",
  "new-zealand": "Oceania",
  singapore: "Southeast Asia",
  japan: "East Asia",
  uae: "Middle East",
  "south-korea": "East Asia",
  estonia: "Northern Europe",
  czechia: "Central Europe",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch { return []; }
}

function addRecent(slug: string) {
  try {
    const prev = getRecent().filter(s => s !== slug);
    localStorage.setItem(RECENT_KEY, JSON.stringify([slug, ...prev].slice(0, MAX_RECENT)));
  } catch {}
}

// FIXED: strict match — only name start or exact word boundary, not substring of any word
function matchesQuery(country: GlobeCountry, q: string): boolean {
  const query = q.toLowerCase().trim();
  if (!query) return false;
  const name = country.name.toLowerCase();
  const slug = country.slug.toLowerCase();
  // name starts with query OR slug starts with query
  // "de" → Denmark ✓, Sweden ✗
  return name.startsWith(query) || slug.startsWith(query);
}

function ScoreBar({ score }: { score: number }) {
  const color = getScoreColor(score);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{
        width: 28,
        height: 3,
        background: "#1a1a1a",
        border: "1px solid #2a2a2a",
      }}>
        <div style={{
          width: `${(score / 10) * 100}%`,
          height: "100%",
          background: color,
        }} />
      </div>
      <span style={{
        fontSize: 11,
        fontFamily: "monospace",
        fontWeight: 700,
        color,
        letterSpacing: "0.05em",
      }}>
        {score.toFixed(1)}
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CommandSearch({ countries, onCountrySelect, open, onClose }: CommandSearchProps) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [cursor, setCursor] = useState(0);
  const [placeholder, setPlaceholder] = useState(PLACEHOLDERS[0]);
  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Rotate placeholder
  useEffect(() => {
    if (!open) return;
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % PLACEHOLDERS.length;
      setPlaceholder(PLACEHOLDERS[i]);
    }, 2500);
    return () => clearInterval(interval);
  }, [open]);

  // Reset + focus on open
  useEffect(() => {
    if (open) {
      setRecentSlugs(getRecent());
      setCursor(0);
      setQuery("");
      setActiveFilter(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Filtered results — fixed match logic
  const results = useMemo(() => {
    if (activeFilter && !query.trim()) {
      const filter = QUICK_FILTERS.find(f => f.id === activeFilter);
      if (filter) return [...countries].sort(filter.sort).slice(0, 8);
    }

    if (!query.trim() && !activeFilter) return [];

    // Apply text filter first, then sort by moveScore
    return countries
      .filter(c => matchesQuery(c, query))
      .sort((a, b) => b.moveScore - a.moveScore)
      .slice(0, 8);
  }, [query, countries, activeFilter]);

  const recentCountries = useMemo(() =>
    recentSlugs
      .map(slug => countries.find(c => c.slug === slug))
      .filter(Boolean) as GlobeCountry[],
    [recentSlugs, countries]
  );

  const showResults = results.length > 0;
  const showRecent = !query && !activeFilter && recentCountries.length > 0;
  const showFilters = !query || activeFilter;

  const allItems = useMemo(
    () => showResults ? results : showRecent ? recentCountries : [],
    [showResults, results, showRecent, recentCountries]
  );

  const select = useCallback((slug: string) => {
    addRecent(slug);
    onCountrySelect(slug);
    onClose();
    setQuery("");
  }, [onCountrySelect, onClose]);

  // Keyboard nav
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setCursor(c => Math.min(c + 1, allItems.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)); }
      if (e.key === "Enter" && allItems[cursor]) select(allItems[cursor].slug);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, allItems, cursor, select, onClose]);

  // Scroll cursor into view
  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${cursor}"]`)?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "15vh",
        paddingLeft: 16,
        paddingRight: 16,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(6px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 580,
          background: "#0f0f0f",
          border: "2px solid #2a2a2a",
          boxShadow: "6px 6px 0 #00ffd5",
          overflow: "hidden",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Input row */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 16px",
          borderBottom: "2px solid #2a2a2a",
        }}>
          <Search style={{ width: 16, height: 16, color: "#666660", flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setCursor(0); setActiveFilter(null); }}
            placeholder={placeholder}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#f0f0e8",
              fontSize: 14,
              fontFamily: "Satoshi, sans-serif",
            }}
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setCursor(0); }}
              style={{ color: "#666660", cursor: "pointer", background: "none", border: "none", padding: 0, display: "flex" }}
            >
              <X style={{ width: 16, height: 16 }} />
            </button>
          )}
          <kbd style={{
            padding: "2px 6px",
            fontSize: 10,
            fontFamily: "monospace",
            border: "1px solid #2a2a2a",
            color: "#666660",
            background: "#1a1a1a",
          }}>ESC</kbd>
        </div>

        <div style={{ maxHeight: "55vh", overflowY: "auto" }} ref={listRef}>

          {/* Quick filters */}
          {showFilters && (
            <div style={{ padding: "12px 16px 8px" }}>
              <p style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#666660",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                marginBottom: 8,
                fontFamily: "Cabinet Grotesk, sans-serif",
              }}>
                Quick filters
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {QUICK_FILTERS.map(f => {
                  const Icon = f.icon;
                  const active = activeFilter === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => { setActiveFilter(active ? null : f.id); setCursor(0); setQuery(""); }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "5px 10px",
                        fontSize: 11,
                        fontFamily: "Cabinet Grotesk, sans-serif",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        cursor: "pointer",
                        border: active ? "2px solid #00ffd5" : "2px solid #2a2a2a",
                        background: active ? "rgba(0,255,213,0.08)" : "transparent",
                        color: active ? "#00ffd5" : "#888880",
                        boxShadow: active ? "2px 2px 0 #00ffd5" : "2px 2px 0 #2a2a2a",
                        transition: "all 0.1s ease",
                      }}
                    >
                      <Icon style={{ width: 11, height: 11 }} />
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent */}
          {showRecent && (
            <div style={{ padding: "8px 16px 4px" }}>
              <p style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#666660",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                marginBottom: 6,
                fontFamily: "Cabinet Grotesk, sans-serif",
              }}>
                Recent
              </p>
              {recentCountries.map((c, i) => (
                <ResultRow
                  key={c.slug}
                  country={c}
                  index={i}
                  active={cursor === i}
                  onSelect={select}
                  onHover={setCursor}
                />
              ))}
            </div>
          )}

          {/* Results */}
          {showResults && (
            <div style={{ padding: "8px 0 4px" }}>
              {activeFilter && (
                <p style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#666660",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  padding: "0 16px 8px",
                  fontFamily: "Cabinet Grotesk, sans-serif",
                }}>
                  {QUICK_FILTERS.find(f => f.id === activeFilter)?.label}
                </p>
              )}
              {results.map((c, i) => (
                <ResultRow
                  key={c.slug}
                  country={c}
                  index={i}
                  active={cursor === i}
                  onSelect={select}
                  onHover={setCursor}
                />
              ))}
            </div>
          )}

          {/* No results */}
          {query && results.length === 0 && (
            <div style={{ padding: "32px 16px", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "#666660", fontFamily: "Satoshi, sans-serif" }}>
                No countries matching &ldquo;{query}&rdquo;
              </p>
            </div>
          )}

          {/* Empty — no query, no recent, no filter */}
          {!query && !activeFilter && recentCountries.length === 0 && (
            <div style={{ padding: "24px 16px", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "#666660", fontFamily: "Satoshi, sans-serif" }}>
                25 countries. Start typing.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: "8px 16px",
          borderTop: "2px solid #1a1a1a",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}>
          {[
            { key: "↑↓", label: "navigate" },
            { key: "↵", label: "select" },
            { key: "esc", label: "close" },
          ].map(({ key, label }) => (
            <span key={key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <kbd style={{
                padding: "1px 5px",
                fontSize: 10,
                fontFamily: "monospace",
                border: "1px solid #2a2a2a",
                color: "#666660",
                background: "#1a1a1a",
              }}>{key}</kbd>
              <span style={{ fontSize: 10, color: "#444440", fontFamily: "Satoshi, sans-serif" }}>{label}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Result row ───────────────────────────────────────────────────────────────

function ResultRow({
  country,
  index,
  active,
  onSelect,
  onHover,
}: {
  country: GlobeCountry;
  index: number;
  active: boolean;
  onSelect: (slug: string) => void;
  onHover: (i: number) => void;
}) {
  const continent = CONTINENT_MAP[country.slug] ?? "";

  return (
    <button
      data-index={index}
      onClick={() => onSelect(country.slug)}
      onMouseEnter={() => onHover(index)}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 16px",
        background: active ? "rgba(0,255,213,0.05)" : "transparent",
        borderLeft: active ? "2px solid #00ffd5" : "2px solid transparent",
        borderRight: "none",
        borderTop: "none",
        borderBottom: "1px solid #1a1a1a",
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.1s ease",
      }}
    >
      {/* Flag */}
      <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>{country.flagEmoji}</span>

      {/* Name + continent */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 13,
          fontWeight: 700,
          color: "#f0f0e8",
          fontFamily: "Cabinet Grotesk, sans-serif",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          margin: 0,
        }}>
          {country.name}
        </p>
        {continent && (
          <p style={{
            fontSize: 11,
            color: "#666660",
            fontFamily: "Satoshi, sans-serif",
            margin: 0,
            marginTop: 1,
          }}>
            {continent}
          </p>
        )}
      </div>

      {/* Score bar */}
      <ScoreBar score={country.moveScore} />

      {/* Arrow on active */}
      {active && (
        <ArrowRight style={{ width: 13, height: 13, color: "#00ffd5", flexShrink: 0 }} />
      )}
    </button>
  );
}