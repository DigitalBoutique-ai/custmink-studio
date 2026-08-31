import type { Metadata } from "next";

import { PublicShell } from "@/components/layout/public-shell";

export const metadata: Metadata = { title: "Sign in | Custm.ink Studio" };
export const revalidate = 3600;

export default function SignInPage() {
  return (
    <PublicShell
      eyebrow="Welcome back"
      title="Sign in to Custm.ink Studio"
      subtitle="Clerk-hosted authentication is wired up in Phase 1B. This route reserves the URL so redirects and invitations resolve correctly."
    />
  );
}
