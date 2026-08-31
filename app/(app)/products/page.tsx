import type { Metadata } from "next";

import { ProductsView } from "@/components/techpack/products-view";

export const metadata: Metadata = { title: "Tech packs | Custm.ink Studio" };

export default function ProductsPage() {
  return <ProductsView />;
}
