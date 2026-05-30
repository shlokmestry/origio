// types/cities.ts

export interface Neighbourhood {
  name: string;
  vibe: string;
  avgRent: number;
  goodFor: string[];
}

export interface CityData {
  id: string;
  cityId: string;
  
  // Costs (monthly, in city currency unless noted)
  costRentCityCentre: number;
  costRentOutside: number;
  costGroceriesMonthly: number;
  costTransportMonthly: number;
  costEatingOut: number;
  costUtilitiesMonthly: number;
  costGymMonthly: number;
  costCoworkingMonthly: number;
  
  // Salary example
  salarySoftwareEngineer: number;
  
  // Quality of life scores (0-10)
  scoreQualityOfLife: number;
  scoreSafety: number;
  scoreHealthcare: number;
  scoreInternetSpeed: number;
  scoreWalkability: number;
  scoreNightlife: number;
  scoreExpatFriendliness: number;
  
  // Climate
  climateSummerAvgC: number;
  climateWinterAvgC: number;
  climateRainyDaysPerYear: number;
  climateDescription: string;
  sunHours?: number;
  
  // Neighbourhoods
  neighbourhoods: Neighbourhood[];
  
  // Visa & immigration
  visaNotes: string;
  visaOfficialUrl: string;
  
  // Tax
  incomeTaxRateMid: number;
  localTaxNote: string;
  
  // Meta
  moveScore: number;
  lastVerified: string; // ISO date
  dataSources: string;
}

export interface City {
  id: string;
  slug: string;
  name: string;
  countrySlug: string;
  countryName: string;
  flagEmoji: string;
  continent: string;
  language: string;
  currency: string;
  timezone: string;
  population: string;
  coverImageUrl?: string;
  monumentName?: string;
  monumentImageUrl?: string;
  tagline: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  data: CityData;
}

export interface CityListItem {
  id: string;
  slug: string;
  name: string;
  countryName: string;
  flagEmoji: string;
  continent: string;
  currency: string;
  monumentImageUrl?: string;
  tagline: string;
  city_data: Array<{
    moveScore: number;
    costRentCityCentre: number;
  }>;
}

// Helper type for form/input
export interface CityFormData {
  slug: string;
  name: string;
  countrySlug: string;
  countryName: string;
  flagEmoji: string;
  continent: string;
  language: string;
  currency: string;
  timezone: string;
  population: string;
  coverImageUrl?: string;
  monumentName?: string;
  monumentImageUrl?: string;
  tagline: string;
  latitude?: number;
  longitude?: number;
  data: CityData;
}

// API response types
export interface GetCitiesResponse {
  cities: City[];
  count: number;
}

export interface GetCityResponse {
  city: City;
}

// Filter options
export interface CityFilters {
  continent?: string;
  budgetMin?: number;
  budgetMax?: number;
  safety?: number;
  visaDifficulty?: number;
  moveScoreMin?: number;
  search?: string;
}