/**
 * Route-driven navigation model.
 *
 * The prototype switched panels with `useState`; the production shell drives
 * the same structure from real URLs. Icons are referenced by name so this stays
 * plain data — `components/icon.tsx` resolves names to lucide components.
 */

import type { IconName } from "@/components/icon";
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

export const productSections: ProductSection[] = [
  { id: "overview", label: "Overview", icon: "clipboard-list", done: true },
  { id: "design", label: "Sketch / Design", icon: "shirt", done: true },
  { id: "colorways", label: "Colorways", icon: "palette", done: true },
  { id: "bom", label: "BOM / Materials", icon: "layers-3", done: true },
  { id: "artwork", label: "Artwork", icon: "file-image", done: true },
  { id: "measurements", label: "Sizes / Measurements", icon: "ruler", done: false },
  { id: "sampling", label: "Sampling", icon: "package-check", done: false },
  { id: "construction", label: "Construction", icon: "file-text", done: false },
  { id: "packaging", label: "Packaging / Labels", icon: "tags", done: false },
  { id: "history", label: "Version History", icon: "history", done: true },
];

export function productSectionHref(productId: string, section: SectionKey): string {
  return `/products/${productId}/${section}`;
}

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
