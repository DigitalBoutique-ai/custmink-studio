import type { Metadata } from "next";
import Link from "next/link";

import { CtaBand } from "@/components/marketing/cta-band";
import { Button } from "@/components/ui/button";
import { PRODUCT_NAME, pageTitle } from "@/lib/brand";
import { FACTORY_GUEST_NOTE } from "@/lib/marketing/pricing";
import { SECTION_CLAIMS } from "@/lib/marketing/features";
import { TRY_NOW } from "@/lib/marketing/nav";

const description =
  "The Studio is where an apparel brand turns a sketch into a factory-ready tech pack: flats, BOM, colorways, graded measurements, construction and packaging, shared with the factory and exported as one versioned PDF.";

export const metadata: Metadata = {
  title: pageTitle("About"),
  description,
  alternates: { canonical: "/about" },
  openGraph: { title: pageTitle("About"), description, type: "website", images: ["/og.png"] },
  twitter: { card: "summary_large_image" },
};

export const revalidate = 3600;

/** Counted from the same claims the features grid renders, so this page cannot overstate them. */
const sectionCount = Object.keys(SECTION_CLAIMS).length;
const liveCount = Object.values(SECTION_CLAIMS).filter((claim) => claim.status === "shipped").length;

const STEPS = [
  {
    title: "Specify the style",
    detail:
      "Article code, season, supplier and target cost on an overview that scores how factory-ready the pack is as each section completes.",
  },
  {
    title: "Build the bill of materials",
    detail:
      "Fabric, rib, trim, thread, labels and packaging from a material library the brand owns, with the origin of every row recorded.",
  },
  {
    title: "Grade the sizes",
    detail:
      "Points of measure with tolerances, graded across the range from a base size, next to the construction and packaging instructions.",
  },
  {
    title: "Hand off to the factory",
    detail:
      "One branded, versioned PDF and a share link. The sample room reads the same record the brand edited — no re-typing, no stale copies.",
  },
] as const;

const AUDIENCES = [
  {
    title: "Brand founders",
    detail:
      "Small labels that have been sending factories a mix of screenshots, spreadsheets and WhatsApp messages, and want one document that is right.",
  },
  {
    title: "Product developers",
    detail:
      "Technical designers running a collection who need every style to read the same way and every change to be traceable to a version.",
  },
  {
    title: "Factories and sample rooms",
    detail:
      "The people who sew from it. They get a link, not a seat, and see exactly what was approved.",
  },
] as const;

export default function AboutPage() {
  return (
    <>
      <main className="mk-section">
        <div className="mk-wrap">
          <div className="mk-pricing-head">
            <p className="eyebrow">About</p>
            <h1>The record between a sketch and a sewn sample.</h1>
            <p className="mk-lede" style={{ margin: "0 auto" }}>
              {PRODUCT_NAME} is a workspace where apparel brands build, review, version and share
              tech packs — the specification a factory needs to make a garment — and export them
              as a document the sample room can actually sew from.
            </p>
          </div>

          <p className="mk-subhead">What a tech pack goes through here</p>
          <div className="mk-grid-4">
            {STEPS.map((step, index) => (
              <article key={step.title} className="panel mk-card">
                <div className="mk-card-head">
                  <span className="mk-feature-icon" aria-hidden="true">
                    {index + 1}
                  </span>
                </div>
                <h3>{step.title}</h3>
                <p>{step.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </main>

      <section className="mk-section">
        <div className="mk-wrap">
          <div className="mk-section-head">
            <p className="eyebrow">Who it is for</p>
            <h2>Built for the brand. Free for the factory.</h2>
            <p className="mk-lede">{FACTORY_GUEST_NOTE}</p>
          </div>
          <div className="mk-grid-3">
            {AUDIENCES.map((audience) => (
              <article key={audience.title} className="panel mk-card">
                <h3>{audience.title}</h3>
                <p>{audience.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mk-section">
        <div className="mk-wrap">
          <div className="mk-section-head">
            <p className="eyebrow">How it is built</p>
            <h2>One workspace, many brands. Every row knows where it came from.</h2>
            <p className="mk-lede">
              An organization is the account; a brand is what the factory sees on the pack —
              its logo, colours, units and libraries. Collections and products sit under the
              brand, so a studio running several labels keeps them separate without separate
              logins. Every row a person or an AI draft writes carries its source and whether
              someone accepted it, and the factory PDF is a real vector document rendered from
              the same data, not a screenshot.
            </p>
          </div>
          <div className="mk-grid-3">
            <article className="panel mk-card">
              <h3>
                {liveCount} of {sectionCount} sections live
              </h3>
              <p>
                Overview, colorways, BOM, measurements, construction and packaging are in the
                demo today. Design canvas, artwork, sampling and version history are in
                development and marked as roadmap wherever they appear on this site.
              </p>
            </article>
            <article className="panel mk-card">
              <h3>Private pilot</h3>
              <p>
                Accounts are issued by invitation while the remaining sections ship. The demo
                workspace is open to anyone and needs no account.
              </p>
            </article>
            <article className="panel mk-card">
              <h3>Who makes it</h3>
              <p>
                {PRODUCT_NAME} is built by Digital Boutique AI for the apparel brand it runs,
                custm.ink, and for every brand that has had the same tech-pack problem.
              </p>
            </article>
          </div>
          <div className="mk-cta-row" style={{ marginTop: 32 }}>
            <Button asChild className="mk-btn">
              <Link href={TRY_NOW.href} prefetch={false}>
                {TRY_NOW.label}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
