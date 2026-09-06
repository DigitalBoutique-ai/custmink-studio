import type { Metadata } from "next";

import { PublicShell } from "@/components/layout/public-shell";
import { pageTitle } from "@/lib/brand";

export const metadata: Metadata = { title: pageTitle("Factory view"), robots: { index: false } };
/**
 * Share links resolve per token and must never be cached across tokens. The
 * window is short and Phase 4 pairs it with on-write revalidation when a share
 * is revoked or the underlying version changes.
 */
export const revalidate = 300;

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <PublicShell
      eyebrow="Read-only factory view"
      title="Secure specification link"
      subtitle={`Token ${token.slice(0, 6)}… will resolve to an immutable approved version. Token hashing, scoping, expiry, and rate limiting land in Phase 4.`}
    />
  );
}
