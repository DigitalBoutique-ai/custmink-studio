import type { FlatSpecV1 } from "@/lib/flats/spec";
import { flatStylesheet } from "@/lib/flats/style";
import {
  type FlatElement,
  type FlatGroup,
  type FlatView,
  type RenderedFlat,
  renderHoodie,
} from "@/lib/flats/templates/hoodie";

/**
 * Deterministic flat rendering.
 *
 * The same spec always produces byte-identical SVG, which is what makes the
 * renderer snapshot-testable in CI at no cost and makes a stored
 * `canvas_documents.content` reproducible rather than a frozen blob of paths.
 */

const TEMPLATES = {
  hoodie: renderHoodie,
} as const;

export type TemplateId = keyof typeof TEMPLATES;

/**
 * Line weights follow technical-flat convention: heavy outline, fine internal
 * detail. Generated from `lib/flats/style.ts` so the browser drawing and the
 * PDF drawing cannot disagree about stroke weight.
 */
const FLAT_STYLES = flatStylesheet();

export function renderFlat(spec: FlatSpecV1, view: FlatView): RenderedFlat {
  const template = TEMPLATES[spec.templateId];
  return template(spec, view);
}

/**
 * A complete standalone SVG document.
 *
 * `fill` tints the garment body so a colorway renders without re-deriving
 * geometry. Print-safe by construction: strokes are real vectors, so the same
 * document scales into the factory PDF at any resolution.
 */
export function renderFlatSvg(
  spec: FlatSpecV1,
  view: FlatView,
  options: { fill?: string; ink?: string } = {},
): string {
  const flat = renderFlat(spec, view);
  const vars = [
    options.fill ? `--flat-fill: ${options.fill};` : "",
    options.ink ? `--flat-ink: ${options.ink};` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${flat.viewBox}" role="img" aria-label="${view} technical flat">`,
    `<style>${FLAT_STYLES}</style>`,
    vars ? `<g style="${vars}">` : "<g>",
    flat.body,
    "</g>",
    "</svg>",
  ].join("");
}

/** Front and back from one parameter object — they cannot drift apart. */
export function renderFlatPair(
  spec: FlatSpecV1,
  options: { fill?: string; ink?: string } = {},
): { front: string; back: string } {
  return {
    front: renderFlatSvg(spec, "front", options),
    back: renderFlatSvg(spec, "back", options),
  };
}

export type { FlatView, RenderedFlat };

/** The drawing before serialization — what a non-SVG renderer consumes. */
export function renderFlatGroups(spec: FlatSpecV1, view: FlatView): FlatGroup[] {
  return renderFlat(spec, view).groups;
}

export type { FlatElement, FlatGroup };
