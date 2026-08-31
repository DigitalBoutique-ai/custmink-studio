"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Plus, Search, Tags } from "lucide-react";

import { useStudioShell } from "@/components/layout/app-shell";
import { Garment } from "@/components/techpack/garment";
import { useProducts } from "@/components/techpack/product-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

export function ProductsView() {
  const { openCreate } = useStudioShell();
  const { products } = useProducts();
  const [query, setQuery] = useState("");

  const filtered = products.filter((product) =>
    `${product.name} ${product.code} ${product.category}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <main className="page-scroll">
      <div className="content-wrap library-page">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Product development</p>
            <h1>Tech packs</h1>
            <p>Design, specify, sample, approve, and hand off every style.</p>
          </div>
          <Button onClick={openCreate}>
            <Plus /> New tech pack
          </Button>
        </div>
        <div className="library-toolbar">
          <div className="inline-search">
            <Search />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tech packs…"
              aria-label="Search tech packs"
            />
          </div>
          <Button variant="outline">
            <Tags /> Filter
          </Button>
          <Button variant="outline">
            <ChevronDown /> Sort
          </Button>
        </div>
        <div className="product-card-grid">
          {filtered.map((product) => (
            <Link className="product-card" key={product.id} href={`/products/${product.id}/overview`}>
              <div className="product-card-visual" style={{ background: `${product.color}20` }}>
                <Garment color={product.color} showCallouts={false} />
                <Badge>{product.status}</Badge>
              </div>
              <div className="product-card-copy">
                <p>
                  {product.code} · {product.season}
                </p>
                <h3>{product.name}</h3>
                <div>
                  <Progress value={product.progress} />
                  <span>{product.progress}% ready</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
