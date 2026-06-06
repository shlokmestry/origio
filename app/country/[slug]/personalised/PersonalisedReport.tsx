"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Calculator } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthProvider";
import { WizardAnswers, CountryMatch, getPassportStrength, PASSPORT_TIER_LABEL, resolveEffectivePassports } from "@/lib/wizard";
import { JOB_ROLES, CountryWithData } from "@/types";
import { getVisaLabel, getVisaColor, getScoreBreakdown } from "@/lib/utils";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { FlagIcon } from "@/components/FlagIcon";
import { slugToIso } from "@/lib/flagCodes";

// ── helpers ────────────────────────────────────────────────────────────────

const SYM: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", AUD: "A$", CAD: "C$",
  NZD: "NZ$", CHF: "CHF ", SGD: "S$", AED: "AED ",
  NOK: "kr ", SEK: "kr ", JPY: "¥", INR: "₹", BRL: "R$",
  MYR: "RM ", DKK: "kr ",
};
const sym = (c: string) => SYM[c] ?? c + " ";

const TO_USD: Record<string, number> = {
  USD: 1, EUR: 1.08, GBP: 1.27, AUD: 0.65, CAD: 0.74,
  NZD: 0.61, CHF: 1.13, SGD: 0.74, AED: 0.27,
  NOK: 0.093, SEK: 0.096, DKK: 0.145,
  JPY: 0.0067, INR: 0.012, BRL: 0.20, MYR: 0.22,
};

const PPP_TIGHT_USD = 500;

const RENT_MAX: Record<string, number> = {
  under800: 800, "800to1500": 1500, "1500to2500": 2500, any: 99999,
};

const EU_PASSPORTS = [
  "ireland", "germany", "france", "netherlands", "spain", "portugal",
  "sweden", "norway", "switzerland", "austria", "belgium", "denmark", "finland", "italy", "poland",
];

const ENGLISH_COUNTRIES = [
  "ireland", "united-kingdom", "australia", "new-zealand", "canada", "usa", "singapore",
];

const HIGH_TAX_COUNTRIES = ["sweden", "denmark", "finland", "belgium"];

const SCORE_EMOJI: Record<string, string> = {
  Salary: "💰", Affordability: "🏠", "Quality of Life": "❤️",
  Safety: "🛡️", "Visa Access": "✈️", "Tax Efficiency": "🧾",
};

function calcTakeHome(gross: number, taxRate: number, ssRate: number) {
  const net = gross * (1 - taxRate / 100) * (1 - ssRate / 100);
  return { annual: Math.round(net), monthly: Math.round(net / 12) };
}

function getFallbackNarrative(slug: string, name: string, cs: string, grossSalary: number, takeHomeMonthly: number, disposable: number, disposableUSD: number, taxRate: number, safetyScore: number, qolScore: number): string {
  const g = `${cs}${grossSalary.toLocaleString()}`;
  const th = `${cs}${takeHomeMonthly.toLocaleString()}`;
  const disp = `${cs}${Math.abs(disposable).toLocaleString()}`;
  const isNeg = disposable < 0;
  const isTight = disposableUSD < PPP_TIGHT_USD;
  // pick variation 0/1/2 based on salary to stay deterministic
  const v = Math.abs(Math.round(grossSalary)) % 3;

  const N: Record<string, string[]> = {
    "uae": [
      `Zero tax. What you earn — ${g} — is what you keep.`,
      `No income tax. Your ${g} salary arrives exactly as advertised.`,
      `${g} gross, ${g} net. That is the entire case for UAE.`,
    ],
    "singapore": [
      `17% flat tax, world-class infrastructure. After rent and costs you keep ${disp}/mo.`,
      `Tax stays low in Singapore. Housing does not. Net after full costs: ${disp}/mo.`,
      `${g} gross, 17% tax. Rent is the number to watch. You clear ${disp}/mo.`,
    ],
    "switzerland": [
      `${g} gross sounds strong. After Swiss costs, ${disp}/mo remains.`,
      `Swiss salaries are real. Swiss costs are also real. You clear ${disp}/mo.`,
      `Highest salaries in Europe. Also among the highest costs. Net: ${disp}/mo.`,
    ],
    "germany": [
      `${taxRate}% tax, solid public services, ${disp}/mo disposable. The deal is clear.`,
      `Germany takes ${taxRate}% and returns healthcare, transit and stability. Net: ${disp}/mo.`,
      `${g} gross becomes ${disp}/mo after Berlin costs. Enough to live well and save.`,
    ],
    "netherlands": [
      `Tax at ${taxRate}%, but ${disp}/mo clears comfortably outside Amsterdam.`,
      `${g} gross, ${taxRate}% tax, ${disp}/mo left. Amsterdam costs more than the rest of the country.`,
      `Netherlands takes ${taxRate}% and gives back infrastructure most countries would pay extra for.`,
    ],
    "portugal": [
      `${g} gross, ${disp}/mo after Lisbon costs. The lifestyle gap versus northern Europe is real.`,
      `Cost of living makes ${disp}/mo stretch further than the number alone suggests.`,
      `Portugal has NHR tax benefits for new residents. Worth checking before you file anything.`,
    ],
    "spain": [
      `${g} gross, ${disp}/mo surplus. Sun and a functioning social safety net included.`,
      `Tax is ${taxRate}%. What stays is ${disp}/mo. Barcelona or Valencia changes that math.`,
      `${disp}/mo in Spain goes further than the same number in Germany.`,
    ],
    "france": [
      `Tax hits ${taxRate}%. What clears is ${disp}/mo. Paris costs more than the rest of the country.`,
      `${g} gross, ${taxRate}% tax, ${disp}/mo left. French public services justify some of that loss.`,
      `France takes a lot and returns a lot. Healthcare, infrastructure, stability. Net: ${disp}/mo.`,
    ],
    "italy": [
      `${disp}/mo in Milan is tight. The same in Bologna or Palermo is comfortable.`,
      `Tax rate is ${taxRate}%. Take-home is ${th}/mo. Italy rewards those who pick the right city.`,
      `${g} gross clears ${disp}/mo in Italy. Location changes everything here.`,
    ],
    "ireland": [
      `English-speaking, EU-accessible, ${taxRate}% tax. Net: ${disp}/mo. Dublin is the expensive variable.`,
      `${g} gross, ${taxRate}% tax, Dublin rents. Net: ${disp}/mo. Outside the capital that math improves fast.`,
      `Ireland tax rate: ${taxRate}%. Disposable: ${disp}/mo. Rents are the thing to stress-test.`,
    ],
    "united-kingdom": [
      `${g} gross, ${taxRate}% tax, ${disp}/mo left. London vs the rest of the UK is a different calculation entirely.`,
      `UK tax is ${taxRate}%. After costs you clear ${disp}/mo. Regional cities change that equation significantly.`,
      `${disp}/mo in Manchester goes further than the same number in London by a considerable margin.`,
    ],
    "australia": [
      `${g} in Australian dollars, ${disp}/mo after costs. The exchange rate matters if your income is offshore.`,
      `Tax at ${taxRate}%, strong labour protections, ${disp}/mo disposable. Straightforward deal.`,
      `${disp}/mo in Perth looks different to ${disp}/mo in Sydney. Pick your city before running the final numbers.`,
    ],
    "canada": [
      `${g} Canadian, ${taxRate}% tax, ${disp}/mo left. Toronto and Vancouver are expensive. Calgary considerably less so.`,
      `Tax is ${taxRate}%. Net: ${disp}/mo. Cold winters, strong institutions, predictable costs.`,
      `${disp}/mo in Montreal goes significantly further than the same number in Toronto.`,
    ],
    "new-zealand": [
      `${g} gross, ${disp}/mo left in NZ dollars. Auckland is expensive. Everywhere else less so.`,
      `Tax at ${taxRate}%, quality of life among the highest measured. Net: ${disp}/mo.`,
      `New Zealand clears ${disp}/mo after costs. The distance from everything is the actual tradeoff.`,
    ],
    "usa": [
      `No federal mandate on state taxes. ${g} goes further in Texas than in California.`,
      `${taxRate}% federal rate, ${disp}/mo after costs. Healthcare is the variable nobody prices in at first.`,
      `${g} gross, ${disp}/mo net. High upside, you manage the downside yourself.`,
    ],
    "norway": [
      `Tax is ${taxRate}%. What clears is ${disp}/mo. Expensive country. The public return is real.`,
      `${g} NOK, ${taxRate}% tax, ${disp}/mo left. Oslo is costly. Smaller cities are a different story.`,
      `Norway taxes heavily and delivers heavily. Net: ${disp}/mo after full costs.`,
    ],
    "sweden": [
      `${taxRate}% tax is the headline. What you get back makes it livable. Net: ${disp}/mo.`,
      `Sweden takes ${taxRate}%. Returns healthcare, childcare, transit and among the best parental leave globally. Net: ${disp}/mo.`,
      `${g} gross, ${taxRate}% tax, ${disp}/mo left. Stockholm is pricey. Gothenburg noticeably less so.`,
    ],
    "denmark": [
      `Denmark takes ${taxRate}% and returns a functioning state. Net after costs: ${disp}/mo.`,
      `${taxRate}% tax sounds severe. The public infrastructure it buys is not. You clear ${disp}/mo.`,
      `${g} gross, ${taxRate}% tax, ${disp}/mo disposable. Copenhagen costs are the other side of the equation.`,
    ],
    "finland": [
      `${taxRate}% tax, one of the happiest countries on record, ${disp}/mo net. The winters are not in the data.`,
      `Finland takes ${taxRate}%. Returns quality healthcare, education and infrastructure. Net: ${disp}/mo.`,
      `${g} gross, ${disp}/mo left in Helsinki after costs. Not a wealth play. A stability play.`,
    ],
    "belgium": [
      `${taxRate}% tax is among the highest in Europe. Net: ${disp}/mo. Central EU location offsets the pain for many.`,
      `Belgium taxes at ${taxRate}%. What remains is ${disp}/mo. Strong expat community, strong EU connectivity.`,
      `${g} gross shrinks fast at ${taxRate}%. You clear ${disp}/mo. Brussels draws people for the EU institutions, not the tax rate.`,
    ],
    "austria": [
      `${g} gross, ${taxRate}% tax, ${disp}/mo left. Vienna consistently ranks among the most livable cities in the world.`,
      `Tax is ${taxRate}%, Vienna is affordable for its quality, you keep ${disp}/mo. Strong deal.`,
      `${disp}/mo in Vienna buys more lifestyle per euro than most western European capitals.`,
    ],
    "czech-republic": [
      `${g} in Czech crowns, ${disp}/mo after Prague costs. One of the most affordable capitals in Europe.`,
      `Tax at ${taxRate}%, Prague rents well below western Europe. Net: ${disp}/mo.`,
      `${disp}/mo goes far in Prague. European quality without the European price tag.`,
    ],
    "poland": [
      `${g} gross, ${taxRate}% tax, Warsaw costs are low. Net: ${disp}/mo with room to save.`,
      `Poland is affordable. ${disp}/mo disposable in Warsaw. Quality of life improving year on year.`,
      `Low cost base, ${taxRate}% tax, ${disp}/mo net. Warsaw punches above its weight for remote workers.`,
    ],
    "croatia": [
      `Croatia joined the euro. Costs stayed low. ${disp}/mo goes further than the number suggests.`,
      `${g} gross, ${taxRate}% tax, Adriatic coast access, ${disp}/mo left. The lifestyle case is strong.`,
      `${disp}/mo in Split is a different life to ${disp}/mo in Frankfurt. Same number, different reality.`,
    ],
    "greece": [
      `${g} gross, ${disp}/mo after Athens costs. Mediterranean climate and a flat tax for new residents worth checking.`,
      `Greece offers a flat 7% tax rate for qualifying foreign pensioners. Check if you qualify.`,
      `${disp}/mo in Athens goes further than most EU capitals. Low cost, improving infrastructure year on year.`,
    ],
    "japan": [
      `${g} in yen, ${taxRate}% tax, ${disp}/mo after Tokyo costs. Safety here is genuinely exceptional.`,
      `Japan taxes at ${taxRate}%. Infrastructure and safety are world-class. Net: ${disp}/mo.`,
      `${disp}/mo in Osaka looks different to ${disp}/mo in Tokyo. The quality floor is high everywhere.`,
    ],
    "south-korea": [
      `${g} in Korean won, ${taxRate}% tax, Seoul costs are moderate. Net: ${disp}/mo.`,
      `South Korea taxes at ${taxRate}%, delivers fast internet and modern infrastructure. Net: ${disp}/mo.`,
      `${disp}/mo in Seoul goes further than most assume. Strong value relative to quality of life.`,
    ],
    "malaysia": [
      `${g} in ringgit, low tax, ${disp}/mo left. Malaysia costs a fraction of Singapore for comparable infrastructure.`,
      `Malaysia MM2H visa is available. ${disp}/mo goes far in Kuala Lumpur. The cost case is clear.`,
      `Tax is low, costs are low, ${disp}/mo net. KL is increasingly popular with remote workers for a reason.`,
    ],
    "thailand": [
      `${g} in baht, ${disp}/mo surplus. Thailand costs make western salaries stretch significantly.`,
      `Thailand LTR visa available for remote workers. ${disp}/mo covers a comfortable lifestyle in Chiang Mai.`,
      `${disp}/mo in Bangkok is a very different life to ${disp}/mo in Frankfurt. The cost gap is real.`,
    ],
    "vietnam": [
      `${disp}/mo in Ho Chi Minh City is well above what most locals earn. Cost case is compelling.`,
      `${g} gross goes far in Vietnam. ${disp}/mo monthly surplus at local price levels.`,
      `Vietnam is cheap. Infrastructure improving fast. ${disp}/mo covers a comfortable expat lifestyle.`,
    ],
    "india": [
      `${g} in rupees, ${disp}/mo after Mumbai costs. PPP-adjusted that goes further than the number suggests.`,
      `${disp}/mo in Bangalore funds a lifestyle that costs three times more in most western cities.`,
      `India costs are low. ${disp}/mo net in most major cities after full expenses.`,
    ],
    "brazil": [
      `${g} in reais, ${disp}/mo after Sao Paulo costs. Crime risk varies heavily by neighbourhood.`,
      `${taxRate}% tax, significant bureaucracy, ${disp}/mo left. Brazil rewards those who do the research first.`,
      `${disp}/mo in Florianopolis is a different proposition to the same amount in Sao Paulo.`,
    ],
    "colombia": [
      `${g} in Colombian pesos, ${disp}/mo after Medellin costs. Cost of living is genuinely low.`,
      `Colombia is affordable. ${disp}/mo disposable in Bogota or Medellin. Safety varies by district.`,
      `${disp}/mo goes far in Medellin. Strong infrastructure for remote workers. Safety is the variable to track.`,
    ],
    "costa-rica": [
      `${disp}/mo in Costa Rica covers a comfortable lifestyle. Rentista visa available from $2,500/mo income.`,
      `${g} gross, ${disp}/mo after San Jose costs. Stable politically, dollarised economy.`,
      `Costa Rica is one of the more stable options in the region. ${disp}/mo net covers the basics well.`,
    ],
    "mexico": [
      `${g} in pesos or USD depending on employer, ${disp}/mo after Mexico City costs. Popular with remote workers.`,
      `${disp}/mo in Merida goes further than the same in Mexico City. Regional spread is wide.`,
      `Mexico City rents have climbed in recent years. Net: ${disp}/mo. Check if that holds at your specific rent level.`,
    ],
    "panama": [
      `Panama uses the US dollar and taxes foreign income at 0%. ${g} gross stays intact.`,
      `${disp}/mo in Panama City, dollarised economy, Pensionado visa available. Solid base for retirees.`,
      `Zero tax on foreign income, Panama City infrastructure is solid. Net after full costs: ${disp}/mo.`,
    ],
    "georgia": [
      `Georgia charges 1% flat tax on foreign income under certain conditions. Worth verifying eligibility.`,
      `${disp}/mo in Tbilisi is ample. One of the cheapest capitals for quality of life in the wider region.`,
      `Georgia is low cost and low tax. ${disp}/mo net in Tbilisi. Visa access is straightforward for most nationalities.`,
    ],
  };

  const variants = N[slug];
  if (variants) {
    const idx = isNeg ? (v + 2) % variants.length : v % variants.length;
    return variants[idx];
  }

  // generic fallbacks
  if (taxRate > 45) return `${name} takes ${taxRate}% in tax. Decide if what you get in return works for you.`;
  if (isNeg) return `The numbers do not clear in ${name} at this salary level. Worth running again with a higher figure or a cheaper city.`;
  if (isTight) return `${disp}/mo surplus in ${name}. Quality of life move, not a wealth building one.`;
  if (disposable >= 0) return `${g} gross, ${disp}/mo left after costs. ${name} makes that work.`;
  return `${g} gross, ${disp} left after costs. Check if it is enough to stay.`;
}

function getMoveTimeline(visaDifficulty: number, isEU: boolean, passportTier?: 1|2|3|4) {
  const now = new Date();
  const add = (m: number) => {
    const d = new Date(now);
    d.setMonth(d.getMonth() + m);
    return d.toLocaleString("default", { month: "short", year: "numeric" }).toUpperCase();
  };
  if (isEU) {
    return {
      months: "1–2 months",
      steps: [
        { month: add(0), action: "Start job search or confirm remote work arrangement" },
        { month: add(1), action: "Register with local authorities on arrival" },
        { month: add(2), action: "Sort local bank account, NIF/tax number" },
        { month: add(2), action: "You're in. EU freedom of movement — no visa required.", final: true },
      ],
    };
  }
  // Tier 1 passport → shave 1–2 months off processing times
  const tierBonus = passportTier === 1 ? 1 : 0;
  if (visaDifficulty <= 2) {
    return {
      months: tierBonus ? "2–4 months" : "3–6 months",
      steps: [
        { month: add(0), action: "Gather documents — passport, bank statements, proof of income" },
        { month: add(1), action: "Submit visa application at consulate" },
        { month: add(2), action: `Processing period (${tierBonus ? "1–3" : "2–4"} months typical)${tierBonus ? " — strong passport speeds processing" : ""}` },
        { month: add(4 - tierBonus), action: "Visa issued — book flights, sort accommodation" },
        { month: add(5 - tierBonus), action: "You're in.", final: true },
      ],
    };
  }
  if (visaDifficulty <= 3) {
    return {
      months: tierBonus ? "5–10 months" : "6–12 months",
      steps: [
        { month: add(0), action: "Secure job offer or employer sponsor" },
        { month: add(2), action: "Employer submits work permit application" },
        { month: add(3), action: `Processing period (${tierBonus ? "2–5" : "3–6"} months)${tierBonus ? " — Tier 1 passport reduces friction" : ""}` },
        { month: add(8 - tierBonus), action: "Permit issued — arrange relocation" },
        { month: add(10 - tierBonus), action: "You're in.", final: true },
      ],
    };
  }
  return {
    months: tierBonus ? "10–15 months" : "12–18 months",
    steps: [
      { month: add(0), action: "Begin job search — employer sponsorship essential" },
      { month: add(4), action: "Job offer secured" },
      { month: add(5), action: "Visa application submitted with full documentation" },
      { month: add(9 - tierBonus), action: `Processing + possible interview or biometrics${tierBonus ? " (Tier 1 passport may expedite)" : ""}` },
      { month: add(13 - tierBonus), action: "Visa issued" },
      { month: add(15 - tierBonus), action: "You're in.", final: true },
    ],
  };
}

const VISA_DOCS: Record<string, string[]> = {
  default: [
    "Valid passport (6+ months remaining)",
    "Recent passport photographs",
    "Criminal background check (apostilled)",
    "Proof of health insurance",
    "Proof of accommodation",
    "Bank statements (last 3 months)",
  ],
  "portugal": [
    "Valid passport (6+ months remaining)",
    "Proof of passive income or remote income",
    "NHR tax regime application",
    "Proof of accommodation (rental contract)",
    "Health insurance certificate",
    "Criminal background check (apostilled)",
    "NIF (Portuguese tax number) — apply at consulate",
  ],
  "germany": [
    "Valid passport",
    "Job offer or employment contract",
    "Recognised qualification or degree certificate",
    "Proof of German language skills (if applicable)",
    "Biometric photographs",
    "Health insurance proof",
    "CV + professional references",
  ],
  "uae": [
    "Valid passport (6+ months remaining)",
    "Emirates ID application documents",
    "Employment contract (employer-sponsored)",
    "Medical fitness certificate",
    "Biometric photographs",
    "Educational certificates (attested)",
  ],
  "ireland": [
    "Valid passport",
    "Job offer from Irish employer",
    "Critical Skills or General Work Permit application",
    "Proof of qualifications",
    "Proof of salary meeting threshold",
    "Health insurance (if not covered by employer)",
  ],
  "united-kingdom": [
    "Valid passport",
    "Certificate of Sponsorship from employer",
    "Proof of English language (B1 minimum)",
    "Tuberculosis test results (some countries)",
    "Biometric residence permit application",
    "Healthcare surcharge payment",
  ],
};

function getVisaChecklist(slug: string): string[] {
  return VISA_DOCS[slug] ?? VISA_DOCS.default;
}

interface Props {
  country: CountryWithData;
  allCountries: CountryWithData[];
}

// ── Inline style constants ─────────────────────────────────────────────────

const S = {
  bg: '#050508',
  card: '#0c0c0f',
  border: 'rgba(255,255,255,0.07)',
  borderMd: 'rgba(255,255,255,0.12)',
  dim: 'rgba(255,255,255,0.38)',
  dimmer: 'rgba(255,255,255,0.2)',
  serif: "'Cabinet Grotesk', sans-serif",
  sans: "'Satoshi', sans-serif",
};

export default function PersonalisedReport({ country, allCountries }: Props) {
  const router = useRouter();
  const { data } = country;
  const cs = sym(country.currency);
  const scoreBreakdown = getScoreBreakdown(data);

  const { user, loading: authLoading, isPro } = useAuth();
  // Seed answers immediately from sessionStorage so the page renders without waiting for Supabase
  const [answers, setAnswers] = useState<Partial<WizardAnswers> | null>(() => {
    if (typeof window === "undefined") return null;
    try { const r = sessionStorage.getItem("wizardAnswers"); return r ? JSON.parse(r) : null; } catch { return null; }
  });
  const [match, setMatch] = useState<{ percent: number; reasons: string[] } | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const r = sessionStorage.getItem("wizardMatches");
      if (!r) return null;
      const all: CountryMatch[] = JSON.parse(r);
      const m = all.find((x) => x.country.slug === country.slug);
      return m ? { percent: m.matchPercent, reasons: m.reasons } : null;
    } catch { return null; }
  });
  const [otherMatches, setOtherMatches] = useState<CountryMatch[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const r = sessionStorage.getItem("wizardMatches");
      if (!r) return [];
      const all: CountryMatch[] = JSON.parse(r);
      return all.filter((x) => x.country.slug !== country.slug).slice(0, 22);
    } catch { return []; }
  });
  const [dataLoading, setDataLoading] = useState(!answers); // skip loading if sessionStorage had data
  const [headline, setHeadline] = useState<string | null>(null);
  const [headlineLoading, setHeadlineLoading] = useState(false);
  const [customSalary, setCustomSalary] = useState<string>("");
  const [useCustom, setUseCustom] = useState(false);
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  // Derived loading flag — must be before any useEffect that uses it
  const loading = authLoading || dataLoading;

  // Once auth resolves, enrich from Supabase in the background (non-blocking)
  useEffect(() => {
    if (authLoading || !user) { setDataLoading(false); return; }
    async function enrich() {
      try {
        const { data: result } = await supabase
          .from("wizard_results")
          .select("answers, top_countries")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (result?.answers) setAnswers(result.answers as Partial<WizardAnswers>);
        if (result?.top_countries) {
          const m = (result.top_countries as any[]).find((c: any) => c.slug === country.slug);
          if (m) setMatch({ percent: m.matchPercent, reasons: m.reasons ?? [] });
          const others = (result.top_countries as any[])
            .filter((c: any) => c.slug !== country.slug).slice(0, 22)
            .map((c: any) => {
              const full = allCountries.find((x) => x.slug === c.slug);
              return full ? { country: full, matchPercent: c.matchPercent, matchScore: 0, reasons: c.reasons ?? [] } : null;
            }).filter(Boolean) as CountryMatch[];
          if (others.length) setOtherMatches(others);
        }
      } catch { /* non-critical */ }
      setDataLoading(false);
    }
    enrich();
  }, [authLoading, user, country.slug, allCountries]);

  useEffect(() => {
    if (!loading && !answers) {
      const t = setTimeout(() => router.replace("/wizard"), 800);
      return () => clearTimeout(t);
    }
  }, [loading, answers, router]);

  useEffect(() => {
    if (loading || !answers) return;
    const userRole = JOB_ROLES.find((r) => r.key === answers.jobRole) ?? JOB_ROLES[0];
    const grossSalary = data[userRole.salaryKey] as number;
    const { monthly: takeHomeMonthly } = calcTakeHome(grossSalary, data.incomeTaxRateMid, data.socialSecurityRate);
    const monthlyTotal = data.costRentCityCentre + data.costGroceriesMonthly + data.costTransportMonthly + data.costEatingOut * 20 + data.costUtilitiesMonthly;
    const disposable = takeHomeMonthly - monthlyTotal;
    const disposableUSD = disposable * (TO_USD[country.currency] ?? 1);
    const { primary: _ep2, secondary: _es2 } = resolveEffectivePassports((answers.passport ?? "").toLowerCase(), (answers.secondPassport ?? "").toLowerCase() || undefined);
    const isEU = EU_PASSPORTS.includes(_ep2) || (_es2 ? EU_PASSPORTS.includes(_es2) : false);
    const isEnglish = ENGLISH_COUNTRIES.includes(country.slug);
    setHeadlineLoading(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    supabase.auth.getSession().then(({ data: { session } }) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (session?.access_token) headers["Authorization"] = `Bearer ${session.access_token}`;
    fetch("/api/generate-headline", {
      method: "POST",
      headers,
      signal: controller.signal,
      body: JSON.stringify({
        countryName: country.name, countrySlug: country.slug, currency: country.currency,
        grossSalary, takeHomeMonthly, disposable, disposableUSD, taxRate: data.incomeTaxRateMid,
        ssRate: data.socialSecurityRate, rentMonthly: data.costRentCityCentre,
        moveReason: answers.moveReason, jobRole: userRole.label, passport: answers.passport,
        safetyScore: data.scoreSafety, qualityOfLife: data.scoreQualityOfLife,
        internetSpeed: data.scoreInternetSpeed, visaDifficulty: data.visaDifficulty,
        isEU, isEnglish, priorities: answers.priorities, matchPercent: match?.percent ?? 0,
        rentBudget: answers.rentBudget, cityVibe: answers.cityVibe,
        languages: answers.languages, dealBreakers: answers.dealBreakers,
      }),
    })
      .then((r) => r.json())
      .then((d) => { if (d.headline) setHeadline(d.headline); })
      .catch(() => {})
      .finally(() => { clearTimeout(timeout); setHeadlineLoading(false); });
    }).catch(() => { clearTimeout(timeout); setHeadlineLoading(false); });
    return () => { controller.abort(); clearTimeout(timeout); };
  }, [loading, answers, country, data, match]);

  if (loading && !answers) return (
    <div style={{ background: S.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes shimmer{0%{opacity:.4}50%{opacity:1}100%{opacity:.4}}`}</style>
      <div style={{ width: 40, height: 40, border: '2px solid rgba(255,255,255,0.1)', borderTop: '2px solid rgba(0,255,213,0.7)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <div style={{ fontFamily: S.serif, fontSize: 18, color: 'rgba(255,255,255,0.5)', letterSpacing: '-0.01em', animation: 'shimmer 1.5s ease infinite' }}>
        Loading your report…
      </div>
    </div>
  );

  // ── derived data ──────────────────────────────────────────────────────────

  if (!answers) return null; // redirect to /wizard is already pending

  const userRole = JOB_ROLES.find((r) => r.key === answers.jobRole) ?? JOB_ROLES[0];
  const roleAvgSalary = data[userRole.salaryKey] as number;
  const parsedCustom = useCustom && customSalary ? parseInt(customSalary.replace(/[^0-9]/g, ""), 10) : 0;
  const grossSalary = (isPro && useCustom && parsedCustom > 0) ? parsedCustom : roleAvgSalary;
  const { annual: takeHomeAnnual, monthly: takeHomeMonthly } = calcTakeHome(grossSalary, data.incomeTaxRateMid, data.socialSecurityRate);
  const rentUSD = data.costRentCityCentre * (TO_USD[country.currency] ?? 1);
  const maxRentUSD = RENT_MAX[answers.rentBudget ?? "any"] ?? 99999;
  const rentFits = rentUSD <= maxRentUSD;
  const rentPct = Math.round(((rentUSD - maxRentUSD) / maxRentUSD) * 100);
  const monthlyTotal = data.costRentCityCentre + data.costGroceriesMonthly + data.costTransportMonthly + data.costEatingOut * 20 + data.costUtilitiesMonthly;
  const disposable = takeHomeMonthly - monthlyTotal;
  const disposableUSD = disposable * (TO_USD[country.currency] ?? 1);
  const { primary: effectivePrimary, secondary: effectiveSecondary } = resolveEffectivePassports(
    (answers.passport ?? "").toLowerCase(),
    (answers.secondPassport ?? "").toLowerCase() || undefined,
  );
  const isEU = EU_PASSPORTS.includes(effectivePrimary) || (effectiveSecondary ? EU_PASSPORTS.includes(effectiveSecondary) : false);
  const euPassportLabel = EU_PASSPORTS.includes(effectivePrimary) ? effectivePrimary : (effectiveSecondary ?? effectivePrimary);
  const passportTier = Math.min(getPassportStrength(effectivePrimary), effectiveSecondary ? getPassportStrength(effectiveSecondary) : 4) as 1|2|3|4;
  const rawPrimaryTier = getPassportStrength((answers.passport ?? "").toLowerCase());
  const tierUpgraded = !!effectiveSecondary && passportTier < rawPrimaryTier;
  const hasDualPassport = !!(answers.secondPassport);
  const isEnglish = ENGLISH_COUNTRIES.includes(country.slug);
  const dealBreakers = answers.dealBreakers ?? [];
  const hasEnglishFlag = dealBreakers.includes("english") && !isEnglish;
  const hasHighTaxFlag = dealBreakers.includes("lowtax") && data.incomeTaxRateMid > 30;
  const hasCrimeFlag = dealBreakers.includes("lowcrime") && (data.scoreCrimeRate ?? 0) < 7;

  const displayHeadline = headline ?? getFallbackNarrative(
    country.slug, country.name, cs, grossSalary, takeHomeMonthly,
    disposable, disposableUSD, data.incomeTaxRateMid, data.scoreSafety, data.scoreQualityOfLife
  );

  const wins: { title: string; sub: string }[] = [];
  if (grossSalary > 0) wins.push({ title: `${userRole.label} salary: ${cs}${grossSalary.toLocaleString()}/yr`, sub: `Take-home ~${cs}${takeHomeMonthly.toLocaleString()}/mo after ${data.incomeTaxRateMid}% tax` });
  if (isEU && ["germany","netherlands","portugal","spain","ireland","france","italy","sweden","switzerland","norway","austria","finland","belgium","denmark"].includes(country.slug)) wins.push({ title: `${euPassportLabel} passport → free movement`, sub: "EU/EFTA freedom of movement — no pre-approval needed in most cases." });
  if (hasDualPassport && tierUpgraded) wins.push({ title: `Dual passport upgrades your access to Tier ${passportTier}`, sub: `${PASSPORT_TIER_LABEL[passportTier]}. Your second passport opens doors your primary wouldn't.` });
  if (rentFits) wins.push({ title: "Rent fits your budget", sub: `${cs}${data.costRentCityCentre.toLocaleString()}/mo city centre — within your range.` });
  if (data.scoreSafety >= 8.5) wins.push({ title: `Safety score ${data.scoreSafety}/10`, sub: answers.priorities?.includes("safety") ? "You ranked this as a priority." : "One of the safer countries in the index." });
  if (data.scoreInternetSpeed >= 8 && answers.moveReason === "remote") wins.push({ title: `${data.scoreInternetSpeed}/10 internet speed`, sub: "Strong infrastructure for remote work." });
  if (isEnglish) wins.push({ title: "English spoken", sub: "No language barrier for work or daily life." });
  if (data.scoreHealthcare >= 8) wins.push({ title: `Healthcare ${data.scoreHealthcare}/10`, sub: "High-quality public or private healthcare system." });

  const warnings: { title: string; sub: string }[] = [];
  if (!rentFits && answers.rentBudget !== "any") warnings.push({ title: "Rent is above your budget", sub: `${cs}${data.costRentCityCentre.toLocaleString()}/mo is ${Math.abs(rentPct)}% over your range. Consider outer suburbs.` });
  if (hasEnglishFlag) warnings.push({ title: "Primary language is not English", sub: "You flagged English as a must. Day-to-day life will require learning the local language." });
  if (hasHighTaxFlag) warnings.push({ title: `Income tax ${data.incomeTaxRateMid}% is above your threshold`, sub: "You flagged low taxes as a priority. This country sits above 30%." });
  if (hasCrimeFlag) warnings.push({ title: "Crime rate below your threshold", sub: "You flagged low crime as a deal breaker. Check neighbourhood-level data before deciding." });
  if (data.visaDifficulty >= 4 && !isEU) {
    if (hasDualPassport && passportTier === 1) {
      warnings.push({ title: `Visa difficulty: ${data.visaDifficulty}/5 — but your passport helps`, sub: "This country is restrictive, but your Tier 1 passport significantly reduces the barrier." });
    } else {
      warnings.push({ title: `Visa difficulty: ${data.visaDifficulty}/5`, sub: "This country has restrictive immigration. Expect a longer, more expensive process." });
    }
  }

  const priorities = answers.priorities ?? [];
  const priorityLabelMap: Record<string, string> = {
    salary: "Salary", affordability: "Affordability", quality: "Quality of Life",
    safety: "Safety", visa: "Visa Access", tax: "Tax Efficiency",
  };

  const timeline = getMoveTimeline(data.visaDifficulty, isEU, passportTier);
  const visaDocs = getVisaChecklist(country.slug);

  // Breakdown bar %s
  const total = takeHomeMonthly || 1;
  const rPct = Math.round((data.costRentCityCentre / total) * 100);
  const gPct = Math.round((data.costGroceriesMonthly / total) * 100);
  const tPct = Math.round((data.costTransportMonthly / total) * 100);
  const uPct = Math.round((data.costUtilitiesMonthly / total) * 100);
  const freePct = Math.max(0, 100 - rPct - gPct - tPct - uPct);

  const visaColor = getVisaColor(data.visaDifficulty);

  const toggleCheck = (i: number) => setChecked(prev => ({ ...prev, [i]: !prev[i] }));

  return (
    <div style={{ background: S.bg, color: '#fff', minHeight: '100vh', fontFamily: S.sans, overflowX: 'hidden' }}>

      {/* Nav — reuse existing component */}
      <Nav countries={[]} onCountrySelect={() => {}} />

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: 'clamp(90px,10vw,110px) clamp(20px,4vw,40px) 80px' }}>

        {/* ── BREADCRUMB ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: S.dim, marginBottom: 48 }}>
          <Link href="/wizard/results" style={{ color: S.dim, textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#fff'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = S.dim}>
            Results
          </Link>
          <span style={{ color: S.dimmer }}>/</span>
          <Link href={`/country/${country.slug}`} style={{ color: S.dim, textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#fff'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = S.dim}>
            {country.name}
          </Link>
          <span style={{ color: S.dimmer }}>/</span>
          <span style={{ color: 'rgba(255,255,255,0.7)' }}>Your report</span>
        </div>

        {/* ── HERO ── */}
        <div style={{ paddingBottom: 56, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Flag + match badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 20 }}>
            {slugToIso(country.slug) ? <FlagIcon code={slugToIso(country.slug)!} size="xl" /> : <span style={{ fontSize: 64, lineHeight: 1 }}>{country.flagEmoji}</span>}
            {match && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.06)', border: `1px solid ${S.borderMd}`, borderRadius: 12, padding: '10px 18px' }}>
                <span style={{ fontFamily: S.serif, fontSize: 32, color: '#fff', lineHeight: 1 }}>{match.percent}%</span>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: S.dim }}>Match</span>
              </div>
            )}
          </div>

          {/* Context line */}
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: S.dim, marginBottom: 20 }}>
            {country.name} · {userRole.label}{answers.passport ? ` · ${answers.passport} passport` : ""}
          </p>

          {/* Headline */}
          <div style={{ minHeight: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            {headlineLoading && !headline ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 720 }}>
                <div style={{ height: 28, background: 'rgba(255,255,255,0.06)', borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
                <div style={{ height: 28, background: 'rgba(255,255,255,0.06)', borderRadius: 6, width: '80%', margin: '0 auto', animation: 'pulse 1.5s infinite' }} />
              </div>
            ) : (
              <h1 style={{ fontFamily: S.serif, fontSize: 'clamp(28px, 4.5vw, 52px)', fontWeight: 400, lineHeight: 1.12, color: '#fff', maxWidth: 720, margin: 0 }}>
                {displayHeadline}
              </h1>
            )}
          </div>

          {/* Reason tags */}
          {match?.reasons && match.reasons.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 28 }}>
              {match.reasons.map((r) => (
                <span key={r} style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', border: `1px solid ${S.borderMd}`, borderRadius: 100, padding: '5px 14px', color: 'rgba(255,255,255,0.6)' }}>
                  {r}
                </span>
              ))}
            </div>
          )}

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href="#visa"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: '#0a0a0a', border: 'none', borderRadius: 100, padding: '14px 32px', fontSize: 14, fontWeight: 700, cursor: 'pointer', textDecoration: 'none', boxShadow: '0 2px 20px rgba(255,255,255,0.12)' }}>
              View visa path →
            </a>
            {otherMatches[0] && (
              <Link href={`/country/${otherMatches[0].country.slug}/personalised`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: 'rgba(255,255,255,0.65)', border: `1px solid ${S.borderMd}`, borderRadius: 100, padding: '14px 28px', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                Compare with {otherMatches[0].country.name}
              </Link>
            )}
          </div>
        </div>

        {/* ── SALARY ── */}
        <div style={{ padding: '56px 0', borderTop: `1px solid ${S.border}` }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 10 }}>
            <h2 style={{ fontFamily: S.serif, fontSize: 'clamp(28px,4vw,40px)', fontWeight: 400, color: '#fff', lineHeight: 1, margin: 0 }}>Salary</h2>
            <span style={{ fontSize: 12, color: S.dim, letterSpacing: '0.04em' }}>{userRole.label} · {country.currency}</span>
          </div>

          {/* Pro salary calculator */}
          {isPro && (
            <div style={{ marginBottom: 16, background: S.card, border: `1px solid ${S.borderMd}`, borderRadius: 14, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Calculator style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.5)' }} />
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: S.dim }}>Salary calculator</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.04)', border: `1px solid ${S.border}`, borderRadius: 8, overflow: 'hidden' }}>
                  <span style={{ padding: '0 12px', color: S.dim, fontWeight: 700, fontSize: 14 }}>{cs}</span>
                  <input
                    type="number"
                    placeholder={roleAvgSalary.toLocaleString()}
                    value={customSalary}
                    onChange={e => { setCustomSalary(e.target.value); setUseCustom(true); }}
                    style={{ width: 140, padding: '10px 8px', background: 'transparent', color: '#fff', fontSize: 14, fontWeight: 700, border: 'none', outline: 'none' }}
                  />
                  <span style={{ padding: '0 12px', color: S.dim, fontSize: 12, fontWeight: 700 }}>/yr</span>
                </div>
                <button onClick={() => { setUseCustom(false); setCustomSalary(""); }}
                  style={{ fontSize: 11, fontWeight: 600, color: S.dim, background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Reset to average
                </button>
              </div>
              {useCustom && parsedCustom > 0 && (
                <p style={{ fontSize: 11, color: S.dim, marginTop: 8 }}>
                  Showing results for {cs}{parsedCustom.toLocaleString()}/yr — role average is {cs}{roleAvgSalary.toLocaleString()}/yr
                </p>
              )}
            </div>
          )}

          {/* 3 stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 16 }}>
            {/* Gross */}
            <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 14, padding: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: S.dim, marginBottom: 12 }}>Gross salary</div>
              <div style={{ fontFamily: S.serif, fontSize: 38, color: '#fff', lineHeight: 1, marginBottom: 6 }}>{cs}{grossSalary.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: S.dim }}>{isPro && useCustom && parsedCustom > 0 ? "your salary" : `per year as ${userRole.label}`}</div>
            </div>

            {/* Take-home */}
            <div style={{ position: 'relative', background: S.card, border: `1px solid ${S.borderMd}`, borderRadius: 14, padding: 24, overflow: 'hidden' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: S.dim, marginBottom: 12 }}>After tax + social security</div>
              <div style={{ filter: isPro ? 'none' : 'blur(8px)', userSelect: isPro ? 'auto' : 'none' }}>
                <div style={{ fontFamily: S.serif, fontSize: 38, color: '#fff', lineHeight: 1, marginBottom: 6 }}>{cs}{takeHomeAnnual.toLocaleString()}</div>
                <div style={{ fontSize: 12, color: S.dim }}>~ {cs}{takeHomeMonthly.toLocaleString()} / month</div>
              </div>
              {!isPro && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Link href="/pro" style={{ display: 'flex', alignItems: 'center', gap: 8, background: S.bg, border: `1px solid ${S.borderMd}`, borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                    <Lock style={{ width: 12, height: 12 }} /> Unlock · Pro
                  </Link>
                </div>
              )}
            </div>

            {/* Disposable */}
            <div style={{ position: 'relative', background: S.card, border: `1px solid ${S.border}`, borderRadius: 14, padding: 24, overflow: 'hidden' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: S.dim, marginBottom: 12 }}>After all costs</div>
              <div style={{ filter: isPro ? 'none' : 'blur(8px)', userSelect: isPro ? 'auto' : 'none' }}>
                <div style={{ fontFamily: S.serif, fontSize: 38, lineHeight: 1, marginBottom: 6, color: '#fff' }}>
                  {disposable > 0 ? "+" : ""}{cs}{Math.abs(disposable).toLocaleString()}
                </div>
                <div style={{ fontSize: 12, color: S.dim }}>/ month {disposable > 0 ? "free" : "shortfall"}</div>
              </div>
              {!isPro && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Link href="/pro" style={{ display: 'flex', alignItems: 'center', gap: 8, background: S.bg, border: `1px solid ${S.borderMd}`, borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                    <Lock style={{ width: 12, height: 12 }} /> Unlock · Pro
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Breakdown bar */}
          <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 14, padding: 24 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: S.dim, marginBottom: 0 }}>
              Monthly take-home breakdown · {cs}{takeHomeMonthly.toLocaleString()}
            </div>
            <div style={{ height: 36, borderRadius: 8, overflow: 'hidden', display: 'flex', margin: '16px 0' }}>
              <div style={{ width: rPct + '%', height: '100%', background: 'rgba(255,255,255,0.9)', transition: 'width 0.6s' }} />
              <div style={{ width: gPct + '%', height: '100%', background: 'rgba(255,255,255,0.5)', transition: 'width 0.6s' }} />
              <div style={{ width: tPct + '%', height: '100%', background: 'rgba(255,255,255,0.3)', transition: 'width 0.6s' }} />
              <div style={{ width: uPct + '%', height: '100%', background: 'rgba(255,255,255,0.18)', transition: 'width 0.6s' }} />
              <div style={{ width: freePct + '%', height: '100%', background: 'rgba(255,255,255,0.06)', transition: 'width 0.6s' }} />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {[
                { label: 'Rent', val: data.costRentCityCentre, bg: 'rgba(255,255,255,0.9)' },
                { label: 'Groceries', val: data.costGroceriesMonthly, bg: 'rgba(255,255,255,0.5)' },
                { label: 'Transport', val: data.costTransportMonthly, bg: 'rgba(255,255,255,0.3)' },
                { label: 'Utilities', val: data.costUtilitiesMonthly, bg: 'rgba(255,255,255,0.18)' },
                { label: 'Free', val: Math.abs(disposable), bg: 'rgba(255,255,255,0.3)' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: S.dim }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.bg, flexShrink: 0 }} />
                  {item.label} <span style={{ color: 'rgba(255,255,255,0.6)', marginLeft: 4 }}>{cs}{item.val.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── WHAT FITS / DOESN'T ── */}
        <div style={{ padding: '56px 0', borderTop: `1px solid ${S.border}` }}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: S.serif, fontSize: 'clamp(28px,4vw,40px)', fontWeight: 400, color: '#fff', lineHeight: 1, margin: 0 }}>What fits, what doesn't</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 12 }}>
            {/* Fits */}
            <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: `1px solid ${S.border}`, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>
                Fits · {wins.length}
              </div>
              {wins.length === 0 && <p style={{ padding: '16px 20px', fontSize: 13, color: S.dim }}>No strong matches found for your criteria.</p>}
              {wins.map((w, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, padding: '16px 20px', borderBottom: i < wins.length - 1 ? `1px solid rgba(255,255,255,0.04)` : 'none' }}>
                  <span style={{ flexShrink: 0, marginTop: 2, fontSize: 14 }}>✓</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 3 }}>{w.title}</div>
                    <div style={{ fontSize: 12, color: S.dim, lineHeight: 1.5 }}>{w.sub}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* Watch out */}
            <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: `1px solid ${S.border}`, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
                Watch out · {warnings.length}
              </div>
              {warnings.length === 0 && <p style={{ padding: '16px 20px', fontSize: 13, color: S.dim }}>No deal-breakers flagged.</p>}
              {warnings.map((w, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, padding: '16px 20px', borderBottom: i < warnings.length - 1 ? `1px solid rgba(255,255,255,0.04)` : 'none' }}>
                  <span style={{ flexShrink: 0, marginTop: 2, fontSize: 14, color: 'rgba(255,130,130,0.8)' }}>!</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 3 }}>{w.title}</div>
                    <div style={{ fontSize: 12, color: S.dim, lineHeight: 1.5 }}>{w.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── VISA PATH ── */}
        <div id="visa" style={{ padding: '56px 0', borderTop: `1px solid ${S.border}` }}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: S.serif, fontSize: 'clamp(28px,4vw,40px)', fontWeight: 400, color: '#fff', lineHeight: 1, margin: 0 }}>
              Visa — your route
            </h2>
          </div>
          <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 14, overflow: 'hidden' }}>
            {/* 3-col stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', borderBottom: `1px solid ${S.border}` }}>
              <div style={{ padding: '22px 24px', borderRight: `1px solid ${S.border}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: S.dim, marginBottom: 8 }}>Top route</div>
                <div style={{ fontFamily: S.serif, fontSize: 22, color: '#fff', marginBottom: 4 }}>{data.visaPopularRoutes?.[0] ?? "Work Permit"}</div>
                {data.visaPopularRoutes?.[1] && <div style={{ fontSize: 12, color: S.dim }}>{data.visaPopularRoutes[1]}</div>}
              </div>
              <div style={{ padding: '22px 24px', borderRight: `1px solid ${S.border}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: S.dim, marginBottom: 8 }}>Difficulty</div>
                <div style={{ fontFamily: S.serif, fontSize: 22, color: '#fff', marginBottom: 8 }}>
                  {data.visaDifficulty}<span style={{ fontSize: 14, color: S.dim }}>/5</span>
                </div>
                <div style={{ display: 'flex', gap: 3 }}>
                  {[1,2,3,4,5].map(n => (
                    <div key={n} style={{ width: 14, height: 4, borderRadius: 2, background: n <= data.visaDifficulty ? '#fff' : 'rgba(255,255,255,0.1)' }} />
                  ))}
                </div>
                <div style={{ fontSize: 12, color: S.dim, marginTop: 6 }}>{getVisaLabel(data.visaDifficulty)}</div>
              </div>
              <div style={{ padding: '22px 24px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: S.dim, marginBottom: 8 }}>
                  {hasDualPassport ? "Passports" : "Passport"}
                </div>
                <div style={{ fontFamily: S.serif, fontSize: 20, color: '#fff', marginBottom: 4 }}>
                  {isEU ? "EU ✓" : (answers.passport ?? "—")}
                  {hasDualPassport && answers.secondPassport && (
                    <span style={{ fontSize: 14, color: S.dim }}> + {answers.secondPassport}</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: S.dim }}>{isEU ? "Freedom of movement" : "Work permit required"}</div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#00ffd5', marginTop: 6, opacity: 0.8 }}>
                  Tier {passportTier} strength{tierUpgraded ? ` ↑ from Tier ${rawPrimaryTier}` : ""}
                </div>
              </div>
            </div>
            {/* Body */}
            <div style={{ padding: 24 }}>
              <p style={{ fontSize: 14, color: S.dim, lineHeight: 1.65, marginBottom: 18 }}>{data.visaNotes}</p>
              {data.visaPopularRoutes?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                  {data.visaPopularRoutes.map((r: string) => (
                    <span key={r} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', border: `1px solid ${S.borderMd}`, borderRadius: 100, padding: '4px 12px', color: 'rgba(255,255,255,0.55)' }}>
                      {r}
                    </span>
                  ))}
                </div>
              )}
              <a href={data.visaOfficialUrl} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', letterSpacing: '0.04em' }}>
                Official immigration site →
              </a>
            </div>
          </div>
        </div>

        {/* ── VISA CHECKLIST ── */}
        <div style={{ padding: '56px 0', borderTop: `1px solid ${S.border}` }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 10 }}>
            <h2 style={{ fontFamily: S.serif, fontSize: 'clamp(28px,4vw,40px)', fontWeight: 400, color: '#fff', lineHeight: 1, margin: 0 }}>Visa checklist</h2>
            <span style={{ fontSize: 12, color: S.dim }}>Documents you'll need</span>
          </div>
          <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 14, overflow: 'hidden' }}>
            {/* First 3 — always visible + interactive */}
            {visaDocs.slice(0, 3).map((doc, i) => (
              <div key={i} onClick={() => toggleCheck(i)}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: `1px solid rgba(255,255,255,0.04)`, cursor: 'pointer' }}>
                <div style={{ width: 18, height: 18, border: `1px solid ${checked[i] ? '#fff' : S.borderMd}`, borderRadius: 4, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: checked[i] ? '#fff' : 'transparent', transition: 'background 0.15s' }}>
                  {checked[i] && <span style={{ fontSize: 10, fontWeight: 700, color: '#0a0a0a' }}>✓</span>}
                </div>
                <span style={{ fontSize: 14, fontWeight: 500, color: checked[i] ? S.dim : 'rgba(255,255,255,0.8)', textDecoration: checked[i] ? 'line-through' : 'none', textDecorationColor: S.dimmer }}>
                  {doc}
                </span>
              </div>
            ))}
            {/* Remaining — blurred for free users */}
            <div style={{ position: 'relative' }}>
              <div style={{ filter: isPro ? 'none' : 'blur(5px)', userSelect: isPro ? 'auto' : 'none', pointerEvents: isPro ? 'auto' : 'none' }}>
                {visaDocs.slice(3).map((doc, i) => {
                  const idx = i + 3;
                  return (
                    <div key={idx} onClick={() => isPro && toggleCheck(idx)}
                      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: idx < visaDocs.length - 1 ? `1px solid rgba(255,255,255,0.04)` : 'none', cursor: isPro ? 'pointer' : 'default' }}>
                      <div style={{ width: 18, height: 18, border: `1px solid ${checked[idx] ? '#fff' : S.borderMd}`, borderRadius: 4, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: checked[idx] ? '#fff' : 'transparent' }}>
                        {checked[idx] && <span style={{ fontSize: 10, fontWeight: 700, color: '#0a0a0a' }}>✓</span>}
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 500, color: checked[idx] ? S.dim : 'rgba(255,255,255,0.8)', textDecoration: checked[idx] ? 'line-through' : 'none' }}>
                        {doc}
                      </span>
                    </div>
                  );
                })}
              </div>
              {!isPro && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Link href="/pro" style={{ display: 'flex', alignItems: 'center', gap: 8, background: S.bg, border: `1px solid ${S.borderMd}`, borderRadius: 12, padding: '14px 22px', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                    <Lock style={{ width: 14, height: 14 }} /> Full checklist · Origio Pro
                  </Link>
                </div>
              )}
            </div>
            {isPro && (
              <div style={{ padding: '12px 20px', borderTop: `1px solid rgba(255,255,255,0.04)`, background: 'rgba(255,255,255,0.02)' }}>
                <a href={data.visaOfficialUrl} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>
                  Official immigration site for full requirements →
                </a>
              </div>
            )}
          </div>
        </div>

        {/* ── MOVE TIMELINE ── */}
        <div style={{ padding: '56px 0', borderTop: `1px solid ${S.border}` }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 10 }}>
            <h2 style={{ fontFamily: S.serif, fontSize: 'clamp(28px,4vw,40px)', fontWeight: 400, color: '#fff', lineHeight: 1, margin: 0 }}>Move timeline</h2>
            <span style={{ fontSize: 12, color: S.dim }}>{timeline.months}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {timeline.steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 20, paddingBottom: i < timeline.steps.length - 1 ? 28 : 0, position: 'relative' }}>
                {/* Left col: dot + line */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 16 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: (step as any).final ? '#fff' : 'rgba(255,255,255,0.15)', border: `1px solid ${(step as any).final ? '#fff' : S.borderMd}`, flexShrink: 0, marginTop: 2 }} />
                  {i < timeline.steps.length - 1 && (
                    <div style={{ width: 1, flex: 1, background: S.border, marginTop: 4, minHeight: 20 }} />
                  )}
                </div>
                {/* Content */}
                <div style={{ paddingBottom: 2 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: S.dim, marginBottom: 4 }}>{step.month}</div>
                  <div style={{ fontSize: 14, fontWeight: (step as any).final ? 700 : 500, color: (step as any).final ? '#fff' : 'rgba(255,255,255,0.85)' }}>{step.action}</div>
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: S.dimmer, marginTop: 24 }}>Estimates based on typical processing times. Check official sources for current wait times.</p>
        </div>

        {/* ── MONTHLY COSTS ── */}
        <div style={{ padding: '56px 0', borderTop: `1px solid ${S.border}` }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 10 }}>
            <h2 style={{ fontFamily: S.serif, fontSize: 'clamp(28px,4vw,40px)', fontWeight: 400, color: '#fff', lineHeight: 1, margin: 0 }}>Monthly costs</h2>
            <span style={{ fontSize: 12, color: S.dim }}>vs your budget</span>
          </div>
          <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 14, overflow: 'hidden' }}>
            {/* Header row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', padding: '12px 22px', background: 'rgba(255,255,255,0.03)', borderBottom: `1px solid ${S.border}`, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: S.dim }}>
              <span>Category</span>
              <span style={{ textAlign: 'right' }}>Est.</span>
              <span style={{ textAlign: 'right' }}>Status</span>
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{ filter: isPro ? 'none' : 'blur(6px)', userSelect: isPro ? 'auto' : 'none', pointerEvents: isPro ? 'auto' : 'none' }}>
                {[
                  { label: "Rent (1-bed, city centre)", val: data.costRentCityCentre, isRent: true },
                  { label: "Groceries", val: data.costGroceriesMonthly, isRent: false },
                  { label: "Transport", val: data.costTransportMonthly, isRent: false },
                  { label: "Utilities", val: data.costUtilitiesMonthly, isRent: false },
                  { label: "Eating out (×20 meals)", val: data.costEatingOut * 20, isRent: false },
                ].map((item, i, arr) => (
                  <div key={item.label} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', padding: '14px 22px', alignItems: 'center', borderBottom: i < arr.length - 1 ? `1px solid rgba(255,255,255,0.04)` : 'none' }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>{item.label}</span>
                    <span style={{ fontFamily: S.serif, fontSize: 16, color: '#fff', textAlign: 'right' }}>{cs}{item.val.toLocaleString()}</span>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      {item.isRent && !rentFits ? (
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', border: '1px solid', borderRadius: 100, padding: '3px 10px', borderColor: 'rgba(255,100,100,0.4)', color: 'rgba(255,130,130,0.8)' }}>
                          +{Math.abs(rentPct)}%
                        </span>
                      ) : (
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', border: '1px solid', borderRadius: 100, padding: '3px 10px', borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.45)' }}>
                          OK
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {!isPro && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Link href="/pro" style={{ display: 'flex', alignItems: 'center', gap: 10, background: S.bg, border: `1px solid ${S.borderMd}`, borderRadius: 12, padding: '14px 22px', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
                    <Lock style={{ width: 14, height: 14 }} /> Unlock full breakdown · Origio Pro
                  </Link>
                </div>
              )}
            </div>
            {/* Total row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', background: 'rgba(255,255,255,0.03)', borderTop: `1px solid ${S.borderMd}`, gap: 16, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: S.serif, fontSize: 18, color: '#fff' }}>Total monthly</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                <span style={{ fontFamily: S.serif, fontSize: 22, color: '#fff' }}>{cs}{monthlyTotal.toLocaleString()}</span>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', background: '#fff', color: '#0a0a0a', borderRadius: 100, padding: '5px 14px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {disposable >= 0 ? `${cs}${disposable.toLocaleString()} free` : "Over budget"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── SCORES ── */}
        <div style={{ padding: '56px 0', borderTop: `1px solid ${S.border}` }}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: S.serif, fontSize: 'clamp(28px,4vw,40px)', fontWeight: 400, color: '#fff', lineHeight: 1, margin: 0 }}>Scored against your priorities</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 12 }}>
            {/* Score breakdown */}
            <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: `1px solid ${S.border}`, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: S.dim }}>
                Score breakdown
              </div>
              {scoreBreakdown.map((item, i) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: i < scoreBreakdown.length - 1 ? `1px solid rgba(255,255,255,0.04)` : 'none' }}>
                  <span style={{ fontSize: 15, flexShrink: 0, width: 18, textAlign: 'center' }}>{SCORE_EMOJI[item.label] ?? "📊"}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: S.dim, flex: 1 }}>{item.label}</span>
                  <div style={{ width: 80, height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 3, flexShrink: 0 }}>
                    <div style={{ height: '100%', width: `${(item.value / item.maxValue) * 100}%`, background: '#fff', borderRadius: 3 }} />
                  </div>
                  <span style={{ fontFamily: S.serif, fontSize: 16, color: '#fff', minWidth: 28, textAlign: 'right' }}>{Math.round(item.value * 10) / 10}</span>
                </div>
              ))}
            </div>

            {/* Priorities */}
            <div style={{ position: 'relative', background: S.card, border: `1px solid ${S.border}`, borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: `1px solid ${S.border}`, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: S.dim }}>
                Your priorities
              </div>
              <div style={{ padding: 20, filter: isPro ? 'none' : 'blur(5px)', userSelect: isPro ? 'auto' : 'none', pointerEvents: isPro ? 'auto' : 'none' }}>
                {priorities.length > 0 ? (
                  <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {priorities.map((p, i) => {
                      const label = priorityLabelMap[p] ?? p;
                      const score = scoreBreakdown.find(s => s.label === label);
                      return (
                        <li key={p} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <span style={{ fontFamily: S.serif, fontSize: 28, color: 'rgba(255,255,255,0.18)', minWidth: 40, flexShrink: 0 }}>{String(i + 1).padStart(2, "0")}</span>
                          <span style={{ fontSize: 14, fontWeight: 600, color: '#fff', flex: 1 }}>{label}</span>
                          {score && <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>{Math.round(score.value * 10) / 10}</span>}
                        </li>
                      );
                    })}
                  </ol>
                ) : <p style={{ fontSize: 13, color: S.dim }}>No priorities selected in wizard.</p>}
              </div>
              {!isPro && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(12,12,15,0.6)' }}>
                  <Link href="/pro" style={{ display: 'flex', alignItems: 'center', gap: 8, background: S.bg, border: `1px solid ${S.borderMd}`, borderRadius: 12, padding: '14px 22px', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                    <Lock style={{ width: 14, height: 14 }} /> Your priorities · Pro
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── OTHER MATCHES ── */}
        <div id="compare" style={{ padding: '56px 0', borderTop: `1px solid ${S.border}` }}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: S.serif, fontSize: 'clamp(28px,4vw,40px)', fontWeight: 400, color: '#fff', lineHeight: 1, margin: 0 }}>Your other matches</h2>
          </div>

          {/* Top 2 match cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12, marginBottom: 12 }}>
            {otherMatches.slice(0, 2).map((m, i) => (
              <Link key={m.country.slug} href={`/country/${m.country.slug}/personalised`}
                style={{ display: 'block', background: S.card, border: `1px solid ${S.border}`, borderRadius: 14, padding: 24, textDecoration: 'none', transition: 'border-color 0.2s, background 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = S.borderMd; (e.currentTarget as HTMLElement).style.background = '#101014'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = S.border; (e.currentTarget as HTMLElement).style.background = S.card; }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  {slugToIso(m.country.slug) ? <FlagIcon code={slugToIso(m.country.slug)!} size="md" /> : <span style={{ fontSize: 36 }}>{m.country.flagEmoji}</span>}
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: S.dimmer }}>#{i + 2}</span>
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: S.dim, marginBottom: 4 }}>
                  {i + 2 === 2 ? "2nd best match" : "3rd best match"}
                </div>
                <div style={{ fontFamily: S.serif, fontSize: 26, color: '#fff', marginBottom: 12 }}>{m.country.name}</div>
                <div>
                  <span style={{ fontFamily: S.serif, fontSize: 42, color: '#fff', lineHeight: 1 }}>{m.matchPercent}</span>
                  <span style={{ fontSize: 12, color: S.dim, display: 'inline-block', marginLeft: 4 }}>% match</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, marginTop: 14, borderTop: `1px solid ${S.border}` }}>
                  <span style={{ fontSize: 12, color: S.dim }}>{sym(m.country.currency)}{(m.country.data[userRole.salaryKey] as number).toLocaleString()} · {getVisaLabel(m.country.data.visaDifficulty)}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>View report →</span>
                </div>
              </Link>
            ))}
          </div>

          {/* All countries table */}
          <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', borderBottom: `1px solid ${S.border}` }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: S.dim }}>22 more countries · ranked for you</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: S.dimmer }}>Pro · €4.99</span>
            </div>

            {isPro ? (
              otherMatches.slice(2).length === 0 ? (
                <div style={{ padding: '24px 22px', textAlign: 'center' }}>
                  <p style={{ fontSize: 13, color: S.dim, marginBottom: 12 }}>Run the wizard to generate your full ranking.</p>
                  <Link href="/wizard" style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Run quiz →</Link>
                </div>
              ) : (
                otherMatches.slice(2).map((m, i) => (
                  <Link key={m.country.slug} href={`/country/${m.country.slug}/personalised`}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 22px', borderBottom: `1px solid rgba(255,255,255,0.04)`, textDecoration: 'none', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.025)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: S.dimmer, minWidth: 24 }}>{String(i + 4).padStart(2, "0")}</span>
                    {slugToIso(m.country.slug) ? <FlagIcon code={slugToIso(m.country.slug)!} size="sm" /> : <span style={{ fontSize: 20 }}>{m.country.flagEmoji}</span>}
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.8)', flex: 1 }}>{m.country.name}</span>
                    <div style={{ width: 100, height: 2, background: 'rgba(255,255,255,0.07)', borderRadius: 2 }}>
                      <div style={{ width: `${m.matchPercent}%`, height: '100%', background: 'rgba(255,255,255,0.4)', borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.6)', minWidth: 36, textAlign: 'right' }}>{m.matchPercent}%</span>
                  </Link>
                ))
              )
            ) : (
              <div style={{ position: 'relative' }}>
                <div style={{ filter: 'blur(4px) saturate(0.2)', opacity: 0.4, pointerEvents: 'none' }}>
                  {[4,5,6,7,8].map(n => (
                    <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 22px', borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: S.dimmer, minWidth: 24 }}>{String(n).padStart(2,'0')}</span>
                      <span style={{ fontSize: 20 }}>🌍</span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.8)', flex: 1 }}>———</span>
                      <div style={{ width: 100, height: 2, background: 'rgba(255,255,255,0.07)', borderRadius: 2 }}>
                        <div style={{ width: `${90 - n * 4}%`, height: '100%', background: 'rgba(255,255,255,0.4)', borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.6)', minWidth: 36, textAlign: 'right' }}>{90 - n * 4}%</span>
                    </div>
                  ))}
                </div>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: S.bg, border: `1px solid ${S.borderMd}`, borderRadius: 12, padding: '14px 22px' }}>
                    <Lock style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.7)' }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>22 more countries — Origio Pro</span>
                  </div>
                </div>
              </div>
            )}

            {/* Upgrade CTA */}
            {!isPro && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, padding: '20px 22px', background: 'rgba(255,255,255,0.03)', borderTop: `1px solid ${S.borderMd}`, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontFamily: S.serif, fontSize: 20, color: '#fff', marginBottom: 3 }}>See all 37 — €4.99 once</div>
                  <div style={{ fontSize: 12, color: S.dim }}>Full ranking · salary calculator · visa checklist · 3-country compare</div>
                </div>
                <Link href="/pro"
                  style={{ display: 'inline-flex', alignItems: 'center', background: '#fff', color: '#0a0a0a', border: 'none', borderRadius: 100, padding: '12px 28px', fontSize: 14, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', boxShadow: '0 2px 20px rgba(255,255,255,0.12)' }}>
                  Upgrade to Pro
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Footer — reuse existing component */}
      <Footer />
    </div>
  );
}