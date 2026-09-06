/**
 * The product's own name, in one place.
 *
 * It was "Custm.ink Studio" and became "The Studio™" on 2026-09-05, which took
 * a sweep of twenty-five hardcoded page titles and two copies of the wordmark.
 * Once is a rename; twice is a pattern, so the string lives here now.
 *
 * Note what this is *not*: `custm.ink` is a DBAI apparel brand and a domain,
 * and `custmink-studio` is the GitHub, Vercel, and Neon project identifier.
 * Neither is the product name and neither changes with it.
 *
 * Plain data, no React — safe to import on either side of the boundary.
 */

export const PRODUCT_NAME = "The Studio";

/** The mark is rendered small and superscript in the UI; see `.wordmark-tm`. */
export const TRADEMARK = "™";

/** For plain-text contexts — page titles, PDF metadata, exports. */
export const PRODUCT_NAME_TM = `${PRODUCT_NAME}${TRADEMARK}`;

export const PRODUCT_TAGLINE = "AI Tech Pack Builder";

/** `pageTitle("Dashboard")` -> `"Dashboard | The Studio™"`. */
export function pageTitle(section: string): string {
  return `${section} | ${PRODUCT_NAME_TM}`;
}
