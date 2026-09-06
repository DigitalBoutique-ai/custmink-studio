import { renderToBuffer } from "@react-pdf/renderer";
import { isValidElement, type ReactElement, type ReactNode } from "react";
import { beforeAll, describe, expect, it } from "vitest";

import { RIVIERA_HOODIE } from "@/lib/flats/spec";
import { bomRows, colorways, measurements, starterProducts, workflowContent } from "@/lib/demo-data";
import {
  BOM_COLUMNS,
  DOCUMENT_SECTIONS,
  DISCLAIMER,
  EXORA_PLACEHOLDER_STYLE,
  buildTechPackData,
  exportFilename,
  type TechPackDocumentData,
} from "@/lib/pdf/tech-pack-data";
import { techPackDocument } from "@/lib/pdf/tech-pack-document";
import { COLORS, contrastRatio, readableInkOn } from "@/lib/pdf/theme";

/**
 * The factory PDF.
 *
 * Two kinds of assertion, because they fail for different reasons:
 *
 * 1. **Tree assertions** walk the React element tree and read the strings that
 *    will be typeset. They catch a section being dropped or a field going
 *    missing, and they are fast enough to run on every save.
 * 2. **Buffer assertions** render real PDF bytes. They catch the failures a
 *    tree walk cannot see — a primitive React PDF refuses to lay out, or the
 *    flat quietly becoming a raster image.
 *
 * Neither notices that the document *looks* right. `npm run pdf:preview` is for
 * that, and the hoodie-render lesson in HANDOFF "What surprised me" #6 is why
 * the distinction is stated rather than assumed.
 */

/** Contrast ratio between a swatch and a chosen label colour. */
function contrastOf(background: string, foreground: string): number {
  const luminance = (hex: string): number => {
    const full = hex.replace("#", "");
    const channel = (offset: number): number => {
      const value = parseInt(full.slice(offset, offset + 2), 16) / 255;
      return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
  };
  return contrastRatio(luminance(background), luminance(foreground));
}

function fixture(): TechPackDocumentData {
  return buildTechPackData({
    product: starterProducts[0] ?? null,
    colorways,
    bom: bomRows,
    measurements,
    construction: workflowContent.construction.items,
    packaging: workflowContent.packaging.items,
    sampling: workflowContent.sampling.items,
    preparedBy: "Tim de Vallée",
    organizationName: "Digital Boutique AI",
    brandName: "Exora Ink",
    // Fixed instant so the rendered date is stable regardless of when tests run.
    now: new Date("2026-09-05T00:00:00Z"),
  });
}

/**
 * Every string the document will typeset, in document order.
 *
 * React PDF's primitives are plain string tags ("DOCUMENT", "TEXT", "VIEW"),
 * so anything with a function `type` is one of this file's own components and
 * can be invoked directly to get its output. That is only safe because none of
 * them use hooks or context — if one ever does, this walk needs a real
 * renderer instead, and it will fail loudly rather than silently return "".
 */
function collectText(node: ReactNode): string[] {
  if (node === null || node === undefined || typeof node === "boolean") return [];
  if (typeof node === "string" || typeof node === "number") return [String(node)];
  if (Array.isArray(node)) return node.flatMap(collectText);
  if (isValidElement(node)) {
    const element = node as ReactElement<{ children?: ReactNode }>;
    if (typeof element.type === "function") {
      const render = element.type as (props: unknown) => ReactNode;
      return collectText(render(element.props));
    }
    return collectText(element.props.children);
  }
  return [];
}

describe("document data transformation", () => {
  it("prefers a real product record over the placeholder style", () => {
    const data = fixture();
    expect(data.style.name).toBe(starterProducts[0]!.name);
    expect(data.style.code).toBe(starterProducts[0]!.code);
  });

  it("falls back to the placeholder when no product resolves", () => {
    const data = buildTechPackData({
      product: null,
      colorways: [],
      bom: [],
      measurements: [],
      construction: [],
      packaging: [],
      sampling: [],
      preparedBy: "Nobody",
      organizationName: "Digital Boutique AI",
      brandName: "Exora Ink",
      now: new Date("2026-09-05T00:00:00Z"),
    });
    expect(data.style.name).toBe(EXORA_PLACEHOLDER_STYLE.name);
  });

  it("marks every unknown pilot value rather than inventing one", () => {
    // TODO(exora) values must read as unresolved in the document itself. A
    // plausible invented factory or cost is indistinguishable from a real one
    // once it is printed, and this document goes to a factory.
    for (const field of ["supplier", "targetCost", "moq", "leadTime"] as const) {
      expect(EXORA_PLACEHOLDER_STYLE[field], `${field} must be visibly unresolved`).toMatch(/TBC/);
    }
  });

  it("takes the flat colour from the first colorway", () => {
    expect(fixture().flat.colorHex).toBe(colorways[0]!.hex);
  });

  it("carries the disclaimer that appears on every page", () => {
    expect(fixture().disclaimer).toBe(DISCLAIMER);
  });

  it("builds a filename with no spaces and no identifiers", () => {
    const name = exportFilename(fixture());
    expect(name).toBe("ci-hod-2407-riviera-oversized-hoodie-techpack.pdf");
    expect(name).not.toMatch(/\s/);
  });
});

describe("document structure", () => {
  const text = collectText(techPackDocument(fixture())).join("\n");

  it.each(DOCUMENT_SECTIONS)("includes the %s section", (section) => {
    // Twice: once as a contents entry and once as the section heading itself.
    // Asserting mere presence passed when the whole Colorways page was deleted,
    // because the contents list still named it.
    const occurrences = text.split("\n").filter((line) => line === section).length;
    expect(occurrences, `${section} should appear in contents and as a heading`).toBe(2);
  });

  it("includes every cover field master prompt section 8 requires", () => {
    for (const value of [
      "Exora Ink", // brand
      "Riviera Oversized Hoodie", // style
      "CI-HOD-2407", // article code
      "FW 2027", // season
      "Riviera Resort 2027", // collection
      "v1.8 — draft", // version
      "Tim de Vallée", // prepared by
      "05 Sep 2026", // date
    ]) {
      expect(text, `cover is missing ${value}`).toContain(value);
    }
  });

  it("labels the supplier as unselected rather than omitting it", () => {
    expect(text).toContain("TBC — factory not yet selected");
  });

  it("renders every BOM row and column", () => {
    for (const column of BOM_COLUMNS) expect(text).toContain(column);
    for (const row of bomRows) expect(text).toContain(row[1]);
  });

  it("renders every point of measure with its graded values", () => {
    for (const row of measurements) {
      expect(text).toContain(row[0]);
      expect(text).toContain(row[1]);
    }
    for (const size of ["XS", "S", "M", "L", "XL"]) expect(text).toContain(size);
  });

  it("renders every colorway with its code", () => {
    for (const colorway of colorways) {
      expect(text).toContain(colorway.name);
      expect(text).toContain(colorway.code);
    }
  });

  it("carries a signature block for both factory and brand", () => {
    // The label and its suffix are separate text nodes, so they are asserted
    // separately rather than as one concatenated string.
    expect(text).toContain("Factory acknowledgement");
    expect(text).toContain("Brand approval");
    expect(text.match(/name, signature, date/g) ?? []).toHaveLength(2);
  });

  it("states that the export is unapproved", () => {
    // A tech pack that does not say whether it is approved is the failure the
    // version/approval model exists to prevent.
    expect(text).toContain("Not approved — draft export");
  });
});

describe("rendered bytes", () => {
  let pdf: Buffer;
  beforeAll(async () => {
    pdf = await renderToBuffer(techPackDocument(fixture()));
  }, 30_000);

  it("is a valid PDF", () => {
    expect(pdf.subarray(0, 5).toString("latin1")).toBe("%PDF-");
    expect(pdf.length).toBeGreaterThan(10_000);
  });

  it("lays out one page per section plus cover and contents", () => {
    const pages = pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) ?? [];
    expect(pages.length).toBe(10);
  });

  it("draws the flat as vector geometry, never a raster image", () => {
    // The parametric-flats decision only pays off if the PDF really contains
    // paths. An embedded bitmap here would mean the flat had been rasterized
    // somewhere and would print soft at factory magnification.
    expect(pdf.toString("latin1")).not.toContain("/Subtype /Image");
  });

  it("embeds no font file, so rendering needs no network", () => {
    // Only the 14 standard PDF fonts. `Font.register` would fetch a file during
    // an export, which is both a latency cost and a way for an export to fail.
    expect(pdf.toString("latin1")).not.toContain("/FontFile");
  });
});

describe("print legibility", () => {
  it("puts dark ink on light swatches and light ink on dark ones", () => {
    expect(readableInkOn("#e7dfcf")).toBe(COLORS.ink); // Natural Ecru
    expect(readableInkOn("#8faee8")).toBe(COLORS.ink); // Riviera Blue
    expect(readableInkOn("#16233b")).toBe(COLORS.surface); // Midnight Navy
    // Sunbleached Clay reads mid-tone, but ink is 4.9:1 against it where white
    // is only 3.3:1 — the reason this picks by ratio rather than by threshold.
    expect(readableInkOn("#c97861")).toBe(COLORS.ink);
  });

  it("clears WCAG AA large-text contrast on every seed colorway", () => {
    for (const colorway of colorways) {
      const ink = readableInkOn(colorway.hex);
      expect(
        contrastOf(colorway.hex, ink),
        `${colorway.name} (${colorway.hex}) label is unreadable`,
      ).toBeGreaterThanOrEqual(3);
    }
  });

  it("falls back to ink for a malformed colour rather than throwing", () => {
    expect(readableInkOn("not-a-colour")).toBe(COLORS.ink);
  });

  it("accepts shorthand hex", () => {
    expect(readableInkOn("#fff")).toBe(COLORS.ink);
    expect(readableInkOn("#000")).toBe(COLORS.surface);
  });
});

describe("flat spec coherence", () => {
  it("does not specify a sleeve length for a sleeveless garment", () => {
    // The seed hoodie was `sleeveless` while its measurement rows specified a
    // sleeve length and its BOM specified ribbed cuffs. The contradiction was
    // invisible until the flat and the measurement table shared a document.
    const hasSleeveMeasurement = measurements.some((row) => /sleeve/i.test(row[1]));
    if (hasSleeveMeasurement) {
      expect(RIVIERA_HOODIE.sleeve).not.toBe("sleeveless");
    }
  });
});
