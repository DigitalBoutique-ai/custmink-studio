import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/brand";

/** Only the marketing routes. Everything database-backed is disallowed in robots.ts. */
export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/pricing`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/demo`, changeFrequency: "monthly", priority: 0.7 },
  ];
}
