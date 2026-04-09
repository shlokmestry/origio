// types/index.ts

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
  salaryDoctor: number;
  salaryDataScientist: number;
  salaryProductManager: number;
  salaryUXDesigner: number;
  salaryDevOps: number;
  salaryCivilEngineer: number;
  salaryFinancialAnalyst: number;
  salaryLawyer: number;
  salaryPharmacist: number;
  salaryArchitect: number;
  salaryHRManager: number;
  salarySalesManager: number;
  salaryCybersecurity: number;
  salaryElectrician: number;
  salaryChef: number;
  costRentCityCentre: number;
  costRentOutside: number;
  costGroceriesMonthly: number;
  costTransportMonthly: number;
  costUtilitiesMonthly: number;
  costEatingOut: number;
  scoreQualityOfLife: number;
  scoreHealthcare: number;
  scoreSafety: number;
  scoreCrimeRate: number;
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
  | "softwareEngineer"
  | "nurse"
  | "teacher"
  | "accountant"
  | "marketingManager"
  | "doctor"
  | "dataScientist"
  | "productManager"
  | "uxDesigner"
  | "devOps"
  | "civilEngineer"
  | "financialAnalyst"
  | "lawyer"
  | "pharmacist"
  | "architect"
  | "hrManager"
  | "salesManager"
  | "cybersecurity"
  | "electrician"
  | "chef"

export const JOB_ROLES: {
  key: JobRole;
  label: string;
  emoji: string;
  salaryKey: keyof CountryData;
}[] = [
  { key: "softwareEngineer", label: "Software Engineer", emoji: "💻", salaryKey: "salarySoftwareEngineer" },
  { key: "doctor", label: "Doctor", emoji: "🩺", salaryKey: "salaryDoctor" },
  { key: "nurse", label: "Nurse", emoji: "🏥", salaryKey: "salaryNurse" },
  { key: "dataScientist", label: "Data Scientist", emoji: "📊", salaryKey: "salaryDataScientist" },
  { key: "productManager", label: "Product Manager", emoji: "🗂️", salaryKey: "salaryProductManager" },
  { key: "devOps", label: "DevOps Engineer", emoji: "⚙️", salaryKey: "salaryDevOps" },
  { key: "cybersecurity", label: "Cybersecurity", emoji: "🔐", salaryKey: "salaryCybersecurity" },
  { key: "uxDesigner", label: "UX Designer", emoji: "🎨", salaryKey: "salaryUXDesigner" },
  { key: "financialAnalyst", label: "Financial Analyst", emoji: "💹", salaryKey: "salaryFinancialAnalyst" },
  { key: "lawyer", label: "Lawyer", emoji: "⚖️", salaryKey: "salaryLawyer" },
  { key: "architect", label: "Architect", emoji: "🏛️", salaryKey: "salaryArchitect" },
  { key: "civilEngineer", label: "Civil Engineer", emoji: "🏗️", salaryKey: "salaryCivilEngineer" },
  { key: "pharmacist", label: "Pharmacist", emoji: "💊", salaryKey: "salaryPharmacist" },
  { key: "teacher", label: "Teacher", emoji: "📚", salaryKey: "salaryTeacher" },
  { key: "accountant", label: "Accountant", emoji: "🧾", salaryKey: "salaryAccountant" },
  { key: "hrManager", label: "HR Manager", emoji: "👥", salaryKey: "salaryHRManager" },
  { key: "salesManager", label: "Sales Manager", emoji: "📈", salaryKey: "salarySalesManager" },
  { key: "marketingManager", label: "Marketing Manager", emoji: "📣", salaryKey: "salaryMarketingManager" },
  { key: "electrician", label: "Electrician", emoji: "⚡", salaryKey: "salaryElectrician" },
  { key: "chef", label: "Chef", emoji: "👨‍🍳", salaryKey: "salaryChef" },
]

// Keep old exports for any files that still reference them
