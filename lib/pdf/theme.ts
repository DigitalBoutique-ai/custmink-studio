/**
 * Print theme for the factory tech pack.
 *
 * Deliberately narrower than the screen design system. A tech pack is printed,
 * photocopied, and read on a factory floor under bad light, so:
 *
 * - No colour carries meaning on its own. Status and provenance are words as
 *   well as colour, because this document survives being photocopied in
 *   greyscale and faxed, and both still happen.
 * - Only the three built-in PDF fonts are used. Registering a webfont means
 *   `Font.register` fetching a file at render time — a network call inside an
 *   export path, which is both slow and a failure mode on a factory PDF that
 *   must render identically every time.
 * - Sizes are in PDF points (1/72"), not pixels.
 */

export const COLORS = {
  ink: "#142033",
  inkSoft: "#41506b",
  inkFaint: "#8a94a8",
  cobalt: "#3451e8",
  rule: "#d7dbe4",
  ruleFaint: "#eceef3",
  surface: "#ffffff",
  surfaceAlt: "#f6f7fb",
  /** Micro-accent only. Never the sole carrier of meaning. */
  lime: "#caff6b",
} as const;

export const FONTS = {
  regular: "Helvetica",
  bold: "Helvetica-Bold",
  italic: "Helvetica-Oblique",
} as const;

export const TYPE = {
  hero: 30,
  title: 17,
  section: 12,
  body: 9,
  small: 8,
  micro: 7,
} as const;

/** A4 at 72dpi is 595.28 x 841.89pt. Margins leave room for the fixed footer. */
export const PAGE = {
  size: "A4",
  paddingTop: 46,
  paddingBottom: 54,
  paddingHorizontal: 44,
} as const;

export const SPACE = { xs: 3, sm: 6, md: 12, lg: 20, xl: 32 } as const;

/**
 * Text colour that stays legible on an arbitrary colorway swatch.
 *
 * Picks whichever of ink and white has the higher WCAG contrast ratio against
 * the swatch, rather than comparing luminance to a threshold. A threshold has
 * to be tuned, and tuning it against the seed colorways is how a pale swatch
 * ends up with white text: #8faee8 sits just above a naive 0.45 cut-off, but
 * white on it is 2.2:1 where ink is 7.3:1. Comparing the two ratios needs no
 * tuning and cannot be wrong for a colour nobody tested.
 */
function relativeLuminance(hex: string): number | null {
  const normalized = hex.replace("#", "");
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;

  const channel = (offset: number): number => {
    const value = parseInt(full.slice(offset, offset + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

/** WCAG 2.2 contrast ratio between two relative luminances. */
export function contrastRatio(a: number, b: number): number {
  const [lighter, darker] = a > b ? [a, b] : [b, a];
  return (lighter + 0.05) / (darker + 0.05);
}

export function readableInkOn(hex: string): string {
  const background = relativeLuminance(hex);
  if (background === null) return COLORS.ink;

  const inkLuminance = relativeLuminance(COLORS.ink) ?? 0;
  const surfaceLuminance = relativeLuminance(COLORS.surface) ?? 1;

  return contrastRatio(background, inkLuminance) >= contrastRatio(background, surfaceLuminance)
    ? COLORS.ink
    : COLORS.surface;
}
