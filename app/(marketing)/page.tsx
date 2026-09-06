import type { Metadata } from "next";

import { Concept } from "@/components/marketing/concept";
import { CtaBand } from "@/components/marketing/cta-band";
import { Design } from "@/components/marketing/design";
import { Features } from "@/components/marketing/features";
import { Hero } from "@/components/marketing/hero";
import { Ideas } from "@/components/marketing/ideas";
import { PRODUCT_NAME_TM, PRODUCT_TAGLINE } from "@/lib/brand";

const description =
  "Draw the style, build the BOM, grade the sizes, share one link with the factory, and export a versioned tech pack the sample room can actually sew from.";

export const metadata: Metadata = {
  title: `${PRODUCT_NAME_TM} | ${PRODUCT_TAGLINE}`,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${PRODUCT_NAME_TM} — factory-ready tech packs`,
    description,
    type: "website",
    images: ["/og.png"],
  },
  twitter: { card: "summary_large_image" },
};

/**
 * The landing page. Marketing traffic is overwhelmingly bots, so this renders
 * once an hour at most and never touches the database.
 */
export const revalidate = 3600;

export default function LandingPage() {
  return (
    <main>
      <Hero />
      <Concept />
      <Features />
      <Design />
      <Ideas />
      <CtaBand />
    </main>
  );
}
