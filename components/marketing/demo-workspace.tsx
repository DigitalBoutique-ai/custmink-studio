import Link from "next/link";

import { Icon } from "@/components/icon";
import { FlatFigure } from "@/components/marketing/flat-figure";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  bomRows,
  colorways,
  dashboardMetrics,
  measurements,
  starterProducts,
  workflowContent,
} from "@/lib/demo-data";
import { navGroups } from "@/lib/navigation";
import { productSectionSpecs } from "@/lib/sections/registry";
import { DOCUMENT_SECTIONS } from "@/lib/pdf/tech-pack-data";

/**
 * The read-only demo workspace.
 *
 * Static by construction. Everything it shows comes from `lib/demo-data.ts`
 * and the flat renderer — never from `lib/data/**`, whose readers resolve a
 * session and would make this page dynamic. It reuses the workspace's own
 * CSS classes (`.app-sidebar`, `.nav-item`, `.metric-card`, `.data-table`), so
 * what a visitor sees here is the product's real chrome with sample data, not
 * an illustration of it.
 *
 * Nothing here links into `app/(app)`. Those routes require a session, and a
 * demo that dead-ends at a sign-in wall is worse than no demo.
 */

const SIGN_UP = { label: "Sign up to edit", href: "/sign-up" };
const SIZES = ["XS", "S", "M", "L", "XL"];

const product = starterProducts[0];

function SectionCard({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={`demo-${id}`} className="panel mk-demo-card">
      <div className="section-heading">
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function DemoWorkspace() {
  return (
    <div className="mk-demo" aria-label="Read-only demo of the workspace">
      <div className="mk-demo-banner">
        <span>
          <Badge variant="outline" className="text-[10px] tracking-wide uppercase mr-2">
            Read-only demo
          </Badge>
          Sample brand, sample styles. Nothing you see here can be edited without an account.
        </span>
        <Button asChild size="sm">
          <Link href={SIGN_UP.href} prefetch={false}>
            {SIGN_UP.label}
          </Link>
        </Button>
      </div>

      <div className="mk-demo-frame">
        <aside className="mk-demo-sidebar" aria-hidden="true">
          {navGroups.map((group) => (
            <div key={group.label} className="mk-demo-navgroup">
              <p>{group.label}</p>
              {group.items.map((item) => (
                <span
                  key={item.href}
                  className={item.href === "/products" ? "nav-item active" : "nav-item"}
                >
                  <Icon name={item.icon} />
                  {item.label}
                </span>
              ))}
            </div>
          ))}
        </aside>

        <div className="mk-demo-main">
          <div className="mk-demo-topbar">
            <div>
              <div className="breadcrumb">Products › {product?.category}</div>
              <h1>{product?.name}</h1>
            </div>
            <Badge className="status-badge">{product?.status}</Badge>
            <div className="mk-demo-topbar-actions">
              <Button variant="outline" size="sm" disabled>
                Share
              </Button>
              <Button variant="outline" size="sm" disabled>
                Export PDF
              </Button>
            </div>
          </div>

          <div className="mk-demo-body">
            <nav className="mk-demo-toc" aria-label="Sections">
              {productSectionSpecs.map((section) => (
                <a key={section.id} href={`#demo-${section.id}`}>
                  <Icon name={section.icon} />
                  {section.label}
                </a>
              ))}
            </nav>

            <div className="mk-demo-content">
              <div className="metric-grid mk-demo-metrics">
                {dashboardMetrics.map((metric) => (
                  <div key={metric.label} className="metric-card">
                    <p>{metric.label}</p>
                    <strong>{metric.value}</strong>
                    <small>{metric.detail}</small>
                  </div>
                ))}
              </div>

              <SectionCard id="overview" eyebrow="Overview" title="Style overview">
                <dl className="mk-demo-fields">
                  <div>
                    <dt>Article code</dt>
                    <dd>{product?.code}</dd>
                  </div>
                  <div>
                    <dt>Category</dt>
                    <dd>{product?.category}</dd>
                  </div>
                  <div>
                    <dt>Season</dt>
                    <dd>{product?.season}</dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>{product?.status}</dd>
                  </div>
                  <div>
                    <dt>Factory readiness</dt>
                    <dd>{product?.progress}%</dd>
                  </div>
                  <div>
                    <dt>Last updated</dt>
                    <dd>{product?.updated}</dd>
                  </div>
                </dl>
                <h3 className="mk-demo-h3">Other styles in this workspace</h3>
                <div className="mk-demo-products">
                  {starterProducts.map((item) => (
                    <div key={item.id} className="mk-demo-product">
                      <span className="mk-demo-thumb" style={{ background: item.color }} />
                      <div>
                        <strong>{item.name}</strong>
                        <small>
                          {item.code} · {item.season}
                        </small>
                      </div>
                      <Badge variant="secondary">{item.status}</Badge>
                      <span className="mk-demo-progress">{item.progress}%</span>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard id="design" eyebrow="Sketch / Design" title="Technical flats">
                <div className="mk-demo-flats">
                  <figure>
                    <FlatFigure view="front" fill={product?.color} />
                    <figcaption>Front</figcaption>
                  </figure>
                  <figure>
                    <FlatFigure view="back" fill={product?.color} />
                    <figcaption>Back</figcaption>
                  </figure>
                </div>
                <p className="mk-demo-note">
                  Rendered from a parameter object — oversized silhouette, relaxed fit, two-layer
                  hood with drawcord, kangaroo pocket, ribbed cuff and hem. Change a parameter and
                  both views re-draw.
                </p>
              </SectionCard>

              <SectionCard id="colorways" eyebrow="Colorways" title="Colour standards">
                <div className="mk-demo-swatches">
                  {colorways.map((colorway) => (
                    <div key={colorway.name} className="mk-demo-swatch">
                      <span style={{ background: colorway.hex }} />
                      <strong>{colorway.name}</strong>
                      <small>
                        {colorway.code} · {colorway.hex.toUpperCase()}
                      </small>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard id="bom" eyebrow="BOM / Materials" title="Bill of materials">
                <div className="data-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        {["Type", "Material", "Composition", "Placement", "Colour"].map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bomRows.map((row) => (
                        <tr key={row[1]}>
                          {row.map((cell, index) => (
                            <td key={index}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>

              <SectionCard id="artwork" eyebrow="Artwork" title="Artwork and placement">
                <p className="mk-demo-empty">
                  No artwork on this style yet. Placement zones, decoration technique, dimensions
                  and colours are recorded here once artwork is uploaded.
                </p>
              </SectionCard>

              <SectionCard id="measurements" eyebrow="Sizes / Measurements" title="Measurement specification">
                <div className="data-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>POM</th>
                        <th>Description</th>
                        {SIZES.map((size) => (
                          <th key={size}>{size}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {measurements.map((row) => (
                        <tr key={row[0]}>
                          {row.map((cell, index) => (
                            <td key={index}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mk-demo-note">Finished garment, centimetres, ± 1.0 cm unless stated.</p>
              </SectionCard>

              <SectionCard id="sampling" eyebrow="Sampling" title={workflowContent.sampling.title}>
                <ol className="mk-demo-list">
                  {workflowContent.sampling.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
              </SectionCard>

              <SectionCard id="construction" eyebrow="Construction" title={workflowContent.construction.title}>
                <ol className="mk-demo-list">
                  {workflowContent.construction.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
              </SectionCard>

              <SectionCard id="packaging" eyebrow="Packaging / Labels" title={workflowContent.packaging.title}>
                <ol className="mk-demo-list">
                  {workflowContent.packaging.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
              </SectionCard>

              <SectionCard id="history" eyebrow="Version history" title={workflowContent.history.title}>
                <ol className="mk-demo-list">
                  {workflowContent.history.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
                <h3 className="mk-demo-h3">What the factory PDF contains</h3>
                <ul className="mk-pdf-list">
                  {DOCUMENT_SECTIONS.map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
              </SectionCard>

              <div className="mk-demo-end">
                <h2>That&rsquo;s the whole record.</h2>
                <p>Create a workspace to start your own style — every section above becomes editable.</p>
                <Button asChild className="mk-btn">
                  <Link href={SIGN_UP.href} prefetch={false}>
                    {SIGN_UP.label}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
