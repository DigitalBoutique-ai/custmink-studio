/** Scratch harness: render flat variants to an HTML page for visual review. */
import { writeFileSync } from "node:fs";

import { renderFlatSvg } from "../lib/flats/render";
import { RIVIERA_HOODIE, type FlatSpecV1 } from "../lib/flats/spec";

const variants: Array<{ title: string; spec: FlatSpecV1; view: "front" | "back"; fill?: string }> = [
  { title: "Riviera — front", spec: RIVIERA_HOODIE, view: "front", fill: "#8faee8" },
  { title: "Riviera — back", spec: RIVIERA_HOODIE, view: "back", fill: "#8faee8" },
  {
    title: "Long sleeve, regular",
    spec: { ...RIVIERA_HOODIE, silhouette: "regular", fit: "regular", sleeve: "long" },
    view: "front",
  },
  {
    title: "Full-zip, long body",
    spec: { ...RIVIERA_HOODIE, sleeve: "long", placket: "full-zip", pocket: "none", bodyLength: "long" },
    view: "front",
    fill: "#e7dfcf",
  },
  {
    title: "Boxy crew, cropped, short sleeve",
    spec: {
      ...RIVIERA_HOODIE,
      silhouette: "boxy",
      fit: "slim",
      bodyLength: "cropped",
      sleeve: "short",
      neckline: { kind: "crew" },
      pocket: "none",
    },
    view: "front",
    fill: "#c97861",
  },
  {
    title: "Patch pocket, one-layer hood",
    spec: {
      ...RIVIERA_HOODIE,
      sleeve: "long",
      pocket: "patch",
      neckline: { kind: "hood", layers: 1, drawcord: false },
    },
    view: "front",
  },
];

const cards = variants
  .map(
    (v) => `<figure><div class="stage">${renderFlatSvg(v.spec, v.view, { fill: v.fill })}</div><figcaption>${v.title}</figcaption></figure>`,
  )
  .join("");

writeFileSync(
  process.argv[2]!,
  `<!doctype html><meta charset="utf-8"><style>
body{margin:0;padding:28px;background:#f6f7fb;font:13px/1.4 -apple-system,system-ui,sans-serif;color:#142033}
h1{font-size:16px;margin:0 0 20px}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
figure{margin:0;background:#fff;border:1px solid #e2e6ef;border-radius:12px;padding:14px}
.stage{aspect-ratio:400/560}
svg{width:100%;height:100%;display:block}
figcaption{margin-top:10px;color:#6d7688;font-size:12px}
</style><h1>Parametric hoodie flat — variants from one renderer</h1><div class="grid">${cards}</div>`,
);
console.log("wrote", process.argv[2]);
