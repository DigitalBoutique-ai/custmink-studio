"use client";

import { useEffect } from "react";
import { Plus, WandSparkles } from "lucide-react";

import { useStudioShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";

/**
 * `/products/new` opens the shared create wizard immediately, and leaves a
 * visible entry point behind it for when the dialog is dismissed.
 */
export function NewProductView() {
  const { openCreate } = useStudioShell();

  useEffect(() => {
    openCreate();
  }, [openCreate]);

  return (
    <main className="page-scroll">
      <div className="content-wrap library-page">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Product development</p>
            <h1>Create a tech pack</h1>
            <p>Start from a product type and a short description, then refine every section.</p>
          </div>
          <Button onClick={openCreate}>
            <Plus /> New tech pack
          </Button>
        </div>
        <div className="library-grid">
          <article className="library-card">
            <div className="library-preview">
              <WandSparkles />
            </div>
            <div>
              <h3>Generate with AI</h3>
              <p>Describe the garment and get a structured draft to review.</p>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
