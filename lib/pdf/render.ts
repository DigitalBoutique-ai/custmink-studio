import { renderToBuffer } from "@react-pdf/renderer";

import { techPackDocument } from "@/lib/pdf/tech-pack-document";
import type { TechPackDocumentData } from "@/lib/pdf/tech-pack-data";

/**
 * Renders the tech pack to PDF bytes.
 *
 * Kept free of `server-only` on purpose: the whole document has to be
 * renderable from a test, and `server-only` throws outside a React Server
 * Component. The server boundary lives one layer up, in
 * `lib/data/tech-pack-export.ts`, where the session and the capability check
 * are — which is also the only place that knows an organization id.
 */
export async function renderTechPackPdf(data: TechPackDocumentData): Promise<Buffer> {
  return renderToBuffer(techPackDocument(data));
}
