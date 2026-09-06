/**
 * Domain types for The Studio tech-pack workspace.
 *
 * These mirror the shape the prototype exercised in-memory. Phase 1B replaces
 * the demo data source with Drizzle queries while keeping these contracts
 * stable, so feature components never learn where the rows came from.
 */

export type SectionKey =
  | "overview"
  | "design"
  | "colorways"
  | "bom"
  | "artwork"
  | "measurements"
  | "sampling"
  | "construction"
  | "packaging"
  | "history";

export type NavKey =
  | "dashboard"
  | "products"
  | "collections"
  | "sketches"
  | "materials"
  | "artwork"
  | "colors"
  | "size-charts"
  | "attachments"
  | "suppliers"
  | "purchase-orders";

export type LibraryKey = Exclude<NavKey, "dashboard" | "products">;

export type ProductStatus =
  | "Draft"
  | "In development"
  | "Sampling"
  | "Revision"
  | "Approved"
  | "In production"
  | "Archived";

export type Product = {
  id: string;
  name: string;
  code: string;
  category: string;
  season: string;
  status: ProductStatus;
  progress: number;
  color: string;
  updated: string;
};

export type Colorway = {
  name: string;
  hex: string;
  code: string;
};

/** A BOM row as the editable grid renders it: type, material, composition, placement, color. */
export type BomRow = readonly [string, string, string, string, string];

/** A point of measure row: code, description, then one value per size XS–XL. */
export type MeasurementRow = readonly [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
];

export type LibraryContent = {
  title: string;
  subtitle: string;
  items: string[];
};

export type WorkflowContent = {
  title: string;
  subtitle: string;
  items: string[];
};
