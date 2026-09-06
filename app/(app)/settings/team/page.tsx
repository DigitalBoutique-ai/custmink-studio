import type { Metadata } from "next";

import { PlaceholderView } from "@/components/techpack/placeholder-view";
import { pageTitle } from "@/lib/brand";

export const metadata: Metadata = { title: pageTitle("Team") };

export default function Page() {
  return (
    <PlaceholderView
      eyebrow="Settings"
      title="Team"
      subtitle="Members, roles, invitations, and access reviews."
      phase="Phase 1B"
    />
  );
}
