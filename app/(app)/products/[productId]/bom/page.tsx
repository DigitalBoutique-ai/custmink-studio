import { BomPanel } from "@/components/techpack/panels/bom-panel";
import { getBomRows } from "@/lib/data/products";

export default async function BomSection({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const rows = await getBomRows(productId);
  return <BomPanel initialRows={rows} />;
}
