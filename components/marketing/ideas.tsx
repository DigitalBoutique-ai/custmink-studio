import { Section } from "@/components/marketing/section";
import { Badge } from "@/components/ui/badge";
import { SECTION_IDS } from "@/lib/marketing/nav";

/**
 * Who it is for, in the order the go-to-market decision names them: decorators
 * and print shops moving to private label first, independent brands second.
 */
export function Ideas() {
  return (
    <Section
      id={SECTION_IDS.ideas}
      eyebrow="Who it's for"
      title="From wholesale blanks to your own label."
    >
      <div className="mk-grid-3">
        <article className="panel mk-audience is-lead">
          <small>Print shops and decorators</small>
          <h3>You already know the customer and the garment. Private label is the next margin.</h3>
          <p>
            Take the blank you decorate today and turn it into a cut-and-sew style with the fit
            your customers already buy. Start from the catalogue SKU you already stock{" "}
            <Badge variant="outline" className="text-[10px] tracking-wide uppercase align-middle">
              Roadmap
            </Badge>
            , then change what you want changed.
          </p>
        </article>
        <article className="panel mk-audience">
          <small>Independent designers</small>
          <h3>A first tech pack a factory will quote from.</h3>
          <p>Flats, BOM, and graded measurements without an Illustrator licence or a spreadsheet template.</p>
        </article>
        <article className="panel mk-audience">
          <small>Apparel brands</small>
          <h3>Every brand in one workspace, every style versioned.</h3>
          <p>Libraries and PDF branding belong to the brand, so two labels under one company never share a fabric list.</p>
        </article>
        <article className="panel mk-audience">
          <small>Product developers</small>
          <h3>Grading, BOM, and construction in the same record as the drawing.</h3>
          <p>A measurement that changes updates the table the factory reads, not a copy of it.</p>
        </article>
        <article className="panel mk-audience">
          <small>Factories</small>
          <h3>Free guest access on every plan.</h3>
          <p>Open the version you were sent, comment on it, and acknowledge it — no seat, no account, no charge to the brand.</p>
        </article>
      </div>
    </Section>
  );
}
