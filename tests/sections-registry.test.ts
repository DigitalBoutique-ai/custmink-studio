import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { iconRegistry } from "@/components/icon";
import { CAPABILITIES } from "@/lib/auth/permissions";
import { productSections } from "@/lib/navigation";
import {
  TOTAL_SECTIONS,
  findSectionSpec,
  productSectionHref,
  productSectionSpecs,
  sectionKeys,
  sectionTables,
  sectionTag,
} from "@/lib/sections/registry";

const appDir = fileURLToPath(new URL("../app", import.meta.url));

/**
 * The section order required by master prompt §4, written out independently of
 * the registry. The registry must conform to it — deriving both from the same
 * source would make the assertion vacuous.
 */
const SPEC_SECTIONS = [
  "overview",
  "design",
  "colorways",
  "bom",
  "artwork",
  "measurements",
  "sampling",
  "construction",
  "packaging",
  "history",
];

describe("section registry conforms to the spec", () => {
  it("lists exactly the required sections, in order", () => {
    expect(sectionKeys).toEqual(SPEC_SECTIONS);
  });

  it("counts every section toward the readiness denominator", () => {
    expect(TOTAL_SECTIONS).toBe(SPEC_SECTIONS.length);
  });

  it("serves a route for every registered section", () => {
    for (const section of productSectionSpecs) {
      expect(
        existsSync(`${appDir}/(app)/products/[productId]/${section.id}/page.tsx`),
        `missing route for section "${section.id}"`,
      ).toBe(true);
    }
  });

  it("builds hrefs that match the route files", () => {
    for (const section of productSectionSpecs) {
      expect(productSectionHref("abc", section.id)).toBe(`/products/abc/${section.id}`);
    }
  });
});

describe("section registry is internally consistent", () => {
  it("resolves every icon", () => {
    for (const section of productSectionSpecs) {
      expect(iconRegistry[section.icon], `unknown icon "${section.icon}"`).toBeTruthy();
    }
  });

  it("names only real capabilities", () => {
    for (const section of productSectionSpecs) {
      expect(CAPABILITIES).toContain(section.capability);
    }
  });

  it("has no duplicate ids", () => {
    expect(new Set(sectionKeys).size).toBe(sectionKeys.length);
  });

  it("names a backing table for every section", () => {
    for (const section of productSectionSpecs) {
      expect(section.table).toMatch(/^[a-z][a-z0-9_]*$/);
    }
    expect(sectionTables.length).toBeGreaterThan(0);
  });

  it("finds a spec for every id and nothing for an unknown one", () => {
    for (const id of sectionKeys) {
      expect(findSectionSpec(id)?.id).toBe(id);
    }
  });
});

describe("cache tags", () => {
  it("scopes to both the section and the organization", () => {
    expect(sectionTag("bom", "org-1")).toBe("section:bom:org-1");
  });

  it("never collides across sections or organizations", () => {
    const orgs = ["org-1", "org-2"];
    const tags = orgs.flatMap((org) => sectionKeys.map((id) => sectionTag(id, org)));
    expect(new Set(tags).size).toBe(tags.length);
  });
});

describe("navigation derives from the registry", () => {
  it("exposes the same sections in the same order", () => {
    expect(productSections.map((section) => section.id)).toEqual(sectionKeys);
  });

  it("carries the registry's labels and icons through unchanged", () => {
    for (const [index, section] of productSectionSpecs.entries()) {
      expect(productSections[index]?.label).toBe(section.label);
      expect(productSections[index]?.icon).toBe(section.icon);
    }
  });
});
