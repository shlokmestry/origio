import { describe, it, expect } from "vitest";
import {
  getPassportStrength,
  resolveEffectivePassports,
  scoreCountriesForWizard,
  TO_USD,
  PASSPORT_TIER_LABEL,
} from "@/lib/wizard";
import type { CountryWithData } from "@/types";
import type { WizardAnswers } from "@/lib/wizard";

// ── Fixtures ─────────────────────────────────────────────────────────────────

function makeData(overrides: Partial<CountryWithData["data"]> = {}): CountryWithData["data"] {
  return {
    id: "d1", countryId: "c1",
    salarySoftwareEngineer: 80000, salaryNurse: 40000, salaryTeacher: 35000,
    salaryAccountant: 45000, salaryMarketingManager: 50000, salaryDoctor: 80000,
    salaryDataScientist: 85000, salaryProductManager: 90000, salaryUXDesigner: 70000,
    salaryDevOps: 85000, salaryCivilEngineer: 60000, salaryFinancialAnalyst: 70000,
    salaryLawyer: 90000, salaryPharmacist: 65000, salaryArchitect: 55000,
    salaryHRManager: 50000, salarySalesManager: 60000, salaryCybersecurity: 90000,
    salaryElectrician: 45000, salaryChef: 35000, salaryAiMlEngineer: 110000,
    salaryCloudArchitect: 105000, salaryDentist: 80000, salaryPhysiotherapist: 55000,
    salaryPsychologist: 65000, salaryRenewableEnergyEngineer: 70000, salaryPilot: 100000,
    salaryGraphicDesigner: 50000, salaryBiomedicalEngineer: 75000, salarySupplyChainManager: 65000,
    costRentCityCentre: 1500, costRentOutside: 1000, costGroceriesMonthly: 300,
    costTransportMonthly: 100, costUtilitiesMonthly: 150, costEatingOut: 15,
    scoreQualityOfLife: 7.5, scoreHealthcare: 8, scoreSafety: 8, scoreCrimeRate: 3,
    scoreInternetSpeed: 8, incomeTaxRateMid: 25, socialSecurityRate: 10,
    visaDifficulty: 2, visaNotes: "", visaPopularRoutes: [], visaOfficialUrl: "",
    moveScore: 0, lastVerified: "2025-01-01",
    ...overrides,
  };
}

function makeCountry(slug: string, overrides: Partial<CountryWithData["data"]> = {}): CountryWithData {
  return {
    id: slug, slug, name: slug, flagEmoji: "🏳️",
    continent: "Europe", lat: 0, lng: 0, currency: "USD", language: "English",
    data: makeData(overrides),
  };
}

const baseAnswers: WizardAnswers = {
  passport: "ireland",
  moveReason: "career",
  jobRole: "softwareEngineer",
  priorities: [],
  cityVibe: "big-city",
  rentBudget: "any",
  languages: [],
  dealBreakers: [],
};

// ── getPassportStrength ───────────────────────────────────────────────────────

describe("getPassportStrength", () => {
  it("tier 1 passport → 1", () => expect(getPassportStrength("germany")).toBe(1));
  it("tier 2 passport → 2", () => expect(getPassportStrength("brazil")).toBe(2));
  it("tier 3 passport → 3", () => expect(getPassportStrength("india")).toBe(3));
  it("tier 4 passport → 4", () => expect(getPassportStrength("nigeria")).toBe(4));
  it("unknown slug → 3 (default)", () => expect(getPassportStrength("atlantis")).toBe(3));
  it("usa = tier 1", () => expect(getPassportStrength("usa")).toBe(1));
});

describe("PASSPORT_TIER_LABEL", () => {
  it("has labels for all 4 tiers", () => {
    expect(PASSPORT_TIER_LABEL[1]).toContain("180+");
    expect(PASSPORT_TIER_LABEL[4]).toContain("100");
  });
});

// ── resolveEffectivePassports ─────────────────────────────────────────────────

describe("resolveEffectivePassports", () => {
  it("no secondary → returns primary unchanged", () => {
    expect(resolveEffectivePassports("ireland")).toEqual({ primary: "ireland" });
  });

  it("primary no-dual + valid secondary → keep secondary only", () => {
    // india can't hold dual — if paired with ireland, india is renounced
    expect(resolveEffectivePassports("india", "ireland")).toEqual({ primary: "ireland" });
  });

  it("valid primary + no-dual secondary → drop secondary", () => {
    expect(resolveEffectivePassports("ireland", "japan")).toEqual({ primary: "ireland" });
  });

  it("both allow dual → keep both", () => {
    const result = resolveEffectivePassports("ireland", "germany");
    expect(result.primary).toBe("ireland");
    expect(result.secondary).toBe("germany");
  });

  it("no secondary → secondary is undefined", () => {
    expect(resolveEffectivePassports("germany").secondary).toBeUndefined();
  });
});

// ── TO_USD ────────────────────────────────────────────────────────────────────

describe("TO_USD", () => {
  it("USD → 1", () => expect(TO_USD["USD"]).toBe(1));
  it("all values > 0", () => {
    Object.entries(TO_USD).forEach(([, v]) => expect(v).toBeGreaterThan(0));
  });
});

// ── scoreCountriesForWizard ───────────────────────────────────────────────────

describe("scoreCountriesForWizard", () => {
  it("returns array sorted by matchScore descending", () => {
    const countries = [
      makeCountry("usa", { salarySoftwareEngineer: 120000, incomeTaxRateMid: 25 }),
      makeCountry("vietnam", { salarySoftwareEngineer: 20000, incomeTaxRateMid: 20 }),
      makeCountry("germany", { salarySoftwareEngineer: 90000, incomeTaxRateMid: 42 }),
    ];
    const results = scoreCountriesForWizard(countries, baseAnswers);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].matchScore).toBeGreaterThanOrEqual(results[i].matchScore);
    }
  });

  it("all matchScores between 0 and 10", () => {
    const countries = [makeCountry("germany"), makeCountry("portugal"), makeCountry("singapore")];
    const results = scoreCountriesForWizard(countries, baseAnswers);
    results.forEach((r) => {
      expect(r.matchScore).toBeGreaterThanOrEqual(0);
      expect(r.matchScore).toBeLessThanOrEqual(10);
    });
  });

  it("all matchPercents between 20 and 95", () => {
    const countries = [makeCountry("germany"), makeCountry("portugal"), makeCountry("singapore")];
    const results = scoreCountriesForWizard(countries, baseAnswers);
    results.forEach((r) => {
      expect(r.matchPercent).toBeGreaterThanOrEqual(20);
      expect(r.matchPercent).toBeLessThanOrEqual(95);
    });
  });

  it("excludes current country (passport = home slug)", () => {
    const countries = [makeCountry("ireland"), makeCountry("germany")];
    const results = scoreCountriesForWizard(countries, { ...baseAnswers, passport: "ireland" });
    expect(results.find((r) => r.country.slug === "ireland")).toBeUndefined();
  });

  it("excludes currentCountry when set explicitly", () => {
    const countries = [makeCountry("portugal"), makeCountry("germany")];
    const results = scoreCountriesForWizard(countries, {
      ...baseAnswers, passport: "ireland", currentCountry: "portugal",
    });
    expect(results.find((r) => r.country.slug === "portugal")).toBeUndefined();
  });

  it("dealBreaker 'english' filters out non-English countries", () => {
    const countries = [makeCountry("germany"), makeCountry("australia")];
    const results = scoreCountriesForWizard(countries, {
      ...baseAnswers, passport: "india", dealBreakers: ["english"],
    });
    expect(results.find((r) => r.country.slug === "germany")).toBeUndefined();
    expect(results.find((r) => r.country.slug === "australia")).toBeDefined();
  });

  it("dealBreaker 'lowtax' filters out high-tax countries", () => {
    const countries = [makeCountry("sweden"), makeCountry("uae")];
    const results = scoreCountriesForWizard(countries, { ...baseAnswers, dealBreakers: ["lowtax"] });
    expect(results.find((r) => r.country.slug === "sweden")).toBeUndefined();
    expect(results.find((r) => r.country.slug === "uae")).toBeDefined();
  });

  it("dealBreaker 'lowcrime' filters out unsafe countries (safety < 6)", () => {
    const dangerous = makeCountry("fakeland", { scoreSafety: 4 });
    const safe = makeCountry("switzerland", { scoreSafety: 9 });
    const results = scoreCountriesForWizard([dangerous, safe], {
      ...baseAnswers, dealBreakers: ["lowcrime"],
    });
    expect(results.find((r) => r.country.slug === "fakeland")).toBeUndefined();
    expect(results.find((r) => r.country.slug === "switzerland")).toBeDefined();
  });

  it("rent budget hard filter blocks countries >20% over budget", () => {
    // under800 → max $800, 20% tolerance = $960
    const expensive = makeCountry("london", { costRentCityCentre: 3000 }); // USD currency assumed
    const cheap = makeCountry("tbilisi", { costRentCityCentre: 600 });
    const results = scoreCountriesForWizard([expensive, cheap], {
      ...baseAnswers, rentBudget: "under800",
    });
    expect(results.find((r) => r.country.slug === "london")).toBeUndefined();
    expect(results.find((r) => r.country.slug === "tbilisi")).toBeDefined();
  });

  it("EU passport + European country → EU free movement reason", () => {
    const results = scoreCountriesForWizard([makeCountry("germany")], {
      ...baseAnswers, passport: "ireland",
    });
    const reasons = results[0]?.reasons ?? [];
    expect(reasons.some((r) => r.toLowerCase().includes("eu") || r.toLowerCase().includes("movement"))).toBe(true);
  });

  it("retire path: retirement visa countries score higher bonus", () => {
    const portugal = makeCountry("portugal");
    const japan = makeCountry("japan");
    const results = scoreCountriesForWizard([portugal, japan], {
      ...baseAnswers, moveReason: "retire",
    });
    const ptScore = results.find((r) => r.country.slug === "portugal")!.matchScore;
    const jpScore = results.find((r) => r.country.slug === "japan")!.matchScore;
    // portugal has retirement visa bonus (+0.8) + territorial tax (+0.6)
    expect(ptScore).toBeGreaterThan(jpScore);
  });

  it("remote path: nomad visa countries get bonus", () => {
    const portugal = makeCountry("portugal");
    const australia = makeCountry("australia");
    const results = scoreCountriesForWizard([portugal, australia], {
      ...baseAnswers, moveReason: "remote",
    });
    const ptScore = results.find((r) => r.country.slug === "portugal")!.matchScore;
    const auScore = results.find((r) => r.country.slug === "australia")!.matchScore;
    expect(ptScore).toBeGreaterThan(auScore);
  });

  it("tier 4 passport penalises high visa-difficulty countries", () => {
    const hard = makeCountry("hardland", { visaDifficulty: 4 });
    const easy = makeCountry("easyland", { visaDifficulty: 1 });
    const resultsStrong = scoreCountriesForWizard([hard, easy], { ...baseAnswers, passport: "germany" });
    const resultsWeak = scoreCountriesForWizard([hard, easy], { ...baseAnswers, passport: "nigeria" });
    const spreadStrong = resultsStrong.find(r => r.country.slug === "easyland")!.matchScore
                       - resultsStrong.find(r => r.country.slug === "hardland")!.matchScore;
    const spreadWeak = resultsWeak.find(r => r.country.slug === "easyland")!.matchScore
                     - resultsWeak.find(r => r.country.slug === "hardland")!.matchScore;
    // weak passport amplifies the gap between easy and hard visa countries
    expect(spreadWeak).toBeGreaterThan(spreadStrong);
  });

  it("language bonus applied for matching language", () => {
    const withLang = scoreCountriesForWizard([makeCountry("germany")], {
      ...baseAnswers, passport: "usa", languages: ["german"],
    });
    const withoutLang = scoreCountriesForWizard([makeCountry("germany")], {
      ...baseAnswers, passport: "usa", languages: [],
    });
    expect(withLang[0].matchScore).toBeGreaterThan(withoutLang[0].matchScore);
  });

  it("returns empty array when all countries excluded", () => {
    const results = scoreCountriesForWizard(
      [makeCountry("sweden")],
      { ...baseAnswers, dealBreakers: ["lowtax"] },
    );
    expect(results).toHaveLength(0);
  });

  it("single country: matchPercent between 20 and 95", () => {
    const results = scoreCountriesForWizard([makeCountry("germany")], baseAnswers);
    expect(results[0].matchPercent).toBeGreaterThanOrEqual(20);
    expect(results[0].matchPercent).toBeLessThanOrEqual(95);
  });

  it("top-ranked of multiple countries gets matchPercent >= bottom", () => {
    const results = scoreCountriesForWizard(
      [makeCountry("usa", { salarySoftwareEngineer: 120000 }), makeCountry("vietnam", { salarySoftwareEngineer: 15000 })],
      baseAnswers,
    );
    expect(results[0].matchPercent).toBeGreaterThanOrEqual(results[results.length - 1].matchPercent);
  });

  it("reasons list capped at 3", () => {
    const results = scoreCountriesForWizard([makeCountry("portugal")], {
      ...baseAnswers, moveReason: "remote", languages: ["portuguese"],
      priorities: ["nature", "culture", "startup"],
    });
    expect(results[0].reasons.length).toBeLessThanOrEqual(3);
  });
});
