import type { Metadata } from "next";

import { PlaceholderView } from "@/components/techpack/placeholder-view";

export const metadata: Metadata = { title: "Activity | Custm.ink Studio" };

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
