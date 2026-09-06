import { z } from "zod";

import type { BomRow } from "@/types/techpack";

/**
 * BOM row shape, validation, and display mapping.
 *
 * Pure and free of database and session imports, for the same reason
 * `lib/data/product-mapping.ts` is: `server-only` throws under Vitest, and the
 * input schema is the part most worth testing. `lib/actions/bom.ts` holds the
 * session and the write; this holds what a valid row is.
 */

export const BOM_ROW_TYPES = [
  "fabric",
  "lining",
  "rib",
  "trim",
  "thread",
  "label",
  "packaging",
  "misc",
] as const;

export type BomRowType = (typeof BOM_ROW_TYPES)[number];

/**
 * Trimmed, length-bounded free text.
 *
 * An empty field becomes `null`, never `""`. Postgres treats them as different
 * values, so without this a "cleared" cell and a never-filled one sort and
 * compare differently, and `coalesce` stops covering the empty case.
 */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value.length === 0 ? null : value))
    .nullable()
    .optional();

export const bomItemInput = z.object({
  productId: z.string().uuid(),
  rowType: z.enum(BOM_ROW_TYPES).default("fabric"),
  name: z.string().trim().min(1, "A BOM row needs a material name").max(200),
  composition: optionalText(200),
  placement: optionalText(200),
  colorName: optionalText(120),
  supplierName: optionalText(200),
  quantity: optionalText(60),
  unit: z.string().trim().min(1).max(16).default("m"),
  notes: optionalText(1000),
});

export type BomItemInput = z.input<typeof bomItemInput>;
export type BomItemValues = z.output<typeof bomItemInput>;

/** Title-case a row type for display: `rib` -> `Rib`. */
export function labelForRowType(rowType: string): string {
  return rowType.charAt(0).toUpperCase() + rowType.slice(1);
}

/**
 * One stored row as the editable grid and the factory PDF render it.
 *
 * An em dash rather than an empty cell: a blank in a printed BOM reads as an
 * oversight, where "—" reads as deliberately not applicable.
 */
export function toGridRow(item: {
  rowType: string;
  name: string;
  composition: string | null;
  placement: string | null;
  colorName: string | null;
}): BomRow {
  return [
    labelForRowType(item.rowType),
    item.name,
    item.composition ?? "—",
    item.placement ?? "—",
    item.colorName ?? "—",
  ];
}
