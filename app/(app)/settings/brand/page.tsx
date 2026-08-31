import type { Metadata } from "next";

import { PlaceholderView } from "@/components/techpack/placeholder-view";

export const metadata: Metadata = { title: "Brand | Custm.ink Studio" };

export default function Page() {
  return (
    <PlaceholderView
      eyebrow="Settings"
      title="Brand"
      subtitle="Logo, colors, and the branding applied to factory PDFs."
      phase="Phase 5"
    />
  );
}
