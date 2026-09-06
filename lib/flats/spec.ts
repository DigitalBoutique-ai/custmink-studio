import { z } from "zod";

/**
 * FlatSpecV1 — the parameter object a technical flat is rendered from.
 *
 * This is the contract between the model and the garment geometry. The model
 * never draws: it emits one of these, and rendering is deterministic, so front
 * and back correspondence is structural rather than something the model has to
 * achieve.
 *
 * Two rules govern what may appear here, and both are load-bearing:
 *
 * 1. **Enums and bounded numerics only.** No free strings that reach geometry.
 * 2. **No identifiers.** Nothing in this schema names an organization, user,
 *    role, storage key, price, or billing field. The model cannot express an
 *    identifier it was never given a slot for — that is the injection boundary,
 *    and `tests/flats.test.ts` asserts it stays true.
 *
 * Versioned and immutable once published. A change to the parameter vocabulary
 * is a new version, because every stored canvas document, callout anchor, and
 * point-of-measure reference depends on it.
 */

export const SILHOUETTES = ["boxy", "regular", "oversized"] as const;
export const FITS = ["slim", "regular", "relaxed"] as const;
export const BODY_LENGTHS = ["cropped", "regular", "long"] as const;
export const SLEEVES = ["sleeveless", "short", "long"] as const;
export const CUFFS = ["ribbed", "raw", "elastic"] as const;
export const HEMS = ["ribbed", "raw", "drawcord"] as const;
export const PLACKETS = ["none", "half-zip", "full-zip"] as const;
export const POCKETS = ["none", "kangaroo", "patch", "welt"] as const;

export const necklineSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("hood"),
    layers: z.union([z.literal(1), z.literal(2)]),
    drawcord: z.boolean(),
  }),
  z.object({ kind: z.literal("crew") }),
  z.object({ kind: z.literal("v-neck"), depthCm: z.number().min(4).max(20) }),
]);

export const flatSpecV1Schema = z
  .object({
    version: z.literal(1),
    templateId: z.literal("hoodie"),
    silhouette: z.enum(SILHOUETTES),
    fit: z.enum(FITS),
    bodyLength: z.enum(BODY_LENGTHS),
    sleeve: z.enum(SLEEVES),
    neckline: necklineSchema,
    placket: z.enum(PLACKETS),
    pocket: z.enum(POCKETS),
    cuff: z.enum(CUFFS),
    hem: z.enum(HEMS),
  })
  .strict();

export type FlatSpecV1 = z.infer<typeof flatSpecV1Schema>;
export type Neckline = z.infer<typeof necklineSchema>;

/**
 * The Riviera Oversized Hoodie from the seed data, as a parameter object.
 *
 * `sleeve` was `sleeveless` until 2026-09-05, which contradicted three other
 * places the same garment is described: the measurement rows specify "P03
 * sleeve length from shoulder, 58-62 cm", the BOM specifies 2x2 rib for
 * "cuffs / waistband", and this object sets `cuff: "ribbed"` — none of which a
 * sleeveless garment has. The contradiction only became visible once the flat
 * and the measurement table appeared on facing pages of the same PDF.
 */
export const RIVIERA_HOODIE: FlatSpecV1 = {
  version: 1,
  templateId: "hoodie",
  silhouette: "oversized",
  fit: "relaxed",
  bodyLength: "regular",
  sleeve: "long",
  neckline: { kind: "hood", layers: 2, drawcord: true },
  placket: "none",
  pocket: "kangaroo",
  cuff: "ribbed",
  hem: "ribbed",
};

export function parseFlatSpec(input: unknown): FlatSpecV1 {
  return flatSpecV1Schema.parse(input);
}
