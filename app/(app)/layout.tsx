import { AppShell } from "@/components/layout/app-shell";
import { ProductStoreProvider } from "@/components/techpack/product-store";
import { listProducts } from "@/lib/data/products";

/**
 * Authenticated workspace layout.
 *
 * Products are read once here on the server and handed to the client store, so
 * every page below shares one fetch. Phase 1B adds the Clerk session and
 * organization scoping at this boundary.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const products = await listProducts();

  return (
    <ProductStoreProvider initialProducts={products}>
      <AppShell>{children}</AppShell>
    </ProductStoreProvider>
  );
}
