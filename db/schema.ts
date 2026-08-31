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
 * Phase 1B schema: identity, tenancy, and the product records the dashboard and
 * product list read. The remaining tables from master prompt section 5
 * (colorways, BOM, measurements, sampling, sharing, AI, exports) land in the
 * phases that own those screens.
 *
 * Rules that hold for every table added later:
 *   - UUID primary keys
 *   - every tenant-owned row carries `organization_id`
 *   - `created_at` / `updated_at` on everything
 *   - `deleted_at` where a soft delete is meaningful
 *   - indexes on the columns the UI actually filters by
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

export const collections = pgTable(
  "collections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    season: text("season"),
    description: text("description"),
    ...timestamps,
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [index("collections_org_idx").on(table.organizationId)],
);

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
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
  collection: one(collections, {
    fields: [products.collectionId],
    references: [collections.id],
  }),
  sectionStatuses: many(productSectionStatuses),
  versions: many(productVersions),
}));

export const collectionsRelations = relations(collections, ({ many, one }) => ({
  organization: one(organizations, {
    fields: [collections.organizationId],
    references: [organizations.id],
  }),
  products: many(products),
}));
