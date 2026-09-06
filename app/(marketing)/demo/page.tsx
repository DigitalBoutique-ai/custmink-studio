import type { Metadata } from "next";

import { DemoWorkspace } from "@/components/marketing/demo-workspace";
import { pageTitle } from "@/lib/brand";

const description =
  "A read-only tour of a real tech pack: flats, colorways, bill of materials, graded measurements, construction, packaging and versions — with sample data, no account needed.";

export const metadata: Metadata = {
  title: pageTitle("Demo"),
  description,
  alternates: { canonical: "/demo" },
  openGraph: { title: pageTitle("Demo"), description, type: "website", images: ["/og.png"] },
  twitter: { card: "summary_large_image" },
};

/**
 * The demo is a static page fed from `lib/demo-data.ts`. It never resolves a
 * session, so it survives the workspace being gated behind sign-in and never
 * wakes the database — which matters, because "Try Now" is the most-clicked
 * link on the site and most of those clicks are bots.
 */
export const revalidate = 3600;

export default function DemoPage() {
  return (
    <main className="mk-demo-page">
      <div className="mk-wrap">
        <div className="mk-demo-head">
          <p className="eyebrow">Demo</p>
          <h1>A tech pack, end to end.</h1>
          <p className="mk-lede">
            This is the Riviera Oversized Hoodie from the sample brand — the same record the
            factory PDF is generated from. Scroll through every section, or jump to one.
          </p>
        </div>
      </div>
      <div className="mk-wrap mk-wrap-wide">
        <DemoWorkspace />
      </div>
    </main>
  );
}
