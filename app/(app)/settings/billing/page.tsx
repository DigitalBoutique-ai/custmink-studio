import type { Metadata } from "next";

import { PlaceholderView } from "@/components/techpack/placeholder-view";

export const metadata: Metadata = { title: "Billing | Custm.ink Studio" };

export default function Page() {
  return (
    <PlaceholderView
      eyebrow="Settings"
      title="Billing"
      subtitle="Plan, usage limits, invoices, and payment method."
      phase="Phase 6"
    />
  );
}
