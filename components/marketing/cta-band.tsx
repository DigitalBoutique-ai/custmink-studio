import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SEE_PRICING, TRY_NOW } from "@/lib/marketing/nav";

export function CtaBand() {
  return (
    <div className="mk-cta">
      <div className="mk-wrap">
        <h2>Open the demo workspace.</h2>
        <p>Sample brand, sample styles, real PDF export.</p>
        <div className="mk-cta-row">
          <Button asChild className="mk-btn">
            <Link href={TRY_NOW.href} prefetch={false}>
              {TRY_NOW.label}
            </Link>
          </Button>
          <Button asChild variant="outline" className="mk-btn mk-btn-ghost">
            <Link href={SEE_PRICING.href} prefetch={false}>
              {SEE_PRICING.label}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
