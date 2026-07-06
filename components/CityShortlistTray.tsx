"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const KEY = "origio_city_shortlist";
type Item = { slug: string; name: string };

function read(): Item[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter(x => x?.slug && x?.name) : [];
  } catch {
    return [];
  }
}

export default function CityShortlistTray() {
  const [items, setItems] = useState<Item[]>([]);

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

  if (items.length === 0) return null;

  const href = `/cities/compare?cities=${items.map(i => i.slug).join(",")}`;
  return (
    <div style={{
      position: "fixed", left: "50%", bottom: 18, transform: "translateX(-50%)", zIndex: 80,
      display: "flex", alignItems: "center", gap: 14, maxWidth: "calc(100vw - 28px)",
      background: "#0a0a0a", border: "1px solid #00ffd5", boxShadow: "3px 3px 0 #00ffd5",
      padding: "10px 14px", color: "#f0f0e8", fontFamily: "Satoshi, sans-serif",
    }}>
      <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
        Shortlist · {items.length}
      </span>
      <span style={{ fontSize: 12, color: "rgba(240,240,232,0.56)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {items.map(i => i.name).join(" · ")}
      </span>
      <Link href={href} style={{ color: "#00ffd5", textDecoration: "none", fontSize: 11, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
        Compare →
      </Link>
    </div>
  );
}
