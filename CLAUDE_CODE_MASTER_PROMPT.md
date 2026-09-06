# The Studio™ — Claude Code Master Build Prompt

You are the lead product engineer and product designer for The Studio™, a multi-tenant SaaS product that helps apparel brands build, review, version, share, and export factory-ready tech packs.

Your job is to turn the supplied prototype into a secure production system and deploy it to Vercel. Preserve the prototype’s information architecture and visual direction, then replace demo behavior with real data, permissions, uploads, background jobs, AI workflows, and exports.

Do not copy Techstyles branding, copy, proprietary artwork, or code. The screenshots were used only to identify a product category and expected capabilities. The Studio™ must have its own design system, workflows, data model, and product voice.

## 1. Source and working rules

- Start from the supplied `atelier-techpack` codebase.
- Preserve all working UI flows unless a production requirement demands a change.
- Use the existing package manager and lockfile.
- Work in small, testable vertical slices.
- Run type checks, tests, and the production build at the end of every phase.
- Fix errors before continuing.
- Commit after every phase with a clear commit message.
- Never expose secrets to the client, logs, screenshots, commits, or generated exports.
- Never make destructive database changes without a migration and a rollback path.
- Use feature flags for incomplete production features.
- Keep demo seed data available in development only.

## 2. Product definition

The Studio™ is the operating system between apparel concept and factory production.

<!-- amended 2026-09-05 -->
Primary go-to-market: decorators and print shops moving from wholesale blanks to
private label. They already sell garments, already have factory relationships and
artwork, and hit the tech-pack wall the moment they want their own cut-and-sew.
Independent apparel brands are the second market, not the first.

Primary users:

- Decorators and print shops taking a proven blank to their own private-label style
- Independent designers creating their first production-ready tech pack
- Apparel brands managing collections, suppliers, samples, and approvals
- Product developers working across many styles
- Factories viewing controlled read-only specifications and leaving comments

Primary workflow:

1. Create a style from a template, prompt, or uploaded reference.
2. Build or generate front and back technical flats.
3. Create colorways and attach color standards.
4. Place artwork and specify decoration methods and dimensions.
5. Build the BOM with fabrics, trims, labels, threads, and construction details.
6. Attach and grade a size chart with points of measure and tolerances.
7. Add construction, packaging, labeling, and testing instructions.
8. Record sample rounds, fit comments, photos, decisions, and approvals.
9. Invite collaborators or publish a secure factory read-only link.
10. Export a branded, versioned PDF and hand off the latest approved specification.

## 3. Required production stack

- Next.js App Router with TypeScript in strict mode
- Tailwind CSS and shadcn/ui
- Neon PostgreSQL
- Drizzle ORM and versioned SQL migrations
- Clerk for authentication, organizations, invitations, and session management
- Vercel Blob for product images, artwork, sample photos, PDFs, and attachments
- OpenAI for structured text assistance and image-assisted concept workflows
- Fabric.js or Konva for the interactive garment canvas
- React PDF for deterministic factory PDF generation
- Stripe Billing for subscriptions and usage limits
- Resend for invitations, export delivery, approval requests, and notifications
- Inngest for durable generation, vectorization, export, and email jobs
- Sentry for errors and performance tracing
- PostHog for privacy-conscious product analytics and feature flags
- Vitest for unit tests and Playwright for end-to-end tests
- Vercel for preview and production deployment

Keep provider-specific code behind interfaces so storage, AI, email, and billing providers can be replaced.

## 4. Information architecture

Build these authenticated routes:

- `/dashboard`
- `/products`
- `/products/new`
- `/products/[productId]`
- `/products/[productId]/overview`
- `/products/[productId]/design`
- `/products/[productId]/colorways`
- `/products/[productId]/bom`
- `/products/[productId]/artwork`
- `/products/[productId]/measurements`
- `/products/[productId]/sampling`
- `/products/[productId]/construction`
- `/products/[productId]/packaging`
- `/products/[productId]/history`
- `/collections`
- `/libraries/sketches`
- `/libraries/materials`
- `/libraries/artwork`
- `/libraries/colors`
- `/libraries/size-charts`
- `/libraries/attachments`
- `/suppliers`
- `/purchase-orders`
- `/activity`
- `/settings/organization`
- `/settings/team`
- `/settings/brand`
- `/settings/billing`
- `/settings/developers` <!-- amended 2026-09-05 -->

Build these public or token-gated routes:

- `/sign-in`
- `/sign-up`
- `/share/[token]` for read-only factory views
- `/share/[token]/comments` for optional supplier comments
- `/accept-invite/[token]`

Use nested product layouts so the section table of contents, completion status, save state, share controls, and version controls stay stable while sections change.

<!-- amended 2026-09-05 -->
Build a public REST API under `/api/v1/**`:

- Handlers wrap the same server actions the UI calls. One mutation path, two entry
  points — an API route that reimplements a mutation will drift from the UI's.
- Every list endpoint supports cursor pagination and an `updated_since` filter.
- `Idempotency-Key` is honoured on every POST.
- Errors follow RFC 9457 (`application/problem+json`).
- OpenAPI is generated from the Zod schemas and served at `/api/v1/openapi.json`.
- Authentication is by API key (see `api_keys` in section 5), scoped and
  organization-bound. Model output and request bodies never choose the organization.

## 5. Core database model

Create normalized Drizzle tables with UUID primary keys, organization scoping, timestamps, soft-delete support where appropriate, and indexes for common filters.

Identity and billing:

- `users`
- `organizations`
- `memberships`
- `organization_settings`
- `subscriptions`
- `usage_events`

Product development:

- `brands` <!-- amended 2026-09-05 -->
- `collections`
- `products`
- `product_versions`
- `product_section_statuses`
- `canvas_documents`
- `sketch_assets`
- `colorways`
- `colorway_components`
- `artwork_assets`
- `artwork_placements`
- `materials`
- `bom_items`
- `size_charts`
- `points_of_measure`
- `measurement_values`
- `construction_instructions`
- `packaging_items`
- `sampling_rounds`
- `sample_comments`
- `approvals`
- `attachments`

Operations and collaboration:

- `suppliers`
- `supplier_contacts`
- `purchase_orders`
- `purchase_order_items`
- `comments`
- `mentions`
- `share_links`
- `notifications`
- `activity_logs`
- `ai_jobs`
- `export_jobs`
- `api_keys` <!-- amended 2026-09-05 -->
- `webhooks` <!-- amended 2026-09-05 -->
- `webhook_deliveries` <!-- amended 2026-09-05 -->

<!-- amended 2026-09-05 -->
API and webhook shape:

- `api_keys`: key prefix, sha256 hash of the secret, scopes (`read | write |
  export`), `last_used_at`, `revoked_at`. The secret is shown once, never stored.
- `webhooks`: target url, encrypted signing secret, event filter, active flag.
- `webhook_deliveries`: a durable outbox — event, attempt, `next_attempt_at`,
  response status and body.

Events fan out from `activity_logs`, so anything already audited is already
deliverable. Payloads are signed `X-Studio-Signature: sha256=HMAC(secret,
timestamp + "." + body)`. Five retries with exponential backoff, and the delivery
log is visible in the UI — a webhook you cannot debug is a support ticket.

<!-- amended 2026-09-05 -->
The hierarchy is organization → brands → collections → products. An organization
is an account; a brand is what appears on the tech pack. Brand-scoped: logo,
primary color, PDF settings, currency, unit, and the libraries (materials, size
charts, colors, artwork). `organization_settings` keeps organization-level
defaults only — never *the* brand.

Every product carries `brand_id` from the first Phase 2 migration. Retrofitting it
later rewrites every product row and every child row that inherits brand context,
so `brands` lands before any product child table exists.

<!-- amended 2026-09-05 -->
Every row table AI can write to — `bom_items`, `points_of_measure`,
`measurement_values`, `construction_instructions`, `packaging_items`,
`artwork_placements` — carries provenance:

- `source`: enum `manual | library | import | api | ai_draft`
- `accepted_at`: timestamp, null until a human accepts the row

Applying an `ai_proposals` row writes `source: ai_draft`; accepting sets
`accepted_at`. Provenance lives on the row, so it survives the proposal being
closed, and "what in this pack did a model write, and did anyone sign off?" stays
answerable for the life of the product.

Every tenant-owned row must include `organization_id`. Enforce tenant boundaries in the data-access layer and test them. Do not rely on UI filtering for security.

Create immutable product version snapshots. A snapshot must include all sections, referenced asset versions, comments excluded from the factory PDF unless explicitly selected, creator, timestamp, and change summary.

## 6. Roles and permissions

Implement organization roles:

- Owner: full access, billing, deletion, organization settings
- Admin: team, settings, all product and supplier operations
- Designer: create and edit products, libraries, and comments
- Product Developer: edit specifications, sampling, suppliers, and orders
- Reviewer: view, comment, approve, and reject
- Factory Guest: token-scoped read-only access, optional comments, no organization browsing

Create a central authorization service. Check permissions in server actions, route handlers, background jobs, exports, and uploads.

## 7. Product workspace requirements

Overview:

- Product name, article code, category, collection, season, status, supplier, target cost, currency, MOQ, lead time, description, and design intent
- Automatic section completion and factory-readiness score
- Missing-data warnings and next recommended action
- Status workflow: Draft, Development, Sampling, Revision, Approved, In Production, Archived

Design canvas:

- Front, back, side, and detail views
- Pan, zoom, selection, multi-select, alignment, snapping, layers, lock, hide, duplicate, undo, and redo
- Garment base templates
- Artwork upload and placement
- Text and annotation tools
- Numbered callouts anchored to canvas objects
- Color fills and stroke controls
- Dimensions in inches and centimeters
- Autosave with conflict detection
- Canvas JSON stored separately from generated preview images
- Export clean PNG and SVG when permitted

AI flat sketch workflow:

- Start from product type, natural-language description, or uploaded garment reference
- Collect silhouette, fit, fabric weight, construction, pockets, closures, collar or hood, trims, and required views
- Generate a clean concept flat and a structured editable draft
- Return front and back views
- Create initial construction notes and likely BOM rows
- Clearly label AI output as a draft requiring human approval
- Track prompt, model configuration, source assets, latency, token or generation cost, status, and errors in `ai_jobs`
- Never let AI silently overwrite approved data

Colorways:

- Multiple named colorways per product
- Garment component colors, artwork colors, trim colors, and thread colors
- HEX, RGB, CMYK, and a user-entered Pantone or supplier code
- Searchable organization color library
- Visual colorway previews generated from the canvas

Artwork:

- PNG, JPG, SVG, PDF, AI, and EPS upload metadata
- Safe MIME and extension validation
- Virus scanning hook
- Background removal job
- Placement zone, decoration technique, dimensions, colors, rotation, scale, notes, and linked colorways
- Preserve original files and generate previews

BOM:

- Reusable material library
- Row types for fabric, lining, rib, trim, thread, label, packaging, and miscellaneous
- Supplier, composition, weight, width, color, placement, quantity, unit, cost, currency, lead time, MOQ, certification, notes, and attachment
- Drag ordering, duplicate, bulk edit, template save, and CSV import or export
- AI can draft suggestions but must never mark them approved

Measurements:

- Reusable size-chart templates
- Base size, size range, units, tolerance, measuring method, and diagram reference
- Point-of-measure codes and descriptions
- Manual values and formula-based grade rules
- Grade from base size
- Detect irregular jumps, missing sizes, and unit mismatches
- CSV import and export
- Version comparison that highlights changed cells

Sampling:

- Proto, fit, size set, pre-production, top-of-production, and custom rounds
- Request date, expected date, received date, factory, tracking, status, photos, fit model, measurements, comments, decisions, and approval
- Pin comments to sample photos
- Convert comments into product changes
- Approval and rejection history

Construction and packaging:

- Ordered instructions with diagrams, stitch or seam type, SPI, tolerance, and linked callouts
- Label placement, care content, hangtags, folding, polybag, carton, barcode, and assortment instructions
- Reusable templates

Version history:

- Autosave draft history
- Named snapshots
- Side-by-side changes by section
- Restore by creating a new version, never by deleting history
- Approval lock for signed-off versions

## 8. Collaboration and factory handoff

- Team comments with replies, mentions, resolved state, and section or object anchors
- Presence indicator and optimistic UI without unsafe last-write-wins behavior
- Share dialog with role, expiration, password option, download permission, comment permission, and revoke action
- Share tokens must be random, hashed at rest, scoped, revocable, and rate-limited
- Factory view must be fast, mobile friendly, read-only by default, and require no account when token access is allowed
- Every share-page view and PDF download must be logged
- Add an optional factory acknowledgement action

PDF export:

- Cover page with brand, style, article code, season, collection, supplier, version, date, and prepared-by information
- Table of contents
- Product overview
- Front and back flats
- Colorways
- Artwork and placement maps
- BOM
- Measurements
- Construction
- Packaging and labels
- Sampling approval summary
- Version and disclaimer footer on every page
- Deterministic page breaks, repeated table headers, print-safe colors, and high-resolution assets
- Organization logo and brand settings
- PDF must reflect an immutable selected version, not a moving live draft

## 9. AI copilot

Build a contextual right-side copilot that can read only the current organization and authorized product context.

Supported actions:

- Draft a new product from a brief
- Suggest missing BOM components
- Draft construction notes
- Recommend artwork size from garment and placement zone
- Check measurement grading for anomalies
- Summarize sample comments into proposed changes
- Write factory questions
- Translate approved factory instructions while preserving technical values and units
- Produce a readiness review

Use structured outputs validated with Zod. Show a review screen before applying mutations. Log every accepted and rejected suggestion. Add per-plan limits and cost tracking.

Protect against prompt injection in uploaded documents and comments. Treat uploaded content as untrusted data. Do not allow model output to choose organization IDs, user IDs, permissions, storage keys, prices, or billing actions.

## 10. Billing

Create Stripe plans with configuration, not hard-coded product IDs:

- Starter: 1 user, 10 active products, limited AI and exports
- Studio: 5 users, 100 active products, larger AI and storage limits
- Brand: 20 users, unlimited archived products, advanced approvals and supplier collaboration
- Enterprise: custom limits, SSO-ready architecture, support controls

<!-- amended 2026-09-05 -->
Factory guests are free and unlimited on every plan and never count toward user
limits. Per-supplier seat fees are the top pricing complaint about the incumbents,
and a tech pack the factory cannot open is not a tech pack.

Implement checkout, customer portal, plan changes, cancellation, webhook verification, idempotency, entitlements, and usage enforcement. Never trust client plan state.

## 11. Security and reliability

- Validate all input with Zod
- Use server-only data access modules
- Add CSRF-safe mutation patterns
- Rate-limit authentication-adjacent routes, share links, AI jobs, uploads, exports, and comments
- Use signed upload flows and private assets by default
- Sanitize filenames and generated HTML
- Add security headers and a strict CSP that fits the app
- Verify Stripe and job-provider webhook signatures
- Add idempotency keys to long-running and payment operations
- Add retry and dead-letter behavior for background jobs
- Add audit logging for access, approvals, sharing, exports, destructive actions, and role changes
- Add organization export and account deletion workflows
- Add retention controls for deleted assets
- Never log product files, prompts containing confidential designs, or signed URLs

## 12. UX and design system

Preserve the current The Studio™ direction:

- Deep ink navigation
- White working surfaces
- Cobalt action color
- Acid-lime micro-accent used sparingly
- Compact professional density
- 8 to 14 px corner radii
- Fine gray dividers
- Clear information hierarchy
- Motion limited to drawer, save-state, drag, and success feedback

Requirements:

- Desktop optimized for 1280 px and wider
- Fully usable on tablets
- Mobile supports review, commenting, approvals, and factory viewing; complex canvas editing may use a focused tablet or desktop mode
- WCAG 2.2 AA color contrast and keyboard support
- Visible focus states
- Accessible labels for icon-only controls
- Empty, loading, error, offline, permission-denied, and success states
- Skeletons that match final geometry
- Unsaved-change and version-conflict handling

## 13. Seed data

<!-- amended 2026-09-05 -->
Create a development seed organization called Digital Boutique AI with:

- Owner: Tim de Vallée
- Brands: Custm.ink (house brand) and Exora Ink (pilot client)
- Collection: Riviera Resort 2027 under the Custm.ink brand
- Products: Riviera Oversized Hoodie, Harbor Heavyweight Tee, Atlas Tapered Jogger
- Four colorways
- Four approved materials
- A complete hoodie BOM
- XS through XL graded measurements
- Two sampling rounds
- One supplier in Portugal
- One active factory share link
- Activity and comments that match the supplied prototype

Never run seeds automatically in production.

## 14. Test requirements

Unit tests:

- Readiness scoring
- Measurement grading and anomaly detection
- Version snapshot creation
- Role and permission checks
- Share-token hashing and scope
- Billing entitlement checks
- PDF data transformation

Integration tests:

- Organization isolation
- Product creation and autosave
- Asset upload authorization
- AI job review and apply flow
- Snapshot and restore flow
- Share creation, revoke, and expiration
- Stripe webhook idempotency

Playwright flows:

- Sign up and create organization
- Create a hoodie tech pack from the guided wizard
- Edit canvas, add colorway, BOM row, and measurement
- Create a version and export PDF
- Invite a reviewer and approve a version
- Open factory share link, comment, and acknowledge
- Upgrade plan through Stripe test mode

## 15. Delivery phases

Phase 1 — Foundation

- Convert the prototype into the production route structure
- Add authentication, organizations, database, migrations, authorization, seed data, and deployment environments
- Deliver a working dashboard and product list backed by PostgreSQL

Phase 2 — Complete tech pack CRUD

- Overview, colorways, BOM, measurements, construction, packaging, suppliers, libraries, autosave, completion states, and activity log
- `brands` lands in the **first** Phase 2 migration, with `brand_id` on `products` <!-- amended 2026-09-05 -->
- "Start from a blank": create a product by seeding fabric, composition, weight, <!-- amended 2026-09-05 -->
  and size chart from a wholesale catalog SKU. SanMar data exists in Supabase;
  treat it as one implementation behind a catalog-import interface, not a
  dependency the product cannot ship without.
- Deliver full data persistence and tenant tests

Phase 3 — Canvas and assets

- Canvas editor, garment templates, artwork placement, uploads, previews, callouts, and versioned canvas documents
- Deliver stable autosave and exportable previews

Phase 4 — Sampling and collaboration

- Sampling rounds, pinned comments, mentions, approvals, notifications, secure share links, and factory views
- Public API, webhooks, and `/settings/developers`, alongside share links — both <!-- amended 2026-09-05 -->
  are the same problem: getting a finished spec out of the product safely

Phase 5 — AI and exports

- Guided AI draft, copilot actions, review-before-apply, background jobs, usage accounting, and full branded PDF export

Phase 6 — Billing and launch hardening

- Stripe, entitlements, limits, analytics, error monitoring, rate limits, accessibility, end-to-end tests, performance work, onboarding, and production launch

## 16. Required phase report

At the end of every phase, create `docs/reports/phase-N.md` with:

- What was completed
- Screens and routes completed
- Database migrations added
- APIs and jobs added
- Tests run and exact results
- Security checks completed
- Known limitations
- Environment variables added
- Manual setup still required
- Production URL or preview URL
- Next phase plan

Do not start the next phase until the current phase build and tests pass.

## 17. Deployment

- Create separate Vercel preview and production environments.
- Connect Neon branches to preview deployments and the production database to production only.
- Configure all environment variables in Vercel, never in committed `.env` files.
- Run migrations through a controlled deployment step.
- Configure Stripe test mode first.
- Verify Clerk, Blob, email, jobs, Sentry, PostHog, and OpenAI in preview.
- Run the full Playwright suite against preview.
- Deploy production only after the preview acceptance checklist passes.
- Return the production URL, admin login method, provider setup checklist, and rollback instructions.

## 18. Final acceptance criteria

The product is complete only when:

- A new user can sign up, create an organization, and create a tech pack.
- Every tech-pack section persists and respects tenant permissions.
- Users can create and compare immutable versions.
- Designers can build a garment canvas and artwork placements.
- Teams can comment, mention, review, and approve.
- A secure factory link works without exposing other organization data.
- A selected approved version exports as a complete branded PDF.
- AI suggestions require review before changing product data.
- Billing limits are enforced on the server.
- Required tests pass.
- Accessibility and responsive acceptance checks pass.
- Preview and production deployments are healthy.
- A phase report and operator runbook exist.

Begin with Phase 1. First inspect the supplied codebase, create a short implementation checklist, then execute without redesigning the approved product direction.
