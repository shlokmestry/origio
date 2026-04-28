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
  currentCountry?: string; // slug of where user currently lives
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

// All European country slugs — used for Europe deal breaker
const EUROPEAN_COUNTRIES = [
  "germany", "netherlands", "portugal", "spain", "ireland", "france",
  "italy", "united-kingdom", "sweden", "switzerland", "norway", "austria",
  "finland", "belgium", "denmark", "poland",
];

const WARM_COUNTRIES = ["uae", "spain", "portugal", "singapore", "australia", "india", "brazil", "malaysia"];
const COLD_COUNTRIES = ["sweden", "norway", "germany", "netherlands", "united-kingdom", "ireland", "canada", "finland", "denmark", "austria", "belgium"];

// HIGH COST countries — rent in USD city centre > ~$1800/mo
const HIGH_COST_COUNTRIES = ["singapore", "switzerland", "norway", "australia", "new-zealand", "ireland", "united-kingdom", "usa", "canada"];

// HIGH TAX countries — effective mid rate > 30%
// Used for lowtax deal breaker. Source: incomeTaxRateMid in countries.json
const HIGH_TAX_COUNTRIES = [
  "sweden",      // 52%
  "germany",     // 42%
  "ireland",     // 40%
  "united-kingdom", // 40%
  "australia",   // 32.5%
  "netherlands", // 36.93%
  "canada",      // 29.32% — borderline, include
  "norway",      // 33%
  "new-zealand", // 30%
  "france",      // 30%+
  "finland",     // 43%
  "belgium",     // 45%+
  "denmark",     // 42%
  "austria",     // 42%
  "italy",       // 35%+
];

// Approximate conversion rates to USD
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

function toUSD(amount: number, currency: string): number {
  const rate = TO_USD[currency] ?? 1;
  return amount * rate;
}

export function scoreCountriesForWizard(
  countries: CountryWithData[],
  answers: WizardAnswers
): CountryMatch[] {

  // --- HARD EXCLUSIONS --- applied before scoring ---
  const dealBreakers = answers.dealBreakers ?? [];
  const currentCountrySlug = (answers.currentCountry ?? answers.passport)?.toLowerCase().trim();

  const eligible = countries.filter((country) => {
    // 1. Exclude current country
    if (currentCountrySlug && country.slug === currentCountrySlug) return false;

    // 2. Europe deal breaker — hard exclude non-European countries
    if (dealBreakers.includes("europe") && !EUROPEAN_COUNTRIES.includes(country.slug)) return false;

    // 3. Low tax deal breaker — hard exclude high tax countries
    if (dealBreakers.includes("lowtax") && HIGH_TAX_COUNTRIES.includes(country.slug)) return false;

    // 4. Low cost deal breaker — hard exclude expensive countries
    if (dealBreakers.includes("lowcost")) {
      const rentUSD = toUSD(country.data.costRentCityCentre, country.currency);
      if (rentUSD > 1700 || HIGH_COST_COUNTRIES.includes(country.slug)) return false;
    }

    // 5. English-speaking deal breaker — hard exclude non-English countries
    if (dealBreakers.includes("english") && !ENGLISH_SPEAKING_COUNTRIES.includes(country.slug)) return false;

    return true;
  });

  const results: CountryMatch[] = eligible.map((country) => {
    const data = country.data;
    let score = 0;
    const reasons: string[] = [];

    // --- Salary score ---
    const jobRoleDef = JOB_ROLES.find((r) => r.key === answers.jobRole);
    const salaryKey = jobRoleDef?.salaryKey ?? "salarySoftwareEngineer";
    const salaryRaw = data[salaryKey] as number;
    const salaryUSD = toUSD(salaryRaw, country.currency);
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

    // Adjust weights from priorities
    if (answers.priorities && answers.priorities.length > 0) {
      answers.priorities.forEach((priority, index) => {
        const boost = (5 - index) * 0.04;
        if (priority === "salary") weights.salary += boost;
        if (priority === "affordability" || priority === "cost") weights.affordability += boost;
        if (priority === "quality") weights.quality += boost;
        if (priority === "safety") weights.safety += boost;
        if (priority === "visa") weights.visa += boost;
        if (priority === "tax") weights.tax += boost;
      });
    }

    // Normalise weights
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    Object.keys(weights).forEach((k) => {
      weights[k as keyof typeof weights] /= total;
    });

    // --- Component scores ---
    const rentUSD = toUSD(data.costRentCityCentre, country.currency);
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

    // --- Passport visa bonus ---
    const passportLower = (answers.passport ?? "").toLowerCase();
    const isEU = EU_PASSPORTS.includes(passportLower);

    if (isEU && EUROPEAN_COUNTRIES.includes(country.slug)) {
      score += 0.5;
      reasons.push("Easy visa with your EU passport");
    }
    if (data.visaDifficulty <= 2) {
      reasons.push("Straightforward visa process");
    }

    // --- Rent budget soft filter ---
    const rentBudgetUSD: Record<string, number> = {
      under800: 800,
      "800to1500": 1500,
      "1500to2500": 2500,
      any: 9999,
    };
    const maxRentUSD = rentBudgetUSD[answers.rentBudget ?? "any"] ?? 9999;
    if (rentUSD > maxRentUSD + 400) {
      score -= 2.5; // stronger penalty for over-budget
    } else if (rentUSD <= maxRentUSD) {
      reasons.push("Fits your rent budget");
    }

    // --- Language bonuses ---
    const languageMap: Record<string, { slug: string; reason: string }> = {
      german:     { slug: "germany",        reason: "Your German gives you a big advantage" },
      french:     { slug: "france",         reason: "Your French is a major advantage" },
      spanish:    { slug: "spain",          reason: "Your Spanish is a major advantage" },
      portuguese: { slug: "portugal",       reason: "Your Portuguese is a major advantage" },
      arabic:     { slug: "uae",            reason: "Your Arabic is a major advantage" },
      dutch:      { slug: "netherlands",    reason: "Your Dutch gives you a big advantage" },
      swedish:    { slug: "sweden",         reason: "Your Swedish gives you a big advantage" },
      norwegian:  { slug: "norway",         reason: "Your Norwegian gives you a big advantage" },
      italian:    { slug: "italy",          reason: "Your Italian gives you a big advantage" },
      japanese:   { slug: "japan",          reason: "Your Japanese gives you a huge advantage" },
      hindi:      { slug: "india",          reason: "Your Hindi is a major advantage" },
      mandarin:   { slug: "singapore",      reason: "Mandarin is widely spoken in Singapore" },
    };
    Object.entries(languageMap).forEach(([lang, { slug, reason }]) => {
      if (answers.languages?.includes(lang) && country.slug === slug) {
        score += 0.4;
        reasons.push(reason);
      }
    });
    if (answers.languages?.includes("french") && country.slug === "canada") {
      score += 0.3;
      reasons.push("French is a bonus in Canada");
    }

    // --- Soft penalties (non-deal-breaker, just score reduction) ---
    if (
      dealBreakers.includes("warm") &&
      !WARM_COUNTRIES.includes(country.slug)
    ) {
      score -= 2.5;
    }
    if (
      dealBreakers.includes("lowcrime") &&
      data.scoreCrimeRate < 8.0
    ) {
      score -= 2.5;
    }
    if (
      dealBreakers.includes("lowcrime") &&
      data.scoreCrimeRate >= 8.0
    ) {
      reasons.push("Very low crime rate");
    }

    // --- Move reason bonuses ---
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

    // --- Positive reason labels ---
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

  results.sort((a, b) => b.matchScore - a.matchScore);

  const topScore = results[0]?.matchScore ?? 10;
  results.forEach((r) => {
    r.matchPercent = Math.round((r.matchScore / topScore) * 100);
  });

  if (results[0]) results[0].matchPercent = Math.min(97, results[0].matchPercent);

  return results;
}