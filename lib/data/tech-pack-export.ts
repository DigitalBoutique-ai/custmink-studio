import "server-only";

import { cache } from "react";

import { assertCan } from "@/lib/auth/permissions";
import { requireSession } from "@/lib/auth/session";
import { getBomGridRows } from "@/lib/data/bom";
import { getColorways, getMeasurements, getProduct } from "@/lib/data/products";
import { workflowContent } from "@/lib/demo-data";
import { buildTechPackData, type TechPackDocumentData } from "@/lib/pdf/tech-pack-data";

/**
 * The server boundary for the factory PDF.
 *
 * Everything above this line is pure and testable; everything below it needs a
 * session. The split matters because `lib/pdf/**` must stay importable from a
 * test, and `server-only` throws outside a React Server Component.
 *
 * `export:create` is a real capability, not a formality: a `reviewer` and a
 * `factory_guest` can both read a product but neither may generate an export,
 * because an export leaves the product and the audit trail behind.
 */

export class ProductNotFoundError extends Error {
  constructor(productId: string) {
    super(`No product ${productId} in this organization`);
    this.name = "ProductNotFoundError";
  }
}

export const getTechPackExportData = cache(
  async (productId: string): Promise<TechPackDocumentData> => {
    const session = await requireSession();
    assertCan(session.role, "export:create");

    // Reads are already organizationId-scoped inside `lib/data/products.ts`;
    // the organization is never taken from the caller. A product from another
    // tenant simply does not resolve, so this is also the tenancy check.
    const product = await getProduct(productId);
    if (!product) throw new ProductNotFoundError(productId);

    const [colorways, bom, measurements] = await Promise.all([
      getColorways(productId),
      getBomGridRows(productId),
      getMeasurements(productId),
    ]);

    return buildTechPackData({
      product,
      colorways,
      bom,
      measurements,
      // The BOM is real as of Phase 2. Construction, packaging and sampling
      // still come from the demo dataset — their tables land with the screens
      // that edit them.
      construction: workflowContent.construction.items,
      packaging: workflowContent.packaging.items,
      sampling: workflowContent.sampling.items,
      preparedBy: session.name,
      // TODO(Phase 2): organization name and brand come from `organizations`
      // and `brands` once those reads exist. Hardcoding the DBAI organization
      // is wrong the moment a second tenant exists, which is why it is marked.
      organizationName: "Digital Boutique AI",
      brandName: "Exora Ink",
      now: new Date(),
    });
  },
);
