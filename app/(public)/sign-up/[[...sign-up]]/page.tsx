import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";

import { PublicShell } from "@/components/layout/public-shell";
import { PRODUCT_NAME, pageTitle } from "@/lib/brand";

export const metadata: Metadata = { title: pageTitle("Create account") };
export const revalidate = 3600;

/** Prerender the bare route; Clerk's sub-steps (`/sign-up/factor-one` …) render on demand and are cached. */
export function generateStaticParams() {
  return [{ "sign-up": [] }];
}

/**
 * Creating a Clerk account grants nothing by itself: a seat has to be
 * provisioned for the email first, and is claimed at `/welcome` after sign-up.
 */
export default function SignUpPage() {
  return (
    <PublicShell
      eyebrow="Get started"
      title={`Create your ${PRODUCT_NAME} account`}
      subtitle="Use the email address your organization invited. You will claim your seat right after."
    >
      <SignUp forceRedirectUrl="/welcome" />
    </PublicShell>
  );
}
