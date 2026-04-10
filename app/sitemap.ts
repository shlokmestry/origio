import { MetadataRoute } from "next";

const COUNTRY_SLUGS = [
  "australia", "austria", "belgium", "brazil", "canada",
  "denmark", "finland", "france", "germany", "india",
  "ireland", "italy", "japan", "malaysia", "netherlands",
  "new-zealand", "norway", "portugal", "singapore", "spain",
  "sweden", "switzerland", "uae", "united-kingdom", "usa",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const countryUrls = COUNTRY_SLUGS.map((slug) => ({
    url: `https://origio-one.vercel.app/country/${slug}`,
    lastModified: new Date("2025-03-01"),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: "https://origio-one.vercel.app",
      lastModified: new Date("2025-03-01"),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      url: "https://origio-one.vercel.app/wizard",
      lastModified: new Date("2025-03-01"),
      changeFrequency: "monthly" as const,
      priority: 0.9,
    },
    {
      url: "https://origio-one.vercel.app/compare",
      lastModified: new Date("2025-03-01"),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: "https://origio-one.vercel.app/about",
      lastModified: new Date("2025-03-01"),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: "https://origio-one.vercel.app/faq",
      lastModified: new Date("2025-03-01"),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    ...countryUrls,
  ];
}