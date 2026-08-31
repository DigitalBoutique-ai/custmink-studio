/**
 * Demo dataset carried over verbatim from the vinext prototype.
 *
 * Kept as plain serializable data (no React components) so it can cross the
 * server/client boundary untouched. Phase 1B swaps the data-access modules in
 * `lib/data/` over to Drizzle; this file then becomes the development seed.
 */

import type {
  BomRow,
  Colorway,
  LibraryContent,
  LibraryKey,
  MeasurementRow,
  Product,
  SectionKey,
  WorkflowContent,
} from "@/types/techpack";

export const starterProducts: Product[] = [
  { id: "riviera-hoodie", name: "Riviera Oversized Hoodie", code: "CI-HOD-2407", category: "Hoodies", season: "FW 2027", status: "Sampling", progress: 82, color: "#8faee8", updated: "8 min ago" },
  { id: "harbor-tee", name: "Harbor Heavyweight Tee", code: "CI-TEE-2411", category: "T-Shirts", season: "SS 2027", status: "In development", progress: 54, color: "#d9d0bf", updated: "Yesterday" },
  { id: "atlas-jogger", name: "Atlas Tapered Jogger", code: "CI-JOG-2398", category: "Bottoms", season: "Core", status: "Approved", progress: 100, color: "#303b3c", updated: "Aug 27" },
];

export const colorways: Colorway[] = [
  { name: "Riviera Blue", hex: "#8faee8", code: "15-4030 TCX" },
  { name: "Midnight Navy", hex: "#16233b", code: "19-3921 TCX" },
  { name: "Sunbleached Clay", hex: "#c97861", code: "17-1452 TCX" },
  { name: "Natural Ecru", hex: "#e7dfcf", code: "12-0605 TCX" },
];

export const bomRows: BomRow[] = [
  ["Fabric", "460 GSM loopback cotton", "100% organic cotton", "Shell / body", "Midnight Navy"],
  ["Rib", "2×2 cotton rib", "97% cotton, 3% elastane", "Cuffs / waistband", "Tonal"],
  ["Trim", "Recycled drawcord, 10 mm", "Recycled polyester", "Hood", "Ecru"],
  ["Label", "Woven main label", "Damask recycled yarn", "Back neck", "Black / white"],
];

export const measurements: MeasurementRow[] = [
  ["P01", "Chest width, 2.5 cm below armhole", "54", "57", "60", "63", "66"],
  ["P02", "Body length from HPS", "66", "68", "70", "72", "74"],
  ["P03", "Sleeve length from shoulder", "58", "59", "60", "61", "62"],
  ["P04", "Bottom opening, relaxed", "48", "51", "54", "57", "60"],
  ["P05", "Hood height", "36", "36.5", "37", "37.5", "38"],
];

export const libraryContent: Record<LibraryKey, LibraryContent> = {
  collections: { title: "Collections", subtitle: "Plan styles, seasons, and delivery calendars.", items: ["Riviera Resort 2027", "Core Essentials", "Studio Athletics", "Holiday Capsule"] },
  sketches: { title: "Sketch library", subtitle: "Start from 240 reusable technical flats.", items: ["Oversized hoodie", "Boxy heavyweight tee", "Tapered jogger", "Coach jacket", "Varsity jacket", "Relaxed polo"] },
  materials: { title: "Materials", subtitle: "Your approved fabrics, trims, labels, and threads.", items: ["460 GSM loopback cotton", "240 GSM jersey", "Recycled drawcord", "2×2 cotton rib", "YKK Excella zip", "Damask label"] },
  artwork: { title: "Artwork library", subtitle: "Logos, prints, embroidery files, and placements.", items: ["CUSTM wordmark", "Riviera back print", "Atelier crest", "Resort monogram", "Care icon set", "Size pip system"] },
  colors: { title: "Color library", subtitle: "Approved palettes and production color standards.", items: colorways.map((item) => `${item.name} · ${item.code}`) },
  "size-charts": { title: "Size charts", subtitle: "Graded measurement templates ready to attach.", items: ["Unisex oversized hoodie", "Men's core tee", "Women's fitted tee", "Tapered jogger", "Coach jacket", "Youth jersey"] },
  attachments: { title: "Attachments", subtitle: "Certificates, lab dips, test reports, and reference files.", items: ["Organic cotton certificate.pdf", "Riviera lab dips.pdf", "Wash test 02.jpg", "Embroidery strike-off.ai"] },
  suppliers: { title: "Suppliers", subtitle: "Factory contacts, capabilities, quotes, and lead times.", items: ["Northstar Apparel · Portugal", "WeaveWorks · Turkey", "Pacific Stitch · Vietnam", "LabelLab · Los Angeles"] },
  "purchase-orders": { title: "Purchase orders", subtitle: "Track samples, production orders, delivery, and QC.", items: ["PO-1078 · Riviera Hoodie · Sampling", "PO-1074 · Harbor Tee · In production", "PO-1068 · Atlas Jogger · Delivered"] },
};

export const workflowContent: Record<
  Extract<SectionKey, "sampling" | "construction" | "packaging" | "history">,
  WorkflowContent
> = {
  sampling: { title: "Sampling rounds", subtitle: "Record fit comments, revisions, and approvals.", items: ["Proto sample", "Fit sample 01", "Size set", "Pre-production sample"] },
  construction: { title: "Construction instructions", subtitle: "Translate design intent into factory-ready directions.", items: ["Seams and stitch types", "Hood construction", "Pocket construction", "Finishing and wash"] },
  packaging: { title: "Packaging and labels", subtitle: "Define every item that ships with the finished garment.", items: ["Main label", "Care and content label", "Hangtag", "Polybag and carton"] },
  history: { title: "Version history", subtitle: "A clear record of every product decision.", items: ["v1.8 · Artwork dimensions approved", "v1.7 · Fit comments added", "v1.6 · BOM updated", "v1.5 · Initial factory share"] },
};

export const dashboardMetrics = [
  { label: "Active styles", value: "12", detail: "+3 this month", icon: "shirt" as const },
  { label: "In sampling", value: "4", detail: "2 awaiting comments", icon: "package-check" as const },
  { label: "Factory ready", value: "7", detail: "58% of collection", icon: "send" as const },
  { label: "Open POs", value: "$48.2k", detail: "3 suppliers", icon: "shopping-bag" as const },
];
