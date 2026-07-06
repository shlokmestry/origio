"use client";

import { useEffect, useState } from "react";

const KEY = "origio_city_shortlist";
const FREE_MAX = 3;
const PRO_MAX = 99;

type Item = { slug: string; name: string };

function read(): Item[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter(x => x?.slug && x?.name) : [];
  } catch {
    return [];
  }
}

function write(items: Item[]) {
  window.localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("origio-shortlist-change"));
}

export default function CityShortlistButton({ slug, name, isPro = false }: { slug: string; name: string; isPro?: boolean }) {
  const [items, setItems] = useState<Item[]>([]);
  const max = isPro ? PRO_MAX : FREE_MAX;
  const saved = items.some(i => i.slug === slug);
  const full = !saved && items.length >= max;

  useEffect(() => {
    const sync = () => setItems(read());
    sync();
    window.addEventListener("origio-shortlist-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("origio-shortlist-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() => {
        const next = saved ? items.filter(i => i.slug !== slug) : [...items, { slug, name }].slice(0, max);
        setItems(next);
        write(next);
      }}
      disabled={full}
      title={full ? "Free shortlist saves 3 cities. Pro saves unlimited." : undefined}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "10px 20px", background: saved ? "#00ffd5" : "transparent",
        color: saved ? "#0a0a0a" : "#f0f0e8", border: "1px solid #2a2a2a",
        cursor: full ? "not-allowed" : "pointer", opacity: full ? 0.45 : 1,
        fontFamily: "Satoshi, sans-serif", fontSize: 11, fontWeight: 800,
        letterSpacing: "0.1em", textTransform: "uppercase",
      }}
    >
      {saved ? "Saved" : full ? "Shortlist full" : "Save city"}
    </button>
  );
}
