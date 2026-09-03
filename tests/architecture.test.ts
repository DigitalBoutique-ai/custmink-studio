import { is } from "drizzle-orm";
import { PgTable, getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";

import * as schema from "@/db/schema";

/**
 * Structural tenancy enforcement.
 *
 * The lint rule proves a query *mentions* `organizationId`; this proves the
 * column and its index actually exist on every tenant-owned table. It walks the
 * live Drizzle schema, so a table added in any future phase is covered the
 * moment it is defined — nothing to remember, nothing to update.
 */

/** Tables that are deliberately global rather than tenant-owned. */
const GLOBAL_TABLES = new Set(["users", "organizations"]);

const TENANT_COLUMN = "organization_id";

// The schema module also exports enums and relations, so widen before
// narrowing — the union is not assignable to the type predicate directly.
const tables = (Object.values(schema) as unknown[])
  .filter((value): value is PgTable => is(value, PgTable))
  .map((table) => getTableConfig(table));

/** Column names covered by an index or a primary key, however it was declared. */
function indexedColumnNames(config: ReturnType<typeof getTableConfig>): Set<string> {
  const names = new Set<string>();
  for (const index of config.indexes) {
    for (const column of index.config.columns ?? []) {
      const name = (column as { name?: string }).name;
      if (name) names.add(name);
    }
  }
  for (const pk of config.primaryKeys) {
    for (const column of pk.columns ?? []) {
      names.add(column.name);
    }
  }
  // A single-column primary key declared inline still indexes that column.
  for (const column of config.columns) {
    if (column.primary) names.add(column.name);
  }
  return names;
}

describe("schema tenancy", () => {
  it("defines at least the phase 1 tables", () => {
    expect(tables.length).toBeGreaterThanOrEqual(9);
  });

  it("gives every tenant-owned table an organization_id column", () => {
    const offenders = tables
      .filter((config) => !GLOBAL_TABLES.has(config.name))
      .filter((config) => !config.columns.some((column) => column.name === TENANT_COLUMN))
      .map((config) => config.name);

    expect(
      offenders,
      `these tables have no ${TENANT_COLUMN}. Either scope them to an organization or add them to GLOBAL_TABLES with a reason.`,
    ).toEqual([]);
  });

  it("indexes organization_id everywhere it exists", () => {
    const offenders = tables
      .filter((config) => config.columns.some((column) => column.name === TENANT_COLUMN))
      .filter((config) => !indexedColumnNames(config).has(TENANT_COLUMN))
      .map((config) => config.name);

    expect(
      offenders,
      `these tables carry ${TENANT_COLUMN} but never index it. Every tenant query filters on it, so an unindexed column means a sequential scan and needless Neon compute.`,
    ).toEqual([]);
  });

  it("marks organization_id NOT NULL so a row cannot escape its tenant", () => {
    const offenders = tables
      .flatMap((config) => config.columns.map((column) => ({ table: config.name, column })))
      .filter(({ column }) => column.name === TENANT_COLUMN && !column.notNull)
      .map(({ table }) => table);

    expect(offenders).toEqual([]);
  });
});

describe("schema hygiene", () => {
  it("timestamps every table", () => {
    const offenders = tables
      .filter((config) => !config.columns.some((column) => column.name === "created_at"))
      .map((config) => config.name);

    expect(offenders).toEqual([]);
  });

  it("keeps table names snake_case", () => {
    for (const config of tables) {
      expect(config.name).toMatch(/^[a-z][a-z0-9_]*$/);
    }
  });
});
