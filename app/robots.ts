import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/brand";

/**
 * Only the marketing routes (`/`, `/pricing`) are meant to be indexed. Nothing
 * in the workspace is, and crawler traffic to database-backed routes is the
 * dominant serverless-compute cost driver — so everything expensive is
 * disallowed and the sitemap lists only what is static.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: ["/api/", "/dashboard", "/products", "/collections", "/libraries", "/suppliers", "/purchase-orders", "/activity", "/settings", "/share", "/accept-invite"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
