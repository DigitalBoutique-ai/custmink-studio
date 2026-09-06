import type { Metadata } from "next";

import { ProductsView } from "@/components/techpack/products-view";
import { pageTitle } from "@/lib/brand";

export const metadata: Metadata = { title: pageTitle("Tech packs") };

export default function ProductsPage() {
  return <ProductsView />;
}
