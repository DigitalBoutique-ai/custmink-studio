/**
 * Backfill step of the brands expand/contract migration.
 *
 * Migration 0001 added `brand_id` to `products` and `collections` as nullable,
 * because adding a NOT NULL column to a populated table fails outright. This
 * gives every organization a default brand and points its existing rows at it;
 * migration 0002 then makes the column NOT NULL.
 *
 * Idempotent: safe to run repeatedly, and a no-op once every row is assigned.
 * Run against any environment that has product rows *before* applying 0002.
 *
 * Usage: npm run db:backfill-brands
 */
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { isNull, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "../db/schema";

config({ path: ".env.local" });
config({ path: ".env" });

// Its own client rather than `db/index.ts`, which imports "server-only" and so
// cannot be loaded from a script. Same arrangement as `scripts/seed.ts`.
const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is not set — copy .env.example to .env.local first.");
}
const database = drizzle(neon(url), { schema });

async function main(): Promise<void> {

  const organizations = await database
    .select({ id: schema.organizations.id, name: schema.organizations.name })
    .from(schema.organizations);

  if (organizations.length === 0) {
    console.log("No organizations. Nothing to backfill.");
    return;
  }

  let created = 0;
  let productsUpdated = 0;
  let collectionsUpdated = 0;

  for (const organization of organizations) {
    // One default brand per organization, named after it. A real brand name is
    // a product decision, not a migration's to make — this only has to be
    // non-null and correct, and it is renameable in the UI afterwards.
    const slug = "default";
    const [brand] = await database
      .insert(schema.brands)
      .values({
        organizationId: organization.id,
        name: organization.name,
        slug,
        isDefault: true,
      })
      .onConflictDoUpdate({
        target: [schema.brands.organizationId, schema.brands.slug],
        set: { updatedAt: new Date() },
      })
      .returning();

    if (!brand) throw new Error(`Failed to upsert a default brand for ${organization.id}`);
    created += 1;

    const products = await database
      .update(schema.products)
      .set({ brandId: brand.id })
      .where(sql`${schema.products.organizationId} = ${organization.id} and ${schema.products.brandId} is null`)
      .returning({ id: schema.products.id });
    productsUpdated += products.length;

    const collections = await database
      .update(schema.collections)
      .set({ brandId: brand.id })
      .where(sql`${schema.collections.organizationId} = ${organization.id} and ${schema.collections.brandId} is null`)
      .returning({ id: schema.collections.id });
    collectionsUpdated += collections.length;
  }

  const [remainingProducts] = await database
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.products)
    .where(isNull(schema.products.brandId));
  const [remainingCollections] = await database
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.collections)
    .where(isNull(schema.collections.brandId));

  console.log(`Organizations processed: ${organizations.length}`);
  console.log(`Default brands upserted: ${created}`);
  console.log(`Products assigned:       ${productsUpdated}`);
  console.log(`Collections assigned:    ${collectionsUpdated}`);
  console.log(`Products still null:     ${remainingProducts?.count ?? "?"}`);
  console.log(`Collections still null:  ${remainingCollections?.count ?? "?"}`);

  // The contract migration will fail on a NOT NULL violation if anything is
  // left. Better to refuse here, where the message says what to do about it.
  if ((remainingProducts?.count ?? 0) > 0 || (remainingCollections?.count ?? 0) > 0) {
    throw new Error("Rows still have a null brand_id. Do not apply migration 0002 yet.");
  }
  console.log("\nBackfill complete. Safe to apply migration 0002.");
}

void main().then(
  () => process.exit(0),
  (error) => {
    console.error(error);
    process.exit(1);
  },
);
