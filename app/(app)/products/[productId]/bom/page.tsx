import { BomPanel } from "@/components/techpack/panels/bom-panel";
import { getSession } from "@/lib/auth/session";
import { listBomItems } from "@/lib/data/bom";
import { bomRows as demoBomRows } from "@/lib/demo-data";

export default async function BomSection({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const [session, items] = await Promise.all([getSession(), listBomItems(productId)]);

  // Without a session there is nothing to write to, so the grid renders the
  // demo dataset read-only rather than offering edits that cannot persist.
  return (
    <BomPanel
      productId={productId}
      items={items}
      demoRows={demoBomRows}
      editable={session !== null}
    />
  );
}
