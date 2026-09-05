# Custm.ink Studio — source-level review vs. the TechPack teardown spec

Revised 2026-09-05 after cloning `DigitalBoutique-ai/custmink-studio` (commit 7803e44). Supersedes the deployed-only analysis: the Sep 1 production build is behind the repo and renders demo data by design (no session in prod).

## What the repo actually is

Phase 1 of a 6-phase build, complete and green. Next 16.2 / React 19 / Tailwind 4 / shadcn, Drizzle 0.45 on Neon PG17, Zod, Vitest (124 tests, 8 files), CI, custom eslint plugin enforcing tenancy shape. Nine tables live (`users, organizations, memberships, organization_settings, collections, products, product_section_statuses, product_versions, activity_logs`); ~36 more specified in `CLAUDE_CODE_MASTER_PROMPT.md` §5. Session boundary built (`requireSession()`), Clerk chosen but unkeyed. Central capability model with six roles including `factory_guest`. `lib/sections/registry.ts` is the single source for nav, readiness, cache tags, route tests. Parametric flats: the model emits `FlatSpecV1` (enums + bounded numerics, no identifiers) and SVG geometry renders deterministically — one template (`hoodie`) so far. `HANDOFF.md` already pulled the PDF + AI drafting spike ahead of Phase 2.

Corrections to the earlier analysis: versioning is already immutable snapshots with approval (`product_versions.snapshot`, master prompt §8 "PDF must reflect an immutable selected version"); the "factory live link" copy is prototype residue, not the plan. Share links, comments, sampling, approvals, PDF, AI-with-review, Stripe are all specified; they're just Phases 2–6.

## What the teardown adds that the master prompt lacks

| Gap | Evidence | Add |
|---|---|---|
| **Public API + webhooks** | Zero mentions outside Stripe/job webhooks. No `api_keys`/`webhooks` tables in §5. | `api_keys`, `webhooks`, `webhook_deliveries` in §5; `/api/v1` over the same server actions; `/settings/developers`. Slot into Phase 4 (after CRUD, with share links). This is the #1 wedge — no competitor under $100/mo has it, and it's what makes the product n8n/Shopify/WooCommerce-native. |
| **Brand layer under organization** | `organization_settings` holds *the* brand logo/color; org = brand. DBAI runs many client brands; Exora would too. | `brands` table (org → brands → collections → products), brand-scoped libraries and PDF settings, sidebar brand switcher. Add in Phase 2 — it touches every product row and gets expensive to retrofit. |
| **Factory seats never count toward plan limits** | §10 tiers count users (1/5/20). `factory_guest` exists but pricing silence is a risk. | One sentence in §10: token guests are free and unlimited on every plan. Per-supplier seat fees are the top complaint about Techpacker/Backbone. |
| **AI-draft provenance on rows** | HANDOFF adds `ai_proposals` (review-before-apply). Once applied, rows lose origin. | `source` enum + `accepted_at` on BOM/POM/construction rows. Cheap now, impossible later. |
| **Blank-as-reference-garment** | Not in scope anywhere. Print shops going private-label start from a wholesale blank (SanMar) they already sell. | "Start from a blank": seed materials + size chart + measurements from a catalog SKU, then edit. James already holds 50k SanMar records in Supabase. Differentiator for the Exora-type customer. |

Not worth relitigating: Clerk vs Supabase auth, Neon/Drizzle app-layer scoping vs RLS, React PDF vs Gotenberg, Inngest vs Postgres queue. Their choices are coherent and tested; adopt them.

## Sequencing recommendation

Keep HANDOFF's order (Clerk → PDF spike → hoodie template → generator → Phase 2), with two changes: put `brands` in the first Phase 2 migration, and make the PDF spike's hardcoded style a **real** garment from a real customer rather than the Riviera seed — see Exora below.

## Exora Ink (Colin Jones) as pilot customer

Exora is a custom-apparel decoration business (SanMar blanks → WooCommerce, DTF, ops app with five staff) and James's existing client. Colin wants to create original apparel, which means cut-and-sew tech packs for a factory. HANDOFF surprise #4 names Exora as "the obvious source of production-side feedback." Concretely:

1. Make Colin's first style the PDF vertical-slice subject. Real garment, real factory response, and the outbound demo comes out of it.
2. Confirm the first style is a hoodie — the only flat template. A tee or jogger needs a new `lib/flats/templates/*.ts` (~300 lines of geometry each).
3. What to collect from Colin: reference blank (SanMar SKU), target fit changes, fabric/weight, trims and labels, artwork, colorways, target factory and MOQ, sample-round plan.
4. Exora becomes org #1 (or brand #1 under a DBAI org) once Clerk is wired; until then, run it on preview with a dev session.
5. His finished style flows back into WooCommerce via the API + n8n — the exact integration the API wedge is for, on a pipeline James already runs.
