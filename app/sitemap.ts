import { MetadataRoute } from "next";
import { ALL_PASSPORTS } from "./passport-power/data";

const BASE = "https://findorigio.com";
const NOW = new Date().toISOString();

const COUNTRY_SLUGS = [
  "australia","austria","belgium","brazil","canada",
  "denmark","finland","france","germany","india",
  "ireland","italy","japan","malaysia","netherlands",
  "new-zealand","norway","portugal","singapore","spain",
  "sweden","switzerland","uae","united-kingdom","usa",
];

const ROLE_SLUGS = [
  "software-engineers","product-managers","designers",
  "nurses","teachers","accountants","marketing-managers",
];

const BLOG_SLUGS = [
  "software-engineer-salary-germany",
  "us-h1b-visa-guide",
  "cost-of-living-dublin-vs-berlin",
];

const CITY_SLUGS = [
  "amsterdam","athens","auckland","bali","bangalore","bangkok","barcelona",
  "belgrade","berlin","brussels","bucharest","budapest","buenos-aires",
  "cape-town","chiang-mai","copenhagen","da-nang","dubai","dublin",
  "helsinki","ho-chi-minh-city","kuala-lumpur","limassol","lisbon","london",
  "malaga","medellin","melbourne","mexico-city","miami","milan","munich",
  "new-york","osaka","oslo","panama-city","paris","porto","prague","rome",
  "san-jose-cr","sao-paulo","seoul","singapore","split","stockholm","sydney",
  "tallinn","tbilisi","tokyo","toronto","vancouver","vienna","warsaw","zurich",
  "san-francisco","austin","madrid","taipei","nairobi",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, lastModified: NOW, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/wizard`, lastModified: NOW, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/cities`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/cities/compare`, lastModified: NOW, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/blog`, lastModified: NOW, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/compare`, lastModified: NOW, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/salary-calculator`, lastModified: NOW, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/about`, lastModified: NOW, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/faq`, lastModified: NOW, changeFrequency: "monthly", priority: 0.5 },
    ...CITY_SLUGS.map(slug => ({
      url: `${BASE}/city/${slug}`,
      lastModified: NOW,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...COUNTRY_SLUGS.map(slug => ({
      url: `${BASE}/country/${slug}`,
      lastModified: NOW,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...ROLE_SLUGS.map(slug => ({
      url: `${BASE}/best-countries-for/${slug}`,
      lastModified: NOW,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    ...BLOG_SLUGS.map(slug => ({
      url: `${BASE}/blog/${slug}`,
      lastModified: NOW,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: `${BASE}/passport-power`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    ...ALL_PASSPORTS.map(p => ({
      url: `${BASE}/passport-power/${p.slug}`,
      lastModified: NOW,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}