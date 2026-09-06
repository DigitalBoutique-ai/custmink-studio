import { AuthorizationError } from "@/lib/auth/permissions";
import { UnauthenticatedError } from "@/lib/auth/session";
import { ProductNotFoundError, getTechPackExportData } from "@/lib/data/tech-pack-export";
import { renderTechPackPdf } from "@/lib/pdf/render";
import { exportFilename } from "@/lib/pdf/tech-pack-data";

/**
 * Factory PDF export.
 *
 * Authenticated, under `app/(app)`, and disallowed in `robots.ts` along with
 * the rest of `/products` — a crawler that could reach this would render a PDF
 * and wake the database on every hit.
 *
 * No `revalidate` and no caching: the response is tenant-scoped, so a cached
 * copy is a cross-tenant leak waiting to happen. That is a deliberate exception
 * to the "declare an explicit revalidate" rule, which governs *public* routes;
 * the compute concern it exists for is handled by authentication plus robots.
 *
 * Rendering happens on the Node runtime because `@react-pdf/renderer` depends
 * on pdfkit, which needs Node builtins.
 */
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> },
): Promise<Response> {
  const { productId } = await params;

  try {
    const data = await getTechPackExportData(productId);
    const pdf = await renderTechPackPdf(data);

    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${exportFilename(data)}"`,
        "Content-Length": String(pdf.length),
        // Tenant-scoped bytes must never sit in a shared cache.
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return new Response("Sign in to export a tech pack", { status: 401 });
    }
    if (error instanceof AuthorizationError) {
      // 404 rather than 403 would hide the product's existence, but the caller
      // already proved they can read it — the missing capability is the honest
      // answer and it is what the UI needs to explain the disabled control.
      return new Response("Your role cannot export tech packs", { status: 403 });
    }
    if (error instanceof ProductNotFoundError) {
      return new Response("Not found", { status: 404 });
    }
    throw error;
  }
}
