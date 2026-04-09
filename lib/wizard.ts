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

// Approximate conversion rates to USD for salary normalisation
// These don't need to be exact — just need to put all salaries on the same scale
const TO_USD: Record<string, number> = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  AUD: 0.65,
  CAD: 0.74,
  NZD: 0.61,
  CHF: 1.13,
  SGD: 0.74,
  AED: 0.27,
  NOK: 0.093,
  SEK: 0.096,
  DKK: 0.145,
  JPY: 0.0067,
  INR: 0.012,
  BRL: 0.20,
  MYR: 0.22,
};

// Convert cost to USD for rent budget comparison
function toUSD(amount: number, currency: string): number {
  const rate = TO_USD[currency] ?? 1;
  return amount * rate;
}

export function scoreCountriesForWizard(
  countries: CountryWithData[],
  answers: WizardAnswers
): CountryMatch[] {
  const results: CountryMatch[] = countries.map((country) => {
    const data = country.data;
    let score = 0;
    const reasons: string[] = [];

    // --- Salary score — normalise to USD first ---
    const jobRoleDef = JOB_ROLES.find((r) => r.key === answers.jobRole);
    const salaryKey = jobRoleDef?.salaryKey ?? "salarySoftwareEngineer";
    const salaryRaw = data[salaryKey] as number;
    const salaryUSD = toUSD(salaryRaw, country.currency);
    // Normalise USD salary: $25k = 0, $200k = 10
    const salaryScore = normalise(salaryUSD, 25000, 200000);

    // --- Base weights ---
    let weights = {
      salary: 0.25,
      affordability: 0.20,
      quality: 0.18,
      safety: 0.12,
      visa: 0.15,
      tax: 0.10,
    };

    // Adjust weights based on priority ranking
    if (answers.priorities && answers.priorities.length > 0) {
      answers.priorities.forEach((priority, index) => {
        const boost = (5 - index) * 0.04;
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

    // --- Affordability — normalise rent to USD ---
    const rentUSD = toUSD(data.costRentCityCentre, country.currency);
    // $300/mo = very cheap, $4000/mo = very expensive
    const affordScore = 10 - normalise(rentUSD, 300, 4000);

    const qualityScore = data.scoreQualityOfLife;
    const safetyScore = data.scoreSafety;
    const visaScore = 10 - data.visaDifficulty * 2;
    const taxScore = 10 - normalise(data.incomeTaxRateMid, 0, 55);

    score =
      salaryScore * weights.salary +
      affordScore * weights.affordability +
      qualityScore * weights.quality +
      safetyScore * weights.safety +
      visaScore * weights.visa +
      taxScore * weights.tax;

    // --- Passport bonus ---
    const passportLower = (answers.passport ?? "").toLowerCase();
    const isEU = EU_PASSPORTS.includes(passportLower);

    if (isEU && [
      "germany", "netherlands", "portugal", "spain", "ireland", "france",
      "italy", "sweden", "switzerland", "norway", "austria", "finland",
      "belgium", "denmark",
    ].includes(country.slug)) {
      score += 0.5;
      reasons.push("Easy visa with your EU passport");
    }
    if (data.visaDifficulty <= 2) {
      reasons.push("Straightforward visa process");
    }

    // --- Rent budget filter — convert user budget to USD for fair comparison ---
    const rentBudgetUSD: Record<string, number> = {
      under800: 800,
      "800to1500": 1500,
      "1500to2500": 2500,
      any: 9999,
    };
    const maxRentUSD = rentBudgetUSD[answers.rentBudget ?? "any"] ?? 9999;
    if (rentUSD > maxRentUSD + 400) {
      score -= 1.5;
    } else if (rentUSD <= maxRentUSD) {
      reasons.push("Fits your rent budget");
    }

    // --- Language bonuses ---
    const languageMap: Record<string, { slug: string; reason: string }> = {
      german: { slug: "germany", reason: "Your German gives you a big advantage" },
      french: { slug: "france", reason: "Your French is a major advantage" },
      spanish: { slug: "spain", reason: "Your Spanish is a major advantage" },
      portuguese: { slug: "portugal", reason: "Your Portuguese is a major advantage" },
      arabic: { slug: "uae", reason: "Your Arabic is a major advantage" },
      dutch: { slug: "netherlands", reason: "Your Dutch gives you a big advantage" },
      swedish: { slug: "sweden", reason: "Your Swedish gives you a big advantage" },
      norwegian: { slug: "norway", reason: "Your Norwegian gives you a big advantage" },
      italian: { slug: "italy", reason: "Your Italian gives you a big advantage" },
      japanese: { slug: "japan", reason: "Your Japanese gives you a huge advantage" },
      hindi: { slug: "india", reason: "Your Hindi is a major advantage" },
    };
    Object.entries(languageMap).forEach(([lang, { slug, reason }]) => {
      if (answers.languages?.includes(lang) && country.slug === slug) {
        score += 0.4;
        reasons.push(reason);
      }
    });
    // French bonus in Canada too
    if (answers.languages?.includes("french") && country.slug === "canada") {
      score += 0.3;
      reasons.push("French is a bonus in Canada");
    }

    // --- Deal breaker penalties ---
    if (
      answers.dealBreakers?.includes("english") &&
      !ENGLISH_SPEAKING_COUNTRIES.includes(country.slug)
    ) {
      score -= 2;
    }
    if (
      answers.dealBreakers?.includes("europe") &&
      !["germany", "netherlands", "portugal", "spain", "ireland", "france",
        "italy", "united-kingdom", "sweden", "switzerland", "norway",
        "austria", "finland", "belgium", "denmark"].includes(country.slug)
    ) {
      score -= 2;
    }
    if (answers.dealBreakers?.includes("lowtax") && data.incomeTaxRateMid > 30) {
      score -= 1;
    }
    if (answers.dealBreakers?.includes("warm") && COLD_COUNTRIES.includes(country.slug)) {
      score -= 0.8;
    }
    if (answers.dealBreakers?.includes("lowcrime") && data.scoreCrimeRate < 8.0) {
      score -= 1.5;
    }
    if (answers.dealBreakers?.includes("lowcrime") && data.scoreCrimeRate >= 8.0) {
      reasons.push("Very low crime rate");
    }

    // --- Move reason adjustments ---
    if (answers.moveReason === "retire" && rentUSD < 1200) {
      score += 0.5;
      reasons.push("Affordable for retirement");
    }
    if (answers.moveReason === "remote" && data.scoreInternetSpeed >= 8) {
      score += 0.4;
      reasons.push("Excellent internet for remote work");
    }
    if (
      answers.moveReason === "study" &&
      ["germany", "netherlands", "sweden", "norway", "finland", "denmark"].includes(country.slug)
    ) {
      score += 0.3;
      reasons.push("Strong university system");
    }
    if (answers.moveReason === "job" && data.visaDifficulty <= 2) {
      score += 0.3;
    }

    // --- Positive reasons from data ---
    if (salaryScore >= 7) reasons.push("Strong " + (jobRoleDef?.label ?? "salary") + " salary");
    if (affordScore >= 7) reasons.push("Low cost of living");
    if (qualityScore >= 8.5) reasons.push("Exceptional quality of life");
    if (safetyScore >= 9) reasons.push("One of the safest countries");
    if (taxScore >= 8) reasons.push("Very tax efficient");

    return {
      country,
      matchScore: Math.max(0, Math.min(10, score)),
      matchPercent: 0,
      reasons: reasons.slice(0, 3),
    };
  });

  // Sort by score descending
  results.sort((a, b) => b.matchScore - a.matchScore);

  // Convert to percentages relative to top score
  const topScore = results[0]?.matchScore ?? 10;
  results.forEach((r) => {
    r.matchPercent = Math.round((r.matchScore / topScore) * 100);
  });

  // Cap top at 97%
  if (results[0]) results[0].matchPercent = Math.min(97, results[0].matchPercent);

  return results;
}