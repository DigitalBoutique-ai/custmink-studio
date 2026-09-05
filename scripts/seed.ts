/**
 * Development seed — master prompt section 13.
 *
 * Creates the Digital Boutique AI demo organization with the same records the
 * prototype showed, so the migrated UI renders identical content from Postgres.
 *
 * The organization is the account; the brand is what appears on a tech pack.
 * DBAI runs several — Custm.ink is the house brand, Exora Ink is the pilot
 * client. Those become `brands` rows once that table lands in the first Phase 2
 * migration (2026-09-05 amendment, master prompt section 13).
 *
 * Refuses to run against production. Never wire this into a deploy step.
 */

import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "../db/schema";

config({ path: ".env.local" });
config({ path: ".env" });

if (process.env.NODE_ENV === "production" && process.env.ALLOW_PRODUCTION_SEED !== "true") {
  throw new Error("Refusing to seed a production database.");
}

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is not set — copy .env.example to .env.local first.");
}

const db = drizzle(neon(url), { schema });

const SECTIONS = [
  "overview",
  "design",
  "colorways",
  "bom",
  "artwork",
  "measurements",
  "sampling",
  "construction",
  "packaging",
  "history",
] as const;

/** Mirrors the prototype's completion badges: 82% readiness on the hoodie. */
const COMPLETE_SECTIONS = new Set([
  "overview",
  "design",
  "colorways",
  "bom",
  "artwork",
  "history",
]);

async function main(): Promise<void> {
  const [organization] = await db
    .insert(schema.organizations)
    .values({
      externalId: "org_seed_custmink_studio",
      name: "Digital Boutique AI",
      slug: "digital-boutique-ai",
    })
    .onConflictDoUpdate({
      // externalId is the upsert key, so an already-seeded database is renamed
      // in place rather than gaining a second organization.
      target: schema.organizations.externalId,
      set: {
        name: "Digital Boutique AI",
        slug: "digital-boutique-ai",
        updatedAt: new Date(),
      },
    })
    .returning();

  if (!organization) throw new Error("Failed to upsert the seed organization");

  const [owner] = await db
    .insert(schema.users)
    .values({
      externalId: "user_seed_tim",
      email: "tim@custmink.studio",
      name: "Tim de Vallée",
    })
    .onConflictDoUpdate({
      target: schema.users.externalId,
      set: { name: "Tim de Vallée", updatedAt: new Date() },
    })
    .returning();

  if (!owner) throw new Error("Failed to upsert the seed owner");

  await db
    .insert(schema.memberships)
    .values({ organizationId: organization.id, userId: owner.id, role: "owner" })
    .onConflictDoNothing();

  await db
    .insert(schema.organizationSettings)
    .values({ organizationId: organization.id, brandPrimaryColor: "#3451e8" })
    .onConflictDoNothing();

  // TODO(brands): once `brands` exists, seed "Custm.ink" and "Exora Ink" here
  // and hang this collection off the Custm.ink brand.
  const [collection] = await db
    .insert(schema.collections)
    .values({
      organizationId: organization.id,
      name: "Riviera Resort 2027",
      season: "FW 2027",
      description: "Twelve styles spanning resort knitwear, jersey, and outerwear.",
    })
    .onConflictDoNothing()
    .returning();

  const collectionId =
    collection?.id ??
    (
      await db.query.collections.findFirst({
        where: eq(schema.collections.organizationId, organization.id),
      })
    )?.id;

  /**
   * Explicit timestamps reproduce the prototype's ordering and its "8 min ago
   * / Yesterday / Aug 27" labels, which are derived from `updated_at` rather
   * than stored as copy.
   */
  const now = Date.now();
  const minutes = (count: number) => new Date(now - count * 60_000);

  const seedProducts = [
    {
      name: "Riviera Oversized Hoodie",
      articleCode: "CI-HOD-2407",
      category: "Hoodies",
      season: "FW 2027",
      status: "sampling" as const,
      displayColor: "#8faee8",
      designIntent:
        "A structured, oversized sleeveless hoodie with a double-layer hood, dropped armholes, deep kangaroo pocket, and premium heavyweight hand feel.",
      supplierName: "Northstar Apparel",
      updatedAt: minutes(8),
    },
    {
      name: "Harbor Heavyweight Tee",
      articleCode: "CI-TEE-2411",
      category: "T-Shirts",
      season: "SS 2027",
      status: "in_development" as const,
      displayColor: "#d9d0bf",
      designIntent: "A boxy 240 GSM jersey tee with a ribbed collar and clean tonal branding.",
      supplierName: "WeaveWorks",
      updatedAt: minutes(60 * 26),
    },
    {
      name: "Atlas Tapered Jogger",
      articleCode: "CI-JOG-2398",
      category: "Bottoms",
      season: "Core",
      status: "approved" as const,
      displayColor: "#303b3c",
      designIntent: "A tapered loopback jogger with a flat drawcord waistband and zip pockets.",
      supplierName: "Pacific Stitch",
      updatedAt: minutes(60 * 24 * 4),
    },
  ];

  for (const seed of seedProducts) {
    const [product] = await db
      .insert(schema.products)
      .values({ ...seed, organizationId: organization.id, collectionId, createdByUserId: owner.id })
      .onConflictDoUpdate({
        target: [schema.products.organizationId, schema.products.articleCode],
        set: { name: seed.name, status: seed.status, updatedAt: seed.updatedAt },
      })
      .returning();

    if (!product) continue;

    for (const section of SECTIONS) {
      const complete =
        seed.status === "approved" ? true : COMPLETE_SECTIONS.has(section);
      await db
        .insert(schema.productSectionStatuses)
        .values({
          organizationId: organization.id,
          productId: product.id,
          section,
          status: complete ? "complete" : "empty",
        })
        .onConflictDoUpdate({
          target: [schema.productSectionStatuses.productId, schema.productSectionStatuses.section],
          set: { status: complete ? "complete" : "empty", updatedAt: new Date() },
        });
    }
  }

  console.log("Seeded organization:", organization.id);
  console.log("Seeded owner:", owner.id);
  console.log("\nAdd these to .env.local to use the development session:");
  console.log(`DEV_ORGANIZATION_ID="${organization.id}"`);
  console.log(`DEV_USER_ID="${owner.id}"`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
