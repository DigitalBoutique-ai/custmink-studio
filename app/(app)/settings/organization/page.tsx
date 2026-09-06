import type { Metadata } from "next";

import { PlaceholderView } from "@/components/techpack/placeholder-view";
import { pageTitle } from "@/lib/brand";

export const metadata: Metadata = { title: pageTitle("Organization") };

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
