import Image from "next/image";
import Link from "next/link";

import { BrandMark } from "@/components/layout/brand-mark";
import { Wordmark } from "@/components/layout/wordmark";
import { MARKETING_NAV, TRY_NOW } from "@/lib/marketing/nav";

/**
 * Footer. The wordmark is the same `<Wordmark/>` the header uses, so the
 * small-superscript ™ cannot drift between the two. The "Powered by" mark is
 * DBAI's agency logo, knocked out to a transparent ink-on-white PNG so it sits
 * on the white footer without its native black background.
 */
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

        <div className="mk-powered">
          <span>Powered by</span>
          <Image
            src="/dbai-agency.png"
            alt="DBAI agency"
            width={110}
            height={81}
            unoptimized
          />
        </div>

        <p className="mk-footer-note">
          © {new Date().getFullYear()} Digital Boutique AI. The demo workspace is read-only and
          shows sample data.
        </p>
      </div>
    </footer>
  );
}
