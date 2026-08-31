"use client";

import { Check } from "lucide-react";

import { Garment } from "@/components/techpack/garment";
import { useWorkspace } from "@/components/techpack/product-workspace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { productSections } from "@/lib/navigation";

export function OverviewPanel() {
  const { product, color } = useWorkspace();

  return (
    <div className="section-stack">
      <section className="section-card product-summary">
        <div className="summary-image">
          <Garment color={color} showCallouts={false} />
        </div>
        <div className="summary-details">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Product overview</p>
              <h2>{product.name}</h2>
            </div>
            <Button variant="outline" size="sm">
              Edit details
            </Button>
          </div>
          <dl className="detail-grid">
            <div>
              <dt>Article code</dt>
              <dd>{product.code}</dd>
            </div>
            <div>
              <dt>Category</dt>
              <dd>{product.category}</dd>
            </div>
            <div>
              <dt>Season</dt>
              <dd>{product.season}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <Badge>{product.status}</Badge>
              </dd>
            </div>
            <div>
              <dt>Collection</dt>
              <dd>Riviera Resort 2027</dd>
            </div>
            <div>
              <dt>Supplier</dt>
              <dd>Northstar Apparel</dd>
            </div>
          </dl>
          <div className="description-block">
            <strong>Design intent</strong>
            <p>
              A structured, oversized sleeveless hoodie with a double-layer hood, dropped armholes,
              deep kangaroo pocket, and premium heavyweight hand feel.
            </p>
          </div>
        </div>
      </section>

      <section className="section-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Readiness</p>
            <h2>Factory handoff checklist</h2>
          </div>
          <strong className="completion-number">{product.progress}%</strong>
        </div>
        <Progress value={product.progress} />
        <div className="checklist-grid">
          {productSections.slice(1, 9).map((section) => (
            <div key={section.id} className={section.done ? "check-item done" : "check-item"}>
              {section.done ? <Check /> : <span />}
              {section.label}
              <small>{section.done ? "Complete" : "Needs input"}</small>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
