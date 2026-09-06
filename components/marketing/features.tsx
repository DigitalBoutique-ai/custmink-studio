import { Icon } from "@/components/icon";
import { Section } from "@/components/marketing/section";
import { Badge } from "@/components/ui/badge";
import { DIFFERENTIATORS, ROADMAP_FOOTNOTE, SECTION_CLAIMS } from "@/lib/marketing/features";
import { SECTION_IDS } from "@/lib/marketing/nav";
import { productSectionSpecs } from "@/lib/sections/registry";

function RoadmapPill() {
  return (
    <Badge variant="outline" className="text-[10px] tracking-wide uppercase">
      Roadmap
    </Badge>
  );
}

/**
 * "Everything it does."
 *
 * The ten cards are generated from the section registry, so the grid cannot
 * drift from the product. What each card *claims* — and whether it is live —
 * comes from `lib/marketing/features.ts`, which is a deliberate edit rather
 * than something derived from a planning flag.
 */
export function Features() {
  return (
    <Section
      id={SECTION_IDS.features}
      eyebrow="Everything it does"
      title="Ten sections. One factory-ready record."
      lede="Every section a factory expects, in the order a tech pack reads, each with a completion state that rolls up into a readiness score."
    >
      <div className="mk-grid-5">
        {productSectionSpecs.map((section) => {
          const claim = SECTION_CLAIMS[section.id];
          return (
            <article key={section.id} className="panel mk-card">
              <div className="mk-card-head">
                <span className="mk-feature-icon" aria-hidden="true">
                  <Icon name={section.icon} />
                </span>
                {claim.status === "roadmap" ? <RoadmapPill /> : null}
              </div>
              <h3>{section.label}</h3>
              <p>{claim.blurb}</p>
            </article>
          );
        })}
      </div>

      <p className="mk-subhead">What the incumbents charge for</p>
      <div className="mk-grid-4">
        {DIFFERENTIATORS.map((item) => (
          <article key={item.title} className="panel mk-card">
            <div className="mk-card-head">
              <h3 style={{ margin: 0 }}>{item.title}</h3>
              {item.status === "roadmap" ? <RoadmapPill /> : null}
            </div>
            <p>{item.detail}</p>
          </article>
        ))}
      </div>

      <p className="mk-footnote">
        <RoadmapPill />
        {ROADMAP_FOOTNOTE}
      </p>
    </Section>
  );
}
