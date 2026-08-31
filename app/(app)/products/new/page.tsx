import type { Metadata } from "next";

import { NewProductView } from "@/components/techpack/new-product-view";

export const metadata: Metadata = { title: "New tech pack | Custm.ink Studio" };

/**
 * Standalone entry point for the create wizard, so the flow is linkable and
 * survives a page refresh. It opens the same dialog the topbar triggers.
 */
export default function NewProductPage() {
  return <NewProductView />;
}
