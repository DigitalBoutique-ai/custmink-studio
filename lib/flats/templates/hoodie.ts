import type { FlatSpecV1 } from "@/lib/flats/spec";
import { type FlatStroke, strokeClassName } from "@/lib/flats/style";

/**
 * Parametric hoodie technical flat.
 *
 * Front and back are rendered from the same derived measurement set, so they
 * cannot disagree about shoulder width, body length, or sleeve geometry — the
 * correspondence a generative model has to be coaxed into is structural here.
 *
 * Coordinates are a fixed 400x560 viewBox in arbitrary drawing units. Real
 * centimetre values live on points of measure, not on the drawing; the flat is
 * a schematic the factory reads alongside the measurement table.
 */

export type Point = { x: number; y: number };
export type FlatView = "front" | "back";

/**
 * One drawn element, before it is committed to a rendering technology.
 *
 * The template emits these rather than markup so the browser SVG and the
 * React PDF drawing are two serializations of one geometry instead of two
 * drawings that have to be kept in agreement by hand.
 */
export type FlatElement =
  | { kind: "path"; d: string; stroke: FlatStroke }
  | {
      kind: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
      stroke: FlatStroke;
    };

/** Elements carry a group id so callouts and artwork can target `#pocket`. */
export type FlatGroup = { id: string; elements: FlatElement[] };

export type RenderedFlat = {
  viewBox: string;
  /** SVG markup without the outer <svg> element, so callers control sizing. */
  body: string;
  /** The same drawing before serialization — what the PDF renderer consumes. */
  groups: FlatGroup[];
  /** Named attachment points for artwork placement and numbered callouts. */
  anchors: Record<string, Point>;
};

/** Serializes groups to SVG markup. Class-based, so the stylesheet can tint. */
export function serializeGroups(groups: FlatGroup[]): string {
  return groups
    .map(({ id, elements }) => {
      const markup = elements
        .map((element) =>
          element.kind === "path"
            ? `<path d="${element.d}" class="${strokeClassName(element.stroke)}" />`
            : `<rect x="${n(element.x)}" y="${n(element.y)}" width="${n(element.width)}" height="${n(element.height)}" class="${strokeClassName(element.stroke)}" />`,
        )
        .join("");
      return `<g id="${id}">${markup}</g>`;
    })
    .join("");
}

export const VIEW_BOX = { width: 400, height: 560 } as const;

const CENTER_X = VIEW_BOX.width / 2;

/** Half-widths at shoulder, chest, and hem for each silhouette. */
const SILHOUETTE_WIDTHS = {
  boxy: { shoulder: 96, chest: 100, hem: 98 },
  regular: { shoulder: 88, chest: 92, hem: 88 },
  oversized: { shoulder: 108, chest: 112, hem: 108 },
} as const;

/** Fit eases the chest and hem without moving the shoulder seam. */
const FIT_DELTA = { slim: -8, regular: 0, relaxed: 8 } as const;

const HEM_Y = { cropped: 330, regular: 400, long: 450 } as const;

const SLEEVE_GEOMETRY = {
  sleeveless: null,
  // `extend` pushes the cuff outboard of the shoulder; `opening` is the cuff
  // width. Short sleeves flare, long sleeves taper — as they do on a real flat.
  short: { drop: 80, extend: 26, opening: 46 },
  long: { drop: 200, extend: 44, opening: 40 },
} as const;

const NECK_Y = 96;
const SHOULDER_Y = 106;
const CHEST_Y = 200;
const NECK_HALF_WIDTH = 36;
const FRONT_NECK_DROP = 26;
const BACK_NECK_DROP = 10;

/** Two decimals is well inside drawing tolerance and keeps output byte-stable. */
function n(value: number): string {
  return Number(value.toFixed(2)).toString();
}

type Measurements = {
  shoulder: number;
  chest: number;
  hem: number;
  hemY: number;
  sleeve: (typeof SLEEVE_GEOMETRY)[keyof typeof SLEEVE_GEOMETRY];
};

/**
 * The single derivation both views share. Anything that could make front and
 * back disagree has to come from here.
 */
export function measurementsFor(spec: FlatSpecV1): Measurements {
  const base = SILHOUETTE_WIDTHS[spec.silhouette];
  const ease = FIT_DELTA[spec.fit];
  return {
    shoulder: base.shoulder,
    chest: base.chest + ease,
    hem: base.hem + ease,
    hemY: HEM_Y[spec.bodyLength],
    sleeve: SLEEVE_GEOMETRY[spec.sleeve],
  };
}

/** Closed body outline: neck, shoulders, armholes, side seams, hem. */
function bodyPath(m: Measurements, neckDrop: number): string {
  const { shoulder, chest, hem, hemY } = m;
  const armholeControlY = SHOULDER_Y + (CHEST_Y - SHOULDER_Y) * 0.55;

  return [
    `M ${n(CENTER_X - NECK_HALF_WIDTH)} ${n(NECK_Y)}`,
    // Left shoulder seam
    `L ${n(CENTER_X - shoulder)} ${n(SHOULDER_Y)}`,
    // Left armhole, scooping in to the chest line
    `C ${n(CENTER_X - shoulder - 4)} ${n(armholeControlY)} ${n(CENTER_X - chest)} ${n(armholeControlY)} ${n(CENTER_X - chest)} ${n(CHEST_Y)}`,
    // Left side seam
    `L ${n(CENTER_X - hem)} ${n(hemY)}`,
    // Hem
    `L ${n(CENTER_X + hem)} ${n(hemY)}`,
    // Right side seam
    `L ${n(CENTER_X + chest)} ${n(CHEST_Y)}`,
    // Right armhole
    `C ${n(CENTER_X + chest)} ${n(armholeControlY)} ${n(CENTER_X + shoulder + 4)} ${n(armholeControlY)} ${n(CENTER_X + shoulder)} ${n(SHOULDER_Y)}`,
    // Right shoulder seam
    `L ${n(CENTER_X + NECK_HALF_WIDTH)} ${n(NECK_Y)}`,
    // Neckline
    `Q ${n(CENTER_X)} ${n(NECK_Y + neckDrop)} ${n(CENTER_X - NECK_HALF_WIDTH)} ${n(NECK_Y)}`,
    "Z",
  ].join(" ");
}

/** Half-width of the body outline at a given height, between shoulder and chest. */
function bodyEdgeAt(m: Measurements, y: number): number {
  const t = Math.min(Math.max((y - SHOULDER_Y) / (CHEST_Y - SHOULDER_Y), 0), 1);
  return m.shoulder + (m.chest - m.shoulder) * t;
}

/**
 * One sleeve, mirrored by sign: shoulder tip, down the sleeve cap to the cuff,
 * across the cuff, then back up the underarm seam to meet the armhole. Closed,
 * so it reads as a panel rather than a line.
 */
function sleevePath(m: Measurements, side: -1 | 1): string {
  if (!m.sleeve) return "";
  const { drop, extend, opening } = m.sleeve;
  const cuffY = SHOULDER_Y + drop;
  const cuffOuter = CENTER_X + side * (m.shoulder + extend);
  const cuffInner = CENTER_X + side * (m.shoulder + extend - opening);

  // The underarm seam meets the body a little above the cuff, on the armhole.
  const underarmY = Math.min(cuffY - 20, CHEST_Y);
  const underarmX = CENTER_X + side * bodyEdgeAt(m, underarmY);

  return [
    `M ${n(CENTER_X + side * m.shoulder)} ${n(SHOULDER_Y)}`,
    `L ${n(cuffOuter)} ${n(cuffY)}`,
    `L ${n(cuffInner)} ${n(cuffY + 4)}`,
    `L ${n(underarmX)} ${n(underarmY)}`,
  ].join(" ");
}

/**
 * Hood drawn as a dome seated on the shoulder line and sitting behind the body,
 * so the body's own neckline reads as the opening. Its base scales with the
 * shoulder, which is what stops it looking like a balloon on a wide silhouette.
 */
function hoodPaths(m: Measurements, layers: 1 | 2): string[] {
  const half = m.shoulder * 0.58;
  const baseY = NECK_Y + 10;
  const topY = 24;

  // Closed and filled, so it occludes as a panel rather than reading as an arc
  // floating above the shoulders.
  const outer = [
    `M ${n(CENTER_X - half)} ${n(baseY + 26)}`,
    `L ${n(CENTER_X - half)} ${n(baseY)}`,
    `C ${n(CENTER_X - half)} ${n(topY)} ${n(CENTER_X + half)} ${n(topY)} ${n(CENTER_X + half)} ${n(baseY)}`,
    `L ${n(CENTER_X + half)} ${n(baseY + 26)}`,
    "Z",
  ].join(" ");

  if (layers === 1) return [outer];

  const innerHalf = half - 13;
  const inner = [
    `M ${n(CENTER_X - innerHalf)} ${n(baseY)}`,
    `C ${n(CENTER_X - innerHalf)} ${n(topY + 17)} ${n(CENTER_X + innerHalf)} ${n(topY + 17)} ${n(CENTER_X + innerHalf)} ${n(baseY)}`,
  ].join(" ");

  return [outer, inner];
}

/** Kangaroo pocket with angled hand openings. */
function kangarooPocketPath(m: Measurements): string {
  const halfWidth = Math.min(m.hem - 26, 78);
  const bottomY = m.hemY - 30;
  const topY = bottomY - 84;
  const openingInset = 22;

  return [
    `M ${n(CENTER_X - halfWidth)} ${n(topY + openingInset)}`,
    `L ${n(CENTER_X - halfWidth + openingInset)} ${n(topY)}`,
    `L ${n(CENTER_X + halfWidth - openingInset)} ${n(topY)}`,
    `L ${n(CENTER_X + halfWidth)} ${n(topY + openingInset)}`,
    `L ${n(CENTER_X + halfWidth)} ${n(bottomY)}`,
    `L ${n(CENTER_X - halfWidth)} ${n(bottomY)}`,
    "Z",
  ].join(" ");
}

function patchPocketPath(m: Measurements): string {
  const halfWidth = 42;
  const bottomY = m.hemY - 40;
  const topY = bottomY - 56;
  return `M ${n(CENTER_X - halfWidth)} ${n(topY)} L ${n(CENTER_X + halfWidth)} ${n(topY)} L ${n(CENTER_X + halfWidth)} ${n(bottomY)} L ${n(CENTER_X - halfWidth)} ${n(bottomY)} Z`;
}

/** Ribbing is drawn as a band with vertical ticks, the way a flat conventionally shows it. */
function ribbingBand(x1: number, x2: number, y: number, height: number): FlatElement[] {
  const ticks: string[] = [];
  const step = 9;
  for (let x = x1 + step; x < x2; x += step) {
    ticks.push(`M ${n(x)} ${n(y)} L ${n(x)} ${n(y + height)}`);
  }
  return [
    { kind: "rect", x: x1, y, width: x2 - x1, height, stroke: "rib" },
    { kind: "path", d: ticks.join(" "), stroke: "rib-tick" },
  ];
}

export function renderHoodie(spec: FlatSpecV1, view: FlatView): RenderedFlat {
  const m = measurementsFor(spec);
  const neckDrop = view === "front" ? FRONT_NECK_DROP : BACK_NECK_DROP;
  const groups: FlatGroup[] = [];

  // Hood sits behind the body on the front view and in front of it on the back.
  const hood: FlatGroup = {
    id: "hood",
    elements:
      spec.neckline.kind === "hood"
        ? hoodPaths(m, spec.neckline.layers).map((d, index) => ({
            kind: "path" as const,
            d,
            stroke: index === 0 ? ("hood" as const) : ("line" as const),
          }))
        : [],
  };

  if (view === "front") groups.push(hood);

  // Sleeves are filled panels drawn *before* the body, so the body occludes
  // them at the armhole and the garment reads as one silhouette. Drawn after
  // the body with `fill: none` they were correct geometry that looked wrong the
  // moment a colorway tinted the flat: the body filled and the sleeves stayed
  // white. Same fix the hood already uses.
  const sleeves = [sleevePath(m, -1), sleevePath(m, 1)]
    .filter((d): d is string => Boolean(d))
    .map((d) => ({ kind: "path" as const, d, stroke: "body" as const }));
  if (sleeves.length) groups.push({ id: "sleeves", elements: sleeves });

  groups.push({
    id: "body",
    elements: [{ kind: "path", d: bodyPath(m, neckDrop), stroke: "body" }],
  });

  if (view === "back") groups.push(hood);

  // Pockets and plackets are front-only construction.
  if (view === "front") {
    if (spec.pocket === "kangaroo") {
      groups.push({
        id: "pocket",
        elements: [{ kind: "path", d: kangarooPocketPath(m), stroke: "line" }],
      });
    } else if (spec.pocket === "patch" || spec.pocket === "welt") {
      groups.push({
        id: "pocket",
        elements: [{ kind: "path", d: patchPocketPath(m), stroke: "line" }],
      });
    }

    if (spec.placket !== "none") {
      const zipBottom = spec.placket === "full-zip" ? m.hemY : CHEST_Y + 40;
      groups.push({
        id: "placket",
        elements: [
          {
            kind: "path",
            d: `M ${n(CENTER_X)} ${n(NECK_Y + neckDrop)} L ${n(CENTER_X)} ${n(zipBottom)}`,
            stroke: "zip",
          },
        ],
      });
    }

    if (spec.neckline.kind === "hood" && spec.neckline.drawcord) {
      groups.push({
        id: "drawcord",
        elements: [-1, 1].map((side) => ({
          kind: "path" as const,
          d: `M ${n(CENTER_X + side * 16)} ${n(NECK_Y + neckDrop - 2)} L ${n(CENTER_X + side * 18)} ${n(NECK_Y + neckDrop + 42)}`,
          stroke: "line" as const,
        })),
      });
    }
  }

  const trims: FlatElement[] = [];
  if (spec.hem === "ribbed") {
    trims.push(...ribbingBand(CENTER_X - m.hem, CENTER_X + m.hem, m.hemY - 22, 22));
  }
  if (spec.cuff === "ribbed" && m.sleeve) {
    const cuffY = SHOULDER_Y + m.sleeve.drop - 14;
    for (const side of [-1, 1] as const) {
      const outer = CENTER_X + side * (m.shoulder + m.sleeve.extend);
      const inner = CENTER_X + side * (m.shoulder + m.sleeve.extend - m.sleeve.opening);
      trims.push(...ribbingBand(Math.min(outer, inner), Math.max(outer, inner), cuffY, 18));
    }
  }
  if (trims.length) groups.push({ id: "trims", elements: trims });

  const anchors: Record<string, Point> = {
    "front-chest": { x: CENTER_X, y: CHEST_Y + 42 },
    "back-neck": { x: CENTER_X, y: NECK_Y + 24 },
    "hem-center": { x: CENTER_X, y: m.hemY - 12 },
    "left-chest": { x: CENTER_X - m.chest * 0.45, y: CHEST_Y + 24 },
  };
  if (spec.neckline.kind === "hood") {
    anchors["hood-top"] = { x: CENTER_X, y: 40 };
  }
  if (m.sleeve) {
    anchors["left-cuff"] = {
      x: CENTER_X - (m.shoulder + m.sleeve.extend - m.sleeve.opening / 2),
      y: SHOULDER_Y + m.sleeve.drop,
    };
    anchors["right-cuff"] = {
      x: CENTER_X + (m.shoulder + m.sleeve.extend - m.sleeve.opening / 2),
      y: SHOULDER_Y + m.sleeve.drop,
    };
  }

  return {
    viewBox: `0 0 ${VIEW_BOX.width} ${VIEW_BOX.height}`,
    body: serializeGroups(groups),
    groups,
    anchors,
  };
}
