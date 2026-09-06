import Link from "next/link";

import { BrandMark } from "@/components/layout/brand-mark";
import { Wordmark } from "@/components/layout/wordmark";
import { MARKETING_NAV, TRY_NOW } from "@/lib/marketing/nav";

export function SiteFooter() {
  return (
    <footer className="mk-footer">
      <div className="mk-wrap">
        <div className="mk-footer-row">
          <Link href="/" className="mk-nav-brand" aria-label="The Studio home">
            <BrandMark />
            <Wordmark />
          </Link>
          <nav className="mk-footer-links" aria-label="Footer">
            {MARKETING_NAV.map((item) => (
              <Link key={item.href} href={item.href} prefetch={false}>
                {item.label}
              </Link>
            ))}
            <Link href={TRY_NOW.href} prefetch={false}>
              {TRY_NOW.label}
            </Link>
            <Link href="/sign-in" prefetch={false}>
              Sign in
            </Link>
          </nav>
        </div>
        <p className="mk-footer-note">
          © {new Date().getFullYear()} Digital Boutique AI. The demo workspace is read-only and
          shows sample data.
        </p>
      </div>
    </footer>
  );
}
