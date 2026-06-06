import { describe, it, expect } from "vitest";
import { mapRowToCountry } from "@/lib/mappers";

const baseCountryRow = {
  id: "abc", slug: "germany", name: "Germany", flag_emoji: "🇩🇪",
  continent: "Europe", lat: 51.1, lng: 10.4, currency: "EUR", language: "German",
};

const baseDataRow = {
  id: "d1", country_id: "abc",
  salary_software_engineer: 80000, salary_nurse: 38000, salary_teacher: 36000,
  salary_accountant: 42000, salary_marketing_manager: 52000, salary_doctor: 85000,
  salary_data_scientist: 78000, salary_product_manager: 88000, salary_ux_designer: 65000,
  salary_devops: 80000, salary_civil_engineer: 58000, salary_financial_analyst: 68000,
  salary_lawyer: 85000, salary_pharmacist: 62000, salary_architect: 54000,
  salary_hr_manager: 48000, salary_sales_manager: 58000, salary_cybersecurity: 82000,
  salary_electrician: 44000, salary_chef: 34000,
  salary_ai_ml_engineer: 105000, salary_cloud_architect: 100000,
  salary_dentist: 78000, salary_physiotherapist: 52000, salary_psychologist: 62000,
  salary_renewable_energy_engineer: 68000, salary_pilot: 95000,
  salary_graphic_designer: 48000, salary_biomedical_engineer: 72000,
  salary_supply_chain_manager: 62000,
  cost_rent_city_centre: 1400, cost_rent_outside: 900, cost_groceries_monthly: 280,
  cost_transport_monthly: 90, cost_utilities_monthly: 140, cost_eating_out: 14,
  score_quality_of_life: 8.2, score_healthcare: 9.0, score_safety: 8.5, score_crime_rate: 2.5,
  score_internet_speed: 8.0, income_tax_rate_mid: 42, social_security_rate: 20,
  visa_difficulty: 2, visa_notes: "Skilled worker visa available",
  visa_popular_routes: ["skilled-worker", "eu-blue-card"], visa_official_url: "https://example.com",
  move_score: 7.2, last_verified: "2025-01-15",
};

describe("mapRowToCountry", () => {
  it("maps country fields correctly", () => {
    const result = mapRowToCountry(baseCountryRow, baseDataRow);
    expect(result.id).toBe("abc");
    expect(result.slug).toBe("germany");
    expect(result.name).toBe("Germany");
    expect(result.flagEmoji).toBe("🇩🇪");
    expect(result.continent).toBe("Europe");
    expect(result.lat).toBe(51.1);
    expect(result.lng).toBe(10.4);
    expect(result.currency).toBe("EUR");
    expect(result.language).toBe("German");
  });

  it("maps salary fields correctly", () => {
    const result = mapRowToCountry(baseCountryRow, baseDataRow);
    expect(result.data.salarySoftwareEngineer).toBe(80000);
    expect(result.data.salaryDoctor).toBe(85000);
    expect(result.data.salaryAiMlEngineer).toBe(105000);
    expect(result.data.salaryPilot).toBe(95000);
  });

  it("maps cost fields correctly", () => {
    const result = mapRowToCountry(baseCountryRow, baseDataRow);
    expect(result.data.costRentCityCentre).toBe(1400);
    expect(result.data.costGroceriesMonthly).toBe(280);
  });

  it("maps score fields correctly", () => {
    const result = mapRowToCountry(baseCountryRow, baseDataRow);
    expect(result.data.scoreQualityOfLife).toBe(8.2);
    expect(result.data.scoreHealthcare).toBe(9.0);
    expect(result.data.scoreSafety).toBe(8.5);
    expect(result.data.scoreInternetSpeed).toBe(8.0);
  });

  it("maps visa fields correctly", () => {
    const result = mapRowToCountry(baseCountryRow, baseDataRow);
    expect(result.data.visaDifficulty).toBe(2);
    expect(result.data.visaNotes).toBe("Skilled worker visa available");
    expect(result.data.visaPopularRoutes).toEqual(["skilled-worker", "eu-blue-card"]);
  });

  it("defaults nullable salary fields to 0 when null", () => {
    const result = mapRowToCountry(baseCountryRow, {
      ...baseDataRow,
      salary_ai_ml_engineer: null,
      salary_cloud_architect: undefined,
      salary_pilot: null,
    });
    expect(result.data.salaryAiMlEngineer).toBe(0);
    expect(result.data.salaryCloudArchitect).toBe(0);
    expect(result.data.salaryPilot).toBe(0);
  });

  it("defaults score_crime_rate to 0 when null", () => {
    const result = mapRowToCountry(baseCountryRow, { ...baseDataRow, score_crime_rate: null });
    expect(result.data.scoreCrimeRate).toBe(0);
  });

  it("data.countryId matches country id", () => {
    const result = mapRowToCountry(baseCountryRow, baseDataRow);
    expect(result.data.countryId).toBe(result.id);
  });
});
