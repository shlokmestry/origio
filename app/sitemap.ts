import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
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

const BLOG_SLUGS = [
  "software-engineer-salary-germany",
  "us-h1b-visa-guide",
  "cost-of-living-dublin-vs-berlin",
];

// Fallback list used if the DB query fails
const CITY_SLUGS_FALLBACK = [
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

async function getCitySlugs(): Promise<string[]> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabase.from("cities").select("slug").limit(500);
    if (error || !data?.length) return CITY_SLUGS_FALLBACK;
    return data.map((c: { slug: string }) => c.slug);
  } catch {
    return CITY_SLUGS_FALLBACK;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const citySlugs = await getCitySlugs();

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
    { url: `${BASE}/pro`, lastModified: NOW, changeFrequency: "monthly", priority: 0.6 },
    ...citySlugs.map(slug => ({
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