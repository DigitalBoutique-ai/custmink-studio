import { PRODUCT_NAME, TRADEMARK } from "@/lib/brand";

/**
 * The product wordmark.
 *
 * The trademark is a real `<sup>` rather than the bare ™ character at body
 * size: at wordmark scale the raw glyph sits on the baseline and reads as a
 * typo. `aria-hidden` on the mark keeps a screen reader saying "The Studio"
 * rather than "The Studio trade mark" on every screen.
 */
export function Wordmark() {
  return (
    <strong className="wordmark">
      {PRODUCT_NAME}
      <sup className="wordmark-tm" aria-hidden="true">
        {TRADEMARK}
      </sup>
    </strong>
  );
}
