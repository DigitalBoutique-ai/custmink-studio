import type { Metadata } from "next";

import { PlaceholderView } from "@/components/techpack/placeholder-view";
import { pageTitle } from "@/lib/brand";

export const metadata: Metadata = { title: pageTitle("Activity") };

export default function ActivityPage() {
  return (
    <PlaceholderView
      eyebrow="Workspace"
      title="Activity"
      subtitle="Every comment, approval, share, and export across the organization."
      phase="Phase 4"
    />
  );
}
