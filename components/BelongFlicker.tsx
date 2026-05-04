"use client";

import { useState, useEffect } from "react";

const SEQUENCE = [
  "Sweden", "Belgium", "Norway", "Spain", "Singapore",
  "Malaysia", "Ireland", "Brazil", "UAE", "Portugal",
  "New Zealand", "Canada", "Denmark",
  "belong",
];
const STEP_MS = 180;

export default function BelongFlicker() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= SEQUENCE.length - 1) return;
    const t = setTimeout(() => setIndex((i) => i + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [index]);

  const word = SEQUENCE[index];
  const isFinal = index === SEQUENCE.length - 1;

  return (
    <span
      key={word}
      className={isFinal ? "belong-settle" : "belong-flicker"}
      style={{
        display: "inline-block",
        color: "hsl(168 100% 50%)",
      }}
    >
      {word}
    </span>
  );
}