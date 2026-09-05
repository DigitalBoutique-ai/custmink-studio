# Custm.ink Studio — scope amendment prompt (2026-09-05)

Paste everything below the line into the existing Claude Code session on `custmink-studio`.

---

Read HANDOFF.md, CLAUDE.md, and CLAUDE_CODE_MASTER_PROMPT.md before doing anything.

Step 0 — land the research. A file `custmink-docs-research.zip` is somewhere in this repo (probably the root). Unzip it so that `docs/research/` exists beside `docs/reports/` with a README.md and four dated files (teardown, gap analysis, mockup HTML, scope-amendment prompt). Delete the zip and add `*.zip` to .gitignore. Commit as `docs: add market teardown, gap analysis, mockup, and scope amendment prompt`. Then read `docs/research/README.md` and the gap analysis — they are the evidence for what follows.

Step 1 — scope amendment. This comes from a competitive teardown of Techpacker, Backbone PLM, Delogue, and the AI-native tech pack tools, plus two decisions: a pilot customer and product ownership. Apply it to the docs and schema rules, then resume HANDOFF item 3. Don't start Phase 2.

Amend the master prompt in place, marking each change `<!-- amended 2026-09-05 -->`:

1. §5, "Product development": add `brands` (organization → brands → collections → products). Brand-scoped: logo, primary color, PDF settings, currency, unit, and the libraries (materials, size charts, colors, artwork). `organization_settings` keeps org-level defaults only. Every product carries `brand_id` from the first Phase 2 migration — retrofitting later rewrites every product row, so it goes in before any product child table exists.
2. §5, "Operations and collaboration": add `api_keys` (prefix, sha256 hash, scopes read|write|export, last_used_at, revoked_at), `webhooks` (url, encrypted secret, event filter, active), `webhook_deliveries` (outbox: event, attempt, next_attempt_at, response). Events fan out from `activity_logs`. Payloads signed `X-Studio-Signature: sha256=HMAC(secret, timestamp.body)`, 5 retries with backoff, delivery log visible in the UI.
3. §4: add `/settings/developers` and `/api/v1/**`. REST handlers wrap the same server actions the UI calls — one mutation path, two entry points. Cursor pagination and `updated_since` on every list endpoint. `Idempotency-Key` on POST. RFC 9457 errors. OpenAPI generated from the Zod schemas at `/api/v1/openapi.json`.
4. §10, one sentence: factory guests are free and unlimited on every plan and never count toward user limits. Per-supplier seat fees are the top pricing complaint about the incumbents.
5. §5 rule for every row table AI can write to (bom_items, points_of_measure, measurement_values, construction_instructions, packaging_items, artwork_placements): `source` enum manual|library|import|api|ai_draft and `accepted_at`. Applying an `ai_proposals` row copies `source: ai_draft`; accepting sets `accepted_at`. Provenance survives the proposal being closed.
6. §15: API + webhooks + developers page land in Phase 4 alongside share links. `brands` lands in the first Phase 2 migration. Add a Phase 2 item "start from a blank": create a product by seeding fabric, composition, weight, and size chart from a wholesale catalog SKU (SanMar data exists in Supabase; treat it as an import source behind an interface, not a dependency).
7. §2: the primary go-to-market becomes decorators and print shops moving from wholesale blanks to private label; independent apparel brands second.

Ownership is decided: Custm.ink Studio is a DBAI first-party product (Digital Boutique AI — Tim de Vallée, James). custm.ink is DBAI's house brand, not a client. Rewrite HANDOFF surprise #4 to state this as settled and remove the "confirm ownership before building" caveat. Seed data's organization becomes "Digital Boutique AI" with brands "Custm.ink" and "Exora Ink". Add `docs/ACCOUNTS.md` listing every external service (Clerk, Neon, Vercel, Anthropic, Stripe, Resend, Sentry, PostHog, domain registrar for custm.ink) with the owning DBAI login and who has access; TODO for any not yet created. Nothing may sit on a personal account.

Pilot customer: Exora Ink (Colin Jones), an existing DBAI client moving from decorating SanMar blanks to original cut-and-sew. Update HANDOFF "Pick up here":

- Item 3, PDF vertical slice: the hardcoded style is Exora's first real style, not the Riviera seed. Until his details arrive, keep the hoodie template with a `TODO(exora)` marker on every value that will be replaced; do not invent a second fictional garment. This slice is both the factory-acceptance test and the outbound demo.
- New item after 4: confirm Exora's first style is a hoodie before any template work; a tee or jogger means a new `lib/flats/templates/*.ts`.
- Exora is the pilot brand under the DBAI organization until Clerk orgs exist; on preview with a dev session until then.

Add `tests/schema-rules.test.ts` that fails if any table listed in item 5 lacks `source` and `accepted_at`, or if `products` lacks `brand_id`, once those tables exist. Stub it so it passes today and starts asserting when the tables appear. Leave `lib/sections/registry.ts` untouched.

Record every decision above in `docs/DECISIONS.md` as dated one-liners. Run `npm run verify`. Commit as `docs: amend scope — brands, public API/webhooks, free factory seats, AI provenance, DBAI ownership, Exora pilot`. Push. Then continue with HANDOFF item 3.
