import { MetadataRoute } from "next";
import { articles } from "@/data/blog/articles";

const SIGNS = [
  "belier", "taureau", "gemeaux", "cancer", "lion", "vierge",
  "balance", "scorpion", "sagittaire", "capricorne", "verseau", "poissons",
];

const BASE_URL = "https://ciel-natal.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  const staticRoutes = [
    { url: BASE_URL, lastModified: now, changeFrequency: "weekly" as const, priority: 1.0 },
    { url: `${BASE_URL}/a-propos`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.4 },
    { url: `${BASE_URL}/confidentialite`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${BASE_URL}/conditions`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${BASE_URL}/signe`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${BASE_URL}/synastrie`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${BASE_URL}/revolution-solaire`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${BASE_URL}/blog`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.7 },
  ];

  const signRoutes = SIGNS.map((slug) => ({
    url: `${BASE_URL}/signe/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const blogRoutes = articles.map((article) => ({
    url: `${BASE_URL}/blog/${article.slug}`,
    lastModified: article.date,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...signRoutes, ...blogRoutes];
}
