# Custm.ink Studio

Multi-tenant SaaS where apparel brands build, review, version, share, and export
factory-ready tech packs. Next.js 16 App Router · TypeScript strict · Tailwind 4 ·
Neon Postgres · Drizzle · Vercel.

`CLAUDE_CODE_MASTER_PROMPT.md` is the product spec. `docs/reports/phase-N.md`
records what each phase actually delivered. The pre-migration prototype is
preserved under `archive/vinext-prototype/` — read-only reference, never a build
target.

---

## Commands

```bash
npm run dev          # next dev
npm run typecheck    # tsc --noEmit
npm run lint         # eslint .
npm run test         # vitest run
npm run build        # next build
npm run db:generate  # drizzle-kit generate  (after editing db/schema.ts)
npm run db:migrate   # apply migrations
npm run db:seed      # development seed — never run against production
```

All four of typecheck, lint, test, and build must pass before a phase is
considered done.

---

## Rules that are specific to this codebase

These are the ones that get written wrong here. The global rules in
`~/.claude/CLAUDE.md` (deployment workflow) and
`~/.claude/CLAUDE-neon-compute-rules.md` (compute discipline) still apply in full.

### Tenancy

- **Tenant scoping lives in `lib/data/*` and `lib/actions/*`, never in a component.**
  Filtering in the UI is not security.
- Every query takes `organizationId` from `getSession()` — **never** from a
  function argument, a route param, a request body, or AI output. If a caller can
  choose the organization, the boundary is already gone.
- Every tenant-owned table carries `organization_id` and an index that includes it.
- `lib/auth/permissions.ts` is the only authority on what a role may do. Call
  `assertCan(session.role, capability)` in data modules, server actions, route
  handlers, background jobs, exports, and uploads.

### Server boundary

- `import "server-only"` is the **first line** of every file under `lib/data/`,
  `lib/actions/`, `lib/auth/`, and `db/`.
- `db()` in `db/index.ts` is lazy on purpose — a build or a route that never
  touches Postgres must not wake the database.

### Rendering — this is the expensive mistake

- **Clerk's `auth()` may only be called inside `app/(app)/**`.** Never in
  `app/layout.tsx`, never under `app/(public)/**`, never in middleware matching a
  public path. `auth()` reads cookies, so one line in the root layout opts the
  entire app into dynamic rendering and silently voids every `revalidate` in the
  tree. Bot traffic then keeps Neon awake continuously. This is the single
  highest-probability compute regression in this repo.
- Public routes declare an explicit `export const revalidate`. Freshness comes
  from on-write revalidation, never from a short window.
- No database write in a render path. Ever.

### Mutations

- A server action does three things in order: `requireSession()` →
  `assertCan(...)` → write → `revalidateTag(...)`.
- **A server action without a `revalidateTag` is a bug, not a style choice.** Reads
  are cached for an hour; without the tag the UI silently serves stale data.
- Tags come from the section registry (`lib/sections/registry.ts`), not string
  literals scattered through the codebase.

### Drizzle

- **Correlated subqueries render their columns unqualified.** This shipped a real
  bug: `product_id = id` compared a row to itself and scored every product 0%
  readiness. Use a grouped left join instead — see the `completeSectionCount`
  aggregate in `lib/data/products.ts`.
- Never hand-edit a file in `drizzle/`. Change `db/schema.ts` and run
  `npm run db:generate`.
- Migrations are additive. A `DROP TABLE`, `DROP COLUMN`, or column type change
  needs an expand/contract plan and a rollback path.

### Deployments

- Vercel Deployment Protection is on, so a plain `curl` against a deployment
  returns an SSO redirect, not your page. Use `vercel curl <url>` — and put curl's
  own flags **after** the URL.
- Migrations never run in the Vercel build. Deploy, verify the preview, then run
  `npm run db:migrate` explicitly.

### Off limits

- `archive/**` — the preserved prototype. Never edit, never import from it.
- `.env.local` — real credentials, gitignored. `.env.example` carries placeholders.

---

## Patterns to follow

**The vertical slice.** Every tech-pack section repeats the same shape. Copy it
rather than inventing a new one:

```
db/schema.ts                          table + indexes
drizzle/NNNN_*.sql                    generated migration
lib/sections/registry.ts              entry: id, table, capability, tag
lib/data/<section>.ts                 server-only reads, cache() + unstable_cache
lib/actions/<section>.ts              server actions, assertCan + revalidateTag
components/techpack/panels/<x>.tsx    client panel
app/(app)/products/[productId]/<x>/   route
tests/sections/<section>.test.ts      tests
```

Reference implementations already in the repo:

- `lib/data/products.ts` — server-only reads, React `cache()` for per-request
  dedupe, `unstable_cache` with an org-scoped tag, `assertCan`, tenant filter
- `lib/auth/permissions.ts` — capabilities and `assertCan`
- `lib/data/product-mapping.ts` — pure mapping kept free of DB imports so it is
  unit-testable
- `lib/navigation.ts` and `components/icon.tsx` — plain-data config with
  name-keyed icons, safe to import on the server
- `scripts/seed.ts` — idempotent upserts
- `tests/routes.test.ts` — structural tests asserting required route files exist

---

## Current state — read before assuming

Phase 1 is complete; phases 2–6 are not. Two Phase-1 bridges exist and will be
removed, so do not build on them:

- **`lib/auth/session.ts` has no real auth provider.** It returns a development
  session gated behind `ALLOW_DEV_SESSION`, set on preview only. Production has no
  session and therefore renders the demo dataset. Wiring Clerk means replacing the
  body of `resolveSession` — every caller already goes through `requireSession()`.
- **`lib/draft-store.ts` keeps created tech packs in `localStorage`** because no
  create action exists yet. Phase 2 replaces it with a server action.

Colorways, BOM rows, measurements, and the workflow lists still read from
`lib/demo-data.ts`. Their tables arrive with the Phase 2 screens; the reader
signatures in `lib/data/` are already product-scoped so only the bodies change.
