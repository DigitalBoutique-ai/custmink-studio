import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { ProductStoreProvider } from "@/components/techpack/product-store";
import { getIdentity, getSession } from "@/lib/auth/session";
import { listProducts } from "@/lib/data/products";

/**
 * Authenticated workspace layout.
 *
 * This is the auth gate for everything under `app/(app)`: no session, no
 * workspace. Not signed in goes to `/sign-in`; signed in with Clerk but holding
 * no seat goes to `/welcome` to claim one (see `lib/seats/rules.ts`).
 *
 * Route handlers under this tree are not wrapped by a layout — each one calls
 * `requireSession()` itself (see `products/[productId]/export/route.ts`).
 *
 * Products are read once here on the server and handed to the client store, so
 * every page below shares one fetch.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect((await getIdentity()) ? "/welcome" : "/sign-in");
  }

  const products = await listProducts();

  return (
    <ProductStoreProvider initialProducts={products}>
      <AppShell>{children}</AppShell>
    </ProductStoreProvider>
  );
}
