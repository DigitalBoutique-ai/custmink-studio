import { describe, expect, it } from "vitest";

import { iconRegistry } from "@/components/icon";
import { bomRows, colorways, libraryContent, measurements, starterProducts, workflowContent } from "@/lib/demo-data";
import { libraryIcons, navGroups, productSections } from "@/lib/navigation";

describe("demo dataset", () => {
  it("keeps the three seed products from the prototype", () => {
    expect(starterProducts.map((product) => product.id)).toEqual([
      "riviera-hoodie",
      "harbor-tee",
      "atlas-jogger",
    ]);
  });

  it("uses valid hex colours for every colorway", () => {
    for (const colorway of colorways) {
      expect(colorway.hex).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it("gives every BOM row the five editable columns the grid renders", () => {
    for (const row of bomRows) {
      expect(row).toHaveLength(5);
    }
  });

  it("grades every point of measure across XS through XL", () => {
    for (const row of measurements) {
      // code + description + five sizes
      expect(row).toHaveLength(7);
      for (const value of row.slice(2)) {
        expect(Number.isNaN(Number(value))).toBe(false);
      }
    }
  });

  it("grades chest width monotonically upward", () => {
    const chest = measurements.find((row) => row[0] === "P01");
    const values = chest!.slice(2).map(Number);
    for (let index = 1; index < values.length; index += 1) {
      expect(values[index]!).toBeGreaterThan(values[index - 1]!);
    }
  });
});

describe("library and workflow content", () => {
  it("provides content for every library the sidebar exposes", () => {
    for (const key of Object.keys(libraryIcons) as (keyof typeof libraryIcons)[]) {
      expect(libraryContent[key]).toBeDefined();
      expect(libraryContent[key].items.length).toBeGreaterThan(0);
    }
  });

  it("provides content for every workflow section", () => {
    for (const section of ["sampling", "construction", "packaging", "history"] as const) {
      expect(workflowContent[section].items.length).toBeGreaterThan(0);
    }
  });
});

describe("icon registry", () => {
  it("resolves every icon named by navigation config", () => {
    const names = [
      ...navGroups.flatMap((group) => group.items.map((item) => item.icon)),
      ...productSections.map((section) => section.icon),
      ...Object.values(libraryIcons),
    ];
    // Lucide icons are forwardRef objects, so assert the lookup resolves at all
    // — the failure this guards against is a typo'd icon name.
    for (const name of names) {
      expect(iconRegistry[name]).toBeTruthy();
    }
  });
});
