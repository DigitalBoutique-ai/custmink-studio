import type { Metadata } from "next";

import { PricingTiers } from "@/components/marketing/pricing-tiers";
import { pageTitle } from "@/lib/brand";

const description =
  "Starter, Studio, Brand, and Enterprise plans. Factory guests are free and unlimited on every plan.";

export const metadata: Metadata = {
  title: pageTitle("Pricing"),
  description,
  alternates: { canonical: "/pricing" },
  openGraph: { title: pageTitle("Pricing"), description, type: "website", images: ["/og.png"] },
  twitter: { card: "summary_large_image" },
};

export const revalidate = 3600;

export default function PricingPage() {
  return (
    <main className="mk-section">
      <div className="mk-wrap">
        <div className="mk-pricing-head">
          <p className="eyebrow">Pricing</p>
          <h1>Simple plans. Factory seats are free.</h1>
          <p className="mk-lede" style={{ margin: "0 auto" }}>
            Priced by the people building the tech pack, never by the people reading it.
          </p>
        </div>
        <PricingTiers />
      </div>
    </main>
  );
}
