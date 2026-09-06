import type { SectionKey } from "@/types/techpack";

/**
 * What the marketing site claims, and whether each claim is live.
 *
 * `status` is set here by hand and is deliberately *not* derived from the
 * section registry's `deliveredInPhase`. That field describes the plan —
 * colorways, measurements, construction and packaging are marked phase 2 there
 * and still read demo data. A marketing claim must be a deliberate edit, not a
 * side effect of a planning flag. `tests/marketing.test.ts` checks every
 * registry section has an entry here so the grid cannot silently drop one.
 */

export type ClaimStatus = "shipped" | "roadmap";

export type SectionClaim = { blurb: string; status: ClaimStatus };

export const SECTION_CLAIMS: Record<SectionKey, SectionClaim> = {
  overview: {
    blurb: "Article code, season, supplier, target cost, MOQ, and a factory-readiness score that updates as sections complete.",
    status: "shipped",
  },
  design: {
    blurb: "Parametric front and back flats with named anchors for artwork and callouts, edited on a canvas rather than redrawn.",
    status: "roadmap",
  },
  colorways: {
    blurb: "Named colorways with HEX, Pantone or supplier codes, applied to the flat as a fill rather than a second drawing.",
    status: "shipped",
  },
  bom: {
    blurb: "Fabric, rib, trim, thread, label and packaging rows from a reusable material library, with every row's origin recorded.",
    status: "shipped",
  },
  artwork: {
    blurb: "Placement zone, decoration technique, dimensions and colours for each piece of artwork, with originals preserved.",
    status: "roadmap",
  },
  measurements: {
    blurb: "Points of measure with tolerances, graded across the size range from a base size.",
    status: "shipped",
  },
  sampling: {
    blurb: "Proto, fit, size-set and pre-production rounds with pinned photo comments and an approval history.",
    status: "roadmap",
  },
  construction: {
    blurb: "Ordered instructions with seam and stitch types, SPI and tolerances, linked to callouts on the flat.",
    status: "shipped",
  },
  packaging: {
    blurb: "Main label, care and content, hangtag, polybag and carton instructions that ship with the garment.",
    status: "shipped",
  },
  history: {
    blurb: "Immutable named versions, side-by-side changes by section, and an approval lock on the one the factory is sewing.",
    status: "roadmap",
  },
};

export type Differentiator = {
  title: string;
  detail: string;
  status: ClaimStatus;
};

/** From the competitive teardown's recommendations and the 2026-09-05 decisions. */
export const DIFFERENTIATORS: readonly Differentiator[] = [
  {
    title: "Factory seats are free",
    detail: "Every plan. Unlimited. A factory guest never counts toward your users.",
    status: "shipped",
  },
  {
    title: "One workspace, many brands",
    detail: "Organization → brands → collections → products. Libraries and PDF branding belong to the brand, not the account.",
    status: "shipped",
  },
  {
    title: "Real vector flats",
    detail: "A flat is a parameter object, so front and back cannot disagree and the PDF prints sharp at any magnification.",
    status: "shipped",
  },
  {
    title: "The factory PDF",
    detail: "Ten pages, branded, versioned, with repeating table headers and a disclaimer on every page.",
    status: "shipped",
  },
  {
    title: "Provenance on every row",
    detail: "Manual, library, import, API or AI draft — and whether a person accepted it. It survives the proposal being closed.",
    status: "shipped",
  },
  {
    title: "Open API and webhooks",
    detail: "Every screen is also an endpoint. Signed webhooks with retries and a visible delivery log. No competitor under $100/mo has one.",
    status: "roadmap",
  },
  {
    title: "Start from a wholesale blank",
    detail: "Seed fabric, composition, weight and size chart from the catalog SKU you already decorate.",
    status: "roadmap",
  },
  {
    title: "AI that drafts, never decides",
    detail: "Suggested BOM rows, construction notes and grading checks, every one reviewed before it touches the spec.",
    status: "roadmap",
  },
];

export const ROADMAP_FOOTNOTE =
  "Roadmap marks what is in development. Everything else is live in the demo workspace today.";
