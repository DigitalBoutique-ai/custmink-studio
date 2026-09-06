import type { Metadata } from "next";

import { NewProductView } from "@/components/techpack/new-product-view";
import { pageTitle } from "@/lib/brand";

export const metadata: Metadata = { title: pageTitle("New tech pack") };

/**
 * Standalone entry point for the create wizard, so the flow is linkable and
 * survives a page refresh. It opens the same dialog the topbar triggers.
 */
export default function NewProductPage() {
  return <NewProductView />;
}
