import type { Metadata } from "next";

import { ProductWorkspace } from "@/components/techpack/product-workspace";
import { getProduct } from "@/lib/data/products";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ productId: string }>;
}): Promise<Metadata> {
  const { productId } = await params;
  const product = await getProduct(productId);
  return { title: `${product?.name ?? "Tech pack"} | Custm.ink Studio` };
}

/**
 * Nested product layout. The header, readiness card, table of contents, share
 * controls, and factory link stay mounted while section routes change.
 */
export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  return <ProductWorkspace productId={productId}>{children}</ProductWorkspace>;
}
