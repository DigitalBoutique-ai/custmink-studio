"use client";

import { useEffect, useState } from "react";
import {
  Archive, ArrowLeft, Bell, Check, ChevronDown, ChevronRight, CircleHelp,
  ClipboardList, CloudUpload, Download, FileArchive, FileImage, FileText,
  FolderKanban, History, Layers3, LayoutDashboard, Link2, Menu, MoreHorizontal,
  PackageCheck, Palette, PanelLeftClose, Plus, Ruler, Save, Search, Send,
  Share2, Shirt, ShoppingBag, Sparkles, SwatchBook, TableProperties, Tags,
  Trash2, Truck, Upload, WandSparkles, X, ZoomIn, ZoomOut,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

type SectionKey = "overview" | "design" | "colorways" | "bom" | "artwork" | "measurements" | "sampling" | "instructions" | "packaging" | "history";
type NavKey = "dashboard" | "products" | "projects" | "sketches" | "materials" | "artworks" | "colorLibrary" | "sizeCharts" | "attachments" | "suppliers" | "orders";
type Product = { id: string; name: string; code: string; category: string; season: string; status: string; progress: number; color: string; updated: string };

const starterProducts: Product[] = [
  { id: "riviera-hoodie", name: "Riviera Oversized Hoodie", code: "CI-HOD-2407", category: "Hoodies", season: "FW 2027", status: "Sampling", progress: 82, color: "#8faee8", updated: "8 min ago" },
  { id: "harbor-tee", name: "Harbor Heavyweight Tee", code: "CI-TEE-2411", category: "T-Shirts", season: "SS 2027", status: "In development", progress: 54, color: "#d9d0bf", updated: "Yesterday" },
  { id: "atlas-jogger", name: "Atlas Tapered Jogger", code: "CI-JOG-2398", category: "Bottoms", season: "Core", status: "Approved", progress: 100, color: "#303b3c", updated: "Aug 27" },
];

const sections: { id: SectionKey; label: string; icon: typeof Shirt; done: boolean }[] = [
  { id: "overview", label: "Overview", icon: ClipboardList, done: true },
  { id: "design", label: "Sketch / Design", icon: Shirt, done: true },
  { id: "colorways", label: "Colorways", icon: Palette, done: true },
  { id: "bom", label: "BOM / Materials", icon: Layers3, done: true },
  { id: "artwork", label: "Artwork", icon: FileImage, done: true },
  { id: "measurements", label: "Sizes / Measurements", icon: Ruler, done: false },
  { id: "sampling", label: "Sampling", icon: PackageCheck, done: false },
  { id: "instructions", label: "Construction", icon: FileText, done: false },
  { id: "packaging", label: "Packaging / Labels", icon: Tags, done: false },
  { id: "history", label: "Version History", icon: History, done: true },
];

const navGroups = [
  { label: "Workspace", items: [
    { id: "dashboard" as NavKey, label: "Dashboard", icon: LayoutDashboard },
    { id: "products" as NavKey, label: "Products", icon: Shirt },
    { id: "projects" as NavKey, label: "Collections", icon: FolderKanban },
  ]},
  { label: "Libraries", items: [
    { id: "sketches" as NavKey, label: "Sketch library", icon: Archive },
    { id: "materials" as NavKey, label: "Materials", icon: Layers3 },
    { id: "artworks" as NavKey, label: "Artwork", icon: FileImage },
    { id: "colorLibrary" as NavKey, label: "Color library", icon: SwatchBook },
    { id: "sizeCharts" as NavKey, label: "Size charts", icon: TableProperties },
    { id: "attachments" as NavKey, label: "Attachments", icon: FileArchive },
  ]},
  { label: "Operations", items: [
    { id: "suppliers" as NavKey, label: "Suppliers", icon: Truck },
    { id: "orders" as NavKey, label: "Purchase orders", icon: ShoppingBag },
  ]},
];

const bomRows = [
  ["Fabric", "460 GSM loopback cotton", "100% organic cotton", "Shell / body", "Midnight Navy"],
  ["Rib", "2×2 cotton rib", "97% cotton, 3% elastane", "Cuffs / waistband", "Tonal"],
  ["Trim", "Recycled drawcord, 10 mm", "Recycled polyester", "Hood", "Ecru"],
  ["Label", "Woven main label", "Damask recycled yarn", "Back neck", "Black / white"],
];

const measurements = [
  ["P01", "Chest width, 2.5 cm below armhole", "54", "57", "60", "63", "66"],
  ["P02", "Body length from HPS", "66", "68", "70", "72", "74"],
  ["P03", "Sleeve length from shoulder", "58", "59", "60", "61", "62"],
  ["P04", "Bottom opening, relaxed", "48", "51", "54", "57", "60"],
  ["P05", "Hood height", "36", "36.5", "37", "37.5", "38"],
];

const colorways = [
  { name: "Riviera Blue", hex: "#8faee8", code: "15-4030 TCX" },
  { name: "Midnight Navy", hex: "#16233b", code: "19-3921 TCX" },
  { name: "Sunbleached Clay", hex: "#c97861", code: "17-1452 TCX" },
  { name: "Natural Ecru", hex: "#e7dfcf", code: "12-0605 TCX" },
];

const libraryContent: Record<Exclude<NavKey, "dashboard" | "products">, { title: string; subtitle: string; items: string[]; icon: typeof Shirt }> = {
  projects: { title: "Collections", subtitle: "Plan styles, seasons, and delivery calendars.", items: ["Riviera Resort 2027", "Core Essentials", "Studio Athletics", "Holiday Capsule"], icon: FolderKanban },
  sketches: { title: "Sketch library", subtitle: "Start from 240 reusable technical flats.", items: ["Oversized hoodie", "Boxy heavyweight tee", "Tapered jogger", "Coach jacket", "Varsity jacket", "Relaxed polo"], icon: Shirt },
  materials: { title: "Materials", subtitle: "Your approved fabrics, trims, labels, and threads.", items: ["460 GSM loopback cotton", "240 GSM jersey", "Recycled drawcord", "2×2 cotton rib", "YKK Excella zip", "Damask label"], icon: Layers3 },
  artworks: { title: "Artwork library", subtitle: "Logos, prints, embroidery files, and placements.", items: ["CUSTM wordmark", "Riviera back print", "Atelier crest", "Resort monogram", "Care icon set", "Size pip system"], icon: FileImage },
  colorLibrary: { title: "Color library", subtitle: "Approved palettes and production color standards.", items: colorways.map((item) => `${item.name} · ${item.code}`), icon: SwatchBook },
  sizeCharts: { title: "Size charts", subtitle: "Graded measurement templates ready to attach.", items: ["Unisex oversized hoodie", "Men’s core tee", "Women’s fitted tee", "Tapered jogger", "Coach jacket", "Youth jersey"], icon: TableProperties },
  attachments: { title: "Attachments", subtitle: "Certificates, lab dips, test reports, and reference files.", items: ["Organic cotton certificate.pdf", "Riviera lab dips.pdf", "Wash test 02.jpg", "Embroidery strike-off.ai"], icon: FileArchive },
  suppliers: { title: "Suppliers", subtitle: "Factory contacts, capabilities, quotes, and lead times.", items: ["Northstar Apparel · Portugal", "WeaveWorks · Turkey", "Pacific Stitch · Vietnam", "LabelLab · Los Angeles"], icon: Truck },
  orders: { title: "Purchase orders", subtitle: "Track samples, production orders, delivery, and QC.", items: ["PO-1078 · Riviera Hoodie · Sampling", "PO-1074 · Harbor Tee · In production", "PO-1068 · Atlas Jogger · Delivered"], icon: ShoppingBag },
};

function BrandMark() {
  return <div className="brand-mark" aria-hidden="true"><span /><span /><span /><span /></div>;
}

function AppSidebar({ active, onChange, collapsed, onCollapse }: { active: NavKey; onChange: (key: NavKey) => void; collapsed: boolean; onCollapse: () => void }) {
  return <aside className={collapsed ? "app-sidebar collapsed" : "app-sidebar"}>
    <div className="sidebar-brand"><BrandMark />{!collapsed && <div><strong>Custm.ink</strong><span>Studio</span></div>}<button className="icon-button collapse-button" onClick={onCollapse} aria-label="Collapse sidebar"><PanelLeftClose /></button></div>
    <nav className="sidebar-nav" aria-label="Main navigation">{navGroups.map((group) => <div className="nav-group" key={group.label}>{!collapsed && <p>{group.label}</p>}{group.items.map((item) => { const Icon = item.icon; return <button className={active === item.id ? "nav-item active" : "nav-item"} key={item.id} onClick={() => onChange(item.id)} title={collapsed ? item.label : undefined}><Icon />{!collapsed && <span>{item.label}</span>}</button>; })}</div>)}</nav>
    <div className="sidebar-footer"><button className="nav-item"><CircleHelp />{!collapsed && <span>Help center</span>}</button><button className="account-card"><span className="avatar">TD</span>{!collapsed && <span className="account-copy"><strong>Tim de Vallée</strong><small>Owner</small></span>}{!collapsed && <MoreHorizontal />}</button></div>
  </aside>;
}

function Topbar({ onNew, onAi, onMenu }: { onNew: () => void; onAi: () => void; onMenu: () => void }) {
  return <header className="topbar"><button className="icon-button mobile-menu" onClick={onMenu} aria-label="Open navigation"><Menu /></button><div className="global-search"><Search /><input aria-label="Search workspace" placeholder="Search styles, codes, materials…" /><kbd>⌘ K</kbd></div><div className="top-actions"><Button className="ai-button" variant="outline" onClick={onAi}><Sparkles /> Ask AI</Button><button className="icon-button"><Bell /><span className="notification-dot" /></button><Button onClick={onNew}><Plus /> New tech pack</Button></div></header>;
}

function Garment({ color, artworkSize = 38, showCallouts = true }: { color: string; artworkSize?: number; showCallouts?: boolean }) {
  return <div className="garment-stage"><div className="garment-object"><Shirt style={{ color, fill: color }} strokeWidth={1.2} /><strong style={{ fontSize: `${Math.max(9, artworkSize / 3)}px` }}>CUSTM</strong><span className="garment-seam seam-a" /><span className="garment-seam seam-b" /></div>{showCallouts && <><span className="callout callout-left">460 GSM<br />organic cotton</span><span className="callout callout-right">Screen print<br />28 cm wide</span></>}</div>;
}

function Dashboard({ products, onOpen, onNew }: { products: Product[]; onOpen: () => void; onNew: () => void }) {
  return <main className="page-scroll"><div className="content-wrap dashboard-page">
    <div className="page-heading"><div><p className="eyebrow">Monday, August 31</p><h1>Good afternoon, Tim.</h1><p>Your product pipeline is moving. Two styles need decisions this week.</p></div><Button onClick={onNew}><Plus /> Create tech pack</Button></div>
    <section className="metric-grid">{[{ label: "Active styles", value: "12", detail: "+3 this month", icon: Shirt }, { label: "In sampling", value: "4", detail: "2 awaiting comments", icon: PackageCheck }, { label: "Factory ready", value: "7", detail: "58% of collection", icon: Send }, { label: "Open POs", value: "$48.2k", detail: "3 suppliers", icon: ShoppingBag }].map((item) => { const Icon = item.icon; return <article className="metric-card" key={item.label}><span className="metric-icon"><Icon /></span><p>{item.label}</p><strong>{item.value}</strong><small>{item.detail}</small></article>; })}</section>
    <section className="dashboard-grid"><div className="panel wide-panel"><div className="panel-heading"><div><h2>Recent tech packs</h2><p>Continue from where your team left off.</p></div><button className="text-button">View all <ChevronRight /></button></div><div className="product-table">{products.map((product) => <button className="product-row" key={product.id} onClick={onOpen}><span className="product-thumb"><Shirt style={{ color: product.color, fill: product.color }} /></span><span className="product-main"><strong>{product.name}</strong><small>{product.code} · {product.season}</small></span><Badge variant="outline">{product.status}</Badge><span className="row-progress"><span><i style={{ width: `${product.progress}%` }} /></span><small>{product.progress}%</small></span><span className="updated">{product.updated}</span><ChevronRight /></button>)}</div></div>
      <div className="panel ai-insight-card"><div className="panel-heading"><div><span className="ai-orb"><Sparkles /></span><h2>Studio intelligence</h2></div></div><h3>Two details may delay sampling.</h3><p>The Riviera Hoodie is missing grade-rule confirmation and the final care-label artwork.</p><button className="insight-action" onClick={onOpen}><span><Check /> Review missing details</span><ChevronRight /></button><button className="insight-action"><span><Ruler /> Check size chart grading</span><ChevronRight /></button></div>
    </section>
    <section className="panel activity-panel"><div className="panel-heading"><div><h2>Collection progress</h2><p>Riviera Resort 2027 · 12 styles</p></div><Badge>On track</Badge></div><div className="collection-progress"><div><strong>68%</strong><span>complete</span></div><Progress value={68} /><div className="milestones"><span><i className="done" />Concept</span><span><i className="done" />Development</span><span><i />Sampling</span><span><i />Production</span></div></div></section>
  </div></main>;
}

function LibraryPage({ page, onNew }: { page: Exclude<NavKey, "dashboard" | "products">; onNew: () => void }) {
  const content = libraryContent[page]; const Icon = content.icon; const [query, setQuery] = useState(""); const filtered = content.items.filter((item) => item.toLowerCase().includes(query.toLowerCase()));
  return <main className="page-scroll"><div className="content-wrap library-page"><div className="page-heading"><div><p className="eyebrow">Workspace library</p><h1>{content.title}</h1><p>{content.subtitle}</p></div><Button onClick={onNew}><Plus /> Add new</Button></div><div className="library-toolbar"><div className="inline-search"><Search /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${content.title.toLowerCase()}…`} /></div><Button variant="outline"><Tags /> Filter</Button><Button variant="outline"><ChevronDown /> Sort</Button></div><div className="library-grid">{filtered.map((item, index) => <article className="library-card" key={item}><div className="library-preview"><Icon />{page === "colorLibrary" && <span className="swatch-preview" style={{ background: colorways[index]?.hex }} />}</div><div><Badge variant="outline">{page === "suppliers" ? "Approved" : page === "orders" ? "Open" : "Library"}</Badge><h3>{item}</h3><p>Updated {index + 1} day{index ? "s" : ""} ago</p></div><button className="icon-button"><MoreHorizontal /></button></article>)}</div></div></main>;
}

function ProductsPage({ products, onOpen, onNew }: { products: Product[]; onOpen: (product: Product) => void; onNew: () => void }) {
  const [query, setQuery] = useState("");
  const filtered = products.filter((product) => `${product.name} ${product.code} ${product.category}`.toLowerCase().includes(query.toLowerCase()));
  return <main className="page-scroll"><div className="content-wrap library-page"><div className="page-heading"><div><p className="eyebrow">Product development</p><h1>Tech packs</h1><p>Design, specify, sample, approve, and hand off every style.</p></div><Button onClick={onNew}><Plus /> New tech pack</Button></div><div className="library-toolbar"><div className="inline-search"><Search /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tech packs…" /></div><Button variant="outline"><Tags /> Filter</Button><Button variant="outline"><ChevronDown /> Sort</Button></div><div className="product-card-grid">{filtered.map((product) => <button className="product-card" key={product.id} onClick={() => onOpen(product)}><div className="product-card-visual" style={{ background: `${product.color}20` }}><Garment color={product.color} showCallouts={false} /><Badge>{product.status}</Badge></div><div className="product-card-copy"><p>{product.code} · {product.season}</p><h3>{product.name}</h3><div><Progress value={product.progress} /><span>{product.progress}% ready</span></div></div></button>)}</div></div></main>;
}

function OverviewPanel({ product }: { product: Product }) {
  return <div className="section-stack"><section className="section-card product-summary"><div className="summary-image"><Garment color={product.color} showCallouts={false} /></div><div className="summary-details"><div className="section-heading"><div><p className="eyebrow">Product overview</p><h2>{product.name}</h2></div><Button variant="outline" size="sm">Edit details</Button></div><dl className="detail-grid"><div><dt>Article code</dt><dd>{product.code}</dd></div><div><dt>Category</dt><dd>{product.category}</dd></div><div><dt>Season</dt><dd>{product.season}</dd></div><div><dt>Status</dt><dd><Badge>{product.status}</Badge></dd></div><div><dt>Collection</dt><dd>Riviera Resort 2027</dd></div><div><dt>Supplier</dt><dd>Northstar Apparel</dd></div></dl><div className="description-block"><strong>Design intent</strong><p>A structured, oversized sleeveless hoodie with a double-layer hood, dropped armholes, deep kangaroo pocket, and premium heavyweight hand feel.</p></div></div></section><section className="section-card"><div className="section-heading"><div><p className="eyebrow">Readiness</p><h2>Factory handoff checklist</h2></div><strong className="completion-number">82%</strong></div><Progress value={82} /><div className="checklist-grid">{sections.slice(1, 9).map((section) => <div key={section.id} className={section.done ? "check-item done" : "check-item"}>{section.done ? <Check /> : <span />}{section.label}<small>{section.done ? "Complete" : "Needs input"}</small></div>)}</div></section></div>;
}

function DesignPanel({ color, setColor, artworkSize, setArtworkSize }: { color: string; setColor: (value: string) => void; artworkSize: number; setArtworkSize: (value: number) => void }) {
  const [zoom, setZoom] = useState(100);
  return <div className="canvas-layout"><div className="canvas-toolbar"><Button variant="ghost" size="sm"><ArrowLeft /> Back</Button><span /><Button variant="ghost" size="sm" onClick={() => setZoom(Math.max(70, zoom - 10))}><ZoomOut /></Button><strong>{zoom}%</strong><Button variant="ghost" size="sm" onClick={() => setZoom(Math.min(140, zoom + 10))}><ZoomIn /></Button><Button variant="outline" size="sm"><History /> Undo</Button><Button size="sm" onClick={() => toast.success("Canvas changes saved")}><Save /> Save</Button></div><div className="design-canvas"><div style={{ transform: `scale(${zoom / 100})` }}><Garment color={color} artworkSize={artworkSize} /></div></div><aside className="properties-panel"><div className="properties-heading"><div><p className="eyebrow">Selected layer</p><h3>CUSTM wordmark</h3></div><Badge>Artwork</Badge></div><label>Placement<Input value="Front chest" readOnly /></label><label>Decoration<select><option>Screen print</option><option>Embroidery</option><option>Heat transfer</option></select></label><label>Print width <span>{artworkSize} cm</span><input type="range" min="20" max="52" value={artworkSize} onChange={(e) => setArtworkSize(Number(e.target.value))} /></label><label>Garment color<div className="mini-swatches">{colorways.map((item) => <button key={item.hex} className={color === item.hex ? "active" : ""} style={{ background: item.hex }} onClick={() => setColor(item.hex)} aria-label={item.name} />)}</div></label><Textarea defaultValue="Center artwork on the body, 8 cm below neck seam. Confirm artwork size before bulk." /><Button variant="outline"><WandSparkles /> AI suggest placement</Button></aside></div>;
}

function ColorwaysPanel({ color, setColor }: { color: string; setColor: (value: string) => void }) {
  return <div className="section-stack"><section className="section-card"><div className="section-heading"><div><p className="eyebrow">Approved palette</p><h2>Product colorways</h2><p>Keep garment, artwork, trims, and factory color codes aligned.</p></div><Button><Plus /> Add colorway</Button></div><div className="colorway-grid">{colorways.map((item) => <button className={color === item.hex ? "colorway-card selected" : "colorway-card"} key={item.hex} onClick={() => setColor(item.hex)}><div className="colorway-garment" style={{ background: `${item.hex}20` }}><Garment color={item.hex} showCallouts={false} /></div><div><span className="large-swatch" style={{ background: item.hex }} /><strong>{item.name}</strong><small>{item.code} · {item.hex.toUpperCase()}</small></div>{color === item.hex && <span className="selected-check"><Check /></span>}</button>)}</div></section></div>;
}

function BomPanel() {
  const [rows, setRows] = useState(bomRows);
  return <section className="section-card data-card"><div className="section-heading"><div><p className="eyebrow">Bill of materials</p><h2>Fabric, trims, and labels</h2><p>Every item the factory needs to source or produce.</p></div><div className="button-row"><Button variant="outline"><Sparkles /> Suggest with AI</Button><Button onClick={() => setRows([...rows, ["New", "Untitled component", "", "", ""]])}><Plus /> Add row</Button></div></div><div className="data-table-wrap"><table className="data-table"><thead><tr>{["Type", "Material", "Composition", "Placement", "Color", ""].map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={`${row[1]}-${index}`}>{row.map((cell, cellIndex) => <td key={cellIndex}><input value={cell} onChange={(event) => setRows(rows.map((existing, rowIndex) => rowIndex === index ? existing.map((value, colIndex) => colIndex === cellIndex ? event.target.value : value) : existing))} /></td>)}<td><button className="icon-button" onClick={() => setRows(rows.filter((_, rowIndex) => rowIndex !== index))}><Trash2 /></button></td></tr>)}</tbody></table></div></section>;
}

function ArtworkPanel() {
  return <div className="section-stack"><section className="section-card"><div className="section-heading"><div><p className="eyebrow">Artwork & decoration</p><h2>Placement map</h2><p>Production-ready artwork details and print dimensions.</p></div><Button><Upload /> Upload artwork</Button></div><div className="artwork-layout"><div className="artwork-stage"><Garment color="#8faee8" artworkSize={42} /></div><div className="artwork-details"><span className="file-icon"><FileImage /></span><h3>CUSTM Wordmark</h3><p>custm-wordmark-vector.ai · 1.8 MB</p><dl><div><dt>Placement</dt><dd>Front chest</dd></div><div><dt>Technique</dt><dd>Screen print</dd></div><div><dt>Dimensions</dt><dd>28 × 6.5 cm</dd></div><div><dt>Ink</dt><dd>Soft-hand black</dd></div></dl><Button variant="outline"><Sparkles /> Remove background</Button></div></div></section></div>;
}

function MeasurementsPanel() {
  return <section className="section-card data-card"><div className="section-heading"><div><p className="eyebrow">Graded specification</p><h2>Size chart and points of measure</h2><p>Base size M · Centimeters · Tolerance ±0.5 cm</p></div><div className="button-row"><Button variant="outline"><Ruler /> Grade from M</Button><Button><Plus /> Add POM</Button></div></div><div className="data-table-wrap"><table className="data-table measurement-table"><thead><tr>{["POM", "Description", "XS", "S", "M", "L", "XL"].map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{measurements.map((row) => <tr key={row[0]}>{row.map((cell, index) => <td key={index}>{index < 2 ? cell : <input defaultValue={cell} />}</td>)}</tr>)}</tbody></table></div><div className="table-footer"><span><CircleHelp /> Grade rules calculate from the approved base-size measurements.</span><Button variant="outline"><Sparkles /> Validate grading</Button></div></section>;
}

function WorkflowPanel({ section }: { section: SectionKey }) {
  const copy: Record<string, { title: string; subtitle: string; items: string[] }> = {
    sampling: { title: "Sampling rounds", subtitle: "Record fit comments, revisions, and approvals.", items: ["Proto sample", "Fit sample 01", "Size set", "Pre-production sample"] },
    instructions: { title: "Construction instructions", subtitle: "Translate design intent into factory-ready directions.", items: ["Seams and stitch types", "Hood construction", "Pocket construction", "Finishing and wash"] },
    packaging: { title: "Packaging and labels", subtitle: "Define every item that ships with the finished garment.", items: ["Main label", "Care and content label", "Hangtag", "Polybag and carton"] },
    history: { title: "Version history", subtitle: "A clear record of every product decision.", items: ["v1.8 · Artwork dimensions approved", "v1.7 · Fit comments added", "v1.6 · BOM updated", "v1.5 · Initial factory share"] },
  };
  const content = copy[section];
  return <section className="section-card workflow-card"><div className="section-heading"><div><p className="eyebrow">Production workflow</p><h2>{content.title}</h2><p>{content.subtitle}</p></div><Button><Plus /> Add item</Button></div><div className="workflow-list">{content.items.map((item, index) => <article key={item}><span className={index === 0 || section === "history" ? "step-number complete" : "step-number"}>{index === 0 || section === "history" ? <Check /> : index + 1}</span><div><strong>{item}</strong><p>{section === "history" ? `Saved by Tim · ${index + 1} day${index ? "s" : ""} ago` : index === 0 ? "Complete and approved" : "Ready for details"}</p></div><Badge variant="outline">{index === 0 || section === "history" ? "Complete" : "Pending"}</Badge><ChevronRight /></article>)}</div></section>;
}

function ProductWorkspace({ product, onBack, onAi }: { product: Product; onBack: () => void; onAi: () => void }) {
  const [activeSection, setActiveSection] = useState<SectionKey>("overview"); const [color, setColor] = useState(product.color); const [artworkSize, setArtworkSize] = useState(38);
  const content = activeSection === "overview" ? <OverviewPanel product={{ ...product, color }} /> : activeSection === "design" ? <DesignPanel color={color} setColor={setColor} artworkSize={artworkSize} setArtworkSize={setArtworkSize} /> : activeSection === "colorways" ? <ColorwaysPanel color={color} setColor={setColor} /> : activeSection === "bom" ? <BomPanel /> : activeSection === "artwork" ? <ArtworkPanel /> : activeSection === "measurements" ? <MeasurementsPanel /> : <WorkflowPanel section={activeSection} />;
  return <div className="workspace-shell"><header className="product-header"><div className="product-title-row"><Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft /></Button><span className="tiny-product-thumb"><Shirt style={{ color, fill: color }} /></span><div><div className="breadcrumb">Products <ChevronRight /> {product.category}</div><h1>{product.name}</h1></div><Badge className="status-badge">{product.status}</Badge></div><div className="product-actions"><span className="autosave"><Check /> Saved</span><Button variant="outline" onClick={() => toast.success("Read-only factory link copied")}><Share2 /> Share</Button><Button variant="outline" onClick={() => window.print()}><Download /> Export PDF</Button><Button onClick={onAi}><Sparkles /> AI assistant</Button><button className="icon-button"><MoreHorizontal /></button></div></header><div className="workspace-body"><aside className="section-nav"><div className="completion-card"><div><span>Tech pack readiness</span><strong>{product.progress}%</strong></div><Progress value={product.progress} /><small>3 sections need input</small></div><p>Table of contents</p>{sections.map((section) => { const Icon = section.icon; return <button key={section.id} className={activeSection === section.id ? "section-nav-item active" : "section-nav-item"} onClick={() => setActiveSection(section.id)}><Icon /><span>{section.label}</span>{section.done ? <Check className="section-check" /> : <i />}</button>; })}<div className="factory-card"><Link2 /><strong>Factory live link</strong><p>Always reflects the latest saved version.</p><button onClick={() => toast.success("Factory link copied")}>Copy link</button></div></aside><main className={activeSection === "design" ? "product-content canvas-content" : "product-content"}><div className="content-header"><div><p className="eyebrow">{sections.find((section) => section.id === activeSection)?.label}</p><h2>{activeSection === "design" ? "Canvas editor" : activeSection === "overview" ? "Product specification" : sections.find((section) => section.id === activeSection)?.label}</h2></div>{activeSection !== "design" && <span className="last-edited">Last edited 8 minutes ago</span>}</div>{content}</main></div></div>;
}

function CreateTechPackDialog({ open, onOpenChange, onCreate }: { open: boolean; onOpenChange: (open: boolean) => void; onCreate: (product: Product) => void }) {
  const [step, setStep] = useState(1); const [type, setType] = useState("Hoodie"); const [name, setName] = useState("Untitled tech pack"); const types = ["T-Shirt", "Hoodie", "Polo", "Sweatshirt", "Jacket", "Tank", "Jogger", "Jersey"];
  const changeOpen = (next: boolean) => { if (!next) setStep(1); onOpenChange(next); };
  const create = () => { onCreate({ id: `product-${Date.now()}`, name, code: `CI-${type.slice(0, 3).toUpperCase()}-${Math.floor(2400 + Math.random() * 400)}`, category: `${type}s`, season: "FW 2027", status: "Draft", progress: 18, color: "#8faee8", updated: "Just now" }); changeOpen(false); toast.success("New tech pack created"); };
  return <Dialog open={open} onOpenChange={changeOpen}><DialogContent className="create-dialog"><DialogHeader><div className="dialog-icon"><WandSparkles /></div><DialogTitle>Generate a tech pack with AI</DialogTitle><DialogDescription>Start with a product type, then describe what you want to make.</DialogDescription></DialogHeader><div className="wizard-progress"><span>Step {step} of 2</span><Progress value={step * 50} /></div>{step === 1 ? <div><label className="field-label">What are you designing?</label><div className="type-grid">{types.map((item) => <button className={type === item ? "type-card selected" : "type-card"} key={item} onClick={() => setType(item)}><Shirt /><span>{item}</span>{type === item && <Check />}</button>)}</div></div> : <div className="prompt-step"><label className="field-label">Product name<Input value={name} onChange={(event) => setName(event.target.value)} /></label><label className="field-label">Describe the design<Textarea defaultValue={`A premium oversized ${type.toLowerCase()} with a structured silhouette, clean construction, heavyweight organic cotton, and tonal branding.`} /></label><div className="upload-drop"><CloudUpload /><strong>Upload a reference image</strong><span>JPG, PNG, PDF, or AI up to 20 MB</span></div></div>}<DialogFooter><Button variant="outline" onClick={() => step === 1 ? changeOpen(false) : setStep(1)}>{step === 1 ? "Cancel" : "Back"}</Button><Button onClick={() => step === 1 ? setStep(2) : create()}>{step === 1 ? <>Continue <ChevronRight /></> : <><Sparkles /> Generate tech pack</>}</Button></DialogFooter></DialogContent></Dialog>;
}

function AiPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [message, setMessage] = useState(""); const [messages, setMessages] = useState([{ role: "ai", text: "I reviewed this tech pack. The core specification is strong. I can draft missing construction notes, validate grading, or prepare factory questions." }]);
  const send = () => { if (!message.trim()) return; const next = message; setMessages([...messages, { role: "user", text: next }, { role: "ai", text: "I drafted the requested update and flagged the items that still need your approval. Review the suggested changes before adding them to the tech pack." }]); setMessage(""); };
  return <aside className={open ? "ai-panel open" : "ai-panel"}><div className="ai-panel-header"><div><span className="ai-orb"><Sparkles /></span><div><strong>Studio AI</strong><small>Product development copilot</small></div></div><button className="icon-button" onClick={onClose}><X /></button></div><div className="ai-context"><Badge variant="outline">Riviera Hoodie</Badge><span>Context: complete tech pack</span></div><div className="message-list">{messages.map((item, index) => <div key={index} className={`message ${item.role}`}><span>{item.role === "ai" ? <Sparkles /> : "TD"}</span><p>{item.text}</p></div>)}</div><div className="suggestion-chips"><button onClick={() => setMessage("Draft the missing construction notes")}>Draft construction notes</button><button onClick={() => setMessage("Validate the size grading")}>Validate grading</button><button onClick={() => setMessage("Write factory questions")}>Factory questions</button></div><div className="message-composer"><Textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask about this product…" onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); } }} /><Button size="icon" onClick={send}><Send /></Button></div></aside>;
}

export function TechPackStudio() {
  const [activeNav, setActiveNav] = useState<NavKey>("dashboard"); const [selectedProduct, setSelectedProduct] = useState<Product | null>(null); const [createOpen, setCreateOpen] = useState(false); const [aiOpen, setAiOpen] = useState(false); const [collapsed, setCollapsed] = useState(false); const [products, setProducts] = useState<Product[]>(() => { if (typeof window === "undefined") return starterProducts; const stored = window.localStorage.getItem("custmink-products"); return stored ? JSON.parse(stored) : starterProducts; });
  useEffect(() => { window.localStorage.setItem("custmink-products", JSON.stringify(products)); }, [products]);
  const openProduct = () => { setActiveNav("products"); setSelectedProduct(products[0]); };
  const page = selectedProduct ? <ProductWorkspace product={selectedProduct} onBack={() => setSelectedProduct(null)} onAi={() => setAiOpen(true)} /> : activeNav === "dashboard" ? <Dashboard products={products} onOpen={openProduct} onNew={() => setCreateOpen(true)} /> : activeNav === "products" ? <ProductsPage products={products} onOpen={setSelectedProduct} onNew={() => setCreateOpen(true)} /> : <LibraryPage page={activeNav as Exclude<NavKey, "dashboard" | "products">} onNew={() => setCreateOpen(true)} />;
  return <div className="studio-app"><Toaster position="bottom-right" richColors /><AppSidebar active={activeNav} onChange={(key) => { setActiveNav(key); setSelectedProduct(null); }} collapsed={collapsed} onCollapse={() => setCollapsed(!collapsed)} /><div className="app-main"><Topbar onNew={() => setCreateOpen(true)} onAi={() => setAiOpen(true)} onMenu={() => setCollapsed(!collapsed)} />{page}</div><CreateTechPackDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={(product) => { setProducts([product, ...products]); setSelectedProduct(product); }} /><AiPanel open={aiOpen} onClose={() => setAiOpen(false)} /></div>;
}
