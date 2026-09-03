import { TOTAL_SECTIONS } from "@/lib/sections/registry";
import type { Product, ProductStatus } from "@/types/techpack";

/**
 * Pure presentation mapping between a `products` row and the shape the UI
 * renders. Kept free of database imports so the readiness maths, status
 * labelling, and relative timestamps are unit-testable without a connection.
 */

export const STATUS_LABELS: Record<string, ProductStatus> = {
  draft: "Draft",
  in_development: "In development",
  sampling: "Sampling",
  revision: "Revision",
  approved: "Approved",
  in_production: "In production",
  archived: "Archived",
};

export { TOTAL_SECTIONS };

/**
 * Factory-readiness score: the share of specification sections marked complete.
 * Master prompt section 7 requires this to be derived, never hand-entered.
 */
export function readinessScore(completeSections: number): number {
  if (TOTAL_SECTIONS === 0) return 0;
  const clamped = Math.min(Math.max(completeSections, 0), TOTAL_SECTIONS);
  return Math.round((clamped / TOTAL_SECTIONS) * 100);
}

/** Matches the prototype's copy: "8 min ago", "Yesterday", "Aug 27". */
export function relativeTime(value: Date, now: Date = new Date()): string {
  const minutes = Math.floor((now.getTime() - value.getTime()) / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  // Anything older reads as a date, matching the prototype's "Aug 27".
  return value.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export type ProductRowForDisplay = {
  id: string;
  name: string;
  articleCode: string;
  category: string;
  season: string | null;
  status: string;
  displayColor: string;
  updatedAt: Date;
  completeSections: number;
};

export function toProduct(row: ProductRowForDisplay, now?: Date): Product {
  return {
    id: row.id,
    name: row.name,
    code: row.articleCode,
    category: row.category,
    season: row.season ?? "",
    status: STATUS_LABELS[row.status] ?? "Draft",
    progress: readinessScore(row.completeSections),
    color: row.displayColor,
    updated: relativeTime(row.updatedAt, now),
  };
}
