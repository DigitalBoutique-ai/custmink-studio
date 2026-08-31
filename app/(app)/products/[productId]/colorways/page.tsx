import { ColorwaysPanel } from "@/components/techpack/panels/colorways-panel";
import { getColorways } from "@/lib/data/products";

export default async function ColorwaysSection({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const colorways = await getColorways(productId);
  return <ColorwaysPanel colorways={colorways} />;
}
