import { MeasurementsPanel } from "@/components/techpack/panels/measurements-panel";
import { getMeasurements } from "@/lib/data/products";

export default async function MeasurementsSection({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const rows = await getMeasurements(productId);
  return <MeasurementsPanel rows={rows} />;
}
