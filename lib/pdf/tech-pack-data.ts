import { RIVIERA_HOODIE, type FlatSpecV1 } from "@/lib/flats/spec";
import type { BomRow, Colorway, MeasurementRow, Product } from "@/types/techpack";

/**
 * The data contract the factory PDF renders from.
 *
 * Deliberately a plain serializable object with no database or session imports,
 * for the same reason `lib/data/product-mapping.ts` is: the transformation is
 * the part most likely to be wrong, and it is only cheap to test if it can be
 * imported without a server. `lib/data/tech-pack-export.ts` is the server-only
 * module that fills this in from a session-scoped read.
 *
 * ## This is a snapshot, not a live read
 *
 * Master prompt section 8: "PDF must reflect an immutable selected version, not
 * a moving live draft." Everything the document needs is copied in here, so
 * rendering a version that was approved last month cannot pick up a BOM row
 * edited this morning. Once `product_versions.snapshot` is wired in Phase 2,
 * this type is what a snapshot deserializes to.
 */

/** Values that must come from the real pilot style before this ships to a factory. */
export type Provisional<T> = T;

export type TechPackBrand = {
  /** The brand on the cover — not the organization. Becomes a `brands` row in Phase 2. */
  name: string;
  organizationName: string;
  primaryColor: string;
};

export type TechPackStyle = {
  name: string;
  code: string;
  category: string;
  season: string;
  collection: string;
  supplier: string;
  status: string;
  description: string;
  designIntent: string;
  targetCost: string;
  currency: string;
  moq: string;
  leadTime: string;
};

export type TechPackVersion = {
  label: string;
  /** ISO date. Formatted at render time so the document stays locale-stable. */
  createdAt: string;
  preparedBy: string;
  approval: string;
};

export type ArtworkPlacement = {
  name: string;
  placement: string;
  technique: string;
  dimensions: string;
  colors: string;
};

export type MeasurementTable = {
  unit: string;
  baseSize: string;
  tolerance: string;
  sizes: string[];
  rows: MeasurementRow[];
};

export type SamplingRound = {
  round: string;
  requested: string;
  received: string;
  decision: string;
};

export type TechPackDocumentData = {
  brand: TechPackBrand;
  style: TechPackStyle;
  version: TechPackVersion;
  flat: { spec: FlatSpecV1; colorHex: string };
  colorways: Colorway[];
  artwork: ArtworkPlacement[];
  bom: BomRow[];
  measurements: MeasurementTable;
  construction: string[];
  packaging: string[];
  sampling: SamplingRound[];
  /** Rendered in the footer of every page. */
  disclaimer: string;
};

export const BOM_COLUMNS = ["Type", "Material", "Composition", "Placement", "Colour"] as const;

export const DISCLAIMER =
  "Confidential. Issued for production quotation and manufacture only. All measurements are finished-garment specifications in centimetres unless stated otherwise. Do not proceed against an unapproved version.";

/**
 * The pilot style.
 *
 * TODO(exora): every value marked below is a placeholder standing in for Exora
 * Ink's first real style, pending Colin Jones. They are deliberately the seed
 * hoodie rather than a second invented garment — an invented "realistic" style
 * is indistinguishable from a real one once it is in a PDF, and the whole point
 * of this slice is to put a *real* spec in front of a factory. HANDOFF item 2
 * gates this: if the first style is a tee or a jogger, the flat template
 * changes too, not just these strings.
 */
export const EXORA_PLACEHOLDER_STYLE: TechPackStyle = {
  name: "Riviera Oversized Hoodie", // TODO(exora): real style name
  code: "CI-HOD-2407", // TODO(exora): real article code
  category: "Hoodies", // TODO(exora): confirm category
  season: "FW 2027", // TODO(exora): real season
  collection: "Riviera Resort 2027", // TODO(exora): real collection
  supplier: "TBC — factory not yet selected", // TODO(exora): target factory
  status: "Sampling",
  description:
    "Oversized loopback hoodie with a two-panel lined hood, kangaroo pocket, and ribbed cuffs and hem.", // TODO(exora)
  designIntent:
    "A heavyweight private-label hoodie to replace a decorated wholesale blank, retaining the fit customers already buy.", // TODO(exora)
  targetCost: "TBC", // TODO(exora): target FOB
  currency: "USD", // TODO(exora): confirm currency
  moq: "TBC", // TODO(exora): factory MOQ
  leadTime: "TBC", // TODO(exora): lead time
};

/** Sizes the seed measurement rows are graded across. */
export const PLACEHOLDER_SIZES = ["XS", "S", "M", "L", "XL"];

/**
 * Assembles the document data.
 *
 * `product` is the only real record so far; everything else still comes from
 * the demo dataset because those tables land in Phase 2 (see `lib/data/products.ts`).
 * The signature is already shaped for the real thing, so Phase 2 changes the
 * caller, not this contract.
 */
export function buildTechPackData(input: {
  product: Product | null;
  colorways: Colorway[];
  bom: BomRow[];
  measurements: MeasurementRow[];
  construction: string[];
  packaging: string[];
  sampling: string[];
  preparedBy: string;
  organizationName: string;
  brandName: string;
  now: Date;
}): TechPackDocumentData {
  const style: TechPackStyle = {
    ...EXORA_PLACEHOLDER_STYLE,
    // A real product record wins over the placeholder wherever one exists.
    ...(input.product
      ? {
          name: input.product.name,
          code: input.product.code,
          category: input.product.category,
          season: input.product.season,
          status: input.product.status,
        }
      : {}),
  };

  return {
    brand: {
      name: input.brandName,
      organizationName: input.organizationName,
      primaryColor: "#3451e8", // TODO(exora): Exora brand colour, once `brands` exists
    },
    style,
    version: {
      label: "v1.8 — draft", // TODO(Phase 2): the selected product_versions row
      createdAt: input.now.toISOString(),
      preparedBy: input.preparedBy,
      approval: "Not approved — draft export", // TODO(Phase 4): real approval state
    },
    flat: {
      spec: RIVIERA_HOODIE, // TODO(exora): the spec for the real style
      colorHex: input.colorways[0]?.hex ?? "#ffffff",
    },
    colorways: input.colorways,
    artwork: [
      // TODO(exora): real artwork, placements, and techniques. Phase 3 reads
      // these from artwork_placements; there is no artwork table yet.
      {
        name: "Placeholder — no artwork on file",
        placement: "Front chest",
        technique: "TBC",
        dimensions: "TBC",
        colors: "TBC",
      },
    ],
    bom: input.bom,
    measurements: {
      unit: "cm",
      baseSize: "M",
      tolerance: "± 1.0 cm unless stated", // TODO(exora): confirm tolerance with the factory
      sizes: PLACEHOLDER_SIZES,
      rows: input.measurements,
    },
    construction: input.construction,
    packaging: input.packaging,
    sampling: input.sampling.map((round) => ({
      round,
      requested: "—", // TODO(Phase 4): sampling_rounds carries real dates
      received: "—",
      decision: "Pending",
    })),
    disclaimer: DISCLAIMER,
  };
}

/**
 * A stable, factory-friendly filename. No spaces and no identifiers.
 *
 * Pure, and deliberately here rather than beside the session-scoped read: a
 * `server-only` module cannot be imported from a test, and the slug rule is
 * exactly the kind of thing that should be.
 */
export function exportFilename(data: TechPackDocumentData): string {
  const slug = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  return `${slug(data.style.code)}-${slug(data.style.name)}-techpack.pdf`;
}

/** Every section the document renders, in order. Drives the table of contents. */
export const DOCUMENT_SECTIONS = [
  "Style overview",
  "Technical flats",
  "Colorways",
  "Artwork and placement",
  "Bill of materials",
  "Measurement specification",
  "Construction",
  "Packaging and labelling",
  "Sampling and approval",
] as const;

export type DocumentSection = (typeof DOCUMENT_SECTIONS)[number];
