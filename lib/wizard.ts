// lib/wizard.ts
import { CountryWithData, JOB_ROLES } from "@/types";
import { normalise } from "@/lib/utils";

export interface WizardAnswers {
  passport: string;
  moveReason: string;
  jobRole: string;
  priorities: string[];
  cityVibe: string;
  rentBudget: string;
  languages: string[];
  dealBreakers: string[];
}

export interface CountryMatch {
  country: CountryWithData;
  matchScore: number;
  matchPercent: number;
  reasons: string[];
}

const EU_PASSPORTS = [
  "ireland", "germany", "france", "netherlands", "spain", "portugal",
  "sweden", "norway", "switzerland", "austria", "belgium", "denmark",
  "finland", "italy", "poland", "romania",
];

const ENGLISH_SPEAKING_COUNTRIES = [
  "ireland", "united-kingdom", "australia", "new-zealand", "canada", "usa", "singapore",
];

const WARM_COUNTRIES = ["uae", "spain", "portugal", "singapore", "australia", "india", "brazil", "malaysia"];
const COLD_COUNTRIES = ["sweden", "norway", "germany", "netherlands", "united-kingdom", "ireland", "canada", "finland", "denmark", "austria", "belgium"];

const TO_USD: Record<string, number> = {
  USD: 1, EUR: 1.08, GBP: 1.27, AUD: 0.65, CAD: 0.74,
  NZD: 0.61, CHF: 1.13, SGD: 0.74, AED: 0.27,
  NOK: 0.093, SEK: 0.096, DKK: 0.145,
  JPY: 0.0067, INR: 0.012, BRL: 0.20, MYR: 0.22,
};

// Rent budget upper limits in USD
const RENT_BUDGET_USD: Record<string, number> = {
  under800: 800,
  "800to1500": 1500,
  "1500to2500": 2500,
  any: 99999,
};

function toUSD(amount: number, currency: string): number {
  return amount * (TO_USD[currency] ?? 1);
}

export function scoreCountriesForWizard(
  countries: CountryWithData[],
  answers: WizardAnswers
): CountryMatch[] {

  const isEU = EU_PASSPORTS.includes((answers.passport ?? "").toLowerCase());
  const rentBudgetUSD = RENT_BUDGET_USD[answers.rentBudget ?? "any"] ?? 99999;

  const results: CountryMatch[] = countries.map((country) => {
    const data = country.data;
    const reasons: string[] = [];

    // ── 1. BASE WEIGHTED SCORE (0–10 each dimension) ────────────────────────

    const jobRoleDef = JOB_ROLES.find((r) => r.key === answers.jobRole);
    const salaryKey = jobRoleDef?.salaryKey ?? "salarySoftwareEngineer";
    const salaryRaw = data[salaryKey] as number;
    const salaryUSD = toUSD(salaryRaw, country.currency);

    // Salary: $20k = 0, $180k = 10 (more realistic range)
    const salaryScore = normalise(salaryUSD, 20000, 180000);

    // Affordability: rent vs budget. If over budget → penalise heavily
    const rentUSD = toUSD(data.costRentCityCentre, country.currency);
    let affordScore: number;
    if (rentUSD <= rentBudgetUSD) {
      // Within budget: score based on how cheap relative to budget
      // Perfect = $300/mo, expensive = budget ceiling
      affordScore = normalise(rentBudgetUSD - rentUSD, 0, rentBudgetUSD) * 10;
      affordScore = Math.max(4, Math.min(10, affordScore)); // floor at 4 if within budget
    } else {
      // Over budget: score drops proportionally to how far over
      const overBy = (rentUSD - rentBudgetUSD) / rentBudgetUSD;
      affordScore = Math.max(0, 4 - overBy * 8); // rapidly drops to 0
    }

    const qualityScore = data.scoreQualityOfLife; // already 0-10
    const safetyScore = data.scoreSafety; // already 0-10

    // Visa: easier = better. difficulty 1 = 10pts, difficulty 5 = 0pts
    // EU passport gets a flat boost
    let visaScore = Math.max(0, 10 - (data.visaDifficulty - 1) * 2.5);
    if (isEU && [
      "germany","netherlands","portugal","spain","ireland","france","italy",
      "sweden","switzerland","norway","austria","finland","belgium","denmark",
    ].includes(country.slug)) {
      visaScore = 10; // EU passport = trivial
    }

    // Tax: 0% = 10, 55% = 0
    const taxScore = normalise(55 - data.incomeTaxRateMid, 0, 55) * 10;

    // ── 2. WEIGHTS — base then adjusted by priorities ────────────────────────

    let weights = {
      salary: 0.28,
      affordability: 0.22,
      quality: 0.18,
      safety: 0.12,
      visa: 0.12,
      tax: 0.08,
    };

    // Priority ranking boosts (max boost per priority = 0.08, diminishing)
    if (answers.priorities?.length > 0) {
      answers.priorities.forEach((priority, index) => {
        const boost = [0.08, 0.05, 0.03, 0.02, 0.01][index] ?? 0.01;
        if (priority === "salary") weights.salary += boost;
        if (priority === "affordability") weights.affordability += boost;
        if (priority === "quality") weights.quality += boost;
        if (priority === "safety") weights.safety += boost;
        if (priority === "visa") weights.visa += boost;
        if (priority === "tax") weights.tax += boost;
      });
    }

    // Normalise weights to sum to 1
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    Object.keys(weights).forEach((k) => {
      weights[k as keyof typeof weights] /= total;
    });

    // ── 3. WEIGHTED BASE SCORE ───────────────────────────────────────────────

    let score =
      salaryScore * weights.salary +
      affordScore * weights.affordability +
      qualityScore * weights.quality +
      safetyScore * weights.safety +
      visaScore * weights.visa +
      taxScore * weights.tax;

    // ── 4. DEAL BREAKER PENALTIES (hard, not soft) ───────────────────────────
    // These are real disqualifiers — penalise aggressively

    // English required but country isn't English-speaking
    if (
      answers.dealBreakers?.includes("english") &&
      !ENGLISH_SPEAKING_COUNTRIES.includes(country.slug)
    ) {
      score *= 0.55; // 45% score reduction — not a disqualification but very significant
    }

    // Low tax required but country taxes > 30%
    if (
      answers.dealBreakers?.includes("lowtax") &&
      data.incomeTaxRateMid > 30
    ) {
      score *= 0.70;
    }

    // Warm climate required but country is cold
    if (
      answers.dealBreakers?.includes("warm") &&
      COLD_COUNTRIES.includes(country.slug)
    ) {
      score *= 0.75;
    }

    // Low crime required but safety < 8
    if (
      answers.dealBreakers?.includes("lowcrime") &&
      (data.scoreSafety ?? 0) < 8
    ) {
      score *= 0.65;
    }

    // Must be in EU but country is not EU
    if (
      answers.dealBreakers?.includes("mustEU") &&
      !["germany","netherlands","portugal","spain","ireland","france","italy",
        "sweden","austria","finland","belgium","denmark"].includes(country.slug)
    ) {
      score *= 0.40;
    }

    // ── 5. CONTEXTUAL BONUSES (small, specific) ──────────────────────────────

    // Rent fits budget perfectly → bonus
    if (rentUSD <= rentBudgetUSD * 0.7) {
      score += 0.3;
      reasons.push("Fits your rent budget");
    }

    // EU passport + EU country → visa is trivial
    if (isEU && visaScore === 10) {
      reasons.push("Easy visa with your EU passport");
    } else if (data.visaDifficulty <= 2) {
      reasons.push("Straightforward visa process");
    }

    // Move reason specific bonuses
    if (answers.moveReason === "retire" && rentUSD < 1000) {
      score += 0.4;
      reasons.push("Affordable for retirement");
    }
    if (answers.moveReason === "remote" && data.scoreInternetSpeed >= 8.5) {
      score += 0.5;
      reasons.push("Excellent internet for remote work");
    }
    if (answers.moveReason === "study" &&
      ["germany", "netherlands", "sweden", "norway", "finland", "denmark"].includes(country.slug)) {
      score += 0.4;
      reasons.push("Strong university system");
    }

    // English country bonus if user flagged it
    if (
      answers.dealBreakers?.includes("english") &&
      ENGLISH_SPEAKING_COUNTRIES.includes(country.slug)
    ) {
      score += 0.5;
      reasons.push("English speaking");
    }

    // Language match bonus
    if (answers.languages?.includes("spanish") &&
      ["spain", "mexico", "colombia"].includes(country.slug)) {
      score += 0.4;
      reasons.push("Matches your language");
    }
    if (answers.languages?.includes("portuguese") &&
      ["portugal", "brazil"].includes(country.slug)) {
      score += 0.4;
      reasons.push("Matches your language");
    }
    if (answers.languages?.includes("german") &&
      ["germany", "austria", "switzerland"].includes(country.slug)) {
      score += 0.4;
      reasons.push("Matches your language");
    }

    // Tax-free bonus
    if (data.incomeTaxRateMid === 0) {
      score += 0.6;
      reasons.push("Zero income tax");
    } else if (taxScore >= 8) {
      reasons.push("Very tax efficient");
    }

    // High salary bonus
    if (salaryScore >= 8) reasons.push(`Strong ${jobRoleDef?.label ?? "salary"} salary`);
    else if (salaryScore >= 6) reasons.push(`Good ${jobRoleDef?.label ?? "salary"} salary`);

    // Low cost of living
    if (affordScore >= 8) reasons.push("Low cost of living");

    // Safety
    if (safetyScore >= 9) reasons.push("Very low crime rate");
    else if (safetyScore >= 8 && answers.priorities?.includes("safety")) {
      reasons.push("High safety score");
    }

    // Quality of life
    if (qualityScore >= 9) reasons.push("Exceptional quality of life");

    // ── 6. CLAMP ────────────────────────────────────────────────────────────

    const finalScore = Math.max(0, Math.min(10, score));

    return {
      country,
      matchScore: finalScore,
      matchPercent: 0,
      reasons: reasons.slice(0, 3),
    };
  });

  // ── 7. SORT ──────────────────────────────────────────────────────────────

  results.sort((a, b) => b.matchScore - a.matchScore);

  // ── 8. ABSOLUTE PERCENTAGES ──────────────────────────────────────────────
  // Convert score (0-10) to percentage using a fixed realistic scale.
  // A perfect 10 = 95%. A score of 5 = ~50%. This gives spread across the list.
  // Formula: percent = (score / 10) * 90 + 5  → range: 5% to 95%
  // Then we apply a curve so top countries feel meaningfully better.

  results.forEach((r) => {
    // Base conversion: 0-10 score → 5-95%
    const base = (r.matchScore / 10) * 90 + 5;

    // Round to nearest integer, clamp between 5 and 95
    r.matchPercent = Math.round(Math.max(5, Math.min(95, base)));
  });

  // Ensure no two adjacent countries have the same percentage (add small variance)
  for (let i = 1; i < results.length; i++) {
    if (results[i].matchPercent >= results[i - 1].matchPercent) {
      results[i].matchPercent = Math.max(5, results[i - 1].matchPercent - 1);
    }
  }

  return results;
}