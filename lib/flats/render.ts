import type { FlatSpecV1 } from "@/lib/flats/spec";
import { type FlatView, type RenderedFlat, renderHoodie } from "@/lib/flats/templates/hoodie";

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

/** Line weights follow technical-flat convention: heavy outline, fine internal detail. */
const FLAT_STYLES = `
.flat-body { fill: var(--flat-fill, #ffffff); stroke: var(--flat-ink, #16233b); stroke-width: 3.2; stroke-linejoin: round; }
.flat-hood { fill: var(--flat-fill, #ffffff); stroke: var(--flat-ink, #16233b); stroke-width: 2.6; stroke-linejoin: round; }
.flat-line { fill: none; stroke: var(--flat-ink, #16233b); stroke-width: 1.8; stroke-linejoin: round; stroke-linecap: round; }
.flat-zip { fill: none; stroke: var(--flat-ink, #16233b); stroke-width: 1.6; stroke-dasharray: 5 3; }
.flat-rib { fill: none; stroke: var(--flat-ink, #16233b); stroke-width: 1.4; }
.flat-rib-tick { fill: none; stroke: var(--flat-ink, #16233b); stroke-width: 0.8; opacity: 0.65; }
`.trim();

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
