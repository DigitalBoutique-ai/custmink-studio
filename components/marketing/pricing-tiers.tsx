import Link from "next/link";

import { Button } from "@/components/ui/button";
import { FACTORY_GUEST_NOTE, PRICING_FOOTNOTE, PRICING_TIERS } from "@/lib/marketing/pricing";

/**
 * The published price list.
 *
 * The factory-guest sentence sits above the tiers rather than under them: it
 * is the strongest pricing claim on the page and the top complaint about the
 * incumbents, and a footnote is where claims go to be missed.
 */
export function PricingTiers() {
  return (
    <>
      <div className="mk-guest-note">
        <span className="mk-pill-free">Free</span>
        <span>{FACTORY_GUEST_NOTE}</span>
      </div>

      <div className="mk-grid-4">
        {PRICING_TIERS.map((tier) => (
          <article
            key={tier.name}
            className={tier.highlighted ? "panel mk-tier is-highlighted" : "panel mk-tier"}
          >
            <h3>
              {tier.name}
              {tier.highlighted ? <span className="eyebrow">Most teams</span> : null}
            </h3>
            <div className="mk-price">
              {tier.monthlyUsd === null ? (
                "Custom"
              ) : (
                <>
                  ${tier.monthlyUsd}
                  <small>/ month</small>
                </>
              )}
            </div>
            <p className="mk-summary">{tier.summary}</p>
            <ul>
              {tier.limits.map((limit) => (
                <li key={limit}>{limit}</li>
              ))}
            </ul>
            <Button asChild variant={tier.highlighted ? "default" : "outline"} className="mk-btn">
              <Link href={tier.cta.href} prefetch={false}>
                {tier.cta.label}
              </Link>
            </Button>
          </article>
        ))}
      </div>

      <p className="mk-pricing-footnote">{PRICING_FOOTNOTE}</p>
    </>
  );
}
