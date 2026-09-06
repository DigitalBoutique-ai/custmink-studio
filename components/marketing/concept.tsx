import { Section } from "@/components/marketing/section";
import { bomRows, colorways, measurements } from "@/lib/demo-data";
import { SECTION_IDS } from "@/lib/marketing/nav";

/** Master prompt section 2, the primary workflow, in order. */
const WORKFLOW = [
  "Create a style from a template, prompt, or reference",
  "Build or generate front and back flats",
  "Create colorways and attach colour standards",
  "Place artwork and specify decoration",
  "Build the BOM — fabrics, trims, labels, threads",
  "Attach and grade a size chart with tolerances",
  "Add construction, packaging, and labelling",
  "Record sample rounds, fit comments, and approvals",
  "Share a secure read-only link with the factory",
  "Export a branded, versioned PDF",
] as const;

export function Concept() {
  const fabric = bomRows[0];
  const bodyLength = measurements.find((row) => row[0] === "P02");
  const colour = colorways[0];

  return (
    <Section
      id={SECTION_IDS.concept}
      eyebrow="Concept"
      title="A tech pack is a contract. Most tools treat it like a slideshow."
      lede="Between the sketch and the sample there is a spreadsheet, a PDF, a folder of Illustrator files and a chat thread. When one changes and the others don't, the factory sews the wrong thing. Past about ten styles a season, that is the normal state of affairs."
    >
      <div className="mk-grid-3">
        <div className="mk-point">
          <span className="mk-point-num">01</span>
          <h3>One record per style</h3>
          <p>
            Organization → brands → collections → products. Every section of the tech pack —
            overview, flats, colorways, BOM, measurements, construction — is a part of one
            record, not a file that has to be kept in step with the others.
          </p>
        </div>
        <div className="mk-point">
          <span className="mk-point-num">02</span>
          <h3>One drawing</h3>
          <p>
            A flat is a set of parameters — silhouette, fit, sleeve, neckline, pocket, cuff,
            hem — not a picture. Front and back come from the same geometry, a colorway is a
            fill, and the PDF gets real vectors.
          </p>
        </div>
        <div className="mk-point">
          <span className="mk-point-num">03</span>
          <h3>One document</h3>
          <p>
            The factory PDF is generated from the record, branded to the brand, and pinned to
            a version. The sample room is always sewing from the one you sent, never the one
            that changed this morning.
          </p>
        </div>
      </div>

      <div className="mk-spec" role="table" aria-label="Sample rows from a tech pack record">
        <div className="mk-spec-row" role="row">
          <span role="columnheader">Section</span>
          <span role="columnheader">Item</span>
          <span role="columnheader">Detail</span>
          <span role="columnheader">Where</span>
        </div>
        {fabric ? (
          <div className="mk-spec-row" role="row">
            <span className="mk-code" role="cell">BOM</span>
            <span role="cell">{fabric[1]}</span>
            <span role="cell">{fabric[2]}</span>
            <span role="cell">{fabric[3]}</span>
          </div>
        ) : null}
        {bodyLength ? (
          <div className="mk-spec-row" role="row">
            <span className="mk-code" role="cell">{bodyLength[0]}</span>
            <span role="cell">{bodyLength[1]}</span>
            <span role="cell">{bodyLength.slice(2).join(" / ")}</span>
            <span role="cell">XS – XL, cm</span>
          </div>
        ) : null}
        {colour ? (
          <div className="mk-spec-row" role="row">
            <span className="mk-code" role="cell">Colour</span>
            <span role="cell">
              <i className="mk-swatch" style={{ background: colour.hex }} aria-hidden="true" />
              {colour.name}
            </span>
            <span role="cell">{colour.code}</span>
            <span role="cell">{colour.hex.toUpperCase()}</span>
          </div>
        ) : null}
      </div>

      <p className="mk-subhead">From concept to factory</p>
      <ol className="mk-rail" aria-label="The ten-step workflow">
        {WORKFLOW.map((step, index) => (
          <li key={step} className="mk-step">
            <small>{String(index + 1).padStart(2, "0")}</small>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </Section>
  );
}
