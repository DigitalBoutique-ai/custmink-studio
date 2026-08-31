import type { Metadata } from "next";

import { PublicShell } from "@/components/layout/public-shell";

export const metadata: Metadata = { title: "Factory comments | Custm.ink Studio", robots: { index: false } };
export const revalidate = 300;

export default function ShareCommentsPage() {
  return (
    <PublicShell
      eyebrow="Read-only factory view"
      title="Supplier comments"
      subtitle="Optional supplier commenting on a shared specification. Delivered in Phase 4."
    />
  );
}
