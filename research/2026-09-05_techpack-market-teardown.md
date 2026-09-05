# Tech pack software: competitive teardown (2026-09-05)

Research brief commissioned before the scope amendment. Source: multi-source web research (vendor sites, G2/Capterra, Reddit, press releases, GitHub). Vendor blogs are self-interested; pricing for quote-gated products is a floor.

## TL;DR

- The market splits into three tiers with a soft middle: dedicated tools (Techpacker, ~$35–125/user/mo) that stop at documentation; SMB PLM/ERP ($109–600/user/mo) that bundle tech packs into production/inventory; enterprise PLM (Centric, PTC FlexPLM, $50k–250k+/yr). The incumbent "non-product" — Illustrator + Excel/Sheets — still owns the low end.
- The clearest wedge is an API-first, AI-assisted, factory-legible tool for independent brands, print/DTF shops, and multi-brand agencies. The leaders lack public APIs (Techpacker and Backbone have none — Zapier/Shopify only), export quality is a recurring complaint, and nobody serves agencies managing many brands.
- Study closely: Backbone (data model, libraries), Techpacker (card UX, price), Delogue (open REST API + webhooks — the technical bar), the AI-native cohort (sketch → spec), CLO-SET Web Tech Pack (3D → POM).

## Key findings

- **No serious API story at the low end.** Techpacker: no public REST API or webhooks, only a Zapier bridge. Backbone: CSV export + Shopify app, no open API. Delogue is the outlier with a documented REST API (JSON) plus webhooks.
- **Table stakes are universal:** POM tables, BOM (fabric/trim/label/packaging), colorways, flat upload/annotation, PDF + Excel export, version history, factory sharing. **Differentiators:** grading automation, costing, 3D integration, true supplier permissions, multi-language, AI sketch → spec.
- **Recurring pain points:** version chaos, image formatting drift (especially Excel), incomplete/illegible factory PDFs, rigid table customization, cloud-only tools failing on factory visits, slowdowns on large images, no supplier portal at the cheap tier, per-supplier seat fees.
- **What factories want:** black-and-white technical flats, BOM with Pantone + weights + per-unit consumption, measurements with tolerances, size grading, clean multi-page landscape PDF (~300 DPI). A manufacturer survey cited by Adstronaut found ~92% of factories accept any software's output if those elements are present; the rest prefer Excel-based templates common in some Asian hubs.
- **Consolidation:** Bamboo Rose acquired Backbone PLM (Mar 2023); Lectra acquired Gerber (Jun 2021, ~€300M); Dassault took a majority of Centric (2018, ~$350M).
- **AI is crowded but immature:** aitechpacks, Adstronaut, SpecForm OS, Genpire, Skema3D, Tchpack and others generate flats + BOM + POM from a photo for ~$3–7/pack; output is a draft for human review. Incumbents are bolting AI on.
- **No adopted data standard.** ANSI/AAMA-292 DXF and ASTM D6673 cover pattern geometry only. OpenTechPack (Coats Digital, GitHub) is dormant. Tech pack data models are proprietary per vendor — greenfield for an interoperability play.

## Landscape

**Tier 1 — dedicated:** Techpacker (2014, Brooklyn; $49/$69 monthly, ~$35/$95/$125 annual tiers; freelancers and small brands). AI-native cohort (2023–25; $3–7/pack; indie founders, POD). Stylio/Techpacks.co (from ~$29/mo). Techpack Builder (free desktop, offline). Gumroad template marketplaces ($9–35).

**Tier 2 — SMB PLM/ERP:** Backbone PLM (2014, acquired by Bamboo Rose; ~$2,388/yr entry; CSV + Shopify, no open API). Delogue (2011, Copenhagen; €109–189/user/mo; open REST API + webhooks). WFX (2000; quote, ~$50k+/yr; NetSuite connector). Uphance (2017, UK; ~$150–400/user/mo; API, Shopify). ApparelMagic (REST API on Enterprise). Zedonk (£166–332/mo). Indigo8 (Sydney; APIs). Kadence, Onbrand, Kobo, Rechain ($100–300/user/mo). TRIMIT (Dynamics-based).

**Tier 3 — enterprise:** Centric ($50k–250k+/yr; steep learning curve, expensive customization). PTC FlexPLM (300k+ users; CLO/Browzwear integration). Bamboo Rose TotalPLM. Lectra YuniquePLM/Kubix Link. Infor CloudSuite Fashion. BlueCherry.

**The incumbent:** Illustrator flats + Excel/Sheets BOM/POM + a shared folder. Breaks past ~10 styles/season.

## Feature matrix (top tools)

| Feature | Techpacker | Backbone | Delogue | WFX | Uphance | Centric | AI-native | CLO-SET |
|---|---|---|---|---|---|---|---|---|
| POM tables | yes | yes | yes | yes | yes | yes | draft | 3D-linked |
| Grading rules | Pro | yes | yes | yes | partial | yes | partial | yes |
| BOM incl. labels/packaging | Pro | yes | yes | yes | yes | yes | yes | partial |
| Construction callouts | yes | yes | yes | yes | yes | yes | yes | yes |
| Colorways | yes | yes (Pantone) | yes | yes | yes | yes | yes | yes |
| Sample/fit tracking + comments | yes | yes | yes | yes | yes | yes | partial | yes |
| Version history | yes | yes | yes | yes | yes | yes | partial | yes |
| Supplier sharing + permissions | no portal | partial | yes | yes | yes | yes | partial | yes |
| PDF/Excel export | yes | CSV | yes | yes | yes | yes | yes | yes |
| Illustrator integration | yes | 2-way | partial | yes | partial | yes | partial | — |
| CLO/Browzwear | no | no | partial | yes | no | yes | partial | native |
| Shopify/ERP sync | Zapier | Shopify app | REST/webhooks | NetSuite+ | native | enterprise | no | partial |
| Public API | no | no | yes | yes | yes | yes | no | partial |
| Multi-language | partial | partial | yes | EN+CN portal | partial | yes | partial | yes |
| Costing | partial | yes | yes | yes | yes | yes | partial | partial |

## Pricing

| Tier | Range | Free tier | Gated behind enterprise |
|---|---|---|---|
| AI-native | $3–7/pack | usually one watermarked pack | batch, brand libraries |
| Dedicated | $35–125/user/mo | 7-day trial | grading, BOM libraries, Excel export, stages |
| SMB PLM | $109–600/user/mo | trials | supplier seats, custom fields, support |
| Enterprise | $50k–250k+/yr | none | everything; per-supplier seat charges common |

Sample-round ROI is the industry's core selling argument: brands submitting tech packs average under two sampling rounds; brands without average more than four (White2Label, cited by Techpacker).

## Voice of customer

Praise: Techpacker's visual cards and support; Backbone for staying focused on tech packs without ERP sprawl; Delogue for ease and price. Complaints: Techpacker's limited column customization, slowdown with many cards/large images, cloud-only, library limits, setup fee; Centric's learning curve and hidden costs; Backbone "feels in development"; Delogue's export options. Users still do BOM and POM tabs in Excel, and abandon tools over version confusion, export quality, and price jumps when adding suppliers or users.

## Technical signals

APIs: Delogue (REST + webhooks), Uphance, ApparelMagic (Enterprise), Centric (2017 REST). Techpacker Zapier-only; Backbone CSV + Shopify. Export formats: PDF (landscape, ~300 DPI), XLSX with images, CSV, proprietary (.tpr, .zprj/.zpac, .tp). Standards: pattern geometry only; no BOM/spec standard. Open source: docdoku-plm, Dokuly (generic PLM), a Frappe-based apparel PLM proof of concept; nothing mature.

## Recommendations

**Study:** Backbone (model), Techpacker (UX/price), Delogue (API bar), AI-native cohort (sketch → spec UX and per-pack pricing), CLO-SET (3D → POM).

**MVP to beat the low end:** database-backed Style → BOM → POM → Colorway → Construction → Sample model; card-based editor with drag-drop annotation; reusable libraries; one-click clean factory PDF and Excel with images; version history with diff; supplier sharing with a free viewer/commenter role; offline/PWA capability; AI sketch → draft as accelerator with human review.

**Three differentiators for independents and small manufacturers:** (1) open documented API + webhooks from day one; (2) free unlimited supplier/factory seats with granular permissions; (3) multi-brand/agency workspace with isolated libraries and white-label PDF.

**Implied data model:** Brand → Season → Style (root); Style has TechPack versions (immutable), Colorways, SizeRange/Sizes, BOMItems (→ component library, with supplier, placement, consumption, Pantone, cost), POMs (→ POM library, tolerance, graded values via grade rules), ConstructionCallouts (anchored to sketch coordinates), Sample/FitRounds with Comments, Shares to Supplier/Factory with permission roles; Costing derived from BOM × consumption + labor + landed.
