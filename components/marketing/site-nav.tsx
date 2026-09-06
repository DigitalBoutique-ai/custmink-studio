"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import { BrandMark } from "@/components/layout/brand-mark";
import { Wordmark } from "@/components/layout/wordmark";
import { Button } from "@/components/ui/button";
import { MARKETING_NAV, TRY_NOW } from "@/lib/marketing/nav";

/**
 * The marketing site's only client component.
 *
 * Kept deliberately thin: `useState` for the mobile panel and nothing else.
 * It imports `Menu`/`X` from lucide directly rather than `components/icon.tsx`,
 * whose registry would drag every app icon into the marketing bundle.
 *
 * `prefetch={false}` on Try Now: a prefetched `/dashboard` runs the app
 * layout's product read for every visitor who scrolls past the button. It
 * falls back to demo data without a session, but marketing traffic should
 * never become app-layout traffic at all.
 */
export function SiteNav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="mk-nav">
      <div className="mk-wrap mk-nav-row">
        <Link href="/" className="mk-nav-brand" onClick={close} aria-label="The Studio home">
          <BrandMark />
          <Wordmark />
        </Link>

        <nav className="mk-nav-links" aria-label="Site">
          {MARKETING_NAV.map((item) => (
            <Link key={item.href} href={item.href} prefetch={false}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mk-nav-cta">
          <Button asChild className="mk-btn">
            <Link href={TRY_NOW.href} prefetch={false}>
              {TRY_NOW.label}
            </Link>
          </Button>
          <button
            type="button"
            className="mk-nav-toggle"
            aria-expanded={open}
            aria-controls="mk-mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <nav
        id="mk-mobile-nav"
        className={open ? "mk-nav-panel is-open" : "mk-nav-panel"}
        aria-label="Site, mobile"
      >
        {MARKETING_NAV.map((item) => (
          <Link key={item.href} href={item.href} prefetch={false} onClick={close}>
            {item.label}
          </Link>
        ))}
        <Link href={TRY_NOW.href} prefetch={false} onClick={close}>
          {TRY_NOW.label}
        </Link>
      </nav>
    </header>
  );
}
