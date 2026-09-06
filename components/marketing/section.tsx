import type { ReactNode } from "react";

import type { SectionId } from "@/lib/marketing/nav";

/**
 * A landing-page section. The id is typed to `SECTION_IDS` so a nav anchor
 * cannot point at a section that does not exist.
 */
export function Section({
  id,
  eyebrow,
  title,
  lede,
  children,
}: {
  id: SectionId;
  eyebrow: string;
  title: string;
  lede?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mk-section">
      <div className="mk-wrap">
        <div className="mk-section-head">
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          {lede ? <p className="mk-lede">{lede}</p> : null}
        </div>
        {children}
      </div>
    </section>
  );
}
