// lib/wizard.ts
import { CountryWithData, JOB_ROLES } from "@/types";
import { normalise } from "@/lib/utils";

export interface WizardAnswers {
  passport: string;
  secondPassport?: string;
  moveReason: string;
  workType?: string; // 'employee' | 'freelancer' | 'company'
  jobRole: string;
  studyField?: string;
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
  "finland", "italy", "poland", "romania", "estonia", "hungary", "cyprus",
];

// Passport strength tiers — how much visa-free access / ease of movement
// Tier 1: near-universal visa-free (180+ countries), strong bilateral treaties
// Tier 2: good access (140–179 countries)
// Tier 3: moderate (100–139 countries)
// Tier 4: restricted (<100 countries)
const PASSPORT_STRENGTH: Record<string, 1 | 2 | 3 | 4> = {
  // Tier 1 — strongest
  "germany": 1, "france": 1, "italy": 1, "spain": 1, "finland": 1,
  "sweden": 1, "austria": 1, "denmark": 1, "netherlands": 1, "norway": 1,
  "switzerland": 1, "portugal": 1, "ireland": 1, "belgium": 1,
  "new-zealand": 1, "australia": 1, "japan": 1, "singapore": 1,
  "united-kingdom": 1, "canada": 1, "united-states": 1, "south-korea": 1, "usa": 1,
  "estonia": 1, "hungary": 1, "cyprus": 1,
  // Tier 2
  "poland": 2, "romania": 2, "malaysia": 2, "brazil": 2, "uae": 2,
  "mexico": 2, "chile": 2, "argentina": 2,
  // Tier 3
  "china": 3, "india": 3, "turkey": 3, "south-africa": 3, "ukraine": 3,
  "south africa": 3, "serbia": 3,
  "philippines": 3, "indonesia": 3, "vietnam": 3, "thailand": 3,
  // Tier 4 — most restricted
  "nigeria": 4, "pakistan": 4, "ghana": 4,
};

export function getPassportStrength(slug: string): 1 | 2 | 3 | 4 {
  if (!(slug in PASSPORT_STRENGTH)) console.warn(`[wizard] Unknown passport slug "${slug}" — defaulting to Tier 3`);
  return PASSPORT_STRENGTH[slug] ?? 3;
}

export const PASSPORT_TIER_LABEL: Record<1 | 2 | 3 | 4, string> = {
  1: "Tier 1 — visa-free access to 180+ countries",
  2: "Tier 2 — visa-free access to 140–179 countries",
  3: "Tier 3 — visa-free access to 100–139 countries",
  4: "Tier 4 — visa-free access to fewer than 100 countries",
};

// Countries that do not allow dual citizenship
export const NO_DUAL_CITIZENSHIP_SLUGS = new Set([
  "india", "china", "japan", "singapore", "uae",
  "indonesia", "malaysia", "south-korea",
]);

// If a no-dual passport is paired with another, the user has renounced the no-dual one.
// Return the passports that are actually valid for scoring.
export function resolveEffectivePassports(primary: string, secondary?: string): { primary: string; secondary?: string } {
  if (!secondary) return { primary };
  const primaryNoD  = NO_DUAL_CITIZENSHIP_SLUGS.has(primary);
  const secondNoD   = NO_DUAL_CITIZENSHIP_SLUGS.has(secondary);
  if (primaryNoD && !secondNoD) return { primary: secondary }; // renounced primary
  if (secondNoD && !primaryNoD) return { primary };            // renounced secondary
  return { primary, secondary };                               // both allow dual (or both no-dual — edge case)
}

// Returns the effective (best) passport strength for scoring
function effectiveStrength(primary: string, secondary?: string): 1 | 2 | 3 | 4 {
  const s1 = getPassportStrength(primary);
  const s2 = secondary ? getPassportStrength(secondary) : 4;
  return Math.min(s1, s2) as 1 | 2 | 3 | 4; // lower number = stronger
}

// Visa score modifier based on passport strength vs country difficulty
// Strong passport in hard-to-enter country → less penalty
function passportVisaModifier(strength: 1 | 2 | 3 | 4, visaDifficulty: number): number {
  // Tier 1 passport: visa difficulty is effectively reduced by up to 2 points globally
  // Tier 4 passport: difficulty is felt fully, even amplified on strict countries
  const reductions: Record<1 | 2 | 3 | 4, number> = { 1: 2.0, 2: 1.0, 3: 0, 4: -1.0 };
  const effectiveDifficulty = Math.max(0, visaDifficulty - reductions[strength]);
  return 10 - effectiveDifficulty * 2; // normalised visa score
}

const ENGLISH_SPEAKING_COUNTRIES = [
  "ireland", "united-kingdom", "australia", "new-zealand", "canada", "usa", "singapore", "south-africa",
];

const EUROPEAN_COUNTRIES = [
  "germany", "netherlands", "portugal", "spain", "ireland", "france",
  "italy", "united-kingdom", "sweden", "switzerland", "norway", "austria",
  "finland", "belgium", "denmark", "poland", "greece", "croatia", "czech-republic",
  "romania", "hungary", "estonia", "cyprus", "serbia",
];

const WARM_COUNTRIES = [
  "uae", "spain", "portugal", "singapore", "australia", "india",
  "brazil", "malaysia", "thailand", "vietnam", "philippines",
  "mexico", "colombia", "costa-rica", "panama", "greece",
  "cyprus", "indonesia", "south-africa", "argentina",
];

// City vibe preferences
const BIG_CITY_COUNTRIES = [
  "usa", "united-kingdom", "singapore", "japan", "germany", "france",
  "australia", "canada", "uae", "netherlands",
  "indonesia", "argentina", "south-africa",
];
const COASTAL_COUNTRIES = [
  "portugal", "spain", "australia", "new-zealand", "brazil", "malaysia",
  "thailand", "philippines", "vietnam", "uae", "italy",
  "indonesia", "cyprus", "south-africa", "argentina",
];
const MID_CITY_COUNTRIES = [
  "portugal", "germany", "netherlands", "austria", "sweden", "norway",
  "denmark", "finland", "belgium", "poland", "ireland", "new-zealand",
  "hungary", "romania", "estonia", "serbia",
];

const HIGH_COST_COUNTRIES = [
  "singapore", "switzerland", "norway", "australia", "new-zealand",
  "ireland", "united-kingdom", "usa", "canada", "denmark", "south-korea",
];

const HIGH_TAX_COUNTRIES = [
  "sweden", "finland", "germany", "denmark", "austria", "ireland",
  "united-kingdom", "italy", "netherlands", "belgium", "norway",
  "australia", "new-zealand", "france", "canada", "poland",
];

const TERRITORIAL_TAX_COUNTRIES = ["uae", "singapore", "malaysia", "portugal", "panama", "georgia", "costa-rica", "indonesia"];
const NATURE_COUNTRIES = [
  "new-zealand", "norway", "switzerland", "canada", "australia", "austria",
  "sweden", "finland", "new zealand", "costa-rica", "colombia",
  "south-africa", "indonesia",
];
const CULTURE_COUNTRIES = [
  "france", "italy", "japan", "spain", "germany", "portugal", "greece",
  "netherlands", "united-kingdom", "austria", "czech-republic",
  "argentina", "hungary", "romania",
];
const STARTUP_COUNTRIES = [
  "usa", "united-kingdom", "singapore", "germany", "netherlands", "ireland",
  "sweden", "canada", "australia", "estonia", "israel", "romania",
];
const RETIREMENT_VISA_COUNTRIES  = ["portugal", "spain", "malaysia", "uae", "italy", "new-zealand", "costa-rica", "panama", "south-africa", "indonesia", "argentina"];
const NOMAD_VISA_COUNTRIES       = [
  "portugal", "spain", "germany", "netherlands", "uae", "malaysia", "new-zealand",
  "mexico", "colombia", "panama", "thailand", "greece", "croatia", "costa-rica", "south-korea",
  "georgia", "vietnam", "czech-republic",
  "indonesia", "south-africa", "argentina", "estonia", "hungary", "serbia", "romania",
];

const STRONG_HEALTHCARE_COUNTRIES = [
  "germany", "france", "switzerland", "austria", "netherlands",
  "sweden", "norway", "denmark", "finland", "belgium",
  "australia", "canada", "new-zealand", "singapore", "japan",
  "united-kingdom", "ireland", "portugal", "spain", "italy", "south-korea",
];

export const TO_USD: Record<string, number> = {
  USD: 1,     EUR: 1.08,  GBP: 1.27,  AUD: 0.65,  CAD: 0.74,
  NZD: 0.61,  CHF: 1.13,  SGD: 0.74,  AED: 0.27,
  NOK: 0.093, SEK: 0.096, DKK: 0.145,
  JPY: 0.0067, INR: 0.012, BRL: 0.20, MYR: 0.22,
  // 2025/2026 additions
  MXN: 0.058, THB: 0.028, COP: 0.00024, KRW: 0.00074,
  CZK: 0.044, GEL: 0.37,  VND: 0.000039, CRC: 0.0019, PLN: 0.25,
  ZAR: 0.055, NGN: 0.00065, KES: 0.0077, PHP: 0.018, CNY: 0.14, RON: 0.22,
  IDR: 0.000067, RSD: 0.0093, HUF: 0.0028,
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

  const slugify = (s: string) => s.toLowerCase().trim().replace(/\s+/g, "-");
  const dealBreakers = answers.dealBreakers ?? [];
  const currentCountrySlug = answers.currentCountry
    ? slugify(answers.currentCountry)
    : slugify(answers.passport ?? "");
  const isRetired   = answers.moveReason === "retire";
  const isRemote    = answers.moveReason === "remote";
  const isLifestyle = answers.moveReason === "lifestyle";
  const isStudy     = answers.moveReason === "study";
  const maxRentUSD = RENT_BUDGET_USD[answers.rentBudget ?? "any"] ?? 9999;

  // ── HARD EXCLUSIONS ─────────────────────────────────────────────
  const eligible = countries.filter((country) => {
    if (currentCountrySlug && country.slug === currentCountrySlug) return false;
    if (dealBreakers.includes("europe")   && !EUROPEAN_COUNTRIES.includes(country.slug))       return false;
    if (dealBreakers.includes("english")  && !ENGLISH_SPEAKING_COUNTRIES.includes(country.slug)) return false;
    if (dealBreakers.includes("lowtax")   && HIGH_TAX_COUNTRIES.includes(country.slug))        return false;
    if (dealBreakers.includes("warm") && !WARM_COUNTRIES.includes(country.slug))               return false;
    if (dealBreakers.includes("lowcrime") && country.data.scoreSafety < 6.0)                   return false;
    if (answers.rentBudget && answers.rentBudget !== "any") {
      const rentUSD = toUSD(country.data.costRentCityCentre, country.currency);
      if (rentUSD > maxRentUSD * 1.2) return false;
    }
    return true;
  });

  // ── Passport resolution (drop renounced no-dual passport) ───────
  const rawPrimary   = slugify(answers.passport ?? "");
  const rawSecondary = answers.secondPassport ? slugify(answers.secondPassport) : undefined;
  const { primary: primarySlug, secondary: secondarySlug } = resolveEffectivePassports(rawPrimary, rawSecondary);
  const strength = effectiveStrength(primarySlug, secondarySlug);
  const hasDual  = !!secondarySlug;

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
    // visa score now accounts for passport strength — strong passport → easier access everywhere
    const visaScore     = Math.max(0, Math.min(10, passportVisaModifier(strength, data.visaDifficulty)));
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
        if (p === "english" && ENGLISH_SPEAKING_COUNTRIES.includes(country.slug)) score += b * 0.5;
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
      let w = { tax: 0.25, affordability: 0.22, internet: 0.18, visa: 0.15, quality: 0.10, safety: 0.08, healthcare: 0.02 };
      answers.priorities?.forEach((p, i) => {
        const b = (5 - i) * 0.04;
        if (p === "tax")                               w.tax           += b;
        if (p === "cost" || p === "affordability")     w.affordability += b;
        if (p === "quality")                           w.quality       += b;
        if (p === "safety")                            w.safety        += b;
        if (p === "visa")                              w.visa          += b;
        if (p === "healthcare")                        w.healthcare    += b;
        if (p === "english" && ENGLISH_SPEAKING_COUNTRIES.includes(country.slug)) score += b * 0.5;
      });
      const wt = Object.values(w).reduce((a, b) => a + b, 0);
      Object.keys(w).forEach((k) => { w[k as keyof typeof w] /= wt; });
      score = taxScore * w.tax + affordScore * w.affordability + internetScore * w.internet +
              visaScore * w.visa + qualityScore * w.quality + safetyScore * w.safety + healthScore * w.healthcare;
      if (NOMAD_VISA_COUNTRIES.includes(country.slug))       { score += 0.8; reasons.push("Official digital nomad visa available"); }
      if (TERRITORIAL_TAX_COUNTRIES.includes(country.slug))  { score += 0.7; reasons.push("Territorial tax — remote income often exempt"); }
      if (internetScore >= 8.5) reasons.push("Excellent internet speeds");
      if (taxScore >= 8)        reasons.push("Very tax efficient");
      if (affordScore >= 7)     reasons.push("Low cost of living");
      // workType bonuses for remote workers
      if (answers.workType === "freelancer") {
        if (NOMAD_VISA_COUNTRIES.includes(country.slug)) { score += 0.4; reasons.push("Freelancer-friendly nomad visa"); }
        if (TERRITORIAL_TAX_COUNTRIES.includes(country.slug)) { score += 0.3; reasons.push("No tax on foreign freelance income"); }
      }
      if (answers.workType === "company") {
        if (TERRITORIAL_TAX_COUNTRIES.includes(country.slug)) { score += 0.5; reasons.push("Territorial tax — company profits taxed locally only"); }
        if (["estonia", "georgia", "portugal", "uae", "singapore"].includes(country.slug)) { score += 0.5; reasons.push("Strong company formation + low corporate tax"); }
      }

    // ── LIFESTYLE scoring path ───────────────────────────────────
    } else if (isLifestyle) {
      let w = { quality: 0.30, safety: 0.22, affordability: 0.18, healthcare: 0.15, visa: 0.10, tax: 0.05 };
      answers.priorities?.forEach((p, i) => {
        const b = (5 - i) * 0.05;
        if (p === "quality")                       w.quality       += b;
        if (p === "safety")                        w.safety        += b;
        if (p === "cost" || p === "affordability") w.affordability += b;
        if (p === "healthcare")                    w.healthcare    += b;
        if (p === "visa")                          w.visa          += b;
        if (p === "tax")                           w.tax           += b;
        if (p === "english" && ENGLISH_SPEAKING_COUNTRIES.includes(country.slug)) score += b * 0.5;
      });
      const wt = Object.values(w).reduce((a, b) => a + b, 0);
      Object.keys(w).forEach((k) => { w[k as keyof typeof w] /= wt; });
      score = qualityScore * w.quality + safetyScore * w.safety + affordScore * w.affordability +
              healthScore * w.healthcare + visaScore * w.visa + taxScore * w.tax;
      if (WARM_COUNTRIES.includes(country.slug))              { score += 0.4; reasons.push("Warm climate"); }
      if (COASTAL_COUNTRIES.includes(country.slug))           { score += 0.3; reasons.push("Coastal lifestyle"); }
      if (qualityScore >= 8.5)  reasons.push("Exceptional quality of life");
      if (safetyScore >= 9)     reasons.push("One of the safest countries");
      if (healthScore >= 8.5)   reasons.push("Excellent public healthcare");
      if (rentUSD < 1200)       reasons.push("Affordable cost of living");

    // ── STUDY scoring path ───────────────────────────────────────
    } else if (isStudy) {
      const studyField = answers.studyField;
      let w = { quality: 0.25, affordability: 0.25, visa: 0.20, safety: 0.15, healthcare: 0.10, internet: 0.05 };
      answers.priorities?.forEach((p, i) => {
        const b = (5 - i) * 0.04;
        if (p === "cost" || p === "affordability") w.affordability += b;
        if (p === "quality")                       w.quality       += b;
        if (p === "safety")                        w.safety        += b;
        if (p === "visa")                          w.visa          += b;
        if (p === "healthcare")                    w.healthcare    += b;
        if (p === "english" && ENGLISH_SPEAKING_COUNTRIES.includes(country.slug)) score += b * 0.5;
      });
      const wt = Object.values(w).reduce((a, b) => a + b, 0);
      Object.keys(w).forEach((k) => { w[k as keyof typeof w] /= wt; });
      score = qualityScore * w.quality + affordScore * w.affordability + visaScore * w.visa +
              safetyScore * w.safety + healthScore * w.healthcare + internetScore * w.internet;
      // Free/low-cost tuition bonus
      if (["germany", "norway", "finland", "sweden", "denmark", "austria"].includes(country.slug)) {
        score += 0.8; reasons.push("Free or near-free university tuition");
      } else if (["netherlands", "france", "portugal", "spain", "italy"].includes(country.slug)) {
        score += 0.4; reasons.push("Low-cost EU university education");
      }
      // English-medium instruction bonus
      if (ENGLISH_SPEAKING_COUNTRIES.includes(country.slug)) {
        score += 0.4; reasons.push("English-medium instruction");
      }
      // Study field bonuses
      if (studyField) {
        const fieldBonuses: Record<string, string[]> = {
          tech:        ["usa", "united-kingdom", "canada", "germany", "netherlands", "singapore", "australia"],
          medicine:    ["germany", "netherlands", "australia", "canada", "ireland", "sweden", "norway"],
          business:    ["united-kingdom", "usa", "singapore", "netherlands", "ireland", "switzerland"],
          law:         ["united-kingdom", "usa", "australia", "canada", "netherlands"],
          engineering: ["germany", "sweden", "netherlands", "switzerland", "usa", "canada"],
          arts:        ["united-kingdom", "france", "italy", "germany", "netherlands"],
          science:     ["germany", "sweden", "switzerland", "netherlands", "usa", "australia"],
          social:      ["netherlands", "united-kingdom", "sweden", "norway", "canada"],
          hospitality: ["switzerland", "australia", "new-zealand", "spain", "france"],
          architecture:["italy", "netherlands", "germany", "spain", "united-kingdom"],
        };
        if (fieldBonuses[studyField]?.includes(country.slug)) {
          score += 0.5; reasons.push(`Strong ${studyField} programmes`);
        }
      }
      if (safetyScore >= 9) reasons.push("Safe country for students");
      if (affordScore >= 7) reasons.push("Affordable for students");

    // ── STANDARD / CAREER scoring path ──────────────────────────
    } else {
      const jobRoleDef = JOB_ROLES.find((r) => r.key === answers.jobRole);
      // Only use salary if a role was actually selected
      const hasSalaryRole = !!jobRoleDef;
      const salaryKey  = jobRoleDef?.salaryKey ?? "salarySoftwareEngineer";
      const salaryUSD  = hasSalaryRole ? toUSD(data[salaryKey] as number, country.currency) : 0;
      const salaryScore = hasSalaryRole ? normalise(salaryUSD, 25000, 200000) : 0;

      let w = hasSalaryRole
        ? { salary: 0.25, affordability: 0.20, quality: 0.17, safety: 0.12, visa: 0.15, tax: 0.10, healthcare: 0.01 }
        : { salary: 0.00, affordability: 0.25, quality: 0.24, safety: 0.18, visa: 0.15, tax: 0.17, healthcare: 0.01 };
      answers.priorities?.forEach((p, i) => {
        const b = (5 - i) * 0.04;
        if (p === "salary" && hasSalaryRole)           w.salary        += b;
        if (p === "cost" || p === "affordability")     w.affordability += b;
        if (p === "quality")                           w.quality       += b;
        if (p === "safety")                            w.safety        += b;
        if (p === "visa")                              w.visa          += b;
        if (p === "tax")                               w.tax           += b;
        if (p === "healthcare")                        w.healthcare    += b;
        if (p === "english" && ENGLISH_SPEAKING_COUNTRIES.includes(country.slug)) score += b * 0.5;
      });
      const wt = Object.values(w).reduce((a, b) => a + b, 0);
      Object.keys(w).forEach((k) => { w[k as keyof typeof w] /= wt; });
      score = salaryScore * w.salary + affordScore * w.affordability + qualityScore * w.quality +
              safetyScore * w.safety + visaScore * w.visa + taxScore * w.tax + healthScore * w.healthcare;

      if (hasSalaryRole && salaryScore >= 8.5) reasons.push(`Top-tier ${jobRoleDef!.label} pay`);
      else if (hasSalaryRole && salaryScore >= 7) reasons.push(`Competitive ${jobRoleDef!.label} salary`);
      if (taxScore >= 8) reasons.push("Very tax efficient");

      // ── PROFESSION-SPECIFIC BONUSES ──────────────────────────
      const role = answers.jobRole;

      // Healthcare professionals — bonus for countries with shortage lists / healthcare system strength
      if (["doctor","nurse","pharmacist","physiotherapist","psychologist","dentist"].includes(role)) {
        if (data.scoreHealthcare >= 8.5) { score += 0.4; reasons.push("Excellent public healthcare system to work in"); }
        if (["australia","canada","germany","netherlands","ireland","new-zealand","norway","sweden","denmark"].includes(country.slug)) {
          score += 0.5; reasons.push("Active healthcare worker visa sponsorship"); }
        if (["physiotherapist","psychologist"].includes(role) &&
          ["australia","canada","new-zealand","ireland","united-kingdom"].includes(country.slug)) {
          score += 0.3; reasons.push("Shortage occupation — faster visa processing"); }
      }

      // AI/ML + Cloud Architect — tech hub bonus, low corporate tax
      if (["aiMlEngineer","cloudArchitect","softwareEngineer","devOps","cybersecurity","dataScientist"].includes(role)) {
        if (["usa","singapore","united-kingdom","germany","netherlands","ireland","canada","australia"].includes(country.slug)) {
          score += 0.4; reasons.push("Major tech hub — strong demand for this role"); }
        if (["aiMlEngineer","cloudArchitect"].includes(role) &&
          ["usa","singapore","united-kingdom","germany","netherlands","switzerland"].includes(country.slug)) {
          score += 0.3; reasons.push("High AI/cloud investment — premium salaries"); }
      }

      // Pilot — aviation hub bonus, UAE/Singapore/Australia flag carriers
      if (role === "pilot") {
        if (["uae","singapore","australia","ireland","germany","norway","netherlands"].includes(country.slug)) {
          score += 0.6; reasons.push("Major aviation hub — active pilot recruitment"); }
        if (data.visaDifficulty <= 2) { score += 0.3; reasons.push("Employer-sponsored pilot visas available"); }
      }

      // Renewable Energy Engineer — EU green economy bonus
      if (role === "renewableEnergyEngineer") {
        if (["germany","netherlands","denmark","sweden","norway","spain","portugal","austria","finland","belgium"].includes(country.slug)) {
          score += 0.6; reasons.push("EU green energy investment — strong sector growth"); }
        if (["australia","canada","new-zealand","usa"].includes(country.slug)) {
          score += 0.3; reasons.push("Growing renewable energy sector"); }
      }

      // Biomedical Engineer — medtech clusters
      if (role === "biomedicalEngineer") {
        if (["switzerland","germany","singapore","usa","netherlands","ireland"].includes(country.slug)) {
          score += 0.5; reasons.push("Major medtech/pharma cluster — high demand"); }
      }

      // Graphic Designer — creative economy / remote-friendly
      if (role === "graphicDesigner") {
        if (NOMAD_VISA_COUNTRIES.includes(country.slug)) { score += 0.4; reasons.push("Nomad visa — work remotely as a designer"); }
        if (TERRITORIAL_TAX_COUNTRIES.includes(country.slug)) { score += 0.3; reasons.push("Tax efficient for freelance design income"); }
      }

      // Supply Chain Manager — logistics hubs
      if (role === "supplyChainManager") {
        if (["singapore","netherlands","germany","uae","belgium"].includes(country.slug)) {
          score += 0.5; reasons.push("Global logistics hub — top supply chain roles"); }
      }

      // workType bonuses for career path (mirrors remote path)
      if (answers.moveReason === "career") {
        if (answers.workType === "freelancer") {
          if (NOMAD_VISA_COUNTRIES.includes(country.slug)) { score += 0.3; reasons.push("Freelancer-friendly nomad visa"); }
          if (TERRITORIAL_TAX_COUNTRIES.includes(country.slug)) { score += 0.2; reasons.push("Tax efficient for freelance income"); }
        }
        if (answers.workType === "company") {
          if (TERRITORIAL_TAX_COUNTRIES.includes(country.slug)) { score += 0.3; reasons.push("Territorial tax — company profits taxed locally only"); }
          if (["estonia","georgia","portugal","uae","singapore"].includes(country.slug)) { score += 0.3; reasons.push("Strong company formation + low corporate tax"); }
        }
      }
    }

    // ── CITY VIBE ────────────────────────────────────────────────
    if (answers.cityVibe === "big-city" && BIG_CITY_COUNTRIES.includes(country.slug)) {
      score += 0.4; reasons.push("Major global city — matches your vibe");
    }
    if (answers.cityVibe === "coastal" && COASTAL_COUNTRIES.includes(country.slug)) {
      score += 0.4; reasons.push("Coastal lifestyle — beaches and ocean access");
    }
    if (answers.cityVibe === "mid-city" && MID_CITY_COUNTRIES.includes(country.slug)) {
      score += 0.3; reasons.push("Liveable mid-size city — less hectic, great quality of life");
    }

    // ── SHARED BONUSES ───────────────────────────────────────────
    const isEU = EU_PASSPORTS.includes(primarySlug) || (secondarySlug ? EU_PASSPORTS.includes(secondarySlug) : false);
    const euPassportLabel = EU_PASSPORTS.includes(primarySlug) ? "your EU passport" : "your second EU passport";

    if (isEU && EUROPEAN_COUNTRIES.includes(country.slug)) {
      score += 0.5;
      reasons.push(`Free movement with ${euPassportLabel}`);
    }

    // Passport strength bonuses/penalties
    if (strength === 1) {
      // Tier 1: virtually no visa barriers globally → reward high-difficulty countries
      if (data.visaDifficulty >= 3) {
        score += 0.4;
        if (!reasons.some(r => r.toLowerCase().includes("visa"))) {
          reasons.push("Strong passport — minimal visa barriers");
        }
      }
    } else if (strength === 4) {
      // Tier 4: restricted access → penalise hard-to-enter countries further
      if (data.visaDifficulty >= 3) {
        score -= 0.8;
      }
    }

    // Dual passport bonus: access to routes either passport unlocks
    if (hasDual) {
      if (data.visaDifficulty >= 3 && strength <= 2) {
        score += 0.4;
        if (!reasons.some(r => r.toLowerCase().includes("visa") || r.toLowerCase().includes("passport"))) {
          reasons.push("Dual passport unlocks additional visa routes");
        }
      }
      // If one passport is EU and destination is European — already captured above
    }

    if (data.visaDifficulty <= 2 && !reasons.some(r => r.toLowerCase().includes("visa") || r.toLowerCase().includes("movement") || r.toLowerCase().includes("passport"))) {
      reasons.push("Straightforward visa process");
    }
    if (answers.priorities?.includes("english") && ENGLISH_SPEAKING_COUNTRIES.includes(country.slug)) {
      score += 0.4; reasons.push("English-speaking country");
    }
    if (answers.priorities?.includes("healthcare") && STRONG_HEALTHCARE_COUNTRIES.includes(country.slug)) {
      score += 0.3;
      if (!reasons.some((r) => r.toLowerCase().includes("healthcare"))) reasons.push("Strong public healthcare system");
    }
    if (answers.priorities?.includes("internet") && internetScore >= 7.5) {
      score += 0.3;
      if (!reasons.some((r) => r.toLowerCase().includes("internet"))) reasons.push("Fast internet speeds");
    }
    if (answers.priorities?.includes("nature") && NATURE_COUNTRIES.includes(country.slug)) {
      score += 0.4; reasons.push("Stunning nature and outdoor lifestyle");
    }
    if (answers.priorities?.includes("culture") && CULTURE_COUNTRIES.includes(country.slug)) {
      score += 0.35; reasons.push("Rich culture, arts and heritage");
    }
    if (answers.priorities?.includes("startup") && STARTUP_COUNTRIES.includes(country.slug)) {
      score += 0.4; reasons.push("Thriving startup and tech ecosystem");
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
      korean:     { slug: "south-korea", reason: "Your Korean is a huge advantage in South Korea" },
      thai:       { slug: "thailand",    reason: "Your Thai gives you a massive local advantage" },
      vietnamese: { slug: "vietnam",     reason: "Your Vietnamese gives you a huge advantage" },
      malay:      { slug: "malaysia",    reason: "Your Malay is a big advantage in Malaysia" },
      polish:     { slug: "poland",      reason: "Your Polish gives you a big advantage in Poland" },
      romanian:   { slug: "romania",     reason: "Your Romanian gives you a big advantage in Romania" },
      czech:      { slug: "czech-republic", reason: "Your Czech gives you a big advantage" },
      danish:     { slug: "denmark",     reason: "Your Danish gives you a big advantage in Denmark" },
      finnish:    { slug: "finland",     reason: "Your Finnish gives you a big advantage in Finland" },
      georgian:   { slug: "georgia",     reason: "Your Georgian gives you a big advantage in Georgia" },
      hungarian:  { slug: "hungary",     reason: "Your Hungarian gives you a big advantage in Hungary" },
      serbian:    { slug: "serbia",      reason: "Your Serbian gives you a big advantage in Serbia" },
      indonesian: { slug: "indonesia",   reason: "Your Indonesian gives you a huge advantage" },
    };
    Object.entries(languageMap).forEach(([lang, { slug, reason }]) => {
      if (answers.languages?.includes(lang) && country.slug === slug) { score += 0.4; reasons.push(reason); }
    });
    // Mandarin bonus for China too
    if (answers.languages?.includes("mandarin") && country.slug === "china") {
      score += 0.5; reasons.push("Mandarin is the primary language in China");
    }
    if (answers.languages?.includes("french") && country.slug === "canada") {
      score += 0.3; reasons.push("French is a bonus in Canada");
    }

    // warm + lowcrime are now hard filters in the exclusion pass above.
    // Only add positive reason labels here for countries that passed.
    if (dealBreakers.includes("lowcrime")) reasons.push("Very low crime rate");
    if (dealBreakers.includes("warm") && !reasons.some(r => r.toLowerCase().includes("warm") || r.toLowerCase().includes("climate"))) {
      reasons.push("Warm climate");
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

  // ── PERCENT: relative scale with real spread ─────────────────
  const topScore  = results[0]?.matchScore ?? 10;
  const botScore  = results[results.length - 1]?.matchScore ?? 0;
  const scoreSpan = Math.max(topScore - botScore, 0.1);
  results.forEach((r) => {
    // Top match → ~88–95%, last match → ~30–45%, linear in between
    const relative = (r.matchScore - botScore) / scoreSpan;
    const pct = Math.round(30 + relative * 65);
    r.matchPercent = Math.min(95, Math.max(20, pct));
  });

  return results;
}