"use client";

import Image from "next/image";
import { useState } from "react";

interface BlogImageProps {
  src: string;
  alt: string;
  style?: React.CSSProperties;
  className?: string;
}

export default function BlogImage({ src, alt, style, className }: BlogImageProps) {
  const [failed, setFailed] = useState(false);
  const {
    objectFit = "cover",
    objectPosition,
    transition,
    ...wrapperStyle
  } = style ?? {};

  if (failed || !src) {
    return (
      <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #1a1a1a, #0f0f0f)" }} />
    );
  }

  return (
    <span
      style={{
        ...wrapperStyle,
        width: wrapperStyle.width ?? "100%",
        height: wrapperStyle.height ?? "100%",
        display: wrapperStyle.display ?? "block",
        position: "relative",
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        style={{ objectFit, objectPosition, transition }}
        className={className}
        onError={() => setFailed(true)}
      />
    </span>
  );
}
