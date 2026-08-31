import type { MetadataRoute } from "next";

/**
 * Nothing in the workspace is meant to be indexed, and crawler traffic to
 * database-backed routes is the dominant serverless-compute cost driver.
 * Disallow everything expensive from day one.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: ["/api/", "/dashboard", "/products", "/collections", "/libraries", "/suppliers", "/purchase-orders", "/activity", "/settings", "/share", "/accept-invite"],
      },
    ],
  };
}
