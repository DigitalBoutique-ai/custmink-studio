import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Phase 2 schema: identity, tenancy, brands, product records, and the BOM.
 * The remaining tables from master prompt section 5 (colorways, measurements,
 * sampling, sharing, AI, exports) land in the phases that own those screens.
 *
 * Rules that hold for every table added later:
 *   - UUID primary keys
 *   - every tenant-owned row carries `organization_id`
 *   - `created_at` / `updated_at` on everything
 *   - `deleted_at` where a soft delete is meaningful
 *   - indexes on the columns the UI actually filters by
 *   - `source` + `accepted_at` on every table AI can write to (2026-09-05
 *     amendment). `tests/schema-rules.test.ts` fails if one is missing.
 */

export const membershipRole = pgEnum("membership_role", [
  "owner",
  "admin",
  "designer",
  "product_developer",
  "reviewer",
  "factory_guest",
]);

export const productStatus = pgEnum("product_status", [
  "draft",
  "in_development",
  "sampling",
  "revision",
  "approved",
  "in_production",
  "archived",
]);

export const sectionStatus = pgEnum("section_status", ["empty", "in_progress", "complete"]);

/**
 * Where a row came from (2026-09-05 amendment).
 *
 * Lives on the row rather than on the `ai_proposals` record that created it, so
 * provenance survives the proposal being closed and "what in this pack did a
 * model write, and did anyone sign off?" stays answerable for the life of the
 * product. Applying an AI proposal writes `ai_draft`; a human accepting the row
 * sets `accepted_at`.
 */
export const rowSource = pgEnum("row_source", [
  "manual",
  "library",
  "import",
  "api",
  "ai_draft",
]);

/** Columns every AI-writable row table carries. Spread, so none can drift. */
const provenance = {
  source: rowSource("source").notNull().default("manual"),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
};

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Clerk user id; the row is created on first sign-in.
    externalId: text("external_id").notNull(),
    email: text("email").notNull(),
    name: text("name"),
    avatarUrl: text("avatar_url"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("users_external_id_idx").on(table.externalId),
    uniqueIndex("users_email_idx").on(table.email),
  ],
);

export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Clerk organization id.
    externalId: text("external_id").notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    ...timestamps,
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("organizations_external_id_idx").on(table.externalId),
    uniqueIndex("organizations_slug_idx").on(table.slug),
  ],
);

export const memberships = pgTable(
  "memberships",
  {
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: membershipRole("role").notNull().default("designer"),
    ...timestamps,
  },
  (table) => [
    primaryKey({ columns: [table.organizationId, table.userId] }),
    index("memberships_user_idx").on(table.userId),
  ],
);

export const organizationSettings = pgTable("organization_settings", {
  organizationId: uuid("organization_id")
    .primaryKey()
    .references(() => organizations.id, { onDelete: "cascade" }),
  brandLogoUrl: text("brand_logo_url"),
  brandPrimaryColor: text("brand_primary_color"),
  defaultCurrency: text("default_currency").notNull().default("USD"),
  defaultMeasurementUnit: text("default_measurement_unit").notNull().default("cm"),
  ...timestamps,
});

/**
 * A brand under an organization (2026-09-05 amendment).
 *
 * The organization is the account; the brand is what appears on the tech pack.
 * DBAI runs several — Custm.ink is the house brand, Exora Ink the pilot client —
 * and a decorator moving to private label will run more. `organization_settings`
 * keeps organization-level defaults; anything a factory sees belongs here.
 */
export const brands = pgTable(
  "brands",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    logoUrl: text("logo_url"),
    primaryColor: text("primary_color").notNull().default("#3451e8"),
    defaultCurrency: text("default_currency").notNull().default("USD"),
    defaultMeasurementUnit: text("default_measurement_unit").notNull().default("cm"),
    /** The brand new products land under when the caller picks none. */
    isDefault: boolean("is_default").notNull().default(false),
    ...timestamps,
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("brands_org_idx").on(table.organizationId),
    uniqueIndex("brands_org_slug_idx").on(table.organizationId, table.slug),
  ],
);

export const collections = pgTable(
  "collections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    /**
     * Landed by expand/contract: added nullable in 0001 so the migration could
     * apply to populated tables, backfilled by `npm run db:backfill-brands`,
     * made NOT NULL in 0002. Rollback is 0002 in reverse (drop the NOT NULL);
     * the column and its data stay. See docs/reports/phase-2.md.
     */
    brandId: uuid("brand_id")
      .notNull()
      .references(() => brands.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    season: text("season"),
    description: text("description"),
    ...timestamps,
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("collections_org_idx").on(table.organizationId),
    index("collections_brand_idx").on(table.brandId),
  ],
);

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    // NOT NULL from migration 0002 — see `collections.brandId`.
    brandId: uuid("brand_id")
      .notNull()
      .references(() => brands.id, { onDelete: "cascade" }),
    collectionId: uuid("collection_id").references(() => collections.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    articleCode: text("article_code").notNull(),
    category: text("category").notNull(),
    season: text("season"),
    status: productStatus("status").notNull().default("draft"),
    // Hex garment colour shown on cards and the canvas stand-in.
    displayColor: text("display_color").notNull().default("#8faee8"),
    designIntent: text("design_intent"),
    supplierName: text("supplier_name"),
    createdByUserId: uuid("created_by_user_id").references(() => users.id, { onDelete: "set null" }),
    ...timestamps,
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("products_org_status_idx").on(table.organizationId, table.status),
    index("products_org_updated_idx").on(table.organizationId, table.updatedAt),
    uniqueIndex("products_org_article_code_idx").on(table.organizationId, table.articleCode),
    index("products_brand_idx").on(table.brandId),
  ],
);

/** BOM row types, master prompt section 7. */
export const bomRowType = pgEnum("bom_row_type", [
  "fabric",
  "lining",
  "rib",
  "trim",
  "thread",
  "label",
  "packaging",
  "misc",
]);

/**
 * The reusable material library, master prompt section 7 ("Reusable material
 * library"). Brand-scoped per the 2026-09-05 amendment: two brands under one
 * organization do not share a fabric list.
 */
export const materials = pgTable(
  "materials",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    brandId: uuid("brand_id")
      .notNull()
      .references(() => brands.id, { onDelete: "cascade" }),
    rowType: bomRowType("row_type").notNull().default("fabric"),
    name: text("name").notNull(),
    composition: text("composition"),
    supplierName: text("supplier_name"),
    weightGsm: integer("weight_gsm"),
    widthCm: integer("width_cm"),
    defaultUnit: text("default_unit").notNull().default("m"),
    /** Minor units (cents) so money never rounds through a float. */
    costMinor: integer("cost_minor"),
    currency: text("currency").notNull().default("USD"),
    leadTimeDays: integer("lead_time_days"),
    moq: integer("moq"),
    certification: text("certification"),
    notes: text("notes"),
    ...provenance,
    ...timestamps,
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("materials_org_idx").on(table.organizationId),
    index("materials_brand_type_idx").on(table.brandId, table.rowType),
  ],
);

/**
 * One row of a product's bill of materials.
 *
 * Values are copied from `materials` rather than joined at read time: a BOM row
 * is part of an immutable version snapshot, so editing a library material must
 * not retroactively change a spec a factory has already quoted against.
 * `materialId` records where the row came from without making the row depend
 * on it.
 */
export const bomItems = pgTable(
  "bom_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    materialId: uuid("material_id").references(() => materials.id, { onDelete: "set null" }),
    rowType: bomRowType("row_type").notNull().default("fabric"),
    name: text("name").notNull(),
    composition: text("composition"),
    placement: text("placement"),
    colorName: text("color_name"),
    supplierName: text("supplier_name"),
    quantity: text("quantity"),
    unit: text("unit").notNull().default("m"),
    costMinor: integer("cost_minor"),
    currency: text("currency").notNull().default("USD"),
    leadTimeDays: integer("lead_time_days"),
    moq: integer("moq"),
    certification: text("certification"),
    notes: text("notes"),
    /** Drag-ordering position. Sparse by design so a reorder rewrites one row. */
    position: integer("position").notNull().default(0),
    ...provenance,
    ...timestamps,
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("bom_items_org_idx").on(table.organizationId),
    index("bom_items_product_position_idx").on(table.productId, table.position),
  ],
);

export const productSectionStatuses = pgTable(
  "product_section_statuses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    // Matches SectionKey in types/techpack.ts.
    section: text("section").notNull(),
    status: sectionStatus("status").notNull().default("empty"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("product_section_statuses_product_section_idx").on(table.productId, table.section),
    index("product_section_statuses_org_idx").on(table.organizationId),
  ],
);

export const productVersions = pgTable(
  "product_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    versionNumber: integer("version_number").notNull(),
    label: text("label"),
    changeSummary: text("change_summary"),
    /**
     * Immutable snapshot of every section at the moment the version was cut.
     * Restores create a new version rather than mutating history.
     */
    snapshot: text("snapshot").notNull().default(sql`'{}'`),
    isApproved: boolean("is_approved").notNull().default(false),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    createdByUserId: uuid("created_by_user_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("product_versions_product_number_idx").on(table.productId, table.versionNumber),
    index("product_versions_org_idx").on(table.organizationId),
  ],
);

export const activityLogs = pgTable(
  "activity_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    actorUserId: uuid("actor_user_id").references(() => users.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: uuid("entity_id"),
    metadata: text("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("activity_logs_org_created_idx").on(table.organizationId, table.createdAt)],
);

export const organizationsRelations = relations(organizations, ({ many, one }) => ({
  memberships: many(memberships),
  brands: many(brands),
  collections: many(collections),
  products: many(products),
  settings: one(organizationSettings, {
    fields: [organizations.id],
    references: [organizationSettings.organizationId],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(memberships),
}));

export const membershipsRelations = relations(memberships, ({ one }) => ({
  organization: one(organizations, {
    fields: [memberships.organizationId],
    references: [organizations.id],
  }),
  user: one(users, { fields: [memberships.userId], references: [users.id] }),
}));

export const productsRelations = relations(products, ({ many, one }) => ({
  organization: one(organizations, {
    fields: [products.organizationId],
    references: [organizations.id],
  }),
  brand: one(brands, { fields: [products.brandId], references: [brands.id] }),
  collection: one(collections, {
    fields: [products.collectionId],
    references: [collections.id],
  }),
  sectionStatuses: many(productSectionStatuses),
  versions: many(productVersions),
  bomItems: many(bomItems),
}));

export const brandsRelations = relations(brands, ({ many, one }) => ({
  organization: one(organizations, {
    fields: [brands.organizationId],
    references: [organizations.id],
  }),
  collections: many(collections),
  products: many(products),
  materials: many(materials),
}));

export const bomItemsRelations = relations(bomItems, ({ one }) => ({
  product: one(products, { fields: [bomItems.productId], references: [products.id] }),
  material: one(materials, { fields: [bomItems.materialId], references: [materials.id] }),
}));

export const collectionsRelations = relations(collections, ({ many, one }) => ({
  organization: one(organizations, {
    fields: [collections.organizationId],
    references: [organizations.id],
  }),
  products: many(products),
}));
