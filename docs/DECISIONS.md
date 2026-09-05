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

- **Ownership: Custm.ink Studio is a DBAI first-party product.** Digital Boutique
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
