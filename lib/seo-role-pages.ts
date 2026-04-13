export type CountryCard = {
  name: string;
  slug: string;
  salary: string;
  tax: string;
  visa: string;
  language: string;
  qualityOfLife: string;
  why: string;
};

export type RolePage = {
  slug: string;
  title: string;
  intro: string;
  metaDescription: string;
  countries: CountryCard[];
  faqs: {
    question: string;
    answer: string;
  }[];
};

export const rolePages: RolePage[] = [
  {
    slug: "software-engineers",
    title: "Best Countries for Software Engineers in 2026",
    intro:
      "These countries stand out for software engineers because they combine strong salaries, healthy tech hiring, and a better quality-of-life tradeoff than many other markets.",
    metaDescription:
      "Compare the best countries for software engineers in 2026 by salary, tax, visas, language, and quality of life.",
    countries: [
      {
        name: "United States",
        slug: "united-states",
        salary: "$120k–$180k",
        tax: "Medium to high, varies by state",
        visa: "Harder",
        language: "English",
        qualityOfLife: "High",
        why: "Best for top-end compensation and large-scale tech opportunities.",
      },
      {
        name: "Canada",
        slug: "canada",
        salary: "CA$90k–CA$140k",
        tax: "Medium",
        visa: "Moderate",
        language: "English",
        qualityOfLife: "High",
        why: "Strong balance of immigration pathways, stability, and tech jobs.",
      },
      {
        name: "Germany",
        slug: "germany",
        salary: "€65k–€95k",
        tax: "High",
        visa: "Moderate",
        language: "German helpful",
        qualityOfLife: "High",
        why: "Good for engineers targeting Europe with strong worker protections.",
      },
      {
        name: "United Kingdom",
        slug: "united-kingdom",
        salary: "£55k–£95k",
        tax: "Medium to high",
        visa: "Moderate",
        language: "English",
        qualityOfLife: "High",
        why: "Solid salary upside with easier English-speaking relocation.",
      },
      {
        name: "Australia",
        slug: "australia",
        salary: "A$100k–A$150k",
        tax: "Medium",
        visa: "Moderate",
        language: "English",
        qualityOfLife: "High",
        why: "Great lifestyle and strong demand in major cities.",
      },
    ],
    faqs: [
      {
        question: "Which country pays software engineers the most?",
        answer:
          "The United States usually offers the highest ceiling for software engineering salaries, especially at large tech companies.",
      },
      {
        question: "Which country is easiest for software engineers to move to?",
        answer:
          "Canada and Australia are often seen as more approachable than the US because of clearer skilled migration routes.",
      },
      {
        question: "Is high salary always better?",
        answer:
          "No. Net income, housing costs, visa friction, healthcare, and long-term residency options matter just as much.",
      },
    ],
  },
  {
    slug: "product-managers",
    title: "Best Countries for Product Managers in 2026",
    intro:
      "The strongest countries for product managers combine mature tech ecosystems, high ownership roles, and enough company density to give you career leverage.",
    metaDescription:
      "Find the best countries for product managers in 2026 based on salary, tax, visas, language, and quality of life.",
    countries: [
      {
        name: "United States",
        slug: "united-states",
        salary: "$130k–$190k",
        tax: "Medium to high, varies by state",
        visa: "Harder",
        language: "English",
        qualityOfLife: "High",
        why: "Deepest PM market with the strongest pay and product maturity.",
      },
      {
        name: "United Kingdom",
        slug: "united-kingdom",
        salary: "£65k–£110k",
        tax: "Medium to high",
        visa: "Moderate",
        language: "English",
        qualityOfLife: "High",
        why: "London remains one of the best PM hubs outside the US.",
      },
      {
        name: "Canada",
        slug: "canada",
        salary: "CA$100k–CA$150k",
        tax: "Medium",
        visa: "Moderate",
        language: "English",
        qualityOfLife: "High",
        why: "Growing PM market with a strong relocation profile.",
      },
      {
        name: "Germany",
        slug: "germany",
        salary: "€70k–€110k",
        tax: "High",
        visa: "Moderate",
        language: "German helpful",
        qualityOfLife: "High",
        why: "Strong B2B and industrial-tech product environment.",
      },
      {
        name: "Australia",
        slug: "australia",
        salary: "A$120k–A$170k",
        tax: "Medium",
        visa: "Moderate",
        language: "English",
        qualityOfLife: "High",
        why: "Strong quality of life and solid PM demand in top cities.",
      },
    ],
    faqs: [
      {
        question: "Where are the best PM jobs outside the US?",
        answer:
          "The UK, Canada, Germany, and Australia are among the strongest alternatives depending on your visa and salary priorities.",
      },
      {
        question: "Do product managers need the local language?",
        answer:
          "Not always, but it helps a lot in markets where cross-functional work extends beyond English-speaking teams.",
      },
    ],
  },
  {
    slug: "designers",
    title: "Best Countries for Designers in 2026",
    intro:
      "For designers, the best countries usually mix strong digital-product ecosystems with good quality of life, international teams, and enough design maturity to value the role properly.",
    metaDescription:
      "Explore the best countries for designers in 2026 with salary, tax, visa, language, and lifestyle comparisons.",
    countries: [
      {
        name: "United States",
        slug: "united-states",
        salary: "$100k–$160k",
        tax: "Medium to high, varies by state",
        visa: "Harder",
        language: "English",
        qualityOfLife: "High",
        why: "Highest upside for product and brand designers at scale.",
      },
      {
        name: "United Kingdom",
        slug: "united-kingdom",
        salary: "£50k–£90k",
        tax: "Medium to high",
        visa: "Moderate",
        language: "English",
        qualityOfLife: "High",
        why: "Strong creative scene with a mature digital design market.",
      },
      {
        name: "Canada",
        slug: "canada",
        salary: "CA$80k–CA$125k",
        tax: "Medium",
        visa: "Moderate",
        language: "English",
        qualityOfLife: "High",
        why: "Balanced relocation path with stable design opportunities.",
      },
      {
        name: "Germany",
        slug: "germany",
        salary: "€55k–€85k",
        tax: "High",
        visa: "Moderate",
        language: "German helpful",
        qualityOfLife: "High",
        why: "Good option for designers targeting Europe and product-heavy firms.",
      },
      {
        name: "Australia",
        slug: "australia",
        salary: "A$90k–A$135k",
        tax: "Medium",
        visa: "Moderate",
        language: "English",
        qualityOfLife: "High",
        why: "Great lifestyle and steady demand in larger city markets.",
      },
    ],
    faqs: [
      {
        question: "What is the best country for UX designers?",
        answer:
          "The answer depends on your priorities, but the US leads on pay while countries like Canada and Australia often look better on lifestyle and migration.",
      },
      {
        question: "Should designers optimize for salary alone?",
        answer:
          "Usually no. Portfolio growth, market maturity, visa options, and cost of living matter a lot.",
      },
    ],
  },
  {
    slug: "nurses",
    title: "Best Countries for Nurses in 2026",
    intro:
      "Nurses are in high demand globally. The best countries offer strong salaries, clear registration pathways for international nurses, and excellent working conditions.",
    metaDescription:
      "Compare the best countries for nurses in 2026 by salary, registration requirements, visa routes, and quality of life.",
    countries: [
      {
        name: "Australia",
        slug: "australia",
        salary: "A$70k–A$95k",
        tax: "Medium",
        visa: "Moderate",
        language: "English",
        qualityOfLife: "High",
        why: "High demand for nurses with clear AHPRA registration pathway for internationally qualified nurses.",
      },
      {
        name: "Canada",
        slug: "canada",
        salary: "CA$65k–CA$90k",
        tax: "Medium",
        visa: "Moderate",
        language: "English",
        qualityOfLife: "High",
        why: "Shortage-driven demand across provinces with structured immigration routes.",
      },
      {
        name: "United Kingdom",
        slug: "united-kingdom",
        salary: "£28k–£45k",
        tax: "Medium",
        visa: "Moderate",
        language: "English",
        qualityOfLife: "High",
        why: "NHS actively recruits internationally with a defined overseas registration process.",
      },
      {
        name: "Ireland",
        slug: "ireland",
        salary: "€35k–€55k",
        tax: "Medium to high",
        visa: "Easy for EU",
        language: "English",
        qualityOfLife: "High",
        why: "Strong demand, English-speaking, and easy entry for EU passport holders.",
      },
      {
        name: "UAE",
        slug: "uae",
        salary: "AED 8,000–AED 14,000/mo",
        tax: "None",
        visa: "Moderate",
        language: "English widely used",
        qualityOfLife: "High",
        why: "Tax-free salaries with strong expat nursing community and modern hospitals.",
      },
    ],
    faqs: [
      {
        question: "Which country is easiest for nurses to immigrate to?",
        answer:
          "Australia and Canada have the clearest pathways for internationally qualified nurses, with structured registration and skilled migration routes.",
      },
      {
        question: "Do nurses need to re-qualify when moving abroad?",
        answer:
          "Usually not fully, but most countries require registration with the local nursing body, English language tests, and credential verification.",
      },
      {
        question: "Is tax-free nursing in the UAE worth it?",
        answer:
          "For many nurses yes — the combination of no income tax and competitive salaries means take-home pay is significantly higher than in Europe.",
      },
    ],
  },
  {
    slug: "teachers",
    title: "Best Countries for Teachers in 2026",
    intro:
      "Teaching abroad can combine career growth with an international lifestyle. The best destinations offer good salaries, respected qualifications, and manageable visa routes.",
    metaDescription:
      "Find the best countries for teachers in 2026 — salary, visa routes, qualification recognition, and quality of life compared.",
    countries: [
      {
        name: "UAE",
        slug: "uae",
        salary: "AED 10,000–AED 20,000/mo",
        tax: "None",
        visa: "Moderate",
        language: "English",
        qualityOfLife: "High",
        why: "Tax-free salaries at international schools with housing and flights often included.",
      },
      {
        name: "Singapore",
        slug: "singapore",
        salary: "S$40k–S$65k",
        tax: "Low",
        visa: "Moderate",
        language: "English",
        qualityOfLife: "High",
        why: "Highly respected profession with strong salaries and excellent public school system.",
      },
      {
        name: "Australia",
        slug: "australia",
        salary: "A$65k–A$95k",
        tax: "Medium",
        visa: "Moderate",
        language: "English",
        qualityOfLife: "High",
        why: "Shortage of teachers in many states drives competitive pay and fast registration.",
      },
      {
        name: "Canada",
        slug: "canada",
        salary: "CA$55k–CA$85k",
        tax: "Medium",
        visa: "Moderate",
        language: "English",
        qualityOfLife: "High",
        why: "Strong public school salaries and clear credential recognition process.",
      },
      {
        name: "Germany",
        slug: "germany",
        salary: "€45k–€65k",
        tax: "High",
        visa: "Moderate",
        language: "German required",
        qualityOfLife: "High",
        why: "Well-paid and respected profession with strong job security.",
      },
    ],
    faqs: [
      {
        question: "Do I need a teaching degree to teach abroad?",
        answer:
          "For public schools yes — most countries require a recognised teaching qualification. International schools may have more flexibility.",
      },
      {
        question: "Which country pays teachers the most?",
        answer:
          "The UAE and Singapore consistently offer the highest effective teaching salaries when factoring in tax rates and benefits packages.",
      },
      {
        question: "Is TEFL teaching different from qualified teaching?",
        answer:
          "Yes. TEFL covers English language teaching and has its own job market. Qualified teachers with subject expertise have more options and higher salaries.",
      },
    ],
  },
  {
    slug: "accountants",
    title: "Best Countries for Accountants in 2026",
    intro:
      "Accountants with internationally recognised qualifications like ACCA, CPA, or CFA have strong options globally. The best countries combine high demand, good salaries, and clear credential pathways.",
    metaDescription:
      "Compare the best countries for accountants in 2026 by salary, tax, visa routes, qualification recognition, and quality of life.",
    countries: [
      {
        name: "Australia",
        slug: "australia",
        salary: "A$70k–A$110k",
        tax: "Medium",
        visa: "Moderate",
        language: "English",
        qualityOfLife: "High",
        why: "Strong demand for accountants with CPA Australia pathway well-defined for international applicants.",
      },
      {
        name: "Canada",
        slug: "canada",
        salary: "CA$60k–CA$95k",
        tax: "Medium",
        visa: "Moderate",
        language: "English",
        qualityOfLife: "High",
        why: "CPA Canada has clear bridging programs and accounting is on the skilled worker list.",
      },
      {
        name: "United Kingdom",
        slug: "united-kingdom",
        salary: "£40k–£70k",
        tax: "Medium to high",
        visa: "Moderate",
        language: "English",
        qualityOfLife: "High",
        why: "ACCA and CIMA are globally recognised and London is a major finance hub.",
      },
      {
        name: "Singapore",
        slug: "singapore",
        salary: "S$55k–S$90k",
        tax: "Low",
        visa: "Moderate",
        language: "English",
        qualityOfLife: "High",
        why: "Regional finance hub with competitive salaries and low personal tax rates.",
      },
      {
        name: "UAE",
        slug: "uae",
        salary: "AED 10,000–AED 18,000/mo",
        tax: "None",
        visa: "Moderate",
        language: "English widely used",
        qualityOfLife: "High",
        why: "Tax-free income with strong demand across audit, finance, and corporate sectors.",
      },
    ],
    faqs: [
      {
        question: "Are accounting qualifications recognised internationally?",
        answer:
          "ACCA, CPA, and CFA are the most portable. Each country has its own recognition process but these qualifications are well respected globally.",
      },
      {
        question: "Which country has the highest accountant salaries?",
        answer:
          "The UAE offers the highest take-home due to zero income tax. The US and Australia lead on gross salaries.",
      },
      {
        question: "Do accountants need to re-qualify when moving abroad?",
        answer:
          "Often not fully, but most countries require registration with the local accounting body and may require bridging exams.",
      },
    ],
  },
  {
    slug: "marketing-managers",
    title: "Best Countries for Marketing Managers in 2026",
    intro:
      "Marketing managers with digital, brand, or growth experience are in demand across markets. The best countries combine strong salaries, mature marketing ecosystems, and manageable visa routes.",
    metaDescription:
      "Find the best countries for marketing managers in 2026 — salary, visa, language, and career opportunities compared.",
    countries: [
      {
        name: "United States",
        slug: "united-states",
        salary: "$90k–$140k",
        tax: "Medium to high, varies by state",
        visa: "Harder",
        language: "English",
        qualityOfLife: "High",
        why: "Largest marketing budgets and most sophisticated digital marketing ecosystem globally.",
      },
      {
        name: "United Kingdom",
        slug: "united-kingdom",
        salary: "£50k–£80k",
        tax: "Medium to high",
        visa: "Moderate",
        language: "English",
        qualityOfLife: "High",
        why: "London is a global marketing hub with strong agency and brand-side opportunities.",
      },
      {
        name: "Australia",
        slug: "australia",
        salary: "A$90k–A$130k",
        tax: "Medium",
        visa: "Moderate",
        language: "English",
        qualityOfLife: "High",
        why: "Growing digital market with strong demand for experienced marketing leaders.",
      },
      {
        name: "Canada",
        slug: "canada",
        salary: "CA$75k–CA$115k",
        tax: "Medium",
        visa: "Moderate",
        language: "English",
        qualityOfLife: "High",
        why: "Steady demand with Toronto and Vancouver as major marketing centres.",
      },
      {
        name: "Singapore",
        slug: "singapore",
        salary: "S$70k–S$110k",
        tax: "Low",
        visa: "Moderate",
        language: "English",
        qualityOfLife: "High",
        why: "Regional hub for APAC marketing roles with competitive pay and low taxes.",
      },
    ],
    faqs: [
      {
        question: "Do marketing managers need local language skills?",
        answer:
          "For most English-speaking markets no, but local language fluency is a significant advantage in Germany, France, and Japan.",
      },
      {
        question: "Which country has the best marketing career opportunities?",
        answer:
          "The US has the highest pay ceiling, but Australia and Singapore offer strong salaries with better work-life balance and easier visa routes.",
      },
      {
        question: "Is digital marketing experience transferable across countries?",
        answer:
          "Yes — digital marketing skills are highly portable. Platform knowledge, data analytics, and growth experience translate well across markets.",
      },
    ],
  },
];