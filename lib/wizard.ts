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

// Passport to region mapping for visa ease
const EU_PASSPORTS = ["ireland", "germany", "france", "netherlands", "spain", "portugal", "sweden", "norway", "switzerland", "austria", "belgium", "denmark", "finland", "italy", "poland"];
const ENGLISH_SPEAKING = ["ireland", "united-kingdom", "australia", "new-zealand", "canada", "usa", "singapore"];

export function scoreCountriesForWizard(
  countries: CountryWithData[],
  answers: WizardAnswers
): CountryMatch[] {
  const results: CountryMatch[] = countries.map((country) => {
    const data = country.data;
    let score = 0;
    const reasons: string[] = [];

    // --- Salary score based on selected job role ---
    const jobRoleDef = JOB_ROLES.find((r) => r.key === answers.jobRole);
    const salaryKey = jobRoleDef?.salaryKey ?? "salarySoftwareEngineer";
    const salary = data[salaryKey] as number;
    const salaryScore = normalise(salary, 20000, 200000);

    // --- Base weights, adjusted by priorities ---
    let weights = {
      salary: 0.25,
      affordability: 0.20,
      quality: 0.18,
      safety: 0.12,
      visa: 0.15,
      tax: 0.10,
    };

    // Adjust weights based on priority ranking
    answers.priorities.forEach((priority, index) => {
      const boost = (5 - index) * 0.04; // top priority gets biggest boost
      if (priority === "salary") weights.salary += boost;
      if (priority === "affordability") weights.affordability += boost;
      if (priority === "quality") weights.quality += boost;
      if (priority === "safety") weights.safety += boost;
      if (priority === "visa") weights.visa += boost;
      if (priority === "tax") weights.tax += boost;
    });

    // Normalise weights to sum to 1
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    Object.keys(weights).forEach((k) => {
      weights[k as keyof typeof weights] /= total;
    });

    // --- Score each dimension ---
    const affordScore = 10 - normalise(data.costRentCityCentre, 400, 4000);
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
    const passportLower = answers.passport.toLowerCase();
    const isEU = EU_PASSPORTS.includes(passportLower);
    const isEnglish = ENGLISH_SPEAKING.includes(passportLower);

    if (isEU && ["germany", "netherlands", "portugal", "spain", "ireland", "sweden", "switzerland", "norway"].includes(country.slug)) {
      score += 0.5;
      reasons.push("Easy visa with your EU passport");
    }
    if (data.visaDifficulty <= 2) {
      reasons.push("Straightforward visa process");
    }

    // --- Rent budget filter ---
    const rentMap: Record<string, number> = {
      "under800": 800,
      "800to1500": 1500,
      "1500to2500": 2500,
      "any": 9999,
    };
    const maxRent = rentMap[answers.rentBudget] ?? 9999;
    if (data.costRentCityCentre > maxRent + 500) {
      score -= 1.5; // penalise countries over budget
    } else if (data.costRentCityCentre <= maxRent) {
      reasons.push("Fits your rent budget");
    }

    // --- Language bonus ---
    if (answers.languages.includes("german") && country.slug === "germany") {
      score += 0.4;
      reasons.push("Your German gives you a big advantage");
    }
    if (answers.languages.includes("french") && country.slug === "canada") {
      score += 0.3;
      reasons.push("French is a bonus in Canada");
    }
    if (answers.languages.includes("spanish") && ["spain"].includes(country.slug)) {
      score += 0.4;
      reasons.push("Your Spanish is a major advantage");
    }
    if (answers.languages.includes("portuguese") && country.slug === "portugal") {
      score += 0.4;
      reasons.push("Your Portuguese is a major advantage");
    }

    // --- Deal breaker penalties ---
    if (answers.dealBreakers.includes("english") && !["ireland", "united-kingdom", "australia", "new-zealand", "canada", "usa", "singapore", "uae"].includes(country.slug)) {
      score -= 2;
    }
    if (answers.dealBreakers.includes("europe") && !["germany", "netherlands", "portugal", "spain", "ireland", "united-kingdom", "sweden", "switzerland", "norway"].includes(country.slug)) {
      score -= 2;
    }
    if (answers.dealBreakers.includes("lowtax") && data.incomeTaxRateMid > 30) {
      score -= 1;
    }
    if (answers.dealBreakers.includes("warm") && ["sweden", "norway", "germany", "netherlands", "united-kingdom", "ireland"].includes(country.slug)) {
      score -= 0.8;
    }

    // --- Move reason adjustments ---
    if (answers.moveReason === "retire" && data.costRentCityCentre < 1200) {
      score += 0.5;
      reasons.push("Affordable for retirement");
    }
    if (answers.moveReason === "remote" && data.scoreInternetSpeed >= 8) {
      score += 0.4;
      reasons.push("Excellent internet for remote work");
    }
    if (answers.moveReason === "study" && ["germany", "netherlands", "sweden", "norway"].includes(country.slug)) {
      score += 0.3;
      reasons.push("Strong university system");
    }

    // --- Top reason from data ---
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

  // Cap top at 97% so it never feels fake
  if (results[0]) results[0].matchPercent = Math.min(97, results[0].matchPercent);

  return results;
}