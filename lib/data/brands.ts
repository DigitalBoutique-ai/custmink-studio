import "server-only";

import { unstable_cache } from "next/cache";
import { cache } from "react";
import { and, asc, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { brands } from "@/db/schema";
import { assertCan } from "@/lib/auth/permissions";
import { getSession } from "@/lib/auth/session";
import { hasDatabase } from "@/lib/env";

/**
 * Brands under the current organization (2026-09-05 amendment).
 *
 * The organization is the account; a brand is what appears on a tech pack.
 * `organizationId` comes from the session and never from an argument — a caller
 * that could name the organization would be the tenancy boundary gone.
 */

export type Brand = {
  id: string;
  name: string;
  slug: string;
  primaryColor: string;
  logoUrl: string | null;
  defaultCurrency: string;
  defaultMeasurementUnit: string;
  isDefault: boolean;
};

export function brandsTag(organizationId: string): string {
  return `brands:${organizationId}`;
}

/** Stand-in for a session-less render, matching the demo dataset's shape. */
const demoBrands: Brand[] = [
  {
    id: "demo-brand-custmink",
    name: "Custm.ink",
    slug: "custmink",
    primaryColor: "#3451e8",
    logoUrl: null,
    defaultCurrency: "USD",
    defaultMeasurementUnit: "cm",
    isDefault: true,
  },
];

function loadBrands(organizationId: string) {
  return unstable_cache(
    async (): Promise<Brand[]> => {
      const rows = await db()
        .select({
          id: brands.id,
          name: brands.name,
          slug: brands.slug,
          primaryColor: brands.primaryColor,
          logoUrl: brands.logoUrl,
          defaultCurrency: brands.defaultCurrency,
          defaultMeasurementUnit: brands.defaultMeasurementUnit,
          isDefault: brands.isDefault,
        })
        .from(brands)
        .where(and(eq(brands.organizationId, organizationId), isNull(brands.deletedAt)))
        .orderBy(asc(brands.name));
      return rows;
    },
    ["brands", organizationId],
    { tags: [brandsTag(organizationId)], revalidate: 3600 },
  )();
}

export const listBrands = cache(async (): Promise<Brand[]> => {
  const session = await getSession();
  if (!session || !hasDatabase()) return demoBrands;

  assertCan(session.role, "product:read");
  return loadBrands(session.organizationId);
});

/**
 * The brand a new product lands under when the caller picks none.
 *
 * Falls back to the first brand rather than throwing: an organization always
 * has at least one after the backfill, and a missing `is_default` flag should
 * not stop someone creating a product.
 */
export const getDefaultBrand = cache(async (): Promise<Brand | null> => {
  // `listBrands` checks too. Repeated here rather than suppressing the lint
  // rule, because an exported reader whose authorization lives one call away is
  // exactly the shape that becomes a hole when someone reuses the inner helper.
  const session = await getSession();
  if (session) assertCan(session.role, "product:read");

  const all = await listBrands();
  return all.find((brand) => brand.isDefault) ?? all[0] ?? null;
});
