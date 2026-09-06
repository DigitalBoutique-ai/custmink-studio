import { is } from "drizzle-orm";
import { PgTable, getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";

import * as schema from "@/db/schema";
import { BOM_ROW_TYPES, bomItemInput, labelForRowType, toGridRow } from "@/lib/bom/rows";
import { productSectionSpecs } from "@/lib/sections/registry";

/**
 * The BOM slice: input validation, display mapping, and the schema shape the
 * server actions write into.
 *
 * The actions themselves import `server-only`, which throws under Vitest, so
 * what is tested here is everything that decides *what a valid row is* — the
 * part a bad request would exploit. The session and capability checks are
 * covered by `tests/permissions.test.ts`.
 */

const tables = new Map(
  (Object.values(schema) as unknown[])
    .filter((value): value is PgTable => is(value, PgTable))
    .map((table) => {
      const config = getTableConfig(table);
      return [config.name, config] as const;
    }),
);

const PRODUCT_ID = "6f1d9b3e-6a7a-4a3e-9f1b-2c3d4e5f6a7b";

function validInput(overrides: Record<string, unknown> = {}) {
  return { productId: PRODUCT_ID, name: "460 GSM loopback cotton", ...overrides };
}

describe("BOM row validation", () => {
  it("accepts a minimal row and defaults the rest", () => {
    const parsed = bomItemInput.parse(validInput());
    expect(parsed.rowType).toBe("fabric");
    expect(parsed.unit).toBe("m");
  });

  it("rejects a row with no material name", () => {
    const result = bomItemInput.safeParse(validInput({ name: "   " }));
    expect(result.success).toBe(false);
  });

  it("rejects a productId that is not a uuid", () => {
    expect(bomItemInput.safeParse(validInput({ productId: "riviera-hoodie" })).success).toBe(false);
  });

  it("rejects a row type outside the vocabulary", () => {
    expect(bomItemInput.safeParse(validInput({ rowType: "sequins" })).success).toBe(false);
  });

  it("has no slot for an organization id", () => {
    // The tenant is taken from the session, never from input. A schema that
    // silently dropped an extra key would still be safe, but one that accepted
    // it would not be — so assert the shape rather than trusting the caller.
    const parsed = bomItemInput.parse(validInput({ organizationId: "someone-elses-org" }));
    expect(Object.keys(parsed)).not.toContain("organizationId");
  });

  it("turns a cleared field into null rather than an empty string", () => {
    // "" and NULL are different values in Postgres: without this, a cleared
    // cell and a never-filled one compare and sort differently.
    const parsed = bomItemInput.parse(validInput({ composition: "  " }));
    expect(parsed.composition).toBeNull();
  });

  it("trims surrounding whitespace", () => {
    expect(bomItemInput.parse(validInput({ name: "  Rib  " })).name).toBe("Rib");
  });

  it("bounds every free-text field", () => {
    expect(bomItemInput.safeParse(validInput({ name: "x".repeat(201) })).success).toBe(false);
    expect(bomItemInput.safeParse(validInput({ notes: "x".repeat(1001) })).success).toBe(false);
  });
});

describe("BOM display mapping", () => {
  it("title-cases the row type", () => {
    expect(labelForRowType("rib")).toBe("Rib");
    expect(labelForRowType("fabric")).toBe("Fabric");
  });

  it("renders a missing value as an em dash, not a blank", () => {
    const row = toGridRow({
      rowType: "trim",
      name: "Recycled drawcord, 10 mm",
      composition: null,
      placement: "Hood",
      colorName: null,
    });
    expect(row).toEqual(["Trim", "Recycled drawcord, 10 mm", "—", "Hood", "—"]);
  });

  it("produces exactly the five columns the grid and the PDF expect", () => {
    const row = toGridRow({
      rowType: "fabric",
      name: "n",
      composition: "c",
      placement: "p",
      colorName: "col",
    });
    expect(row).toHaveLength(5);
  });
});

describe("bom_items schema", () => {
  const config = tables.get("bom_items");

  it("exists", () => {
    expect(config).toBeDefined();
  });

  it("carries provenance with a safe default", () => {
    const source = config?.columns.find((column) => column.name === "source");
    expect(source?.notNull).toBe(true);
    // Defaulting to `manual` means a row inserted by a path that forgets to set
    // provenance is recorded as human-entered — which is wrong in the safe
    // direction. Defaulting to `ai_draft` would mark real work as unreviewed.
    expect(source?.default).toBe("manual");
    expect(config?.columns.some((column) => column.name === "accepted_at")).toBe(true);
  });

  it("indexes the columns the grid actually orders by", () => {
    const indexed = (config?.indexes ?? []).flatMap((index) =>
      (index.config.columns ?? []).map((column) => (column as { name?: string }).name),
    );
    expect(indexed).toContain("product_id");
    expect(indexed).toContain("position");
  });

  it("covers every row type the enum declares", () => {
    expect([...BOM_ROW_TYPES]).toEqual([...schema.bomRowType.enumValues]);
  });
});

describe("brands schema", () => {
  it("scopes brands to an organization and makes slugs unique within one", () => {
    const config = tables.get("brands");
    expect(config).toBeDefined();
    const unique = (config?.indexes ?? []).filter((index) => index.config.unique);
    const uniqueColumns = unique.flatMap((index) =>
      (index.config.columns ?? []).map((column) => (column as { name?: string }).name),
    );
    // Unique on (organization_id, slug), not on slug alone — two tenants must
    // both be able to have a brand called "default".
    expect(uniqueColumns).toContain("organization_id");
    expect(uniqueColumns).toContain("slug");
  });
});

describe("section registry matches the schema", () => {
  /**
   * Phase-2 sections whose tables have not shipped yet. Delete a name from this
   * list in the same commit that adds its table.
   *
   * The list is asserted in both directions: a section that leaves the list
   * without a table fails, and a table that ships while its name is still on
   * the list fails too. A one-directional allowlist quietly becomes a place
   * where finished work is still marked pending.
   */
  const PENDING_PHASE_2_TABLES = new Set([
    "colorways",
    "measurement_values",
    "construction_instructions",
    "packaging_items",
  ]);

  const deliveredSections = productSectionSpecs
    .filter((section) => section.deliveredInPhase <= 2)
    .filter((section) => section.table !== "products");

  it("has a real table for every section already delivered", () => {
    const missing = deliveredSections
      .filter((section) => !tables.has(section.table))
      .filter((section) => !PENDING_PHASE_2_TABLES.has(section.table))
      .map((section) => `${section.id} -> ${section.table}`);

    expect(
      missing,
      "these sections claim phase-2 delivery but have no table. Add the table, or raise deliveredInPhase.",
    ).toEqual([]);
  });

  it("does not still list a table that has shipped", () => {
    const stale = [...PENDING_PHASE_2_TABLES].filter((table) => tables.has(table));
    expect(
      stale,
      "these tables exist now — remove them from PENDING_PHASE_2_TABLES.",
    ).toEqual([]);
  });

  it("names only real registry tables as pending", () => {
    const registryTables = new Set<string>(deliveredSections.map((section) => section.table));
    const unknown = [...PENDING_PHASE_2_TABLES].filter((table) => !registryTables.has(table));
    expect(unknown, "pending list names a table no section declares").toEqual([]);
  });

  it("has shipped the bom table it claims", () => {
    expect(tables.has("bom_items")).toBe(true);
    expect(PENDING_PHASE_2_TABLES.has("bom_items")).toBe(false);
  });
});
