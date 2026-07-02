"use client";

import { useState } from "react";

interface BlogImageProps {
  src: string;
  alt: string;
  style?: React.CSSProperties;
  className?: string;
}

export default function BlogImage({ src, alt, style, className }: BlogImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #1a1a1a, #0f0f0f)" }} />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      style={style}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
