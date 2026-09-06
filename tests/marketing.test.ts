import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { DIFFERENTIATORS, SECTION_CLAIMS } from "@/lib/marketing/features";
import { MARKETING_NAV, SECTION_IDS, SEE_PRICING, TRY_NOW } from "@/lib/marketing/nav";
import { FACTORY_GUEST_NOTE, PRICING_TIERS } from "@/lib/marketing/pricing";
import { productSectionSpecs } from "@/lib/sections/registry";

/**
 * The marketing site is static by rule, and its claims are grounded by rule.
 * These tests enforce both without rendering anything: file structure, the
 * plain-data modules, and grep-level checks on source.
 */

const root = fileURLToPath(new URL("..", import.meta.url));
const appDir = join(root, "app");
const marketingDir = join(appDir, "(marketing)");
const componentsDir = join(root, "components", "marketing");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

function pageExists(routePath: string): boolean {
  const segments = routePath.replace(/^\//, "");
  const file = segments ? `${segments}/page.tsx` : "page.tsx";
  return [
    `${appDir}/(app)/${file}`,
    `${appDir}/(public)/${file}`,
    `${appDir}/(marketing)/${file}`,
    `${appDir}/${file}`,
    // Clerk's optional catch-all sign-in/up routes.
    `${appDir}/(public)/${segments}/[[...${segments.split("/").pop()}]]/page.tsx`,
  ].some((candidate) => existsSync(candidate));
}

const marketingPages = walk(marketingDir).filter((file) => file.endsWith("page.tsx"));
const marketingSources = [...walk(marketingDir), ...walk(componentsDir)].filter((file) =>
  /\.(ts|tsx)$/.test(file),
);
const landingSource = marketingSources.map((file) => readFileSync(file, "utf8")).join("\n");

describe("marketing navigation", () => {
  const links = [...MARKETING_NAV, TRY_NOW, SEE_PRICING];

  it.each(links.map((link) => [link.label, link.href]))("%s -> %s resolves", (_label, href) => {
    const anchor = href.match(/^\/#(.+)$/);
    if (anchor) {
      const id = anchor[1]!;
      expect(Object.values(SECTION_IDS)).toContain(id);
      // The section must actually be rendered with that id somewhere.
      expect(landingSource).toMatch(new RegExp(`SECTION_IDS\\.${id}\\b`));
      return;
    }
    expect(pageExists(href), `${href} has no page`).toBe(true);
  });

  it("uses absolute anchors so they work from /pricing and /demo", () => {
    for (const link of MARKETING_NAV) {
      expect(link.href.startsWith("/")).toBe(true);
    }
  });

  it("never sends Try Now into the gated workspace", () => {
    // `app/(app)` redirects to sign-in without a session. A demo that dead-ends
    // at a login wall is worse than no demo, so Try Now must stay public.
    expect(TRY_NOW.href).toBe("/demo");
    expect(TRY_NOW.href.startsWith("/dashboard")).toBe(false);
  });
});

describe("marketing pages are static", () => {
  it("has at least the landing, pricing and demo pages", () => {
    expect(marketingPages.length).toBeGreaterThanOrEqual(3);
  });

  it.each(marketingPages.map((file) => [file.replace(root, "")]))(
    "%s declares an hourly revalidate",
    (relative) => {
      const source = readFileSync(join(root, relative), "utf8");
      expect(source).toMatch(/export const revalidate = 3600/);
    },
  );

  it("imports nothing that reads the request or the database", () => {
    // `lib/data/*` and `lib/actions/*` resolve a session, which calls Clerk's
    // `auth()`, which reads cookies, which makes the route dynamic. The lint
    // rule catches the direct call; this catches the transitive import.
    const forbidden = [
      "next/headers",
      "@/lib/data/",
      "@/lib/actions/",
      "@/lib/auth/",
      "@/db",
      "force-dynamic",
      "setInterval",
      "refetchInterval",
    ];
    for (const file of marketingSources) {
      const source = readFileSync(file, "utf8");
      for (const needle of forbidden) {
        expect(source, `${file.replace(root, "")} contains ${needle}`).not.toContain(needle);
      }
    }
  });

  it("keeps the nav's client bundle thin", () => {
    const nav = readFileSync(join(componentsDir, "site-nav.tsx"), "utf8");
    expect(nav).toMatch(/^"use client";/);
    expect(nav).not.toContain("@/components/icon");
    expect(nav).not.toContain("@/lib/flats");
  });

  it("generates the features grid from the section registry", () => {
    const features = readFileSync(join(componentsDir, "features.tsx"), "utf8");
    expect(features).toContain("productSectionSpecs");
  });
});

describe("marketing claims are grounded", () => {
  const decisions = readFileSync(join(root, "docs", "DECISIONS.md"), "utf8");

  it("publishes the decided prices", () => {
    expect(PRICING_TIERS.map((tier) => tier.name)).toEqual(["Starter", "Studio", "Brand", "Enterprise"]);
    const [starter, studio, brand] = PRICING_TIERS.map((tier) => tier.monthlyUsd);
    expect(decisions).toContain(`Pricing $${starter} / $${studio} / $${brand} / Enterprise`);
    expect(PRICING_TIERS[3]?.monthlyUsd).toBeNull();
  });

  it("states the factory-guest policy verbatim", () => {
    expect(decisions).toContain("Factory guests are free and unlimited on every plan");
    expect(FACTORY_GUEST_NOTE).toBe(
      "Factory guests are free and unlimited on every plan and never count toward user limits.",
    );
  });

  it("has a claim for every registry section and nothing else", () => {
    const registryIds = productSectionSpecs.map((section) => section.id).sort();
    expect(Object.keys(SECTION_CLAIMS).sort()).toEqual(registryIds);
  });

  it("marks the unshipped sections as roadmap, not live", () => {
    // These still read demo data or have no table (HANDOFF). Claiming them as
    // live is the one kind of marketing copy this repo refuses to write.
    for (const id of ["design", "artwork", "sampling", "history"] as const) {
      expect(SECTION_CLAIMS[id].status, `${id} must be roadmap`).toBe("roadmap");
    }
  });

  it("marks the API and start-from-a-blank as roadmap", () => {
    const byTitle = Object.fromEntries(DIFFERENTIATORS.map((item) => [item.title, item.status]));
    expect(byTitle["Open API and webhooks"]).toBe("roadmap");
    expect(byTitle["Start from a wholesale blank"]).toBe("roadmap");
  });

  it("does not invent a contact address", () => {
    for (const tier of PRICING_TIERS) {
      expect(tier.cta.href.startsWith("mailto:")).toBe(false);
    }
  });
});

describe("marketing assets", () => {
  it.each(["og.png", "pdf-cover.png"])("ships %s as a static file", (asset) => {
    expect(existsSync(join(root, "public", asset))).toBe(true);
  });

  it("never computes an OpenGraph image at request time", () => {
    // Crawlers fetch OG images constantly; a route that renders one wakes the
    // function (and anything it touches) on every hit.
    expect(walk(appDir).some((file) => /opengraph-image\.(tsx?|jsx?)$/.test(file))).toBe(false);
  });
});
