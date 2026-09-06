# Decisions

Dated one-liners. Newest first. A decision recorded here is settled — reopen it
by adding a new dated line that supersedes the old one, never by editing history.

Where a decision changed the spec, the change is marked `<!-- amended 2026-09-05 -->`
in `CLAUDE_CODE_MASTER_PROMPT.md`. The research behind the 2026-09-05 set is in
`docs/research/`.

---

## 2026-09-05 — scope amendment

Source: competitive teardown of Techpacker, Backbone PLM, Delogue, Centric and the
AI-native tech pack tools (`docs/research/2026-09-05_techpack-market-teardown.md`),
plus the gap analysis against this repo.

- **Ownership: The Studio™ is a DBAI first-party product.** Digital Boutique
  AI (Tim de Vallée, James) owns it. custm.ink is DBAI's house brand, not a
  client. Settled — the "confirm ownership before building" caveat is removed.
- **Every external service is owned by a DBAI account, never a personal one.**
  Tracked in `docs/ACCOUNTS.md`; anything not yet created carries a TODO there.
- **Pilot customer is Exora Ink (Colin Jones)** — an existing DBAI client moving
  from decorating SanMar blanks to original cut-and-sew. Chosen over cold outbound
  because a real garment produces a real factory response, and the outbound demo
  falls out of the pilot rather than having to precede it.
- **The PDF vertical slice is built against Exora's first real style, not the
  Riviera seed.** Until his details arrive, keep the hoodie template and mark
  every value that will be replaced with `TODO(exora)`. Do not invent a second
  fictional garment.
- **Exora is a brand under the DBAI organization** until Clerk organizations
  exist; on preview with a dev session until then. Exora being the pilot does not
  change who owns the product.
- **Primary go-to-market is decorators and print shops moving to private label**,
  with independent apparel brands second. They already sell garments, already have
  factory relationships and artwork, and hit the tech-pack wall the moment they
  want their own cut-and-sew. (§2)
- **A `brands` layer sits between organization and collections** — organization →
  brands → collections → products. Brand-scoped: logo, primary color, PDF
  settings, currency, unit, and the libraries. `organization_settings` keeps
  org-level defaults only. (§5)
- **`brands` lands in the first Phase 2 migration, with `brand_id` on `products`.**
  Retrofitting it later rewrites every product row, so it goes in before any
  product child table exists. (§15)
- **A public REST API is the primary wedge**: `/api/v1/**` wrapping the same
  server actions the UI calls — one mutation path, two entry points. Cursor
  pagination and `updated_since` on lists, `Idempotency-Key` on POST, RFC 9457
  errors, OpenAPI generated from the Zod schemas. No competitor under $100/mo has
  one. (§4)
- **`api_keys`, `webhooks`, `webhook_deliveries` join the schema.** Events fan out
  from `activity_logs`; payloads signed `X-Studio-Signature: sha256=HMAC(secret,
  timestamp.body)`; five retries with backoff; the delivery log is visible in the
  UI. (§5)
- **API, webhooks and `/settings/developers` land in Phase 4, alongside share
  links** — both are the same problem, getting a finished spec out of the product
  safely. (§15)
- **Every row table AI can write to carries `source` and `accepted_at`.**
  `manual | library | import | api | ai_draft`; applying an `ai_proposals` row
  writes `ai_draft`, accepting sets `accepted_at`. Provenance lives on the row so
  it survives the proposal being closed. Cheap now, impossible later — enforced by
  `tests/schema-rules.test.ts`. (§5)
- **Factory guests are free and unlimited on every plan** and never count toward
  user limits. Per-supplier seat fees are the top pricing complaint about the
  incumbents. (§10)
- **"Start from a blank" is a Phase 2 item**: seed fabric, composition, weight and
  size chart from a wholesale catalog SKU. SanMar data exists in Supabase — treat
  it as one implementation behind a catalog-import interface, not a dependency the
  product cannot ship without. (§15)
- **Seed organization becomes "Digital Boutique AI"** with brands "Custm.ink" and
  "Exora Ink". The brand records land with the `brands` table in Phase 2. (§13)
- **Not relitigated:** Clerk vs Supabase auth, app-layer scoping vs Postgres RLS,
  React PDF vs Gotenberg, Inngest vs a Postgres queue. The existing choices are
  coherent and tested.

## 2026-09-05 — Phase 2 begins: brands, BOM, and the rename

- **The product is renamed to "The Studio™"**, trademark rendered small and
  superscript. `custm.ink` remains a DBAI apparel brand and a domain, and
  `custmink-studio` remains the GitHub, Vercel and Neon project identifier —
  neither is the product name and neither changed. The name now lives in
  `lib/brand.ts`; it was previously hardcoded in 25 page titles and two copies
  of the wordmark.
- **`brands` landed by expand → backfill → contract, across three migrations.**
  A single migration declaring `brand_id NOT NULL` cannot run against a
  populated table, so 0001 adds it nullable, `db:backfill-brands` assigns a
  default brand per organization, and 0002 sets NOT NULL.
- **BOM row values are copied from `materials`, not joined at read time.** A BOM
  row is part of an immutable version snapshot; editing a library material must
  not retroactively change a spec a factory has already quoted against.
  `material_id` records the origin without creating the dependency.
- **`source` defaults to `manual`.** A write path that forgets to set provenance
  records the row as human-entered — wrong in the safe direction. Defaulting to
  `ai_draft` would mark real work as unreviewed and erode trust in the flag.
- **Server actions use `updateTag`, not `revalidateTag`.** Next 16 made
  `revalidateTag` take a required cache profile and purge for future requests
  only, while `updateTag` gives server actions read-your-own-writes. CLAUDE.md
  named `revalidateTag`; the rule is updated rather than followed literally,
  because following it literally serves a user the list that predates their own
  save.
- **BOM edits save on blur, not on keystroke.** One action per character is one
  database wake per character, and Neon bills by wake-time.
- **Deletes are soft.** Version snapshots and history must keep resolving the
  row.
- **A section with no session renders read-only.** Production has no session, so
  offering inputs whose edits cannot persist would be a lie about the state of
  the system.

## 2026-09-05 — factory PDF vertical slice

- **React PDF (`@react-pdf/renderer` 4.9.0) confirmed as the export engine**, as
  master prompt §3 names. Renders server-side to a buffer, works under Vitest and
  Next 16 / React 19.
- **Only the standard PDF fonts.** `Font.register` would fetch a font file during
  an export — latency and a failure mode inside a path that must be deterministic.
  Asserted by the absence of `/FontFile` in the rendered bytes.
- **The flat goes into the PDF as vector paths, never a raster image.** Asserted
  by the absence of `/Subtype /Image`. This is the parametric-flats decision made
  enforceable rather than merely intended.
- **Flat geometry emits structured elements; markup is a serialization.**
  `lib/flats/style.ts` holds the stroke weights once, and both the browser
  stylesheet and the React PDF presentation props derive from it. React PDF
  supports no stylesheets, classes, or custom properties, so the alternative was
  two drawings kept in sync by hand.
- **`lib/pdf/**` is pure and `lib/data/tech-pack-export.ts` is the server
  boundary.** `server-only` throws under Vitest, and the document transformation
  is the part most worth testing.
- **The export route returns `Cache-Control: private, no-store`** and declares no
  `revalidate`. A tenant-scoped PDF must never sit in a shared cache; the compute
  rule it appears to break governs public routes, and this one is authenticated
  and disallowed in `robots.ts`.
- **`export:create` gates the route**, so a `reviewer` and a `factory_guest` can
  read a product but cannot export it. An export leaves the audit trail behind.
- **Unresolved pilot values print as `TBC` and are marked `TODO(exora)`**, never
  invented. An invented factory or cost is indistinguishable from a real one once
  printed, and this document goes to a factory. Asserted in `tests/pdf.test.ts`.
- **Seed hoodie corrected from `sleeveless` to `long`.** It contradicted its own
  measurement rows, its own BOM, and its own `cuff: "ribbed"`.

## 2026-09-05 — earlier

- **Production domain is `techpack.intlo.com`**, and it is publicly browsable —
  Vercel Deployment Protection covers preview and `*.vercel.app` only. No tenant
  data is exposed (production has no session, so the demo dataset renders), but
  the whole workspace UI is visible to anyone with the URL.

## 2026-09-01 — build session

- **Sequencing deviates from §15:** the factory PDF and AI drafting move ahead of
  Phase 2 as a 2–3 week de-risking spike. They decide whether anyone buys this;
  spec order would answer that after ~4 months of CRUD.
- **Flats are parametric, never generated as images.** The model emits a
  `FlatSpecV1` of enums and bounded numerics; geometry renders deterministically.
  Raster→vector tracing was rejected: no layers, no callout anchors, no measurable
  geometry, no front/back parity.
- **`canvas_documents.content` is `{ flatSpec, overlay: [...] }`** — not raw
  Fabric/Konva JSON. Not reversible; storing raw canvas JSON forecloses
  regenerating the flat from parameters.
- **`claude-opus-5` for structured output**, not OpenAI as §3 names; a separate
  provider for images only.
- **SVG-native, not Fabric.js/Konva** as §3 names. Canvas-raster tooling for a
  vector technical flat loses layers, anchors, and print-resolution PDF.
- **`ai_proposals` is required** — §5 lists `ai_jobs` but no proposals table, and
  "review before apply" has nowhere else to live.
- **Never free-translate numbers.** Tokenize measurements out, translate prose,
  re-insert. "12.5 cm ± 0.5" mistranslated reaches a factory.
- **Tenancy rules live in eslint, not CI** — local, deterministic, and blocking
  before commit rather than after deploy.
- **Pricing $49 / $149 / $399 / Enterprise**, full master-prompt scope, no deadline.
