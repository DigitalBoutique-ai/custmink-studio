import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ClaimForm } from "@/app/(onboarding)/welcome/claim-form";
import { PublicShell } from "@/components/layout/public-shell";
import { PRODUCT_NAME } from "@/lib/brand";
import { getIdentity, getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: `Welcome | ${PRODUCT_NAME}` };

/**
 * Signed in, but not yet in a workspace.
 *
 * Reached from the `(app)` layout when Clerk knows the person but no seat is
 * linked to them. Calls `auth()`, so it renders dynamically — which is why it
 * sits in its own route group rather than under `(public)`.
 */
export default async function WelcomePage() {
  const identity = await getIdentity();
  if (!identity) redirect("/sign-in");

  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <PublicShell
      eyebrow="Almost there"
      title={`Join your workspace on ${PRODUCT_NAME}`}
      subtitle={`You are signed in as ${identity.email}. If your organization has set up a seat for that address, claim it below.`}
    >
      <ClaimForm />
    </PublicShell>
  );
}
