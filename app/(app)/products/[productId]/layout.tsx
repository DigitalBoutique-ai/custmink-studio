import type { Metadata } from "next";

import { ProductWorkspace } from "@/components/techpack/product-workspace";
import { getProduct } from "@/lib/data/products";
import { pageTitle } from "@/lib/brand";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ productId: string }>;
}): Promise<Metadata> {
  const { productId } = await params;
  const product = await getProduct(productId);
  return { title: pageTitle(product?.name ?? "Tech pack") };
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
