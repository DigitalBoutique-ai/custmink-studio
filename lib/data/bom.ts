import "server-only";

import { unstable_cache } from "next/cache";
import { cache } from "react";
import { and, asc, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { bomItems } from "@/db/schema";
import { assertCan } from "@/lib/auth/permissions";
import { getSession } from "@/lib/auth/session";
import { toGridRow } from "@/lib/bom/rows";
import { bomRows as demoBomRows } from "@/lib/demo-data";
import { hasDatabase } from "@/lib/env";
import { sectionTag } from "@/lib/sections/registry";
import type { BomRow } from "@/types/techpack";

/**
 * Bill of materials rows for one product.
 *
 * Tenant scoping is on `organization_id` from the session, not on the
 * `productId` argument: a caller who guesses another organization's product id
 * gets an empty list rather than someone else's BOM.
 */

export type BomItem = {
  id: string;
  rowType: string;
  name: string;
  composition: string | null;
  placement: string | null;
  colorName: string | null;
  supplierName: string | null;
  quantity: string | null;
  unit: string;
  notes: string | null;
  position: number;
  /** Provenance, per the 2026-09-05 amendment. */
  source: string;
  acceptedAt: Date | null;
};

export function bomTag(organizationId: string): string {
  return sectionTag("bom", organizationId);
}

function loadBomItems(organizationId: string, productId: string) {
  return unstable_cache(
    async (): Promise<BomItem[]> => {
      return db()
        .select({
          id: bomItems.id,
          rowType: bomItems.rowType,
          name: bomItems.name,
          composition: bomItems.composition,
          placement: bomItems.placement,
          colorName: bomItems.colorName,
          supplierName: bomItems.supplierName,
          quantity: bomItems.quantity,
          unit: bomItems.unit,
          notes: bomItems.notes,
          position: bomItems.position,
          source: bomItems.source,
          acceptedAt: bomItems.acceptedAt,
        })
        .from(bomItems)
        .where(
          and(
            eq(bomItems.organizationId, organizationId),
            eq(bomItems.productId, productId),
            isNull(bomItems.deletedAt),
          ),
        )
        .orderBy(asc(bomItems.position));
    },
    ["bom", organizationId, productId],
    { tags: [bomTag(organizationId)], revalidate: 3600 },
  )();
}

export const listBomItems = cache(async (productId: string): Promise<BomItem[]> => {
  const session = await getSession();
  if (!session || !hasDatabase()) return [];

  assertCan(session.role, "product:read");
  return loadBomItems(session.organizationId, productId);
});

/**
 * The BOM as the existing grid renders it.
 *
 * Keeps the `BomRow` tuple contract so the panel does not change shape while
 * its data source does. Falls back to the demo rows when there is no session or
 * no database, which is what production renders and what the tests assert.
 */
export const getBomGridRows = cache(async (productId: string): Promise<BomRow[]> => {
  const session = await getSession();
  if (session) assertCan(session.role, "product:read");

  const items = await listBomItems(productId);
  if (items.length === 0) return demoBomRows;

  return items.map(toGridRow);
});
