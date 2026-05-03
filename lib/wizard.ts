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
  currentCountry?: string;
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

const EUROPEAN_COUNTRIES = [
  "germany", "netherlands", "portugal", "spain", "ireland", "france",
  "italy", "united-kingdom", "sweden", "switzerland", "norway", "austria",
  "finland", "belgium", "denmark", "poland",
];

const WARM_COUNTRIES = [
  "uae", "spain", "portugal", "singapore", "australia", "india",
  "brazil", "malaysia", "thailand", "vietnam", "philippines",
];

const HIGH_COST_COUNTRIES = [
  "singapore", "switzerland", "norway", "australia", "new-zealand",
  "ireland", "united-kingdom", "usa", "canada", "denmark",
];

const HIGH_TAX_COUNTRIES = [
  "sweden", "finland", "germany", "denmark", "austria", "ireland",
  "united-kingdom", "italy", "netherlands", "belgium", "norway",
  "australia", "new-zealand", "france", "canada",
];

const TERRITORIAL_TAX_COUNTRIES = ["uae", "singapore", "malaysia", "portugal"];
const RETIREMENT_VISA_COUNTRIES  = ["portugal", "spain", "malaysia", "uae", "italy", "new-zealand"];
const NOMAD_VISA_COUNTRIES       = ["portugal", "spain", "germany", "netherlands", "uae", "malaysia", "new-zealand"];

const STRONG_HEALTHCARE_COUNTRIES = [
  "germany", "france", "switzerland", "austria", "netherlands",
  "sweden", "norway", "denmark", "finland", "belgium",
  "australia", "canada", "new-zealand", "singapore", "japan",
  "united-kingdom", "ireland", "portugal", "spain", "italy",
];

const TO_USD: Record<string, number> = {
  USD: 1, EUR: 1.08, GBP: 1.27, AUD: 0.65, CAD: 0.74,
  NZD: 0.61, CHF: 1.13, SGD: 0.74, AED: 0.27,
  NOK: 0.093, SEK: 0.096, DKK: 0.145,
  JPY: 0.0067, INR: 0.012, BRL: 0.20, MYR: 0.22,
};

function toUSD(amount: number, currency: string): number {
  return amount * (TO_USD[currency] ?? 1);
}

const RENT_BUDGET_USD: Record<string, number> = {
  under800: 800,
  "800to1500": 1500,
  "1500to2500": 2500,
  any: 9999,
};

export function scoreCountriesForWizard(
  countries: CountryWithData[],
  answers: WizardAnswers
): CountryMatch[] {

  const dealBreakers = answers.dealBreakers ?? [];
  const currentCountrySlug = (answers.currentCountry ?? answers.passport)?.toLowerCase().trim();
  const isRetired = answers.moveReason === "retire";
  const isRemote  = answers.moveReason === "remote";
  const maxRentUSD = RENT_BUDGET_USD[answers.rentBudget ?? "any"] ?? 9999;

  // ── HARD EXCLUSIONS ─────────────────────────────────────────────
  const eligible = countries.filter((country) => {
    if (currentCountrySlug && country.slug === currentCountrySlug) return false;
    if (dealBreakers.includes("europe")   && !EUROPEAN_COUNTRIES.includes(country.slug))       return false;
    if (dealBreakers.includes("english")  && !ENGLISH_SPEAKING_COUNTRIES.includes(country.slug)) return false;
    if (dealBreakers.includes("lowtax")   && HIGH_TAX_COUNTRIES.includes(country.slug))        return false;
    if (dealBreakers.includes("nomadvisa") && !NOMAD_VISA_COUNTRIES.includes(country.slug))    return false;
    if (dealBreakers.includes("healthcare") && !STRONG_HEALTHCARE_COUNTRIES.includes(country.slug)) return false;
    if (dealBreakers.includes("lowcost")) {
      const rentUSD = toUSD(country.data.costRentCityCentre, country.currency);
      if (HIGH_COST_COUNTRIES.includes(country.slug)) return false;
      if (rentUSD > 1200) return false;
    }
    if (answers.rentBudget && answers.rentBudget !== "any") {
      const rentUSD = toUSD(country.data.costRentCityCentre, country.currency);
      if (rentUSD > maxRentUSD * 1.2) return false;
    }
    return true;
  });

  // ── SCORING ─────────────────────────────────────────────────────
  const results: CountryMatch[] = eligible.map((country) => {
    const data = country.data;
    let score = 0;
    const reasons: string[] = [];

    const rentUSD       = toUSD(data.costRentCityCentre, country.currency);
    const affordScore   = 10 - normalise(rentUSD, 300, 4000);
    const qualityScore  = data.scoreQualityOfLife;
    const safetyScore   = data.scoreSafety;
    const healthScore   = data.scoreHealthcare;
    const visaScore     = 10 - data.visaDifficulty * 2;
    const taxScore      = 10 - normalise(data.incomeTaxRateMid, 0, 55);
    const internetScore = data.scoreInternetSpeed;

    // ── RETIRED scoring path ─────────────────────────────────────
    if (isRetired) {
      let w = { affordability: 0.30, tax: 0.22, healthcare: 0.18, safety: 0.15, quality: 0.10, visa: 0.05 };
      answers.priorities?.forEach((p, i) => {
        const b = (5 - i) * 0.05;
        if (p === "cost" || p === "affordability") w.affordability += b;
        if (p === "tax")        w.tax        += b;
        if (p === "healthcare") w.healthcare += b;
        if (p === "safety")     w.safety     += b;
        if (p === "quality")    w.quality    += b;
        if (p === "visa")       w.visa       += b;
      });
      const wt = Object.values(w).reduce((a, b) => a + b, 0);
      Object.keys(w).forEach((k) => { w[k as keyof typeof w] /= wt; });
      score = affordScore * w.affordability + taxScore * w.tax + healthScore * w.healthcare +
              safetyScore * w.safety + qualityScore * w.quality + visaScore * w.visa;
      if (RETIREMENT_VISA_COUNTRIES.includes(country.slug))  { score += 0.8; reasons.push("Retirement / passive income visa available"); }
      if (TERRITORIAL_TAX_COUNTRIES.includes(country.slug))  { score += 0.6; reasons.push("Territorial tax — foreign income often exempt"); }
      if (rentUSD < 1000)  { score += 0.5; reasons.push("Very affordable for retirement"); }
      else if (rentUSD < 1500) reasons.push("Affordable cost of living");
      if (healthScore >= 8.5) reasons.push("Excellent public healthcare");
      if (safetyScore >= 9)   reasons.push("One of the safest countries");
      if (taxScore >= 8)      reasons.push("Very tax efficient");

    // ── REMOTE scoring path ──────────────────────────────────────
    } else if (isRemote) {
      let w = { tax: 0.25, affordability: 0.22, internet: 0.18, visa: 0.15, quality: 0.12, safety: 0.08 };
      answers.priorities?.forEach((p, i) => {
        const b = (5 - i) * 0.04;
        if (p === "tax")                               w.tax           += b;
        if (p === "cost" || p === "affordability")     w.affordability += b;
        if (p === "quality")                           w.quality       += b;
        if (p === "safety")                            w.safety        += b;
        if (p === "visa")                              w.visa          += b;
      });
      const wt = Object.values(w).reduce((a, b) => a + b, 0);
      Object.keys(w).forEach((k) => { w[k as keyof typeof w] /= wt; });
      score = taxScore * w.tax + affordScore * w.affordability + internetScore * w.internet +
              visaScore * w.visa + qualityScore * w.quality + safetyScore * w.safety;
      if (NOMAD_VISA_COUNTRIES.includes(country.slug))       { score += 0.8; reasons.push("Official digital nomad visa available"); }
      if (TERRITORIAL_TAX_COUNTRIES.includes(country.slug))  { score += 0.7; reasons.push("Territorial tax — remote income often exempt"); }
      if (internetScore >= 8.5) reasons.push("Excellent internet speeds");
      if (taxScore >= 8)        reasons.push("Very tax efficient");
      if (affordScore >= 7)     reasons.push("Low cost of living");

    // ── STANDARD scoring path ────────────────────────────────────
    } else {
      const jobRoleDef  = JOB_ROLES.find((r) => r.key === answers.jobRole);
      const salaryKey   = jobRoleDef?.salaryKey ?? "salarySoftwareEngineer";
      const salaryUSD   = toUSD(data[salaryKey] as number, country.currency);
      const salaryScore = normalise(salaryUSD, 25000, 200000);

      let w = { salary: 0.25, affordability: 0.20, quality: 0.18, safety: 0.12, visa: 0.15, tax: 0.10 };
      answers.priorities?.forEach((p, i) => {
        const b = (5 - i) * 0.04;
        if (p === "salary")                            w.salary        += b;
        if (p === "cost" || p === "affordability")     w.affordability += b;
        if (p === "quality" || p === "worklife")       w.quality       += b;
        if (p === "safety")                            w.safety        += b;
        if (p === "visa")                              w.visa          += b;
        if (p === "tax")                               w.tax           += b;
        if (p === "healthcare")                        w.quality       += b * 0.5;
      });
      const wt = Object.values(w).reduce((a, b) => a + b, 0);
      Object.keys(w).forEach((k) => { w[k as keyof typeof w] /= wt; });
      score = salaryScore * w.salary + affordScore * w.affordability + qualityScore * w.quality +
              safetyScore * w.safety + visaScore * w.visa + taxScore * w.tax;

      if (salaryScore >= 8.5) reasons.push(`Top-tier ${jobRoleDef?.label ?? "salary"} pay`);
      else if (salaryScore >= 7) reasons.push(`Competitive ${jobRoleDef?.label ?? "salary"} salary`);
      if (taxScore >= 8) reasons.push("Very tax efficient");
      if (answers.moveReason === "study" &&
        ["germany", "netherlands", "sweden", "norway", "finland", "denmark"].includes(country.slug)) {
        score += 0.4; reasons.push("Free or low-cost university education");
      }
      if (answers.moveReason === "job" && data.visaDifficulty <= 2) score += 0.3;
    }

    // ── SHARED BONUSES ───────────────────────────────────────────
    const passportLower = (answers.passport ?? "").toLowerCase();
    const isEU = EU_PASSPORTS.includes(passportLower);
    if (isEU && EUROPEAN_COUNTRIES.includes(country.slug)) {
      score += 0.5;
      reasons.push("Easy visa with your EU passport");
    }
    if (data.visaDifficulty <= 2 && !reasons.includes("Easy visa with your EU passport")) {
      reasons.push("Straightforward visa process");
    }
    if (answers.priorities?.includes("english") && ENGLISH_SPEAKING_COUNTRIES.includes(country.slug)) {
      score += 0.4; reasons.push("English-speaking country");
    }
    if (answers.priorities?.includes("healthcare") && STRONG_HEALTHCARE_COUNTRIES.includes(country.slug)) {
      score += 0.3;
      if (!reasons.some((r) => r.toLowerCase().includes("healthcare"))) reasons.push("Strong public healthcare system");
    }
    if (answers.rentBudget && answers.rentBudget !== "any") {
      const rentUSD2 = toUSD(data.costRentCityCentre, country.currency);
      if (rentUSD2 <= maxRentUSD && !reasons.some((r) => r.toLowerCase().includes("afford") || r.toLowerCase().includes("cost") || r.toLowerCase().includes("budget"))) {
        reasons.push("Fits your rent budget");
      }
    }

    const languageMap: Record<string, { slug: string; reason: string }> = {
      german:     { slug: "germany",     reason: "Your German gives you a big advantage" },
      french:     { slug: "france",      reason: "Your French is a major advantage" },
      spanish:    { slug: "spain",       reason: "Your Spanish is a major advantage" },
      portuguese: { slug: "portugal",    reason: "Your Portuguese is a major advantage" },
      arabic:     { slug: "uae",         reason: "Your Arabic is a major advantage" },
      dutch:      { slug: "netherlands", reason: "Your Dutch gives you a big advantage" },
      swedish:    { slug: "sweden",      reason: "Your Swedish gives you a big advantage" },
      norwegian:  { slug: "norway",      reason: "Your Norwegian gives you a big advantage" },
      italian:    { slug: "italy",       reason: "Your Italian gives you a big advantage" },
      japanese:   { slug: "japan",       reason: "Your Japanese gives you a huge advantage" },
      hindi:      { slug: "india",       reason: "Your Hindi is a major advantage" },
      mandarin:   { slug: "singapore",   reason: "Mandarin is widely spoken in Singapore" },
    };
    Object.entries(languageMap).forEach(([lang, { slug, reason }]) => {
      if (answers.languages?.includes(lang) && country.slug === slug) { score += 0.4; reasons.push(reason); }
    });
    if (answers.languages?.includes("french") && country.slug === "canada") {
      score += 0.3; reasons.push("French is a bonus in Canada");
    }

    // Soft deal breaker penalties (warm/crime — can't hard filter, subjective)
    if (dealBreakers.includes("warm") && !WARM_COUNTRIES.includes(country.slug)) score -= 2.5;
    if (dealBreakers.includes("lowcrime")) {
      if (data.scoreCrimeRate < 8.0) score -= 2.5;
      else reasons.push("Very low crime rate");
    }

    if (affordScore >= 7.5 && !reasons.some((r) => r.toLowerCase().includes("afford") || r.toLowerCase().includes("cost"))) {
      reasons.push("Low cost of living");
    }
    if (qualityScore >= 8.5 && !reasons.some((r) => r.includes("quality"))) reasons.push("Exceptional quality of life");
    if (safetyScore >= 9 && !reasons.some((r) => r.includes("safest")))     reasons.push("One of the safest countries");

    return {
      country,
      matchScore: Math.max(0, Math.min(10, score)),
      matchPercent: 0,
      reasons: reasons.slice(0, 3),
    };
  });

  results.sort((a, b) => b.matchScore - a.matchScore);

  // ── PERCENT: absolute scale, real spread ─────────────────────
  results.forEach((r) => {
    const pct = Math.round(45 + (r.matchScore / 10) * 50);
    r.matchPercent = Math.min(95, Math.max(45, pct));
  });

  return results;
}