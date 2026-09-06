import Image from "next/image";

import { FlatFigure } from "@/components/marketing/flat-figure";
import { Section } from "@/components/marketing/section";
import { colorways, dashboardMetrics } from "@/lib/demo-data";
import { SECTION_IDS } from "@/lib/marketing/nav";
import { DOCUMENT_SECTIONS } from "@/lib/pdf/tech-pack-data";

/**
 * The product's design philosophy, shown rather than described.
 *
 * Panel 1 is a miniature of the workspace drawn with the app's own tokens.
 * Panel 2 is the real flat renderer, front and back, tinted with two seed
 * colorways. Panel 3 is the real PDF's cover page (`public/pdf-cover.png`,
 * produced by `npm run pdf:preview`) beside the sections it contains.
 */
export function Design() {
  const [primary, secondary] = colorways;

  return (
    <Section
      id={SECTION_IDS.design}
      eyebrow="Design"
      title="Built like a workshop, not a dashboard."
      lede="Dark navigation, white working surfaces, one action colour, and enough density to fit a full bill of materials on a 1280-pixel screen."
    >
      <div className="mk-design-grid">
        <article className="panel mk-panel-figure">
          <div className="mk-figure mk-figure-ink">
            <div className="mk-mini" aria-hidden="true">
              <div className="mk-mini-side">
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>
              <div className="mk-mini-main">
                <div className="mk-mini-metrics">
                  {dashboardMetrics.map((metric) => (
                    <b key={metric.label}>
                      <small>{metric.label}</small>
                      {metric.value}
                    </b>
                  ))}
                </div>
                <div className="mk-mini-rows">
                  <i />
                  <i />
                  <i />
                </div>
              </div>
            </div>
          </div>
          <div className="mk-panel-body">
            <h3>Deep-ink workspace</h3>
            <p>
              The sidebar stays out of the way, the surface stays white, and the only colour
              that asks for a click is cobalt. Compact by default, because a BOM is a table.
            </p>
          </div>
        </article>

        <article className="panel mk-panel-figure">
          <div className="mk-figure">
            <div className="mk-flat-pair">
              <figure style={{ margin: 0 }}>
                <FlatFigure view="front" fill={primary?.hex} />
                <figcaption>Front · {primary?.name}</figcaption>
              </figure>
              <figure style={{ margin: 0 }}>
                <FlatFigure view="back" fill={secondary?.hex} />
                <figcaption>Back · {secondary?.name}</figcaption>
              </figure>
            </div>
          </div>
          <div className="mk-panel-body">
            <h3>Parametric vector flats</h3>
            <p>
              A flat is a parameter object — silhouette, fit, sleeve, neckline, pocket, cuff,
              hem. Front and back cannot disagree, a colorway is a fill, and the factory PDF
              prints real vectors at any magnification.
            </p>
          </div>
        </article>

        <article className="panel mk-panel-figure">
          <div className="mk-figure">
            {/* Static, committed output of the real export route. `unoptimized`
                because one PNG at one size does not need an optimizer function
                invoked per requested width — it is served straight from /public. */}
            <Image
              className="mk-pdf-cover"
              src="/pdf-cover.png"
              width={200}
              height={283}
              unoptimized
              alt="Cover page of the generated factory PDF for the Riviera Oversized Hoodie"
            />
          </div>
          <div className="mk-panel-body">
            <h3>The factory PDF</h3>
            <p>
              Branded to the brand, pinned to a version, with repeating table headers and a
              disclaimer on every page.
            </p>
            <ul className="mk-pdf-list">
              {DOCUMENT_SECTIONS.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>
        </article>
      </div>
    </Section>
  );
}
