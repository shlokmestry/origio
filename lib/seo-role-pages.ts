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
];