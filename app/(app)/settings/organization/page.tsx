import type { Metadata } from "next";

import { PlaceholderView } from "@/components/techpack/placeholder-view";

export const metadata: Metadata = { title: "Organization | Custm.ink Studio" };

export default function Page() {
  return (
    <PlaceholderView
      eyebrow="Settings"
      title="Organization"
      subtitle="Workspace name, region, retention, and data controls."
      phase="Phase 1B"
    />
  );
}
