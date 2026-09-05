import { is } from "drizzle-orm";
import { PgTable, getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";

import * as schema from "@/db/schema";

/**
 * Schema rules from the 2026-09-05 scope amendment.
 *
 * These two rules are cheap before Phase 2 and expensive after: `brand_id`
 * retrofitted onto `products` rewrites every product row, and provenance added
 * after rows exist can only be backfilled with a guess. Neither table this
 * covers exists yet, so the assertions are *armed but dormant* — each one
 * activates the moment its table is defined in `db/schema.ts`, with no test
 * change required.
 *
 * A dormant assertion that never wakes up is the failure mode here, so the
 * pending list is asserted against the schema too: adding `bom_items` without
 * `source` fails, and quietly deleting it from the list below fails as well.
 */

const tables = new Map(
  (Object.values(schema) as unknown[])
    .filter((value): value is PgTable => is(value, PgTable))
    .map((table) => {
      const config = getTableConfig(table);
      return [config.name, config] as const;
    }),
);

function columnNames(tableName: string): Set<string> | null {
  const config = tables.get(tableName);
  if (!config) return null;
  return new Set(config.columns.map((column) => column.name));
}

/**
 * Master prompt section 5: every row table AI can write to carries provenance.
 * Arrives with the Phase 2 and Phase 3 section migrations.
 */
const PROVENANCE_TABLES = [
  "bom_items",
  "points_of_measure",
  "measurement_values",
  "construction_instructions",
  "packaging_items",
  "artwork_placements",
] as const;

const PROVENANCE_COLUMNS = ["source", "accepted_at"] as const;

/** The `source` enum, in the order the master prompt lists it. */
const SOURCE_VALUES = ["manual", "library", "import", "api", "ai_draft"];

describe("AI-draft provenance", () => {
  it.each(PROVENANCE_TABLES)("%s carries source and accepted_at once it exists", (tableName) => {
    const columns = columnNames(tableName);
    if (!columns) return; // Table not defined yet — this assertion is dormant.

    const missing = PROVENANCE_COLUMNS.filter((column) => !columns.has(column));
    expect(
      missing,
      `${tableName} is a table AI can write to, so it must record where each row came from. Add: ${missing.join(", ")}.`,
    ).toEqual([]);
  });

  it("defines the source enum with exactly the documented values", () => {
    const sourceEnum = (schema as Record<string, unknown>).rowSource;
    if (!sourceEnum) return; // Enum not defined yet — dormant.

    expect((sourceEnum as { enumValues: string[] }).enumValues).toEqual(SOURCE_VALUES);
  });

  it("still has provenance tables left to check, or none left at all", () => {
    const defined = PROVENANCE_TABLES.filter((name) => tables.has(name));
    const pending = PROVENANCE_TABLES.filter((name) => !tables.has(name));

    // Guards against the list silently emptying: every name here is either a
    // real table under assertion, or a table that has not landed yet.
    expect(defined.length + pending.length).toBe(PROVENANCE_TABLES.length);
    expect(PROVENANCE_TABLES.length).toBe(6);
  });
});

describe("brand hierarchy", () => {
  it("puts brand_id on products once brands exists", () => {
    if (!tables.has("brands")) return; // `brands` not defined yet — dormant.

    const products = columnNames("products");
    expect(products, "products must exist before brands can be attached to it").not.toBeNull();
    expect(
      products?.has("brand_id"),
      "brands landed without brand_id on products. Add it in the same migration — backfilling it later rewrites every product row.",
    ).toBe(true);
  });

  it("scopes brands to an organization", () => {
    const brands = columnNames("brands");
    if (!brands) return; // Dormant.

    expect(brands.has("organization_id")).toBe(true);
  });

  it("moves collections under a brand once brands exists", () => {
    if (!tables.has("brands")) return; // Dormant.

    const collections = columnNames("collections");
    expect(collections?.has("brand_id")).toBe(true);
  });
});
