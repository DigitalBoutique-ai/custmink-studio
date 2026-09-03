import type { IconName } from "@/components/icon";
import type { Capability } from "@/lib/auth/permissions";
import type { SectionKey } from "@/types/techpack";

/**
 * The single source of truth for tech-pack sections.
 *
 * Navigation, route structure, readiness scoring, cache tags, the sitemap, the
 * route-200 sweep, and the tenant-isolation test all derive from this list.
 * Adding a section means adding one entry here and then following the vertical
 * slice in CLAUDE.md — nothing downstream is maintained by hand.
 *
 * Plain data only: no React components, no database imports. It is imported on
 * both sides of the server/client boundary.
 */

export type SectionSpec = {
  id: SectionKey;
  /** Shown in the table of contents and the content header. */
  label: string;
  icon: IconName;
  /**
   * The table backing this section's rows. `products` means the section edits
   * the product record itself rather than a child collection.
   */
  table: string;
  /** Capability required to edit. Reading is always `product:read`. */
  capability: Capability;
  /**
   * Master-prompt phase that delivers real persistence for this section.
   * Anything above the current phase still reads from `lib/demo-data.ts`.
   */
  deliveredInPhase: 2 | 3 | 4 | 5;
};

export const productSectionSpecs = [
  {
    id: "overview",
    label: "Overview",
    icon: "clipboard-list",
    table: "products",
    capability: "product:update",
    deliveredInPhase: 2,
  },
  {
    id: "design",
    label: "Sketch / Design",
    icon: "shirt",
    table: "canvas_documents",
    capability: "product:update",
    deliveredInPhase: 3,
  },
  {
    id: "colorways",
    label: "Colorways",
    icon: "palette",
    table: "colorways",
    capability: "product:update",
    deliveredInPhase: 2,
  },
  {
    id: "bom",
    label: "BOM / Materials",
    icon: "layers-3",
    table: "bom_items",
    capability: "product:update",
    deliveredInPhase: 2,
  },
  {
    id: "artwork",
    label: "Artwork",
    icon: "file-image",
    table: "artwork_placements",
    capability: "product:update",
    deliveredInPhase: 3,
  },
  {
    id: "measurements",
    label: "Sizes / Measurements",
    icon: "ruler",
    table: "measurement_values",
    capability: "product:update",
    deliveredInPhase: 2,
  },
  {
    id: "sampling",
    label: "Sampling",
    icon: "package-check",
    table: "sampling_rounds",
    capability: "product:update",
    deliveredInPhase: 4,
  },
  {
    id: "construction",
    label: "Construction",
    icon: "file-text",
    table: "construction_instructions",
    capability: "product:update",
    deliveredInPhase: 2,
  },
  {
    id: "packaging",
    label: "Packaging / Labels",
    icon: "tags",
    table: "packaging_items",
    capability: "product:update",
    deliveredInPhase: 2,
  },
  {
    id: "history",
    label: "Version History",
    icon: "history",
    table: "product_versions",
    capability: "product:read",
    deliveredInPhase: 4,
  },
] as const satisfies readonly SectionSpec[];

/** Every section id, in table-of-contents order. */
export const sectionKeys = productSectionSpecs.map((section) => section.id);

/**
 * Denominator for the factory-readiness score. Widened to `number` so the
 * divide-by-zero guard in `readinessScore` stays live rather than being
 * narrowed away to a literal.
 */
export const TOTAL_SECTIONS: number = productSectionSpecs.length;

export function findSectionSpec(id: SectionKey): SectionSpec | undefined {
  return productSectionSpecs.find((section) => section.id === id);
}

export function productSectionHref(productId: string, section: SectionKey): string {
  return `/products/${productId}/${section}`;
}

/**
 * Cache tag for one section's rows within one organization.
 *
 * Every server action that writes to a section must call
 * `revalidateTag(sectionTag(id, organizationId))`, or reads stay stale for the
 * full hour-long `unstable_cache` window.
 */
export function sectionTag(id: SectionKey, organizationId: string): string {
  return `section:${id}:${organizationId}`;
}

/** Tables that back sections and therefore must be organization-scoped. */
export const sectionTables = [
  ...new Set(productSectionSpecs.map((section) => section.table)),
];
