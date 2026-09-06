import type { Metadata } from "next";

import { PublicShell } from "@/components/layout/public-shell";
import { pageTitle } from "@/lib/brand";

export const metadata: Metadata = { title: pageTitle("Accept invitation"), robots: { index: false } };
export const revalidate = 300;

export default function AcceptInvitePage() {
  return (
    <PublicShell
      eyebrow="Team invitation"
      title="Join a studio"
      subtitle="Invitation acceptance is handled by Clerk organizations in Phase 1B."
    />
  );
}
