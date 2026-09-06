"use client";

import Link from "next/link";
import { Check, ChevronRight, Plus, Ruler, Shirt, Sparkles } from "lucide-react";

import { Icon } from "@/components/icon";
import { useStudioShell } from "@/components/layout/app-shell";
import { useProducts } from "@/components/techpack/product-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { dashboardMetrics } from "@/lib/demo-data";

export function DashboardView({ firstName }: { firstName: string }) {
  const { openCreate } = useStudioShell();
  const { products } = useProducts();
  const firstProduct = products[0];
  const reviewHref = firstProduct ? `/products/${firstProduct.id}/overview` : "/products";

  return (
    <main className="page-scroll">
      <div className="content-wrap dashboard-page">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Monday, August 31</p>
            <h1>Good afternoon, {firstName}.</h1>
            <p>Your product pipeline is moving. Two styles need decisions this week.</p>
          </div>
          <Button onClick={openCreate}>
            <Plus /> Create tech pack
          </Button>
        </div>

        <section className="metric-grid">
          {dashboardMetrics.map((item) => (
            <article className="metric-card" key={item.label}>
              <span className="metric-icon">
                <Icon name={item.icon} />
              </span>
              <p>{item.label}</p>
              <strong>{item.value}</strong>
              <small>{item.detail}</small>
            </article>
          ))}
        </section>

        <section className="dashboard-grid">
          <div className="panel wide-panel">
            <div className="panel-heading">
              <div>
                <h2>Recent tech packs</h2>
                <p>Continue from where your team left off.</p>
              </div>
              <Link className="text-button" href="/products">
                View all <ChevronRight />
              </Link>
            </div>
            <div className="product-table">
              {products.map((product) => (
                <Link
                  className="product-row"
                  key={product.id}
                  href={`/products/${product.id}/overview`}
                >
                  <span className="product-thumb">
                    <Shirt style={{ color: product.color, fill: product.color }} />
                  </span>
                  <span className="product-main">
                    <strong>{product.name}</strong>
                    <small>
                      {product.code} · {product.season}
                    </small>
                  </span>
                  <Badge variant="outline">{product.status}</Badge>
                  <span className="row-progress">
                    <span>
                      <i style={{ width: `${product.progress}%` }} />
                    </span>
                    <small>{product.progress}%</small>
                  </span>
                  <span className="updated">{product.updated}</span>
                  <ChevronRight />
                </Link>
              ))}
            </div>
          </div>

          <div className="panel ai-insight-card">
            <div className="panel-heading">
              <div>
                <span className="ai-orb">
                  <Sparkles />
                </span>
                <h2>Studio intelligence</h2>
              </div>
            </div>
            <h3>Two details may delay sampling.</h3>
            <p>
              The Riviera Hoodie is missing grade-rule confirmation and the final care-label
              artwork.
            </p>
            <Link className="insight-action" href={reviewHref}>
              <span>
                <Check /> Review missing details
              </span>
              <ChevronRight />
            </Link>
            <Link
              className="insight-action"
              href={
                firstProduct ? `/products/${firstProduct.id}/measurements` : "/libraries/size-charts"
              }
            >
              <span>
                <Ruler /> Check size chart grading
              </span>
              <ChevronRight />
            </Link>
          </div>
        </section>

        <section className="panel activity-panel">
          <div className="panel-heading">
            <div>
              <h2>Collection progress</h2>
              <p>Riviera Resort 2027 · 12 styles</p>
            </div>
            <Badge>On track</Badge>
          </div>
          <div className="collection-progress">
            <div>
              <strong>68%</strong>
              <span>complete</span>
            </div>
            <Progress value={68} />
            <div className="milestones">
              <span>
                <i className="done" />
                Concept
              </span>
              <span>
                <i className="done" />
                Development
              </span>
              <span>
                <i />
                Sampling
              </span>
              <span>
                <i />
                Production
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
