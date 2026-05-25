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
  salaryAiMlEngineer: number;
  salaryCloudArchitect: number;
  salaryDentist: number;
  salaryPhysiotherapist: number;
  salaryPsychologist: number;
  salaryRenewableEnergyEngineer: number;
  salaryPilot: number;
  salaryGraphicDesigner: number;
  salaryBiomedicalEngineer: number;
  salarySupplyChainManager: number;
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
  incomeTaxRateMid: number;
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
  | "aiMlEngineer"
  | "cloudArchitect"
  | "dentist"
  | "physiotherapist"
  | "psychologist"
  | "renewableEnergyEngineer"
  | "pilot"
  | "graphicDesigner"
  | "biomedicalEngineer"
  | "supplyChainManager"

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
  { key: "aiMlEngineer", label: "AI / ML Engineer", emoji: "🤖", salaryKey: "salaryAiMlEngineer" },
  { key: "cloudArchitect", label: "Cloud Architect", emoji: "☁️", salaryKey: "salaryCloudArchitect" },
  { key: "dentist", label: "Dentist", emoji: "🦷", salaryKey: "salaryDentist" },
  { key: "physiotherapist", label: "Physiotherapist", emoji: "🏃", salaryKey: "salaryPhysiotherapist" },
  { key: "psychologist", label: "Psychologist", emoji: "🧠", salaryKey: "salaryPsychologist" },
  { key: "renewableEnergyEngineer", label: "Renewable Energy Engineer", emoji: "🌱", salaryKey: "salaryRenewableEnergyEngineer" },
  { key: "pilot", label: "Pilot", emoji: "✈️", salaryKey: "salaryPilot" },
  { key: "graphicDesigner", label: "Graphic Designer", emoji: "🖌️", salaryKey: "salaryGraphicDesigner" },
  { key: "biomedicalEngineer", label: "Biomedical Engineer", emoji: "🔬", salaryKey: "salaryBiomedicalEngineer" },
  { key: "supplyChainManager", label: "Supply Chain Manager", emoji: "📦", salaryKey: "salarySupplyChainManager" },
]

// Keep old exports for any files that still reference them

// ─── CITIES ───────────────────────────────────────────────────

export interface Neighbourhood {
  name: string;
  vibe: string;
  avgRent: number;
  goodFor: string[];
}

export interface CityData {
  costRentCityCentre: number;
  costRentOutside: number;
  costGroceriesMonthly: number;
  costTransportMonthly: number;
  costEatingOut: number;
  costUtilitiesMonthly: number;
  costGymMonthly: number;
  costCoworkingMonthly: number;
  salarySoftwareEngineer: number;
  salaryDoctor: number;
  salaryNurse: number;
  salaryDataScientist: number;
  salaryProductManager: number;
  salaryDevOps: number;
  salaryCybersecurity: number;
  salaryUXDesigner: number;
  salaryFinancialAnalyst: number;
  salaryLawyer: number;
  salaryArchitect: number;
  salaryCivilEngineer: number;
  salaryPharmacist: number;
  salaryTeacher: number;
  salaryAccountant: number;
  salaryHRManager: number;
  salarySalesManager: number;
  salaryMarketingManager: number;
  salaryElectrician: number;
  salaryChef: number;
  scoreQualityOfLife: number;
  scoreSafety: number;
  scoreHealthcare: number;
  scoreInternetSpeed: number;
  scoreWalkability: number;
  scoreNightlife: number;
  scoreExpatFriendliness: number;
  climateSummerAvgC: number;
  climateWinterAvgC: number;
  climateRainyDaysPerYear: number;
  climateDescription: string;
  neighbourhoods: Neighbourhood[];
  visaNotes: string;
  visaOfficialUrl: string;
  incomeTaxRateMid: number;
  localTaxNote: string | null;
  moveScore: number;
  lastVerified: string;
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
  coverImageUrl: string | null;
  tagline: string;
  data: CityData;
}