import type { Metadata } from "next";

import { PublicShell } from "@/components/layout/public-shell";
import { PRODUCT_NAME_TM, pageTitle } from "@/lib/brand";

export const metadata: Metadata = { title: pageTitle("Sign in") };
export const revalidate = 3600;

export default function SignInPage() {
  return (
    <PublicShell
      eyebrow="Welcome back"
      title={`Sign in to ${PRODUCT_NAME_TM}`}
      subtitle="Sign-in is not open yet. The Studio is in a private pilot, and accounts are issued by invitation while authentication is completed."
    />
  );
}
