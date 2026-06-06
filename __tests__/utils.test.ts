import { describe, it, expect } from "vitest";
import {
  normalise,
  isValidEmail,
  sanitizeForPrompt,
  getVisaLabel,
  getVisaColor,
  getScoreColor,
  calculateMoveScore,
} from "@/lib/utils";

describe("normalise", () => {
  it("clamps to 0 below min", () => expect(normalise(0, 100, 200)).toBe(0));
  it("clamps to 10 above max", () => expect(normalise(300, 100, 200)).toBe(10));
  it("midpoint → 5", () => expect(normalise(150, 100, 200)).toBe(5));
  it("exact min → 0", () => expect(normalise(100, 100, 200)).toBe(0));
  it("exact max → 10", () => expect(normalise(200, 100, 200)).toBe(10));
});

describe("isValidEmail", () => {
  it("valid email passes", () => expect(isValidEmail("user@example.com")).toBe(true));
  it("no @ fails", () => expect(isValidEmail("userexample.com")).toBe(false));
  it("no domain fails", () => expect(isValidEmail("user@")).toBe(false));
  it("short TLD fails", () => expect(isValidEmail("user@x.c")).toBe(false));
  it("too long fails", () => expect(isValidEmail("a".repeat(255) + "@b.com")).toBe(false));
});

describe("sanitizeForPrompt", () => {
  it("strips < > { } [ ]", () => {
    expect(sanitizeForPrompt("<script>{alert}</script>")).not.toMatch(/[<>{}[\]]/);
  });
  it("truncates at maxLen", () => {
    expect(sanitizeForPrompt("a".repeat(200), 50)).toHaveLength(50);
  });
  it("returns empty string for non-string", () => {
    expect(sanitizeForPrompt(42)).toBe("");
  });
  it("collapses newlines to space", () => {
    expect(sanitizeForPrompt("line1\nline2")).toBe("line1 line2");
  });
});

describe("getVisaLabel", () => {
  it("0 → Very Easy", () => expect(getVisaLabel(0)).toBe("Very Easy"));
  it("1 → Very Easy", () => expect(getVisaLabel(1)).toBe("Very Easy"));
  it("2 → Easy", () => expect(getVisaLabel(2)).toBe("Easy"));
  it("3 → Moderate", () => expect(getVisaLabel(3)).toBe("Moderate"));
  it("4 → Difficult", () => expect(getVisaLabel(4)).toBe("Difficult"));
  it("5 → Very Difficult", () => expect(getVisaLabel(5)).toBe("Very Difficult"));
});

describe("getVisaColor", () => {
  it("easy = green", () => expect(getVisaColor(1)).toBe("#4ade80"));
  it("very difficult = red", () => expect(getVisaColor(5)).toBe("#f87171"));
});

describe("getScoreColor", () => {
  it("7+ → green", () => expect(getScoreColor(7)).toBe("#4ade80"));
  it("4.5–6.9 → yellow", () => expect(getScoreColor(5)).toBe("#facc15"));
  it("<4.5 → red", () => expect(getScoreColor(3)).toBe("#f87171"));
});

describe("calculateMoveScore", () => {
  const base = {
    id: "1", countryId: "1",
    salarySoftwareEngineer: 90000, salaryNurse: 40000, salaryTeacher: 35000,
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
    scoreQualityOfLife: 8, scoreHealthcare: 8, scoreSafety: 8, scoreCrimeRate: 3,
    scoreInternetSpeed: 8, incomeTaxRateMid: 30, socialSecurityRate: 10,
    visaDifficulty: 2, visaNotes: "", visaPopularRoutes: [], visaOfficialUrl: "",
    moveScore: 0, lastVerified: "2025-01-01",
  };

  it("returns a number between 0 and 10", () => {
    const score = calculateMoveScore(base);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(10);
  });

  it("higher salary → higher score", () => {
    const low = calculateMoveScore({ ...base, salarySoftwareEngineer: 30000 });
    const high = calculateMoveScore({ ...base, salarySoftwareEngineer: 150000 });
    expect(high).toBeGreaterThan(low);
  });

  it("lower rent → higher score", () => {
    const cheap = calculateMoveScore({ ...base, costRentCityCentre: 400 });
    const expensive = calculateMoveScore({ ...base, costRentCityCentre: 4000 });
    expect(cheap).toBeGreaterThan(expensive);
  });
});
