import "@/app/marketing.css";

import type { Metadata } from "next";

import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteNav } from "@/components/marketing/site-nav";
import { SITE_URL } from "@/lib/brand";

/** Resolves the relative OpenGraph image paths on every marketing page. */
export const metadata: Metadata = { metadataBase: new URL(SITE_URL) };

/**
 * Marketing shell. Static by construction — no session, no database, no
 * request APIs. The `custmink/no-dynamic-in-public` lint rule and preflight
 * check #4 both cover this group, so a stray `auth()` here fails the build
 * gate rather than silently making the landing page dynamic.
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mk-site">
      <SiteNav />
      {children}
      <SiteFooter />
    </div>
  );
}
