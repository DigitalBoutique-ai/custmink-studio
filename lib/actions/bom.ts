"use server";

import "server-only";

import { updateTag } from "next/cache";
import { and, eq, isNull, max } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { bomItems } from "@/db/schema";
import { assertCan } from "@/lib/auth/permissions";
import { requireSession } from "@/lib/auth/session";
import { bomItemInput, type BomItemInput } from "@/lib/bom/rows";
import { bomTag } from "@/lib/data/bom";
import { productsTag } from "@/lib/data/products";

/**
 * BOM mutations.
 *
 * Every action does four things in this order, and the order is the point:
 *
 *   requireSession() -> assertCan(...) -> write -> revalidateTag(...)
 *
 * The tag comes from `lib/sections/registry.ts` via `bomTag`, never a string
 * literal. Reads are cached for an hour, so an action that fails to invalidate
 * is a bug, not a style choice — the UI would silently serve the pre-write BOM
 * until the window expired.
 *
 * The invalidation call is `updateTag`, not `revalidateTag`. CLAUDE.md names
 * the latter, but Next 16 changed it: `revalidateTag(tag, profile)` now takes a
 * required cache profile and purges for *future* requests, while `updateTag`
 * exists specifically for server actions and gives read-your-own-writes. With
 * `revalidateTag` the person who just added a BOM row can be served the cached
 * list that predates it — which is precisely the failure the rule is about.
 *
 * `organizationId` always comes from the session. Nothing in these schemas
 * accepts one, so a crafted request cannot write into another tenant.
 */


export type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

function revalidateBom(organizationId: string): void {
  updateTag(bomTag(organizationId));
  // Readiness is derived from section statuses, which the product list shows.
  updateTag(productsTag(organizationId));
}

export async function createBomItem(input: BomItemInput): Promise<ActionResult> {
  const session = await requireSession();
  assertCan(session.role, "product:update");

  const parsed = bomItemInput.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "That BOM row is not valid",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const { productId, ...values } = parsed.data;

  // Append to the end of *this tenant's* rows for this product.
  const [current] = await db()
    .select({ highest: max(bomItems.position) })
    .from(bomItems)
    .where(
      and(eq(bomItems.organizationId, session.organizationId), eq(bomItems.productId, productId)),
    );

  const [created] = await db()
    .insert(bomItems)
    .values({
      ...values,
      organizationId: session.organizationId,
      productId,
      position: (current?.highest ?? -1) + 1,
      // A row typed by a human is manual and accepted the moment it is saved.
      // Only an applied AI proposal writes `ai_draft` with a null `accepted_at`.
      source: "manual",
      acceptedAt: new Date(),
    })
    .returning({ id: bomItems.id });

  revalidateBom(session.organizationId);
  return { ok: true, id: created?.id };
}

export async function updateBomItem(
  id: string,
  input: Omit<BomItemInput, "productId"> & { productId: string },
): Promise<ActionResult> {
  const session = await requireSession();
  assertCan(session.role, "product:update");

  const parsed = bomItemInput.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "That BOM row is not valid",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const { productId: _productId, ...values } = parsed.data;

  const updated = await db()
    .update(bomItems)
    .set({ ...values, updatedAt: new Date() })
    // The organization filter is what makes the id unguessable-in-effect: a
    // valid uuid from another tenant matches zero rows.
    .where(and(eq(bomItems.id, id), eq(bomItems.organizationId, session.organizationId)))
    .returning({ id: bomItems.id });

  if (updated.length === 0) return { ok: false, error: "That BOM row no longer exists" };

  revalidateBom(session.organizationId);
  return { ok: true, id };
}

/**
 * Soft delete. History and version snapshots must keep referring to the row, so
 * it is marked rather than removed — the master prompt's "restore by creating a
 * new version, never by deleting history".
 */
export async function deleteBomItem(id: string): Promise<ActionResult> {
  const session = await requireSession();
  assertCan(session.role, "product:update");

  const deleted = await db()
    .update(bomItems)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(
      and(
        eq(bomItems.id, id),
        eq(bomItems.organizationId, session.organizationId),
        isNull(bomItems.deletedAt),
      ),
    )
    .returning({ id: bomItems.id });

  if (deleted.length === 0) return { ok: false, error: "That BOM row no longer exists" };

  revalidateBom(session.organizationId);
  return { ok: true, id };
}

/** Drag-reorder. Positions are rewritten in one pass so they stay dense. */
export async function reorderBomItems(
  productId: string,
  orderedIds: string[],
): Promise<ActionResult> {
  const session = await requireSession();
  assertCan(session.role, "product:update");

  const parsed = z.array(z.string().uuid()).max(500).safeParse(orderedIds);
  if (!parsed.success) return { ok: false, error: "That ordering is not valid" };

  for (const [position, id] of parsed.data.entries()) {
    await db()
      .update(bomItems)
      .set({ position, updatedAt: new Date() })
      .where(
        and(
          eq(bomItems.id, id),
          eq(bomItems.organizationId, session.organizationId),
          eq(bomItems.productId, productId),
        ),
      );
  }

  revalidateBom(session.organizationId);
  return { ok: true };
}
