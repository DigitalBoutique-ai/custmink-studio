import { Badge } from "@/components/ui/badge";

/**
 * Honest placeholder for routes the master prompt requires but a later phase
 * fills in. It states which phase owns the screen rather than implying the
 * feature exists.
 */
export function PlaceholderView({
  eyebrow,
  title,
  subtitle,
  phase,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  phase: string;
}) {
  return (
    <main className="page-scroll">
      <div className="content-wrap library-page">
        <div className="page-heading">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <Badge variant="outline">Planned · {phase}</Badge>
        </div>
        <section className="section-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Not built yet</p>
              <h2>Reserved route</h2>
              <p>
                This route exists so navigation, permissions, and links are correct now. The screen
                itself is delivered in {phase}.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
