import type { Metadata } from "next";

import { PublicShell } from "@/components/layout/public-shell";
import { pageTitle } from "@/lib/brand";

export const metadata: Metadata = { title: pageTitle("Create account") };
export const revalidate = 3600;

export default function SignUpPage() {
  return (
    <PublicShell
      eyebrow="Get started"
      title="Create your studio"
      subtitle="Sign-up and organization creation are delivered in Phase 1B alongside Clerk and the tenant model."
    />
  );
}
