// components/Globe.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { GlobeCountry } from "@/types";
import { getScoreColor } from "@/lib/utils";

interface GlobeProps {
  countries: GlobeCountry[];
  onCountrySelect: (slug: string) => void;
  selectedSlug: string | null;
  highlightedSlugs?: string[];
}

interface PinPosition {
  slug: string;
  x: number;
  y: number;
  visible: boolean;
  color: string;
  isSelected: boolean;
  isHovered: boolean;
}

function getGlobeTexture(): string {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 18) {
    return "//unpkg.com/three-globe/example/img/earth-day.jpg";
  } else if (hour >= 18 && hour < 22) {
    return "//unpkg.com/three-globe/example/img/earth-dark.jpg";
  } else {
    return "//unpkg.com/three-globe/example/img/earth-night.jpg";
  }
}

export default function Globe({
  countries,
  onCountrySelect,
  selectedSlug,
  highlightedSlugs = [],
}: GlobeProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [pinPositions, setPinPositions] = useState<PinPosition[]>([]);
  const animFrameRef = useRef<number>(0);
  const onCountrySelectRef = useRef(onCountrySelect);
  onCountrySelectRef.current = onCountrySelect;

  const updatePins = useCallback(() => {
    if (!globeRef.current || !mountRef.current) return;

    const hasHighlights = highlightedSlugs.length > 0;
    const pov = globeRef.current.pointOfView();
    const povLat = (pov.lat * Math.PI) / 180;
    const povLng = (pov.lng * Math.PI) / 180;

    const camX = Math.cos(povLat) * Math.cos(povLng);
    const camY = Math.sin(povLat);
    const camZ = Math.cos(povLat) * Math.sin(povLng);

    const positions: PinPosition[] = countries.map((d) => {
      const coords = globeRef.current.getScreenCoords(d.lat, d.lng, 0.02);
      const isSelected = d.slug === selectedSlug;
      const isHovered = d.slug === hoveredSlug;
      const rank = highlightedSlugs.indexOf(d.slug);

      let color: string;
      if (isSelected || isHovered) color = "#00d4c8";
      else if (rank === 0) color = "#fbbf24";
      else if (rank === 1) color = "#00d4c8";
      else if (rank === 2) color = "#a78bfa";
      else if (hasHighlights) color = "#555566";
      else color = getScoreColor(d.moveScore);

      const latRad = (d.lat * Math.PI) / 180;
      const lngRad = (d.lng * Math.PI) / 180;
      const px = Math.cos(latRad) * Math.cos(lngRad);
      const py = Math.sin(latRad);
      const pz = Math.cos(latRad) * Math.sin(lngRad);
      const dot = px * camX + py * camY + pz * camZ;

      const visible = dot > 0.1 && coords &&
        coords.x > 10 &&
        coords.x < (mountRef.current?.clientWidth ?? 0) - 10 &&
        coords.y > 10 &&
        coords.y < (mountRef.current?.clientHeight ?? 0) - 10;

      return {
        slug: d.slug,
        x: coords?.x ?? -999,
        y: coords?.y ?? -999,
        visible: !!visible,
        color,
        isSelected,
        isHovered,
      };
    });

    setPinPositions(positions);
    animFrameRef.current = requestAnimationFrame(updatePins);
  }, [countries, selectedSlug, hoveredSlug, highlightedSlugs]);

  useEffect(() => {
    const mountEl = mountRef.current;
    if (!mountEl) return;

    const globeContainer = document.createElement("div");
    globeContainer.style.width = "100%";
    globeContainer.style.height = "100%";
    mountEl.appendChild(globeContainer);

    let cancelled = false;
    let resizeHandler: (() => void) | null = null;

    const init = async () => {
      if (cancelled) return;
      const GlobeGL = (await import("globe.gl")).default;
      if (cancelled) return;

      const globe = (GlobeGL as any)()(globeContainer)
      .globeImageUrl("//unpkg.com/three-globe/example/img/earth-night.jpg")
        .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
        .backgroundImageUrl("//unpkg.com/three-globe/example/img/night-sky.png")
        .showAtmosphere(true)
        .atmosphereColor("#00d4c8")
        .atmosphereAltitude(0.25)
        .width(mountEl.clientWidth)
        .height(mountEl.clientHeight)
        .pointsData([])
        .pointLat((d: any) => d.lat)
        .pointLng((d: any) => d.lng)
        .pointAltitude(() => 0.02)
        .pointRadius(() => 1.5)
        .pointColor(() => "rgba(0,0,0,0)")
        .pointResolution(8)
        .onPointClick((point: any) => {
          onCountrySelectRef.current(point.slug);
        })
        .onPointHover((point: any) => {
          setHoveredSlug(point?.slug || null);
        })
        .labelsData([])
        .labelLat((d: any) => d.lat)
        .labelLng((d: any) => d.lng)
        .labelText((d: any) => d.name)
        .labelSize(1.0)
        .labelDotRadius(0)
        .labelColor(() => "rgba(240, 240, 245, 0.7)")
        .labelResolution(2)
        .labelAltitude(0.05)
        .arcsData([])
        .arcColor(() => ["rgba(0, 212, 200, 0.3)", "rgba(0, 212, 200, 0.05)"])
        .arcStroke(0.3)
        .arcDashLength(0.4)
        .arcDashGap(0.2)
        .arcDashAnimateTime(4000);

      globe.controls().autoRotate = true;
      globe.controls().autoRotateSpeed = 0.2;
      globe.controls().enableZoom = true;
      globe.controls().minDistance = 150;
      globe.controls().maxDistance = 500;

      globe.pointOfView({ lat: 30, lng: 0, altitude: 2.5 });

      globeRef.current = globe;
      setIsLoaded(true);

      resizeHandler = () => {
        if (mountEl && globeRef.current) {
          globeRef.current.width(mountEl.clientWidth).height(mountEl.clientHeight);
        }
      };
      window.addEventListener("resize", resizeHandler);
    };

    init();

    return () => {
      cancelled = true;
      if (resizeHandler) window.removeEventListener("resize", resizeHandler);
      cancelAnimationFrame(animFrameRef.current);
      globeRef.current = null;
      if (globeContainer.parentNode) globeContainer.parentNode.removeChild(globeContainer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isLoaded || countries.length === 0) return;
    animFrameRef.current = requestAnimationFrame(updatePins);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isLoaded, updatePins]);

  useEffect(() => {
    if (!globeRef.current || !isLoaded || countries.length === 0) return;
    globeRef.current
      .pointsData(countries)
      .labelsData(countries);
  }, [countries, isLoaded]);

  useEffect(() => {
    if (!globeRef.current || !isLoaded) return;

    if (globeRef.current.controls()) {
      globeRef.current.controls().autoRotate = !selectedSlug;
    }

    if (selectedSlug) {
      const selected = countries.find((c) => c.slug === selectedSlug);
      if (selected) {
        globeRef.current.pointOfView(
          { lat: selected.lat, lng: selected.lng - 20, altitude: 1.8 },
          1000
        );
        const arcs = countries
          .filter((c) => c.slug !== selectedSlug)
          .map((c) => ({
            startLat: selected.lat,
            startLng: selected.lng,
            endLat: c.lat,
            endLng: c.lng,
          }));
        globeRef.current.arcsData(arcs);
      }
    } else {
      globeRef.current.arcsData([]);
    }
  }, [selectedSlug, countries, isLoaded]);

  return (
    <div className="globe-container" style={{ position: "relative" }}>
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />

      {isLoaded && pinPositions.map((pin) => {
        if (!pin.visible) return null;
        const hasHighlights = highlightedSlugs.length > 0;
        const isDimmed = hasHighlights && !highlightedSlugs.includes(pin.slug) && !pin.isSelected && !pin.isHovered;

        return (
          <div
            key={pin.slug}
            onClick={() => onCountrySelectRef.current(pin.slug)}
            onMouseEnter={() => setHoveredSlug(pin.slug)}
            onMouseLeave={() => setHoveredSlug(null)}
            style={{
              position: "absolute",
              left: pin.x,
              top: pin.y,
              transform: "translate(-50%, -100%)",
              cursor: "pointer",
              zIndex: pin.isSelected ? 30 : pin.isHovered ? 25 : 20,
              opacity: isDimmed ? 0.25 : 1,
              transition: "opacity 0.3s ease",
              pointerEvents: "auto",
              fontSize: pin.isSelected ? "28px" : pin.isHovered ? "24px" : "20px",
              filter: pin.isSelected
                ? "drop-shadow(0 0 8px " + pin.color + ")"
                : pin.isHovered
                ? "drop-shadow(0 0 4px " + pin.color + ")"
                : "drop-shadow(0 2px 3px rgba(0,0,0,0.5))",
              userSelect: "none",
            }}
          >
            📌
          </div>
        );
      })}

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
  );
}