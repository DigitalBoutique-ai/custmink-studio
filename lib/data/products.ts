import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { and, desc, eq, getTableColumns, isNull, sql } from "drizzle-orm";

import { db } from "@/db";
import { productSectionStatuses, products } from "@/db/schema";
import { assertCan } from "@/lib/auth/permissions";
import { getSession } from "@/lib/auth/session";
import { bomRows, colorways, measurements, starterProducts } from "@/lib/demo-data";
import { hasDatabase } from "@/lib/env";
import { toProduct } from "@/lib/data/product-mapping";
import type { BomRow, Colorway, MeasurementRow, Product } from "@/types/techpack";

/**
 * Server-only data access for products.
 *
 * Tenant scoping is enforced here, not in the UI: every query filters on the
 * session's `organization_id`, and the caller's role is checked against the
 * central authorization service before any row is read.
 *
 * Readers are wrapped in React `cache()` so a page body and its
 * `generateMetadata` share one execution per request, and in `unstable_cache`
 * with an org-scoped tag so repeat requests do not wake the database. Mutations
 * added in Phase 2 must call `revalidateTag(productsTag(organizationId))`.
 */

export function productsTag(organizationId: string): string {
  return `products:${organizationId}`;
}

/**
 * Completion count comes back from a grouped left join rather than a correlated
 * subquery: drizzle renders subquery columns unqualified, which silently made
 * `product_id = id` compare a row to itself and scored every product at 0%.
 */
const completeSectionCount = sql<number>`(count(${productSectionStatuses.id}) filter (where ${productSectionStatuses.status} = 'complete'))::int`;

function loadProducts(organizationId: string) {
  return unstable_cache(
    async () => {
      const rows = await db()
        .select({ ...getTableColumns(products), completeSections: completeSectionCount })
        .from(products)
        .leftJoin(productSectionStatuses, eq(productSectionStatuses.productId, products.id))
        .where(and(eq(products.organizationId, organizationId), isNull(products.deletedAt)))
        .groupBy(products.id)
        .orderBy(desc(products.updatedAt));
      return rows.map((row) => toProduct(row));
    },
    ["products", organizationId],
    { tags: [productsTag(organizationId)], revalidate: 3600 },
  )();
}

export const listProducts = cache(async (): Promise<Product[]> => {
  const session = await getSession();
  // Without a session or a database the app still renders the demo dataset,
  // which is what Phase 1A shipped and what the tests assert against.
  if (!session || !hasDatabase()) return starterProducts;

  assertCan(session.role, "product:read");
  return loadProducts(session.organizationId);
});

export const getProduct = cache(async (productId: string): Promise<Product | null> => {
  const session = await getSession();
  if (!session || !hasDatabase()) {
    return starterProducts.find((product) => product.id === productId) ?? null;
  }

  assertCan(session.role, "product:read");
  const all = await loadProducts(session.organizationId);
  return all.find((product) => product.id === productId) ?? null;
});

/**
 * Colorways, BOM rows, and measurements still come from the demo dataset —
 * their tables land in Phase 2 with the screens that edit them. The signatures
 * are already product-scoped so only the bodies change.
 */
export const getColorways = cache(async (_productId: string): Promise<Colorway[]> => {
  return colorways;
});

export const getBomRows = cache(async (_productId: string): Promise<BomRow[]> => {
  return bomRows;
});

export const getMeasurements = cache(async (_productId: string): Promise<MeasurementRow[]> => {
  return measurements;
});
