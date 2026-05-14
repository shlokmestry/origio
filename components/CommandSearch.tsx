"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  Search,
  X,
  DollarSign,
  Shield,
  Receipt,
  TrendingUp,
  ArrowRight,
  Clock,
} from "lucide-react";

import { GlobeCountry } from "@/types";
import { getScoreColor } from "@/lib/utils";
import SearchIllustration from "./SearchIllustration";

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

const RECENT_KEY = "origio_recent_searches";
const MAX_RECENT = 5;

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
    sort: (a, b) =>
      b.salarySoftwareEngineer - a.salarySoftwareEngineer,
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
    sort: (a, b) =>
      b.scoreQualityOfLife - a.scoreQualityOfLife,
  },
];

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

const S = {
  card: "#0c0c0f",
  border: "rgba(255,255,255,0.08)",
  borderMd: "rgba(255,255,255,0.14)",
  dim: "rgba(255,255,255,0.38)",
  dimmer: "rgba(255,255,255,0.18)",
  sans: "'Inter', sans-serif",
};

function getRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function addRecent(slug: string) {
  try {
    const prev = getRecent().filter((s) => s !== slug);

    localStorage.setItem(
      RECENT_KEY,
      JSON.stringify([slug, ...prev].slice(0, MAX_RECENT))
    );
  } catch {}
}

function clearRecent() {
  try {
    localStorage.removeItem(RECENT_KEY);
  } catch {}
}

function matchesQuery(country: GlobeCountry, q: string): boolean {
  const query = q.toLowerCase().trim();

  if (!query) return false;

  return (
    country.name.toLowerCase().includes(query) ||
    country.slug.toLowerCase().includes(query)
  );
}

function ScoreBar({ score }: { score: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      <div
        style={{
          width: 32,
          height: 2,
          background: "rgba(255,255,255,0.07)",
          borderRadius: 2,
        }}
      >
        <div
          style={{
            width: `${(score / 10) * 100}%`,
            height: "100%",
            background: "rgba(255,255,255,0.5)",
            borderRadius: 2,
          }}
        />
      </div>

      <span
        style={{
          fontSize: 11,
          fontFamily: "monospace",
          fontWeight: 700,
          color: "rgba(255,255,255,0.5)",
        }}
      >
        {score.toFixed(1)}
      </span>
    </div>
  );
}

export default function CommandSearch({
  countries,
  onCountrySelect,
  open,
  onClose,
}: CommandSearchProps) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] =
    useState<string | null>(null);

  const [cursor, setCursor] = useState(0);

  const [placeholder, setPlaceholder] =
    useState(PLACEHOLDERS[0]);

  const [recentSlugs, setRecentSlugs] =
    useState<string[]>([]);

  const [isTyping, setIsTyping] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const listRef = useRef<HTMLDivElement>(null);

  const typingTimer =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;

    let i = 0;

    const interval = setInterval(() => {
      i = (i + 1) % PLACEHOLDERS.length;
      setPlaceholder(PLACEHOLDERS[i]);
    }, 2500);

    return () => clearInterval(interval);
  }, [open]);

  useEffect(() => {
    if (open) {
      setRecentSlugs(getRecent());

      setCursor(0);
      setQuery("");
      setActiveFilter(null);

      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [open]);

  const handleQueryChange = (val: string) => {
    setQuery(val);

    setCursor(0);

    setActiveFilter(null);

    setIsTyping(true);

    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
    }

    typingTimer.current = setTimeout(() => {
      setIsTyping(false);
    }, 800);
  };

  const results = useMemo(() => {
    if (activeFilter && !query.trim()) {
      const filter = QUICK_FILTERS.find(
        (f) => f.id === activeFilter
      );

      if (filter) {
        return [...countries]
          .sort(filter.sort)
          .slice(0, 8);
      }
    }

    if (!query.trim() && !activeFilter) return [];

    return countries
      .filter((c) => matchesQuery(c, query))
      .sort((a, b) => b.moveScore - a.moveScore)
      .slice(0, 8);
  }, [query, countries, activeFilter]);

  const recentCountries = useMemo(
    () =>
      recentSlugs
        .map((slug) =>
          countries.find((c) => c.slug === slug)
        )
        .filter(Boolean) as GlobeCountry[],
    [recentSlugs, countries]
  );

  const showResults = results.length > 0;

  const showRecent =
    !query &&
    !activeFilter &&
    recentCountries.length > 0;

  const allItems = useMemo(
    () =>
      showResults
        ? results
        : showRecent
        ? recentCountries
        : [],
    [showResults, results, showRecent, recentCountries]
  );

  const select = useCallback(
    (slug: string) => {
      addRecent(slug);

      onCountrySelect(slug);

      onClose();

      setQuery("");
    },
    [onCountrySelect, onClose]
  );

  useEffect(() => {
    if (!open) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();

        setCursor((c) =>
          Math.min(c + 1, allItems.length - 1)
        );
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();

        setCursor((c) => Math.max(c - 1, 0));
      }

      if (e.key === "Enter" && allItems[cursor]) {
        select(allItems[cursor].slug);
      }
    };

    window.addEventListener("keydown", handler);

    return () =>
      window.removeEventListener("keydown", handler);
  }, [
    open,
    allItems,
    cursor,
    select,
    onClose,
  ]);

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${cursor}"]`)
      ?.scrollIntoView({
        block: "nearest",
      });
  }, [cursor]);

  if (!open) return null;

  const illustrationVisible =
    query.length > 0 || !!activeFilter;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 100,
          background: "rgba(0,0,0,0.82)",
          backdropFilter: "blur(10px)",
        }}
      />

      {/* Wrapper */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 101,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        {/* Illustration */}
{/* Illustration */}
<div
  className="search-illustration-wrap"
  style={{
    position: "fixed",
    left: "48px",
bottom: "48px",
width: "280px",   // ⬆ explicitly set to 280px
height: "280px",  

    opacity: illustrationVisible ? 1 : 0,

    transform: illustrationVisible
      ? "translateY(0px) scale(1)"
      : "translateY(14px) scale(0.92)",

    transition:
      "all 0.35s cubic-bezier(0.22,1,0.36,1)",

    pointerEvents: "none",

    zIndex: 0,
  }}
>
  <SearchIllustration
    isTyping={isTyping}
    isVisible={illustrationVisible}
  />
</div>

        {/* Modal */}
        <div
          role="dialog"
          aria-modal="true"
          style={{
            width: "calc(100vw - 32px)",
            maxWidth: 720,
            pointerEvents: "auto",
            animation:
              "slideUp 0.3s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <div
            style={{
              background: S.card,
              border: `1px solid ${S.borderMd}`,
              borderRadius: 22,
              overflow: "hidden",
              boxShadow:
                "0 32px 80px rgba(0,0,0,0.7)",
            }}
          >
            {/* Input */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "18px 22px",
                borderBottom: `1px solid ${S.border}`,
              }}
            >
              <Search
                size={16}
                color={S.dimmer}
              />

              <input
                ref={inputRef}
                value={query}
                onChange={(e) =>
                  handleQueryChange(e.target.value)
                }
                placeholder={placeholder}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 500,
                  fontFamily: S.sans,
                }}
              />

              <kbd
                style={{
                  padding: "3px 8px",
                  fontSize: 10,
                  borderRadius: 6,
                  color: S.dimmer,
                  border: `1px solid ${S.border}`,
                }}
              >
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div
              ref={listRef}
              style={{
                maxHeight: "52vh",
                overflowY: "auto",
              }}
            >
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

              {!query && (
                <div
                  style={{
                    padding: "36px",
                    textAlign: "center",
                    color: S.dim,
                  }}
                >
                  25 countries. Start typing.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }

          to {
            opacity: 1;
            transform: translateY(0px);
          }
        }

        @media (max-width: 1200px) {
          .search-illustration-wrap {
            display: none;
          }
        }
      `}</style>
    </>
  );
}

function ResultRow({
  country,
  index,
  active,
  onSelect,
  onHover,
}: any) {
  const continent =
    CONTINENT_MAP[country.slug] ?? "";

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
        padding: "11px 20px",
        background: active
          ? "rgba(255,255,255,0.05)"
          : "transparent",
        border: "none",
        borderBottom:
          "1px solid rgba(255,255,255,0.04)",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <span style={{ fontSize: 20 }}>
        {country.flagEmoji}
      </span>

      <div style={{ flex: 1 }}>
        <p
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#fff",
            margin: 0,
          }}
        >
          {country.name}
        </p>

        <p
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.3)",
            margin: 0,
          }}
        >
          {continent}
        </p>
      </div>

      <ScoreBar score={country.moveScore} />

      {active && (
        <ArrowRight
          size={13}
          color="rgba(255,255,255,0.6)"
        />
      )}
    </button>
  );
}