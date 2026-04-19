"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  Search, X, Clock, TrendingUp, DollarSign, Shield, Receipt, ArrowRight
} from "lucide-react";
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
  description: string;
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
    label: "Best for salary",
    icon: DollarSign,
    description: "Highest software engineer pay",
    sort: (a, b) => b.salarySoftwareEngineer - a.salarySoftwareEngineer,
  },
  {
    id: "visa",
    label: "Easiest visa",
    icon: Shield,
    description: "Lowest visa difficulty",
    sort: (a, b) => a.visaDifficulty - b.visaDifficulty,
  },
  {
    id: "tax",
    label: "Lowest tax",
    icon: Receipt,
    description: "Most tax-efficient countries",
    sort: (a, b) => a.visaDifficulty - b.visaDifficulty, // proxy — moveScore inversely weights tax
  },
  {
    id: "quality",
    label: "Best quality of life",
    icon: TrendingUp,
    description: "Highest quality of life score",
    sort: (a, b) => b.scoreQualityOfLife - a.scoreQualityOfLife,
  },
];

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

function ScoreDot({ score }: { score: number }) {
  return (
    <span className="font-heading text-xs font-bold" style={{ color: getScoreColor(score) }}>
      {score.toFixed(1)}
    </span>
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

  // Load recent on open
  useEffect(() => {
    if (open) {
      setRecentSlugs(getRecent());
      setCursor(0);
      setQuery("");
      setActiveFilter(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Filtered + sorted results
  const results = useMemo(() => {
    let base = [...countries];

    if (activeFilter) {
      const filter = QUICK_FILTERS.find(f => f.id === activeFilter);
      if (filter) base = base.sort(filter.sort).slice(0, 8);
    }

    if (!query.trim() && !activeFilter) return [];

    if (query.trim()) {
      const q = query.toLowerCase();
      base = countries.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.slug.includes(q)
      );
    }

    return base.slice(0, 8);
  }, [query, countries, activeFilter]);

  // Recent countries resolved
  const recentCountries = useMemo(() =>
    recentSlugs
      .map(slug => countries.find(c => c.slug === slug))
      .filter(Boolean) as GlobeCountry[],
    [recentSlugs, countries]
  );

  const showResults = results.length > 0;
  const showRecent = !query && !activeFilter && recentCountries.length > 0;
  const showFilters = !query || activeFilter;
  const allItems = showResults ? results : showRecent ? recentCountries : [];

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
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setCursor(c => Math.min(c + 1, allItems.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setCursor(c => Math.max(c - 1, 0));
      }
      if (e.key === "Enter" && allItems[cursor]) {
        select(allItems[cursor].slug);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, allItems, cursor, select, onClose]);

  // Scroll cursor into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${cursor}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl glass-panel-strong rounded-2xl overflow-hidden shadow-2xl border border-white/10"
        style={{ boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,212,200,0.1)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
          <Search className="w-4 h-4 text-text-muted flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setCursor(0); setActiveFilter(null); }}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-text-primary placeholder:text-text-muted text-sm focus:outline-none"
          />
          {query && (
            <button onClick={() => { setQuery(""); setCursor(0); }} className="text-text-muted hover:text-text-primary transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-bg-elevated border border-border text-text-muted">
            ESC
          </kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto" ref={listRef}>

          {/* Quick filters */}
          {showFilters && (
            <div className="px-3 pt-3 pb-2">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.15em] px-1 mb-2">Quick filters</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_FILTERS.map(f => {
                  const Icon = f.icon;
                  const active = activeFilter === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => { setActiveFilter(active ? null : f.id); setCursor(0); setQuery(""); }}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                        active
                          ? "bg-accent/15 border-accent/40 text-accent"
                          : "bg-bg-elevated border-border text-text-muted hover:border-accent/30 hover:text-text-primary"
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent searches */}
          {showRecent && (
            <div className="px-3 pt-3 pb-1">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.15em] px-1 mb-1">Recent</p>
              {recentCountries.map((c, i) => (
                <button
                  key={c.slug}
                  data-index={i}
                  onClick={() => select(c.slug)}
                  onMouseEnter={() => setCursor(i)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                    cursor === i ? "bg-accent/10" : "hover:bg-white/[0.03]"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                  <span className="text-lg leading-none">{c.flagEmoji}</span>
                  <span className="text-sm text-text-primary flex-1 text-left">{c.name}</span>
                  <ScoreDot score={c.moveScore} />
                </button>
              ))}
            </div>
          )}

          {/* Filter active description */}
          {activeFilter && !query && (
            <div className="px-4 pt-1 pb-2">
              <p className="text-[11px] text-text-muted">
                {QUICK_FILTERS.find(f => f.id === activeFilter)?.description}
              </p>
            </div>
          )}

          {/* Search / filter results */}
          {showResults && (
            <div className="px-3 pt-2 pb-3">
              {!activeFilter && (
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.15em] px-1 mb-1">Countries</p>
              )}
              {results.map((c, i) => {
                const isActive = cursor === i;
                return (
                  <button
                    key={c.slug}
                    data-index={i}
                    onClick={() => select(c.slug)}
                    onMouseEnter={() => setCursor(i)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                      isActive ? "bg-accent/10" : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <span className="text-xl leading-none">{c.flagEmoji}</span>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm text-text-primary font-medium">{c.name}</p>
                      <p className="text-[11px] text-text-muted">Move score {c.moveScore.toFixed(1)} · Visa {c.visaDifficulty}/5</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <ScoreDot score={c.moveScore} />
                      {isActive && <ArrowRight className="w-3.5 h-3.5 text-accent" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* No results */}
          {query && results.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-text-muted">No countries matching &ldquo;{query}&rdquo;</p>
            </div>
          )}

          {/* Empty state — no query, no recent, no filter */}
          {!query && !activeFilter && recentCountries.length === 0 && (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-text-muted">Search any of 25 countries</p>
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2.5 border-t border-border flex items-center gap-4 text-[10px] text-text-muted">
          <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-bg-elevated border border-border">↑↓</kbd> navigate</span>
          <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-bg-elevated border border-border">↵</kbd> select</span>
          <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-bg-elevated border border-border">esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}