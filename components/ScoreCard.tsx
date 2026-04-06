"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ScoreCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  sublabel?: string;
  scoreValue?: number;
  accentBorder?: boolean;
}

export default function ScoreCard({
  icon: Icon,
  label,
  value,
  sublabel,
  scoreValue,
  accentBorder = false,
}: ScoreCardProps) {
  const borderClass = accentBorder
    ? "accent-border-glow"
    : scoreValue !== undefined
    ? scoreValue >= 7
      ? "border-score-high/20"
      : scoreValue >= 4.5
      ? "border-score-mid/20"
      : "border-score-low/20"
    : "border-border";

  return (
    <div
      className={cn(
        "stat-card flex flex-col items-center gap-3 p-5 rounded-2xl bg-bg-elevated/60 border cursor-default",
        borderClass
      )}
    >
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          accentBorder
            ? "bg-accent/10"
            : scoreValue !== undefined
            ? scoreValue >= 7
              ? "bg-score-high/10"
              : scoreValue >= 4.5
              ? "bg-score-mid/10"
              : "bg-score-low/10"
            : "bg-accent/10"
        )}
      >
        <Icon
          className={cn(
            "w-5 h-5",
            accentBorder
              ? "text-accent"
              : scoreValue !== undefined
              ? scoreValue >= 7
                ? "text-score-high"
                : scoreValue >= 4.5
                ? "text-score-mid"
                : "text-score-low"
              : "text-accent"
          )}
        />
      </div>
      <div className="text-center">
        <p className="text-xs text-text-muted mb-1 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-lg font-heading font-bold text-text-primary">
          {value}
        </p>
        {sublabel && (
          <p className="text-xs text-text-muted mt-0.5">{sublabel}</p>
        )}
      </div>
    </div>
  );
}