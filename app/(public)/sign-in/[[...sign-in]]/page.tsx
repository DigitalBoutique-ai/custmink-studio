import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

import { PublicShell } from "@/components/layout/public-shell";
import { PRODUCT_NAME, pageTitle } from "@/lib/brand";

export const metadata: Metadata = { title: pageTitle("Sign in") };
export const revalidate = 3600;

/** Prerender the bare route; Clerk's sub-steps (`/sign-in/factor-one` …) render on demand and are cached. */
export function generateStaticParams() {
  return [{ "sign-in": [] }];
}

/**
 * Clerk-hosted sign-in. `<SignIn />` is a client component that talks to Clerk
 * from the browser, so this route stays static; the session it produces is
 * read by `auth()` inside `app/(app)/**` only.
 */
export default function SignInPage() {
  return (
    <PublicShell
      eyebrow="Welcome back"
      title={`Sign in to ${PRODUCT_NAME}`}
      subtitle="The Studio is in a private pilot. Accounts are issued by invitation — sign in with the email your organization set up."
    >
      {/* The shell carries the heading; Clerk's own would repeat it with the resource name. */}
      <SignIn forceRedirectUrl="/dashboard" signUpUrl="/sign-up" appearance={{ elements: { header: "hidden" } }} />
    </PublicShell>
  );
}
