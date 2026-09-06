# Phase 2 — Complete tech pack CRUD (in progress)

Master prompt section 16 requires a report per phase. Phase 2 is **partially
delivered**: the brand layer and the BOM section are complete and persisted;
colorways, measurements, construction and packaging still read the demo dataset.
This report covers what has actually shipped, so the next session does not have
to infer it.

Last updated: 2026-09-05.

---

## What was completed

**The brand layer (2026-09-05 amendment).** `organization → brands →
collections → products`. Every product and collection carries `brand_id`, NOT
NULL. This had to land before any product child table existed, because
retrofitting it rewrites every product row.

**The BOM section, end to end.** `materials` (a brand-scoped reusable library)
and `bom_items` (product-scoped rows), with reads, server actions, a wired
panel, and provenance. This is the reference vertical slice for the remaining
sections — copy it rather than inventing a new shape.

**AI-draft provenance is live.** `bom_items` and `materials` carry `source`
(`manual | library | import | api | ai_draft`) and `accepted_at`. The columns
come from a shared `provenance` spread in `db/schema.ts` so they cannot drift
between tables.

**The product was renamed** from Custm.ink Studio to **The Studio™**. The name
now lives in `lib/brand.ts` rather than in twenty-five hardcoded page titles.

## Screens and routes completed

| Route | State |
|---|---|
| `/products/[productId]/bom` | **Real persistence.** Add, edit-on-blur, soft delete. Read-only with the demo dataset when there is no session. |
| `/products/[productId]/export` | Now renders the *real* BOM rather than the demo rows. |

No new routes. The BOM route already existed; its data source changed.

## Database migrations added

Three, in a deliberate expand → backfill → contract sequence:

| Migration | Contents |
|---|---|
| `0001_woozy_squadron_supreme.sql` | **Expand.** `row_source` enum, `brands` table, `brand_id` added to `products` and `collections` **as nullable**. |
| *(no migration)* | **Backfill.** `npm run db:backfill-brands` creates one default brand per organization and assigns every existing row. Idempotent, and refuses to report success while any row is still null. |
| `0002_fancy_punisher.sql` | **Contract.** `brand_id` SET NOT NULL on both tables. |
| `0003_fantastic_chameleon.sql` | `bom_row_type` enum, `materials` and `bom_items` tables. |

**Why three and not one.** `ALTER TABLE products ADD COLUMN brand_id uuid NOT
NULL` fails outright against a populated table. Generating the final state in
one migration would have produced a migration that cannot run anywhere that has
data — which is every environment except a fresh one.

**Rollback path.** 0002 reverses with `ALTER TABLE ... ALTER COLUMN brand_id
DROP NOT NULL` on both tables; the column and its data stay, so it is safe to
roll back and re-apply. 0001 and 0003 are additive: rolling them back means
dropping `brands`, `materials`, `bom_items` and the two enums, which destroys
data and should be treated as a restore-from-snapshot rather than a rollback.

**One rule was left unsatisfied deliberately.** HANDOFF item 9 plans a
`tests/migrations.test.ts` that fails on `ALTER COLUMN` unless annotated
`-- expand-contract:` in the SQL. 0002 is exactly such a migration, but CLAUDE.md
says never hand-edit a file in `drizzle/`, and drizzle-kit will not emit the
comment. Whoever writes that test needs to resolve the conflict — either allow
`SET NOT NULL`, or read the plan from a report like this one instead of from the
SQL.

## APIs and jobs added

- `lib/actions/bom.ts` — the first module in `lib/actions/`:
  `createBomItem`, `updateBomItem`, `deleteBomItem` (soft), `reorderBomItems`.
- `lib/data/bom.ts` — `listBomItems`, `getBomGridRows`.
- `lib/data/brands.ts` — `listBrands`, `getDefaultBrand`.
- `lib/bom/rows.ts` — pure zod input schema and display mapping.

No background jobs.

## Tests run and exact results

`npm run verify` (typecheck, eslint, vitest, Neon preflight): **exit 0**.
`npm run build`: **exit 0**.

**187 tests across 11 files**, up from 167. New: `tests/bom.test.ts` (20).

Runtime verification, because green tests are not evidence the feature works:

- Seeded BOM renders from Postgres on `/products/<id>/bom` — the four seeded
  rows, not the demo fallback.
- "Add row" through the real UI wrote a row at position 4 with
  `source = manual` and `accepted_at` set.
- "Delete" soft-deleted it: `deleted_at` set, row still present, live count back
  to 4.

## Security checks completed

- Every action: `requireSession()` → `assertCan(session.role, "product:update")`
  → write → `updateTag(...)`.
- **No action input accepts an `organizationId`.** The tenant comes from the
  session only; `tests/bom.test.ts` asserts the input schema has no such slot.
- Update and delete filter on `id AND organization_id`, so a valid uuid from
  another tenant matches zero rows rather than someone else's data.
- All free text is trimmed and length-bounded; a cleared field becomes `NULL`,
  not `""`.
- The four project lint rules pass, including `require-capability-check` — which
  caught `getDefaultBrand` delegating its authorization to `listBrands`.

## Known limitations

- **Four Phase-2 sections are still demo data**: colorways, measurements,
  construction, packaging. `PENDING_PHASE_2_TABLES` in `tests/bom.test.ts` is
  the list, and it fails in both directions so it cannot go stale.
- **No `tests/isolation.test.ts` yet.** Tenancy is proven structurally (lint,
  schema shape, input schema) but not yet by two seeded organizations reading
  each other's rows. Now possible for the first time, because mutations exist.
- `reorderBomItems` issues one UPDATE per row. Fine at BOM scale (tens of rows);
  it would need a single `CASE` statement at hundreds.
- The BOM panel has no optimistic delete — the row disappears on refresh, not on
  click.
- "Suggest with AI" is disabled, not implemented.
- `materials` has no library UI. Rows are created by the seed and by BOM writes.

## Environment variables added

None.

## Manual setup still required

- **Run `npm run db:backfill-brands` before applying 0002** in any environment
  that already has product rows. Production has none, so ordinary deploy order
  is safe there.
- Clerk is still the hard blocker for real tenancy (HANDOFF item 1).

## Production URL

https://techpack.intlo.com — public, no auth gate. Production has no session, so
the BOM grid renders read-only demo data and touches no database.

## Next phase plan

Repeat the BOM slice for colorways, measurements, construction and packaging,
then `tests/isolation.test.ts` with two seeded organizations on a Neon branch.
That last one is the test that actually proves tenancy; everything shipped so
far proves only shape.
