export interface Country {
  id: string;
  slug: string;
  name: string;
  flagEmoji: string;
  continent: string;
  lat: number;
  lng: number;
  currency: string;
  language: string;
}

export interface CountryData {
  id: string;
  countryId: string;
  salarySoftwareEngineer: number;
  salaryNurse: number;
  salaryTeacher: number;
  salaryAccountant: number;
  salaryMarketingManager: number;
  costRentCityCentre: number;
  costRentOutside: number;
  costGroceriesMonthly: number;
  costTransportMonthly: number;
  costUtilitiesMonthly: number;
  costEatingOut: number;
  scoreQualityOfLife: number;
  scoreHealthcare: number;
  scoreSafety: number;
  scoreInternetSpeed: number;
  incomeTaxRateMid: number;
  socialSecurityRate: number;
  visaDifficulty: number;
  visaNotes: string;
  visaPopularRoutes: string[];
  visaOfficialUrl: string;
  moveScore: number;
  lastVerified: string;
}

export interface CountryWithData extends Country {
  data: CountryData;
}

export interface GlobeCountry {
  slug: string;
  name: string;
  flagEmoji: string;
  lat: number;
  lng: number;
  moveScore: number;
  salarySoftwareEngineer: number;
  costRentCityCentre: number;
  scoreQualityOfLife: number;
  visaDifficulty: number;
}

export interface ScoreBreakdown {
  label: string;
  value: number;
  maxValue: number;
  weight: number;
  color: string;
}

export type JobRole =
  | "software_engineer"
  | "nurse"
  | "teacher"
  | "accountant"
  | "marketing_manager";

export const JOB_ROLE_LABELS: Record<JobRole, string> = {
  software_engineer: "Software Engineer",
  nurse: "Nurse",
  teacher: "Teacher",
  accountant: "Accountant",
  marketing_manager: "Marketing Manager",
};

export const JOB_ROLE_SALARY_KEYS: Record<JobRole, keyof CountryData> = {
  software_engineer: "salarySoftwareEngineer",
  nurse: "salaryNurse",
  teacher: "salaryTeacher",
  accountant: "salaryAccountant",
  marketing_manager: "salaryMarketingManager",
};