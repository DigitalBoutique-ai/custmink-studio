/**
 * Renders a tech pack PDF to disk for visual review.
 *
 * The sibling of `npm run flats:preview`, and it exists for the same reason:
 * every flat test passed while the hood rendered as a balloon (HANDOFF,
 * "What surprised me" #6). Tests assert structure — that a section exists, that
 * a table has rows. They cannot tell you the document looks like something a
 * factory would accept. Look at the output after any layout change.
 *
 * `.mts` rather than `.ts` because @react-pdf/renderer's dependency graph is
 * ESM-only (`@react-pdf/hyphenate` exports an `import` condition and no
 * `require`), and tsx compiles a plain `.ts` here to CJS.
 *
 * Usage: npm run pdf:preview [out.pdf]
 */
import { writeFile } from "node:fs/promises";

import { bomRows, colorways, measurements, starterProducts, workflowContent } from "../lib/demo-data.js";
import { renderTechPackPdf } from "../lib/pdf/render.js";
import { buildTechPackData } from "../lib/pdf/tech-pack-data.js";

const out = process.argv[2] ?? "tech-pack-preview.pdf";

const data = buildTechPackData({
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
  now: new Date("2026-09-05T00:00:00Z"),
});

const buffer = await renderTechPackPdf(data);
await writeFile(out, buffer);
console.log(`Wrote ${out} — ${(buffer.length / 1024).toFixed(1)} KB`);
