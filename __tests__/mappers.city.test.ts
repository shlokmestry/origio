import { describe, it, expect } from "vitest";
import { mapRowToCity } from "@/lib/mappers";

const baseCityRow = {
  id: "c1", slug: "berlin", name: "Berlin",
  country_slug: "germany", country_name: "Germany", flag_emoji: "🇩🇪",
  continent: "Europe", language: "German", currency: "EUR",
  timezone: "Europe/Berlin", population: "3.7M",
  cover_image_url: "https://example.com/berlin.jpg",
  tagline: "The city that never sleeps",
  city_data: [{
    cost_rent_city_centre: 1400, cost_rent_outside: 900, cost_groceries_monthly: 280,
    cost_transport_monthly: 90, cost_eating_out: 14, cost_utilities_monthly: 130,
    cost_gym_monthly: 35, cost_coworking_monthly: 200,
    salary_software_engineer: 80000, salary_doctor: 85000, salary_nurse: 38000,
    salary_data_scientist: 75000, salary_product_manager: 85000, salary_devops: 78000,
    salary_cybersecurity: 80000, salary_ux_designer: 65000, salary_financial_analyst: 65000,
    salary_lawyer: 80000, salary_architect: 52000, salary_civil_engineer: 56000,
    salary_pharmacist: 60000, salary_teacher: 34000, salary_accountant: 42000,
    salary_hr_manager: 46000, salary_sales_manager: 56000, salary_marketing_manager: 50000,
    salary_electrician: 42000, salary_chef: 32000,
    salary_ai_ml_engineer: 100000, salary_cloud_architect: 95000, salary_dentist: 75000,
    salary_physiotherapist: 50000, salary_psychologist: 60000,
    salary_renewable_energy_engineer: 65000, salary_pilot: 90000,
    salary_graphic_designer: 46000, salary_biomedical_engineer: 70000,
    salary_supply_chain_manager: 60000,
    score_quality_of_life: 8.0, score_safety: 8.5, score_healthcare: 9.0,
    score_internet_speed: 8.0, score_walkability: 8.5, score_nightlife: 9.0,
    score_expat_friendliness: 8.0,
    climate_summer_avg_c: 24, climate_winter_avg_c: 2,
    climate_rainy_days_per_year: 106, climate_description: "Continental",
    neighbourhoods: [{ name: "Mitte", vibe: "Central", avgRent: 1800, goodFor: ["professionals"] }],
    visa_notes: "EU Blue Card available", visa_official_url: "https://example.com",
    income_tax_rate_mid: 42, local_tax_note: "Church tax optional",
    move_score: 7.5, last_verified: "2025-01-01", data_sources: ["numbeo"],
  }],
};

describe("mapRowToCity", () => {
  it("maps top-level city fields", () => {
    const result = mapRowToCity(baseCityRow);
    expect(result.id).toBe("c1");
    expect(result.slug).toBe("berlin");
    expect(result.name).toBe("Berlin");
    expect(result.countrySlug).toBe("germany");
    expect(result.currency).toBe("EUR");
    expect(result.timezone).toBe("Europe/Berlin");
  });

  it("maps cost fields from city_data", () => {
    const result = mapRowToCity(baseCityRow);
    expect(result.data.costRentCityCentre).toBe(1400);
    expect(result.data.costGymMonthly).toBe(35);
    expect(result.data.costCoworkingMonthly).toBe(200);
  });

  it("maps salary fields", () => {
    const result = mapRowToCity(baseCityRow);
    expect(result.data.salarySoftwareEngineer).toBe(80000);
    expect(result.data.salaryAiMlEngineer).toBe(100000);
    expect(result.data.salaryPilot).toBe(90000);
  });

  it("maps score fields", () => {
    const result = mapRowToCity(baseCityRow);
    expect(result.data.scoreWalkability).toBe(8.5);
    expect(result.data.scoreNightlife).toBe(9.0);
    expect(result.data.scoreExpatFriendliness).toBe(8.0);
  });

  it("maps climate fields", () => {
    const result = mapRowToCity(baseCityRow);
    expect(result.data.climateSummerAvgC).toBe(24);
    expect(result.data.climateWinterAvgC).toBe(2);
    expect(result.data.climateDescription).toBe("Continental");
  });

  it("maps neighbourhoods array", () => {
    const result = mapRowToCity(baseCityRow);
    expect(result.data.neighbourhoods).toHaveLength(1);
    expect(result.data.neighbourhoods[0].name).toBe("Mitte");
  });

  it("defaults nullable salary fields to 0 when null", () => {
    const row = {
      ...baseCityRow,
      city_data: [{ ...baseCityRow.city_data[0], salary_ai_ml_engineer: null, salary_pilot: null }],
    };
    const result = mapRowToCity(row);
    expect(result.data.salaryAiMlEngineer).toBe(0);
    expect(result.data.salaryPilot).toBe(0);
  });

  it("handles missing city_data gracefully", () => {
    const row = { ...baseCityRow, city_data: [] };
    const result = mapRowToCity(row);
    expect(result.data.costRentCityCentre).toBeUndefined();
    expect(result.data.neighbourhoods).toEqual([]);
  });

  it("uses null for missing cover_image_url", () => {
    const row = { ...baseCityRow, cover_image_url: undefined };
    const result = mapRowToCity(row);
    expect(result.coverImageUrl).toBeNull();
  });
});
