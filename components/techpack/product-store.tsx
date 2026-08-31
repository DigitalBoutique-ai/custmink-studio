"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";

import {
  addDraft,
  getDraftsServerSnapshot,
  getDraftsSnapshot,
  subscribeToDrafts,
} from "@/lib/draft-store";
import type { Product } from "@/types/techpack";

/**
 * Phase 1A bridge for product reads and local drafts.
 *
 * Server data from `lib/data/products.ts` seeds this store, and locally created
 * drafts are merged on top so the create-tech-pack wizard keeps working end to
 * end before the database exists.
 *
 * Phase 1B replaces `createProduct` with a server action writing to Postgres
 * and drops the draft store; the `useProducts` contract stays put so no feature
 * component has to change.
 */

type ProductStore = {
  products: Product[];
  getProduct: (productId: string) => Product | undefined;
  createProduct: (product: Product) => void;
};

const ProductStoreContext = createContext<ProductStore | null>(null);

export function useProducts(): ProductStore {
  const context = useContext(ProductStoreContext);
  if (!context) {
    throw new Error("useProducts must be used inside <ProductStoreProvider>");
  }
  return context;
}

export function ProductStoreProvider({
  initialProducts,
  children,
}: {
  initialProducts: Product[];
  children: React.ReactNode;
}) {
  const drafts = useSyncExternalStore(
    subscribeToDrafts,
    getDraftsSnapshot,
    getDraftsServerSnapshot,
  );

  const createProduct = useCallback((product: Product) => {
    addDraft(product);
  }, []);

  const value = useMemo<ProductStore>(() => {
    const products = [...drafts, ...initialProducts];
    return {
      products,
      getProduct: (productId) => products.find((product) => product.id === productId),
      createProduct,
    };
  }, [drafts, initialProducts, createProduct]);

  return <ProductStoreContext.Provider value={value}>{children}</ProductStoreContext.Provider>;
}
