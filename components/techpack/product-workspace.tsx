"use client";

import Link from "next/link";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import { createContext, useContext, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Download,
  Link2,
  MoreHorizontal,
  Share2,
  Shirt,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { Icon } from "@/components/icon";
import { useStudioShell } from "@/components/layout/app-shell";
import { useProducts } from "@/components/techpack/product-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { findSection, productSectionHref, productSections } from "@/lib/navigation";
import type { Product, SectionKey } from "@/types/techpack";

/**
 * Persistent product workspace chrome.
 *
 * The header, readiness card, table of contents, and factory-link card stay
 * mounted while section routes swap underneath — the nested-layout requirement
 * from the master prompt. Canvas state that several sections share (garment
 * colour, artwork width) lives here so switching sections does not reset it.
 */

type WorkspaceState = {
  product: Product;
  color: string;
  setColor: (value: string) => void;
  artworkSize: number;
  setArtworkSize: (value: number) => void;
};

const WorkspaceContext = createContext<WorkspaceState | null>(null);

export function useWorkspace(): WorkspaceState {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used inside <ProductWorkspace>");
  }
  return context;
}

export function ProductWorkspace({
  productId,
  children,
}: {
  productId: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { openAi } = useStudioShell();
  const { getProduct } = useProducts();
  const product = getProduct(productId);
  const segment = useSelectedLayoutSegment();
  const activeSection = (segment ?? "overview") as SectionKey;

  const [color, setColor] = useState<string | null>(null);
  const [artworkSize, setArtworkSize] = useState(38);

  const resolvedColor = color ?? product?.color ?? "#8faee8";

  const workspace = useMemo<WorkspaceState | null>(
    () =>
      product
        ? { product, color: resolvedColor, setColor, artworkSize, setArtworkSize }
        : null,
    [product, resolvedColor, artworkSize],
  );

  if (!product || !workspace) {
    return (
      <main className="page-scroll">
        <div className="content-wrap library-page">
          <div className="page-heading">
            <div>
              <p className="eyebrow">Product development</p>
              <h1>Tech pack not found</h1>
              <p>This style may have been archived, or the link is out of date.</p>
            </div>
            <Button onClick={() => router.push("/products")}>Back to products</Button>
          </div>
        </div>
      </main>
    );
  }

  const section = findSection(activeSection);
  const contentTitle =
    activeSection === "design"
      ? "Canvas editor"
      : activeSection === "overview"
        ? "Product specification"
        : (section?.label ?? "Section");

  return (
    <WorkspaceContext.Provider value={workspace}>
      <div className="workspace-shell">
        <header className="product-header">
          <div className="product-title-row">
            <Button variant="ghost" size="icon" onClick={() => router.push("/products")} aria-label="Back to products">
              <ArrowLeft />
            </Button>
            <span className="tiny-product-thumb">
              <Shirt style={{ color: resolvedColor, fill: resolvedColor }} />
            </span>
            <div>
              <div className="breadcrumb">
                Products <ChevronRight /> {product.category}
              </div>
              <h1>{product.name}</h1>
            </div>
            <Badge className="status-badge">{product.status}</Badge>
          </div>
          <div className="product-actions">
            <span className="autosave">
              <Check /> Saved
            </span>
            <Button variant="outline" onClick={() => toast.success("Read-only factory link copied")}>
              <Share2 /> Share
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Download /> Export PDF
            </Button>
            <Button onClick={openAi}>
              <Sparkles /> AI assistant
            </Button>
            <button className="icon-button" aria-label="More product actions">
              <MoreHorizontal />
            </button>
          </div>
        </header>

        <div className="workspace-body">
          <aside className="section-nav">
            <div className="completion-card">
              <div>
                <span>Tech pack readiness</span>
                <strong>{product.progress}%</strong>
              </div>
              <Progress value={product.progress} />
              <small>3 sections need input</small>
            </div>
            <p>Table of contents</p>
            {productSections.map((item) => (
              <Link
                key={item.id}
                href={productSectionHref(product.id, item.id)}
                className={activeSection === item.id ? "section-nav-item active" : "section-nav-item"}
                aria-current={activeSection === item.id ? "page" : undefined}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
                {item.done ? <Check className="section-check" /> : <i />}
              </Link>
            ))}
            <div className="factory-card">
              <Link2 />
              <strong>Factory live link</strong>
              <p>Always reflects the latest saved version.</p>
              <button onClick={() => toast.success("Factory link copied")}>Copy link</button>
            </div>
          </aside>

          <main className={activeSection === "design" ? "product-content canvas-content" : "product-content"}>
            <div className="content-header">
              <div>
                <p className="eyebrow">{section?.label}</p>
                <h2>{contentTitle}</h2>
              </div>
              {activeSection !== "design" && <span className="last-edited">Last edited 8 minutes ago</span>}
            </div>
            {children}
          </main>
        </div>
      </div>
    </WorkspaceContext.Provider>
  );
}
