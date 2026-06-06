import { describe, it, expect } from "vitest";
import { scoreCountriesForWizard } from "@/lib/wizard";
import type { CountryWithData } from "@/types";
import type { WizardAnswers } from "@/lib/wizard";

// Fixed country set — represents real data shape without hitting DB.
// If scoring weights change, this snapshot will fail and force a deliberate update.

function country(slug: string, overrides: Partial<CountryWithData["data"]> = {}): CountryWithData {
  const defaults: CountryWithData["data"] = {
    id: slug, countryId: slug,
    salarySoftwareEngineer: 70000, salaryNurse: 38000, salaryTeacher: 34000,
    salaryAccountant: 42000, salaryMarketingManager: 50000, salaryDoctor: 82000,
    salaryDataScientist: 75000, salaryProductManager: 85000, salaryUXDesigner: 65000,
    salaryDevOps: 78000, salaryCivilEngineer: 56000, salaryFinancialAnalyst: 65000,
    salaryLawyer: 80000, salaryPharmacist: 60000, salaryArchitect: 52000,
    salaryHRManager: 46000, salarySalesManager: 56000, salaryCybersecurity: 80000,
    salaryElectrician: 42000, salaryChef: 32000, salaryAiMlEngineer: 100000,
    salaryCloudArchitect: 95000, salaryDentist: 75000, salaryPhysiotherapist: 50000,
    salaryPsychologist: 60000, salaryRenewableEnergyEngineer: 65000, salaryPilot: 90000,
    salaryGraphicDesigner: 46000, salaryBiomedicalEngineer: 70000, salarySupplyChainManager: 60000,
    costRentCityCentre: 1200, costRentOutside: 800, costGroceriesMonthly: 280,
    costTransportMonthly: 90, costUtilitiesMonthly: 130, costEatingOut: 12,
    scoreQualityOfLife: 7.5, scoreHealthcare: 7.5, scoreSafety: 7.5, scoreCrimeRate: 3,
    scoreInternetSpeed: 7.5, incomeTaxRateMid: 30, socialSecurityRate: 12,
    visaDifficulty: 2, visaNotes: "", visaPopularRoutes: [], visaOfficialUrl: "",
    moveScore: 7, lastVerified: "2025-01-01",
  };
  return {
    id: slug, slug, name: slug, flagEmoji: "🏳️",
    continent: "World", lat: 0, lng: 0, currency: "USD", language: "English",
    data: { ...defaults, ...overrides },
  };
}

const countries = [
  country("germany",        { salarySoftwareEngineer: 85000, incomeTaxRateMid: 42, scoreQualityOfLife: 8.0, scoreSafety: 8.5, visaDifficulty: 2 }),
  country("portugal",       { salarySoftwareEngineer: 45000, incomeTaxRateMid: 28, scoreQualityOfLife: 7.8, scoreSafety: 8.8, visaDifficulty: 2, costRentCityCentre: 1100 }),
  country("singapore",      { salarySoftwareEngineer: 110000, incomeTaxRateMid: 17, scoreQualityOfLife: 8.5, scoreSafety: 9.5, visaDifficulty: 3, costRentCityCentre: 2800 }),
  country("uae",            { salarySoftwareEngineer: 95000, incomeTaxRateMid: 0, scoreQualityOfLife: 7.5, scoreSafety: 8.8, visaDifficulty: 3, costRentCityCentre: 2200 }),
  country("vietnam",        { salarySoftwareEngineer: 18000, incomeTaxRateMid: 20, scoreQualityOfLife: 6.5, scoreSafety: 7.0, visaDifficulty: 2, costRentCityCentre: 500 }),
];

const answers: WizardAnswers = {
  passport: "united-kingdom",
  moveReason: "career",
  jobRole: "softwareEngineer",
  priorities: ["salary", "tax"],
  cityVibe: "big-city",
  rentBudget: "any",
  languages: [],
  dealBreakers: [],
};

describe("scoreCountriesForWizard snapshot", () => {
  it("ranking order is stable — update deliberately if weights change", () => {
    const results = scoreCountriesForWizard(countries, answers);
    const ranking = results.map(r => r.country.slug);
    expect(ranking).toMatchSnapshot();
  });

  it("matchScores are stable to 2dp — update deliberately if weights change", () => {
    const results = scoreCountriesForWizard(countries, answers);
    const scores = results.map(r => ({ slug: r.country.slug, score: Math.round(r.matchScore * 100) / 100 }));
    expect(scores).toMatchSnapshot();
  });

  it("remote path ranking is stable", () => {
    const results = scoreCountriesForWizard(countries, { ...answers, moveReason: "remote" });
    expect(results.map(r => r.country.slug)).toMatchSnapshot();
  });

  it("retire path ranking is stable", () => {
    const results = scoreCountriesForWizard(countries, { ...answers, moveReason: "retire" });
    expect(results.map(r => r.country.slug)).toMatchSnapshot();
  });
});
