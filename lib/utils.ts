import { CountryData, ScoreBreakdown } from "@/types";

export function normalise(value: number, min: number, max: number): number {
  return Math.min(10, Math.max(0, ((value - min) / (max - min)) * 10));
}

export function calculateMoveScore(data: CountryData): number {
  const salaryScore = normalise(data.salarySoftwareEngineer, 30000, 150000);
  const costScore = 10 - normalise(data.costRentCityCentre, 400, 4000);
  const qualityScore = data.scoreQualityOfLife;
  const safetyScore = data.scoreSafety;
  const visaScore = 10 - data.visaDifficulty * 2;
  const taxScore = 10 - normalise(data.incomeTaxRateMid, 0, 55);

  const raw =
    salaryScore * 0.3 +
    costScore * 0.25 +
    qualityScore * 0.2 +
    safetyScore * 0.1 +
    visaScore * 0.1 +
    taxScore * 0.05;

  return Math.round(raw * 10) / 10;
}

export function getScoreBreakdown(data: CountryData): ScoreBreakdown[] {
  return [
    {
      label: "Salary",
      value: normalise(data.salarySoftwareEngineer, 30000, 150000),
      maxValue: 10,
      weight: 0.3,
      color: "#00d4c8",
    },
    {
      label: "Affordability",
      value: 10 - normalise(data.costRentCityCentre, 400, 4000),
      maxValue: 10,
      weight: 0.25,
      color: "#4ade80",
    },
    {
      label: "Quality of Life",
      value: data.scoreQualityOfLife,
      maxValue: 10,
      weight: 0.2,
      color: "#a78bfa",
    },
    {
      label: "Safety",
      value: data.scoreSafety,
      maxValue: 10,
      weight: 0.1,
      color: "#60a5fa",
    },
    {
      label: "Visa Access",
      value: 10 - data.visaDifficulty * 2,
      maxValue: 10,
      weight: 0.1,
      color: "#facc15",
    },
    {
      label: "Tax Efficiency",
      value: 10 - normalise(data.incomeTaxRateMid, 0, 55),
      maxValue: 10,
      weight: 0.05,
      color: "#f472b6",
    },
  ];
}

export function getScoreColor(score: number): string {
  if (score >= 7) return "#4ade80";
  if (score >= 4.5) return "#facc15";
  return "#f87171";
}

export function getScoreClass(score: number): string {
  if (score >= 7) return "score-high";
  if (score >= 4.5) return "score-mid";
  return "score-low";
}

export function formatSalary(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCost(amount: number): string {
  return `€${amount.toLocaleString()}/mo`;
}

export function getVisaLabel(difficulty: number): string {
  if (difficulty <= 1) return "Very Easy";
  if (difficulty <= 2) return "Easy";
  if (difficulty <= 3) return "Moderate";
  if (difficulty <= 4) return "Difficult";
  return "Very Difficult";
}

export function getVisaColor(difficulty: number): string {
  if (difficulty <= 1) return "#4ade80";
  if (difficulty <= 2) return "#86efac";
  if (difficulty <= 3) return "#facc15";
  if (difficulty <= 4) return "#fb923c";
  return "#f87171";
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}