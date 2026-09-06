import Link from "next/link";

import { FlatFigure } from "@/components/marketing/flat-figure";
import { Button } from "@/components/ui/button";
import { measurements, starterProducts } from "@/lib/demo-data";
import { SEE_PRICING, TRY_NOW } from "@/lib/marketing/nav";

/**
 * The hero is a spec sheet.
 *
 * A drawing frame, the real vector flat, two point-of-measure callouts with
 * their graded ranges, and a title block — the four things a factory looks for
 * on the first page of a tech pack. The callout values come from the same demo
 * dataset the workspace renders, so the hero shows the product's data, not
 * placeholder numbers.
 */
export function Hero() {
  const hoodie = starterProducts[0];
  const chest = measurements.find((row) => row[0] === "P01");
  const sleeve = measurements.find((row) => row[0] === "P03");

  const range = (row: readonly string[] | undefined) =>
    row ? `${row[2]}–${row[row.length - 1]} cm` : "";

  return (
    <div className="mk-hero">
      <div className="mk-wrap mk-hero-grid">
        <div>
          <p className="mk-kicker">Apparel tech packs</p>
          <h1>The operating system between apparel concept and factory production.</h1>
          <p className="mk-hero-sub">
            Draw the style, build the BOM, grade the sizes, share one link with the factory, and
            export a versioned tech pack the sample room can actually sew from.
          </p>
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
          <p className="mk-hero-note">
            Try Now opens a read-only demo of a real tech pack. No account needed.
          </p>
        </div>

        <figure className="mk-sheet" aria-label="Technical flat with points of measure">
          <div className="mk-sheet-stage">
            <FlatFigure view="front" fill="#8faee8" ink="#e9ecf4" />
            {chest ? (
              <div className="mk-callout" style={{ left: "-4%", top: "36%", "--leader": "40px" } as React.CSSProperties}>
                <b>{chest[0]}</b>
                <span>{range(chest)}</span>
              </div>
            ) : null}
            {sleeve ? (
              <div className="mk-callout is-right" style={{ right: "-4%", top: "56%", "--leader": "40px" } as React.CSSProperties}>
                <b>{sleeve[0]}</b>
                <span>{range(sleeve)}</span>
              </div>
            ) : null}
          </div>
          <figcaption className="mk-titleblock">
            <div>
              <small>Style</small>
              <strong>{hoodie?.name ?? "Riviera Oversized Hoodie"}</strong>
            </div>
            <div>
              <small>Article</small>
              <strong>{hoodie?.code ?? "CI-HOD-2407"}</strong>
            </div>
            <div>
              <small>Season</small>
              <strong>{hoodie?.season ?? "FW 2027"}</strong>
            </div>
            <div>
              <small>Drawing</small>
              <strong>Vector · v1</strong>
            </div>
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
