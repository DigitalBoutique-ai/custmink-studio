/**
 * Route-driven navigation model.
 *
 * The prototype switched panels with `useState`; the production shell drives
 * the same structure from real URLs. Icons are referenced by name so this stays
 * plain data — `components/icon.tsx` resolves names to lucide components.
 */

import type { IconName } from "@/components/icon";
import { productSectionHref, productSectionSpecs } from "@/lib/sections/registry";
import type { SectionKey } from "@/types/techpack";

export type NavItem = {
  href: string;
  label: string;
  icon: IconName;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "layout-dashboard" },
      { href: "/products", label: "Products", icon: "shirt" },
      { href: "/collections", label: "Collections", icon: "folder-kanban" },
    ],
  },
  {
    label: "Libraries",
    items: [
      { href: "/libraries/sketches", label: "Sketch library", icon: "archive" },
      { href: "/libraries/materials", label: "Materials", icon: "layers-3" },
      { href: "/libraries/artwork", label: "Artwork", icon: "file-image" },
      { href: "/libraries/colors", label: "Color library", icon: "swatch-book" },
      { href: "/libraries/size-charts", label: "Size charts", icon: "table-properties" },
      { href: "/libraries/attachments", label: "Attachments", icon: "file-archive" },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/suppliers", label: "Suppliers", icon: "truck" },
      { href: "/purchase-orders", label: "Purchase orders", icon: "shopping-bag" },
      { href: "/activity", label: "Activity", icon: "history" },
    ],
  },
];

export type ProductSection = {
  id: SectionKey;
  label: string;
  icon: IconName;
  /** Demo completion state; Phase 1B reads this from `product_section_statuses`. */
  done: boolean;
};

/**
 * Sections whose checklist tick is shown as complete on the demo product.
 *
 * Phase 2 replaces this with per-product `product_section_statuses` rows; until
 * then the ticks are static while the headline readiness percentage is already
 * derived. Keep the two consistent when wiring it up.
 */
const DEMO_COMPLETE_SECTIONS = new Set<SectionKey>([
  "overview",
  "design",
  "colorways",
  "bom",
  "artwork",
  "history",
]);

/** Derived from the section registry — add sections there, not here. */
export const productSections: ProductSection[] = productSectionSpecs.map((section) => ({
  id: section.id,
  label: section.label,
  icon: section.icon,
  done: DEMO_COMPLETE_SECTIONS.has(section.id),
}));

export { productSectionHref };

export function findSection(section: SectionKey): ProductSection | undefined {
  return productSections.find((item) => item.id === section);
}

/** Icon shown on each library's cards and empty previews. */
export const libraryIcons = {
  collections: "folder-kanban",
  sketches: "shirt",
  materials: "layers-3",
  artwork: "file-image",
  colors: "swatch-book",
  "size-charts": "table-properties",
  attachments: "file-archive",
  suppliers: "truck",
  "purchase-orders": "shopping-bag",
} as const satisfies Record<string, IconName>;
