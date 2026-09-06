/**
 * Marketing-site navigation.
 *
 * Separate from `lib/navigation.ts`, which is the app sidebar and is asserted
 * against by `tests/routes.test.ts`. Anchor hrefs are absolute (`/#features`,
 * not `#features`) so they work from `/pricing` as well as from the landing
 * page.
 *
 * Section ids live here, not in the components, so the nav and the page cannot
 * disagree about what an anchor points at. `tests/marketing.test.ts` checks
 * every anchor resolves to one of these ids.
 */

export const SECTION_IDS = {
  concept: "concept",
  features: "features",
  design: "design",
  ideas: "ideas",
} as const;

export type SectionId = (typeof SECTION_IDS)[keyof typeof SECTION_IDS];

export type MarketingLink = { label: string; href: string };

export const MARKETING_NAV: readonly MarketingLink[] = [
  { label: "Concept", href: `/#${SECTION_IDS.concept}` },
  { label: "Features", href: `/#${SECTION_IDS.features}` },
  { label: "Design", href: `/#${SECTION_IDS.design}` },
  { label: "Ideas", href: `/#${SECTION_IDS.ideas}` },
  { label: "About", href: "/about" },
  { label: "Pricing", href: "/pricing" },
];

/**
 * The primary call to action. A static, read-only demo fed from
 * `lib/demo-data.ts` — not the workspace, which requires a session and would
 * dead-end a visitor at the sign-in page.
 */
export const TRY_NOW: MarketingLink = { label: "Try Now", href: "/demo" };

export const SEE_PRICING: MarketingLink = { label: "See pricing", href: "/pricing" };
