"use client";

import { useEffect, useRef, useState } from "react";
import { GlobeCountry } from "@/types";
import { getScoreColor } from "@/lib/utils";

interface GlobeProps {
  countries: GlobeCountry[];
  onCountrySelect: (slug: string) => void;
  selectedSlug: string | null;
}

export default function Globe({
  countries,
  onCountrySelect,
  selectedSlug,
}: GlobeProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const onCountrySelectRef = useRef(onCountrySelect);
  onCountrySelectRef.current = onCountrySelect;

  useEffect(() => {
    const mountEl = mountRef.current;
    if (!mountEl) return;

    // Create a dedicated div for globe.gl so React never touches it
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

      const globe = GlobeGL()(globeContainer)
        .globeImageUrl(
          "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        )
        .bumpImageUrl(
          "//unpkg.com/three-globe/example/img/earth-topology.png"
        )
        .backgroundImageUrl(
          "//unpkg.com/three-globe/example/img/night-sky.png"
        )
        .showAtmosphere(true)
        .atmosphereColor("#00d4c8")
        .atmosphereAltitude(0.2)
        .width(mountEl.clientWidth)
        .height(mountEl.clientHeight)
        .pointsData(countries)
        .pointLat((d: any) => d.lat)
        .pointLng((d: any) => d.lng)
       .pointAltitude(() => 0.06)
        .pointRadius(() => 0.8)
        .pointColor((d: any) => getScoreColor(d.moveScore))
        .pointResolution(24)
        .onPointClick((point: any) => {
          onCountrySelectRef.current(point.slug);
        })
        .onPointHover((point: any) => {
          setHoveredSlug(point?.slug || null);
          globeContainer.style.cursor = point ? "pointer" : "default";
        })
       .labelsData(countries)
        .labelLat((d: any) => d.lat)
        .labelLng((d: any) => d.lng)
        .labelText((d: any) => d.name)
        .labelSize(1.2)
        .labelDotRadius(0.4)
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
      globe.controls().autoRotateSpeed = 0.4;
      globe.controls().enableZoom = true;
      globe.controls().minDistance = 150;
      globe.controls().maxDistance = 500;

      globe.pointOfView({ lat: 30, lng: 0, altitude: 2.5 });

      globeRef.current = globe;
      setIsLoaded(true);

      resizeHandler = () => {
        if (mountEl && globeRef.current) {
          globeRef.current
            .width(mountEl.clientWidth)
            .height(mountEl.clientHeight);
        }
      };
      window.addEventListener("resize", resizeHandler);
    };

    init();

    return () => {
      cancelled = true;
      if (resizeHandler) {
        window.removeEventListener("resize", resizeHandler);
      }
      globeRef.current = null;
      // Remove the globe container we created — not managed by React
      if (globeContainer.parentNode) {
        globeContainer.parentNode.removeChild(globeContainer);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!globeRef.current) return;

    globeRef.current
      .pointAltitude((d: any) => {
        if (d.slug === selectedSlug) return 0.12;
        if (d.slug === hoveredSlug) return 0.08;
        return 0.04;
      })
      .pointRadius((d: any) => {
        if (d.slug === selectedSlug) return 0.7;
        if (d.slug === hoveredSlug) return 0.6;
        return 0.4;
      })
      .pointColor((d: any) => {
        if (d.slug === selectedSlug) return "#00d4c8";
        if (d.slug === hoveredSlug) return "#00d4c8";
        return getScoreColor(d.moveScore);
      })
      .labelColor((d: any) => {
        if (d.slug === selectedSlug || d.slug === hoveredSlug)
          return "rgba(0, 212, 200, 1)";
        return "rgba(240, 240, 245, 0.7)";
      });

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
  }, [selectedSlug, hoveredSlug, countries]);

  return (
    <div className="globe-container">
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
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