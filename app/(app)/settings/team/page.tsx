import type { Metadata } from "next";

import { PlaceholderView } from "@/components/techpack/placeholder-view";

export const metadata: Metadata = { title: "Team | Custm.ink Studio" };

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
