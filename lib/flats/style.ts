/**
 * Stroke vocabulary for technical flats.
 *
 * One table, two renderers. The browser gets these as a CSS stylesheet with
 * custom properties so a colorway can tint the garment without re-deriving
 * geometry; React PDF gets them as inline presentation attributes, because
 * `@react-pdf/renderer` supports neither stylesheets, CSS classes, nor custom
 * properties inside `<Svg>`.
 *
 * Defining the weights in either renderer instead of here is how the screen
 * flat and the factory PDF quietly stop being the same drawing. Line weight is
 * not decoration on a technical flat — heavy outline versus fine internal
 * detail is how a pattern cutter reads which edge is a cut line and which is a
 * stitch line.
 */

export type FlatStroke = "body" | "hood" | "line" | "zip" | "rib" | "rib-tick";

export type StrokeToken = {
  /** `true` means the garment fill colour, `false` means no fill at all. */
  filled: boolean;
  width: number;
  opacity?: number;
  /** SVG dash pattern, in user units. */
  dash?: readonly [number, number];
  linejoin?: "round";
  linecap?: "round";
};

export const DEFAULT_FILL = "#ffffff";
export const DEFAULT_INK = "#16233b";

export const FLAT_STROKES: Record<FlatStroke, StrokeToken> = {
  body: { filled: true, width: 3.2, linejoin: "round" },
  hood: { filled: true, width: 2.6, linejoin: "round" },
  line: { filled: false, width: 1.8, linejoin: "round", linecap: "round" },
  zip: { filled: false, width: 1.6, dash: [5, 3] },
  rib: { filled: false, width: 1.4 },
  "rib-tick": { filled: false, width: 0.8, opacity: 0.65 },
};

export const FLAT_STROKE_NAMES = Object.keys(FLAT_STROKES) as FlatStroke[];

/** `body` -> `flat-body`. The class name the browser stylesheet uses. */
export function strokeClassName(stroke: FlatStroke): string {
  return `flat-${stroke}`;
}

/** The browser stylesheet, generated from the tokens above. */
export function flatStylesheet(): string {
  return FLAT_STROKE_NAMES.map((name) => {
    const token = FLAT_STROKES[name];
    const declarations = [
      `fill: ${token.filled ? "var(--flat-fill, " + DEFAULT_FILL + ")" : "none"};`,
      `stroke: var(--flat-ink, ${DEFAULT_INK});`,
      `stroke-width: ${token.width};`,
      token.linejoin ? `stroke-linejoin: ${token.linejoin};` : "",
      token.linecap ? `stroke-linecap: ${token.linecap};` : "",
      token.dash ? `stroke-dasharray: ${token.dash[0]} ${token.dash[1]};` : "",
      token.opacity !== undefined ? `opacity: ${token.opacity};` : "",
    ].filter(Boolean);
    return `.${strokeClassName(name)} { ${declarations.join(" ")} }`;
  }).join("\n");
}

/**
 * The same token as React PDF presentation props, with colours resolved.
 *
 * React PDF has no cascade, so the colour has to be baked into every element
 * rather than inherited from a wrapper.
 */
export function strokeProps(
  stroke: FlatStroke,
  colors: { fill?: string; ink?: string } = {},
): {
  fill: string;
  stroke: string;
  strokeWidth: number;
  strokeLinejoin?: "round";
  strokeLinecap?: "round";
  strokeDasharray?: string;
  opacity?: number;
} {
  const token = FLAT_STROKES[stroke];
  const ink = colors.ink ?? DEFAULT_INK;
  return {
    fill: token.filled ? (colors.fill ?? DEFAULT_FILL) : "none",
    stroke: ink,
    strokeWidth: token.width,
    ...(token.linejoin ? { strokeLinejoin: token.linejoin } : {}),
    ...(token.linecap ? { strokeLinecap: token.linecap } : {}),
    ...(token.dash ? { strokeDasharray: token.dash.join(" ") } : {}),
    ...(token.opacity !== undefined ? { opacity: token.opacity } : {}),
  };
}
