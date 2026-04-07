// lib/mappers.ts
import { CountryWithData } from '@/types'

export function mapRowToCountry(c: any, d: any): CountryWithData {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    flagEmoji: c.flag_emoji,
    continent: c.continent,
    lat: c.lat,
    lng: c.lng,
    currency: c.currency,
    language: c.language,
    data: {
      id: d.id,
      countryId: d.country_id,
      salarySoftwareEngineer: d.salary_software_engineer,
      salaryNurse: d.salary_nurse,
      salaryTeacher: d.salary_teacher,
      salaryAccountant: d.salary_accountant,
      salaryMarketingManager: d.salary_marketing_manager,
      costRentCityCentre: d.cost_rent_city_centre,
      costRentOutside: d.cost_rent_outside,
      costGroceriesMonthly: d.cost_groceries_monthly,
      costTransportMonthly: d.cost_transport_monthly,
      costUtilitiesMonthly: d.cost_utilities_monthly,
      costEatingOut: d.cost_eating_out,
      scoreQualityOfLife: d.score_quality_of_life,
      scoreHealthcare: d.score_healthcare,
      scoreSafety: d.score_safety,
      scoreInternetSpeed: d.score_internet_speed,
      incomeTaxRateMid: d.income_tax_rate_mid,
      socialSecurityRate: d.social_security_rate,
      visaDifficulty: d.visa_difficulty,
      visaNotes: d.visa_notes,
      visaPopularRoutes: d.visa_popular_routes,
      visaOfficialUrl: d.visa_official_url,
      moveScore: d.move_score,
      lastVerified: d.last_verified,
    },
  }
}