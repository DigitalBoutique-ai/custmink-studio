/**
 * Published price list.
 *
 * Amounts are the 2026-09-01 decision in docs/DECISIONS.md ("Pricing $49 /
 * $149 / $399 / Enterprise"); limits are master prompt section 10.
 * `tests/marketing.test.ts` asserts this file and DECISIONS.md agree, so a
 * price change is a deliberate two-file edit rather than a marketing drift.
 *
 * Billing itself is Phase 6. Until then every tier's button opens the static demo.
 */

export type PricingTier = {
  name: string;
  /** USD per month; null for a quoted plan. */
  monthlyUsd: number | null;
  summary: string;
  limits: readonly string[];
  highlighted?: boolean;
  cta: { label: string; href: string };
};

export const PRICING_TIERS: readonly PricingTier[] = [
  {
    name: "Starter",
    monthlyUsd: 49,
    summary: "One person, a first collection.",
    limits: ["1 user", "10 active products", "Limited AI and exports"],
    cta: { label: "Try Now", href: "/demo" },
  },
  {
    name: "Studio",
    monthlyUsd: 149,
    summary: "A small team shipping every season.",
    limits: ["5 users", "100 active products", "Larger AI and storage limits"],
    highlighted: true,
    cta: { label: "Try Now", href: "/demo" },
  },
  {
    name: "Brand",
    monthlyUsd: 399,
    summary: "Several brands, formal approvals.",
    limits: [
      "20 users",
      "Unlimited archived products",
      "Advanced approvals and supplier collaboration",
    ],
    cta: { label: "Try Now", href: "/demo" },
  },
  {
    name: "Enterprise",
    monthlyUsd: null,
    summary: "Custom limits and controls.",
    limits: ["Custom limits", "SSO-ready architecture", "Support controls"],
    // TODO(accounts): no sales contact address is recorded in docs/ACCOUNTS.md
    // yet. Until one exists this opens the demo rather than a mailto to an
    // invented inbox.
    cta: { label: "Try Now", href: "/demo" },
  },
];

/**
 * Verbatim from the master prompt's section 10 amendment. Per-supplier seat
 * fees are the top pricing complaint about the incumbents, so this sentence
 * sits above the tiers, not in a footnote.
 */
export const FACTORY_GUEST_NOTE =
  "Factory guests are free and unlimited on every plan and never count toward user limits.";

export const PRICING_FOOTNOTE =
  "Prices in USD per month. Billing is in development; plans shown are the published price list.";
