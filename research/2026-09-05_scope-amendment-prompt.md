# Scope amendment prompt — paste into the custmink-studio Claude Code session

Read HANDOFF.md, CLAUDE.md, and CLAUDE_CODE_MASTER_PROMPT.md before doing anything. This is a scope amendment from a competitive teardown of Techpacker, Backbone PLM, Delogue, and the AI-native tech pack tools, plus a pilot-customer decision. Apply it to the docs and schema rules first, then resume HANDOFF item 3. Don't start Phase 2. Supporting research is in `docs/research/`.

Amend the master prompt — edit in place, mark each change with `<!-- amended 2026-09-05 -->`:

1. §5, new tables under "Product development": `brands` (organization → brands → collections → products). Brand-scoped: logo, primary color, PDF settings, currency, unit, and the libraries (materials, size charts, colors, artwork). `organization_settings` keeps org-level defaults only. Every product carries `brand_id` from the first Phase 2 migration — retrofitting this later rewrites every product row, so it goes in before any product child table exists.
2. §5, new tables under "Operations and collaboration": `api_keys` (prefix, sha256 hash, scopes read|write|export, last_used_at, revoked_at), `webhooks` (url, encrypted secret, event filter, active), `webhook_deliveries` (outbox: event, attempt, next_attempt_at, response). Events fan out from `activity_logs`. Payloads signed `X-Studio-Signature: sha256=HMAC(secret, timestamp.body)`, 5 retries with backoff, delivery log visible in the UI.
3. §4, add routes `/settings/developers` and `/api/v1/**`. The REST handlers wrap the same server actions the UI calls — one mutation path, two entry points. Every list endpoint supports cursor pagination and `updated_since`. `Idempotency-Key` on POST. RFC 9457 errors. OpenAPI generated from the Zod schemas at `/api/v1/openapi.json`.
4. §10, one sentence: factory guests are free and unlimited on every plan and never count toward user limits. Per-supplier seat fees are the top pricing complaint about the incumbents.
5. §5 rule for every row table that AI can write to (bom_items, points_of_measure, measurement_values, construction_instructions, packaging_items, artwork_placements): `source` enum manual|library|import|api|ai_draft and `accepted_at`. Applying an `ai_proposals` row copies `source: ai_draft`; accepting sets `accepted_at`. Provenance survives the proposal being closed.
6. §15: API + webhooks + developers page land in Phase 4 alongside share links. `brands` lands in the first Phase 2 migration. Add a Phase 2 item "start from a blank": create a product by seeding fabric, composition, weight, and size chart from a wholesale catalog SKU (SanMar data already exists in Supabase; treat it as an import source behind an interface, not a dependency).

Then update HANDOFF.md "Pick up here":

- Item 3, PDF vertical slice: the hardcoded style is no longer the Riviera seed. It is the first real style from Exora Ink (Colin Jones), an existing DBAI client moving from decorating SanMar blanks to original cut-and-sew. Until his details arrive, keep the hoodie template with a `TODO(exora)` marker on every value that will be replaced; do not invent a second fictional garment. This slice is both the factory-acceptance test and the outbound demo.
- New item after 4: confirm Exora's first style is a hoodie before any template work; a tee or jogger means a new `lib/flats/templates/*.ts`.
- Update surprise #4: Exora is now the designated pilot, org #1 once Clerk is wired; on preview with a dev session until then.

Add to `lib/sections/registry.ts` nothing — but add `tests/schema-rules.test.ts` that fails if any table listed in item 5 lacks `source` and `accepted_at`, and if `products` lacks `brand_id`, once those tables exist. Stub it so it passes today and starts asserting when the tables appear.

Record all of the above in `docs/DECISIONS.md` as dated one-liners. Run `npm run verify`. Commit as `docs: amend scope — brands, public API/webhooks, free factory seats, AI provenance, Exora pilot`. Then continue with HANDOFF item 3.
