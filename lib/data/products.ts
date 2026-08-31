import "server-only";

import { cache } from "react";

import { bomRows, colorways, measurements, starterProducts } from "@/lib/demo-data";
import type { BomRow, Colorway, MeasurementRow, Product } from "@/types/techpack";

/**
 * Server-only data access for products and their specification sections.
 *
 * Every reader is wrapped in React `cache()` so a page body and its
 * `generateMetadata` share one execution per request rather than doubling the
 * query load — see the Neon compute rules. Phase 1B replaces the demo source
 * with organization-scoped Drizzle queries behind these same signatures.
 */

export const listProducts = cache(async (): Promise<Product[]> => {
  return starterProducts;
});

export const getProduct = cache(async (productId: string): Promise<Product | null> => {
  return starterProducts.find((product) => product.id === productId) ?? null;
});

export const getColorways = cache(async (_productId: string): Promise<Colorway[]> => {
  return colorways;
});

export const getBomRows = cache(async (_productId: string): Promise<BomRow[]> => {
  return bomRows;
});

export const getMeasurements = cache(async (_productId: string): Promise<MeasurementRow[]> => {
  return measurements;
});
