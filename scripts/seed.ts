/**
 * Development seed — master prompt section 13.
 *
 * Creates the Digital Boutique AI demo organization for The Studio, with the
 * same records the
 * prototype showed, so the migrated UI renders identical content from Postgres.
 *
 * The organization is the account; the brand is what appears on a tech pack.
 * DBAI runs several — Custm.ink is the house brand, Exora Ink is the pilot
 * client. Both are `brands` rows as of the Phase 2 migrations.
 *
 * Refuses to run against production. Never wire this into a deploy step.
 */

import { config } from "dotenv";
import { and, eq } from "drizzle-orm";
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

  /**
   * Brands under the organization (2026-09-05 amendment). The organization is
   * the account; these are what appear on a tech pack. Custm.ink is DBAI's
   * house apparel brand — note that it is *not* the product's name, which is
   * The Studio. Exora Ink is the pilot client.
   */
  const brandSeeds = [
    {
      name: "Custm.ink",
      slug: "custmink",
      primaryColor: "#3451e8",
      isDefault: true,
    },
    {
      name: "Exora Ink",
      slug: "exora-ink",
      primaryColor: "#c97861", // TODO(exora): real brand colour from Colin
      isDefault: false,
    },
  ];

  const brands = new Map<string, string>();
  for (const seed of brandSeeds) {
    const [brand] = await db
      .insert(schema.brands)
      .values({ ...seed, organizationId: organization.id })
      .onConflictDoUpdate({
        target: [schema.brands.organizationId, schema.brands.slug],
        set: { name: seed.name, primaryColor: seed.primaryColor, updatedAt: new Date() },
      })
      .returning();
    if (!brand) throw new Error(`Failed to upsert the ${seed.name} brand`);
    brands.set(seed.slug, brand.id);
  }

  // The backfill migration created a "default"-slug brand for pre-existing
  // rows. Fold those onto Custm.ink so a re-seeded database has two brands,
  // not three, and drop the placeholder.
  const houseBrandId = brands.get("custmink")!;
  const placeholder = await db.query.brands.findFirst({
    where: and(eq(schema.brands.organizationId, organization.id), eq(schema.brands.slug, "default")),
  });
  if (placeholder) {
    await db
      .update(schema.products)
      .set({ brandId: houseBrandId })
      .where(eq(schema.products.brandId, placeholder.id));
    await db
      .update(schema.collections)
      .set({ brandId: houseBrandId })
      .where(eq(schema.collections.brandId, placeholder.id));
    await db.delete(schema.brands).where(eq(schema.brands.id, placeholder.id));
  }

  const [collection] = await db
    .insert(schema.collections)
    .values({
      organizationId: organization.id,
      brandId: houseBrandId,
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
        "A structured, oversized hoodie with a double-layer hood, dropped armholes, long set-in sleeves with ribbed cuffs, deep kangaroo pocket, and premium heavyweight hand feel.",
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

  const productsByCode = new Map<string, string>();

  for (const seed of seedProducts) {
    const [product] = await db
      .insert(schema.products)
      .values({
        ...seed,
        organizationId: organization.id,
        brandId: houseBrandId,
        collectionId,
        createdByUserId: owner.id,
      })
      .onConflictDoUpdate({
        target: [schema.products.organizationId, schema.products.articleCode],
        set: { name: seed.name, status: seed.status, updatedAt: seed.updatedAt },
      })
      .returning();

    if (!product) continue;
    productsByCode.set(seed.articleCode, product.id);

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

  /**
   * Materials library and the hoodie BOM (master prompt section 13, "a complete
   * hoodie BOM"). Values match `lib/demo-data.ts` so the migrated screens show
   * the same content the prototype did.
   *
   * `source: "manual"` with `accepted_at` set: these are human-entered rows, and
   * a seeded row that claimed to be an unreviewed AI draft would be a lie the
   * provenance column exists to prevent.
   */
  const bomSeeds = [
    {
      rowType: "fabric" as const,
      name: "460 GSM loopback cotton",
      composition: "100% organic cotton",
      placement: "Shell / body",
      colorName: "Midnight Navy",
      weightGsm: 460,
      unit: "m",
    },
    {
      rowType: "rib" as const,
      name: "2×2 cotton rib",
      composition: "97% cotton, 3% elastane",
      placement: "Cuffs / waistband",
      colorName: "Tonal",
      weightGsm: 320,
      unit: "m",
    },
    {
      rowType: "trim" as const,
      name: "Recycled drawcord, 10 mm",
      composition: "Recycled polyester",
      placement: "Hood",
      colorName: "Ecru",
      weightGsm: null,
      unit: "m",
    },
    {
      rowType: "label" as const,
      name: "Woven main label",
      composition: "Damask recycled yarn",
      placement: "Back neck",
      colorName: "Black / white",
      weightGsm: null,
      unit: "pc",
    },
  ];

  const hoodieId = productsByCode.get("CI-HOD-2407");
  if (hoodieId) {
    // Idempotent without a unique index: clear this product's rows, then
    // reinsert. Safe because the seed owns every row it writes here.
    await db.delete(schema.bomItems).where(eq(schema.bomItems.productId, hoodieId));

    for (const [position, seed] of bomSeeds.entries()) {
      const [material] = await db
        .insert(schema.materials)
        .values({
          organizationId: organization.id,
          brandId: houseBrandId,
          rowType: seed.rowType,
          name: seed.name,
          composition: seed.composition,
          weightGsm: seed.weightGsm,
          defaultUnit: seed.unit,
          supplierName: "Northstar Apparel",
          source: "manual",
          acceptedAt: new Date(),
        })
        .onConflictDoNothing()
        .returning();

      await db.insert(schema.bomItems).values({
        organizationId: organization.id,
        productId: hoodieId,
        materialId: material?.id ?? null,
        rowType: seed.rowType,
        name: seed.name,
        composition: seed.composition,
        placement: seed.placement,
        colorName: seed.colorName,
        supplierName: "Northstar Apparel",
        unit: seed.unit,
        position,
        source: "manual",
        acceptedAt: new Date(),
      });
    }
  }

  console.log("Seeded organization:", organization.id);
  console.log("Seeded brands:", [...brands.keys()].join(", "));
  console.log("Seeded BOM rows:", hoodieId ? bomSeeds.length : 0);
  console.log("Seeded owner:", owner.id);
  console.log("\nAdd these to .env.local to use the development session:");
  console.log(`DEV_ORGANIZATION_ID="${organization.id}"`);
  console.log(`DEV_USER_ID="${owner.id}"`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
