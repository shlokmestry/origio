// components/Globe.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { GlobeCountry } from "@/types";
import { getScoreColor } from "@/lib/utils";

// ─── MapLibre loaded dynamically to avoid SSR issues ─────────────────────────
type MapLibreMap = any;

interface GlobeProps {
  countries: GlobeCountry[];
  onCountrySelect: (slug: string) => void;
  selectedSlug: string | null;
  highlightedSlugs?: string[];
  savedSlugs?: string[];
}

function getStartLng(): number {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
    if (tz.startsWith("America")) return -95;
    if (tz.startsWith("Australia") || tz.startsWith("Pacific")) return 135;
    if (tz.startsWith("Asia/Kolkata") || tz.startsWith("Asia/Dhaka")) return 80;
    if (tz.startsWith("Asia")) return 105;
    if (tz.startsWith("Africa")) return 20;
  } catch {}
  return 10;
}

function getPinColor(
  country: GlobeCountry,
  selectedSlug: string | null,
  hoveredSlug: string | null,
  highlightedSlugs: string[],
  savedSlugs: string[]
): string {
  const isSelected = country.slug === selectedSlug;
  const isHovered = country.slug === hoveredSlug;
  const isSaved = savedSlugs.includes(country.slug);
  const rank = highlightedSlugs.indexOf(country.slug);
  const hasHighlights = highlightedSlugs.length > 0;

  if (isSelected || isHovered) return "#00ffd5";
  if (rank === 0) return "#fbbf24";
  if (rank === 1) return "#00ffd5";
  if (rank === 2) return "#a78bfa";
  if (hasHighlights) return "#333344";
  if (isSaved) return "#f472b6";
  return getScoreColor(country.moveScore);
}

function createMarkerEl(
  country: GlobeCountry,
  color: string,
  isSelected: boolean,
  isHovered: boolean,
  isDimmed: boolean,
  onClick: () => void,
  onEnter: () => void,
  onLeave: () => void
): HTMLElement {
  const pinSize = isSelected ? 14 : isHovered ? 12 : 9;

  const wrapper = document.createElement("div");
  wrapper.style.cssText = `
    position: relative;
    cursor: pointer;
    opacity: ${isDimmed ? "0.2" : "1"};
    transition: opacity 0.3s ease;
    user-select: none;
  `;

  // Square pin — brutalist, no border-radius
  const pin = document.createElement("div");
  pin.style.cssText = `
    width: ${pinSize}px;
    height: ${pinSize}px;
    background: ${color};
    border: 2px solid #0a0a0a;
    box-shadow: ${isSelected ? `3px 3px 0 ${color}` : "2px 2px 0 #000000"};
    transition: width 0.15s ease, height 0.15s ease;
    border-radius: 0;
  `;
  wrapper.appendChild(pin);

  // Pulse ring on selected
  if (isSelected) {
    const ring = document.createElement("div");
    ring.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: ${pinSize + 12}px;
      height: ${pinSize + 12}px;
      border: 1.5px solid ${color};
      border-radius: 0;
      animation: origio-pulse 1.8s ease-out infinite;
      pointer-events: none;
    `;
    wrapper.appendChild(ring);
  }

  // Brutalist tooltip on hover (not selected)
  if (isHovered && !isSelected) {
    const tooltip = document.createElement("div");
    tooltip.style.cssText = `
      position: absolute;
      bottom: calc(100% + 10px);
      left: 50%;
      transform: translateX(-50%);
      background: #111111;
      border: 1px solid #2a2a2a;
      box-shadow: 3px 3px 0 #000000;
      padding: 6px 10px;
      white-space: nowrap;
      pointer-events: none;
      z-index: 50;
      border-radius: 0;
    `;
    tooltip.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:14px">${country.flagEmoji}</span>
        <div>
          <div style="color:#f0f0e8;font-weight:700;font-family:'Cabinet Grotesk',sans-serif;font-size:12px;text-transform:uppercase;letter-spacing:0.08em">
            ${country.name}
          </div>
          <div style="color:#00ffd5;font-size:11px;font-family:monospace;letter-spacing:0.05em">
            ${country.moveScore}/10
          </div>
        </div>
      </div>
    `;
    wrapper.appendChild(tooltip);
  }

  wrapper.addEventListener("click", (e) => { e.stopPropagation(); onClick(); });
  wrapper.addEventListener("mouseenter", onEnter);
  wrapper.addEventListener("mouseleave", onLeave);

  return wrapper;
}

export default function Globe({
  countries,
  onCountrySelect,
  selectedSlug,
  highlightedSlugs = [],
  savedSlugs = [],
}: GlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const rotateRef = useRef<number>(0);
  const isSpinningRef = useRef(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  const onCountrySelectRef = useRef(onCountrySelect);
  onCountrySelectRef.current = onCountrySelect;
  const selectedSlugRef = useRef(selectedSlug);
  selectedSlugRef.current = selectedSlug;

  // ─── Init map ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    const KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY!;
    let cancelled = false;

    const init = async () => {
      const maplibregl = (await import("maplibre-gl")).default;
      await import("maplibre-gl/dist/maplibre-gl.css");
      if (cancelled || !containerRef.current) return;

      const map = new maplibregl.Map({
        container: containerRef.current,
        style: `https://api.maptiler.com/maps/satellite/style.json?key=${KEY}`,
        center: [getStartLng(), 25],
        zoom: window.innerWidth < 768 ? 1.2 : 1.8,
        pitch: 0,
        bearing: 0,
        attributionControl: false,
        // Globe projection — requires MapLibre v4+
        // Falls back to Mercator gracefully on v3
        ...(({ projection: { type: "globe" } } as any)),
      });

      // Compact attribution — legally required, visually minimal
      map.addControl(
        new maplibregl.AttributionControl({ compact: true }),
        "bottom-left"
      );

      // Block scroll bubbling on desktop
      const blockScroll = (e: WheelEvent) => {
        if (window.innerWidth >= 768) e.stopPropagation();
      };
      containerRef.current?.addEventListener("wheel", blockScroll, { passive: true });

      map.on("load", () => {
        if (cancelled) return;

        // Deep space atmosphere
        try {
          map.setFog({
            color: "#000000",
            "high-color": "#000008",
            "horizon-blend": 0.02,
            "space-color": "#000000",
            "star-intensity": 0.8,
          });
        } catch {
          // setFog not available on all MapLibre versions — silent fail
        }

        mapRef.current = map;
        setIsLoaded(true);
      });

      // Auto-rotate
      let lastTime = 0;
      const spin = (time: number) => {
        if (!isSpinningRef.current || !mapRef.current) return;
        const delta = time - lastTime;
        lastTime = time;
        // Skip large gaps (tab switch, etc.)
        if (delta > 0 && delta < 200) {
          const center = map.getCenter();
          map.setCenter([(center.lng + delta * 0.008) % 360, center.lat]);
        }
        rotateRef.current = requestAnimationFrame(spin);
      };
      rotateRef.current = requestAnimationFrame(spin);

      const stopSpin = () => {
        isSpinningRef.current = false;
        cancelAnimationFrame(rotateRef.current);
      };
      map.on("mousedown", stopSpin);
      map.on("touchstart", stopSpin);

      // Resize
      const onResize = () => map.resize();
      window.addEventListener("resize", onResize);

      return () => {
        cancelled = true;
        isSpinningRef.current = false;
        cancelAnimationFrame(rotateRef.current);
        window.removeEventListener("resize", onResize);
        markersRef.current.forEach((m) => m.remove());
        markersRef.current.clear();
        map.remove();
        mapRef.current = null;
      };
    };

    const cleanup = init();
    return () => {
      cancelled = true;
      cleanup.then((fn) => fn?.());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Sync markers ──────────────────────────────────────────────────────────
  const syncMarkers = useCallback(async () => {
    const map = mapRef.current;
    if (!map) return;

    const maplibregl = (await import("maplibre-gl")).default;
    const hasHighlights = highlightedSlugs.length > 0;

    // Remove all existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();

    countries.forEach((country) => {
      const isSelected = country.slug === selectedSlug;
      const isHovered = country.slug === hoveredSlug;
      const rank = highlightedSlugs.indexOf(country.slug);
      const isDimmed = hasHighlights && rank === -1 && !isSelected && !isHovered;

      const color = getPinColor(country, selectedSlug, hoveredSlug, highlightedSlugs, savedSlugs);

      const el = createMarkerEl(
        country,
        color,
        isSelected,
        isHovered,
        isDimmed,
        () => onCountrySelectRef.current(country.slug),
        () => setHoveredSlug(country.slug),
        () => setHoveredSlug(null)
      );

      const marker = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat([country.lng, country.lat])
        .addTo(map);

      markersRef.current.set(country.slug, marker);
    });
  }, [countries, selectedSlug, hoveredSlug, highlightedSlugs, savedSlugs]);

  useEffect(() => {
    if (isLoaded) syncMarkers();
  }, [isLoaded, syncMarkers]);

  // ─── Fly to selected ───────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isLoaded) return;

    // Stop rotation when country selected
    if (selectedSlug) {
      isSpinningRef.current = false;
      cancelAnimationFrame(rotateRef.current);

      const c = countries.find((c) => c.slug === selectedSlug);
      if (c) {
        map.flyTo({
          center: [c.lng - 15, c.lat],
          zoom: 3.5,
          duration: 1200,
          essential: true,
        });
      }
    } else {
      // Resume rotation when deselected
      isSpinningRef.current = true;
      let lastTime = 0;
      const spin = (time: number) => {
        if (!isSpinningRef.current || !mapRef.current) return;
        const delta = time - lastTime;
        lastTime = time;
        if (delta > 0 && delta < 200) {
          const center = map.getCenter();
          map.setCenter([(center.lng + delta * 0.008) % 360, center.lat]);
        }
        rotateRef.current = requestAnimationFrame(spin);
      };
      rotateRef.current = requestAnimationFrame(spin);
    }
  }, [selectedSlug, countries, isLoaded]);

  return (
    <>
      {/* Pulse keyframe — injected once */}
      <style>{`
        @keyframes origio-pulse {
          0%   { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }
        }
        /* Minimal MapLibre attribution */
        .maplibregl-ctrl-attrib {
          opacity: 0.25 !important;
          font-size: 9px !important;
          background: transparent !important;
        }
        .maplibregl-ctrl-attrib a {
          color: #555 !important;
        }
        /* Hide default MapLibre logo */
        .maplibregl-ctrl-logo {
          display: none !important;
        }
      `}</style>

      <div
        style={{ position: "relative", width: "100%", height: "100%", background: "#000000" }}
      >
        <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
              <p className="text-sm text-text-muted font-body animate-pulse">
                Loading globe...
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}