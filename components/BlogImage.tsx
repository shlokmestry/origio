"use client";

import { useEffect, useMemo, useState } from "react";

interface BlogImageProps {
  src: string;
  alt: string;
  style?: React.CSSProperties;
  className?: string;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

function toAbsoluteUrl(src: string): string {
  const value = src.trim();
  if (!value) return "";

  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("//")) return `https:${value}`;

  if (value.startsWith("/storage/v1/object/") && SUPABASE_URL) {
    return `${SUPABASE_URL}${value}`;
  }

  if (value.startsWith("storage/v1/object/") && SUPABASE_URL) {
    return `${SUPABASE_URL}/${value}`;
  }

  return value;
}

function withRetryBust(src: string): string {
  if (!src) return src;
  const joiner = src.includes("?") ? "&" : "?";
  return `${src}${joiner}retry=1`;
}

function buildFallbackSvg(title: string): string {
  const safeTitle = title.replace(/\s+/g, " ").trim().slice(0, 72) || "Origio Blog";
  const wrappedTitle = safeTitle.match(/.{1,22}(\s|$)/g)?.slice(0, 3).join("\n").trim() ?? safeTitle;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" width="1200" height="900">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#151515" />
          <stop offset="100%" stop-color="#0a0a0a" />
        </linearGradient>
      </defs>
      <rect width="1200" height="900" fill="url(#bg)" />
      <rect x="58" y="58" width="1084" height="784" fill="none" stroke="#2a2a2a" stroke-width="2" />
      <line x1="58" y1="180" x2="1142" y2="180" stroke="#1f1f1f" stroke-width="2" />
      <text x="86" y="128" fill="#00ffd5" font-family="Arial, Helvetica, sans-serif" font-size="28" letter-spacing="6">ORIGIO BLOG</text>
      <text x="86" y="280" fill="#f0f0e8" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="700" letter-spacing="-1" xml:space="preserve">${wrappedTitle}</text>
      <text x="86" y="760" fill="#6b6b6b" font-family="Arial, Helvetica, sans-serif" font-size="24" letter-spacing="4">COVER IMAGE UNAVAILABLE</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export default function BlogImage({ src, alt, style, className }: BlogImageProps) {
  const normalizedSrc = useMemo(() => toAbsoluteUrl(src), [src]);
  const fallbackSrc = useMemo(() => buildFallbackSvg(alt), [alt]);
  const [currentSrc, setCurrentSrc] = useState(normalizedSrc);
  const [didRetry, setDidRetry] = useState(false);

  useEffect(() => {
    setCurrentSrc(normalizedSrc);
    setDidRetry(false);
  }, [normalizedSrc]);

  const handleError = () => {
    if (normalizedSrc && !didRetry) {
      setDidRetry(true);
      setCurrentSrc(withRetryBust(normalizedSrc));
      return;
    }

    setCurrentSrc(fallbackSrc);
  };

  return (
    <img
      src={currentSrc || fallbackSrc}
      alt={alt}
      style={style}
      className={className}
      onError={handleError}
      loading="lazy"
    />
  );
}
