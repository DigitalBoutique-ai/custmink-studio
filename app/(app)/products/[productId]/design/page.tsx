import { DesignPanel } from "@/components/techpack/panels/design-panel";
import { getColorways } from "@/lib/data/products";

export default async function DesignSection({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const colorways = await getColorways(productId);
  return <DesignPanel colorways={colorways} />;
}
