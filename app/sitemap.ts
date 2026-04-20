import { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";

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

export default function sitemap(): MetadataRoute.Sitemap {
  const blogPosts = getAllPosts();

  return [
    { url: BASE, lastModified: NOW, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/wizard`, lastModified: NOW, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/guides`, lastModified: NOW, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/blog`, lastModified: NOW, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/compare`, lastModified: NOW, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/salary-calculator`, lastModified: NOW, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/about`, lastModified: NOW, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/faq`, lastModified: NOW, changeFrequency: "monthly", priority: 0.5 },
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
    ...blogPosts.map(post => ({
      url: `${BASE}/blog/${post.slug}`,
      lastModified: post.date ? new Date(post.date).toISOString() : NOW,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}