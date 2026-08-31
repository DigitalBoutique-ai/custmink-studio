import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { navGroups, productSectionHref, productSections } from "@/lib/navigation";

const appDir = fileURLToPath(new URL("../app", import.meta.url));

/**
 * Resolve a URL path to the page file that serves it, trying each route group.
 * Keeps the structural tests honest about where files actually live.
 */
function pageExists(routePath: string): boolean {
  const segments = routePath.replace(/^\//, "");
  const candidates = [
    `${appDir}/(app)/${segments}/page.tsx`,
    `${appDir}/(public)/${segments}/page.tsx`,
    `${appDir}/${segments}/page.tsx`,
  ];
  return candidates.some((candidate) => existsSync(candidate));
}

/** Every authenticated route the master prompt requires, section 4. */
const requiredAuthenticatedRoutes = [
  "/dashboard",
  "/products",
  "/products/new",
  "/collections",
  "/libraries/sketches",
  "/libraries/materials",
  "/libraries/artwork",
  "/libraries/colors",
  "/libraries/size-charts",
  "/libraries/attachments",
  "/suppliers",
  "/purchase-orders",
  "/activity",
  "/settings/organization",
  "/settings/team",
  "/settings/brand",
  "/settings/billing",
];

const requiredProductSections = [
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

const requiredPublicRoutes = ["/sign-in", "/sign-up"];

describe("required route structure", () => {
  it.each(requiredAuthenticatedRoutes)("serves %s", (route) => {
    expect(pageExists(route)).toBe(true);
  });

  it.each(requiredPublicRoutes)("serves %s", (route) => {
    expect(pageExists(route)).toBe(true);
  });

  it.each(requiredProductSections)("serves the %s product section", (section) => {
    expect(
      existsSync(`${appDir}/(app)/products/[productId]/${section}/page.tsx`),
    ).toBe(true);
  });

  it("serves the token-gated share and invite routes", () => {
    expect(existsSync(`${appDir}/(public)/share/[token]/page.tsx`)).toBe(true);
    expect(existsSync(`${appDir}/(public)/share/[token]/comments/page.tsx`)).toBe(true);
    expect(existsSync(`${appDir}/(public)/accept-invite/[token]/page.tsx`)).toBe(true);
  });
});

describe("sidebar navigation", () => {
  it("only links to routes that exist", () => {
    const hrefs = navGroups.flatMap((group) => group.items.map((item) => item.href));
    const missing = hrefs.filter((href) => !pageExists(href));
    expect(missing).toEqual([]);
  });

  it("does not link the same route twice", () => {
    const hrefs = navGroups.flatMap((group) => group.items.map((item) => item.href));
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });
});

describe("product section table of contents", () => {
  it("covers every required section in order", () => {
    expect(productSections.map((section) => section.id)).toEqual(requiredProductSections);
  });

  it("builds hrefs that match the route files", () => {
    for (const section of productSections) {
      expect(productSectionHref("riviera-hoodie", section.id)).toBe(
        `/products/riviera-hoodie/${section.id}`,
      );
    }
  });
});
