# The Studio™

Multi-tenant SaaS where apparel brands build, review, version, share, and export
factory-ready tech packs. Next.js 16 App Router · TypeScript strict · Tailwind 4 ·
Neon Postgres · Drizzle · Vercel.

`CLAUDE_CODE_MASTER_PROMPT.md` is the product spec. `HANDOFF.md` is the current
state and what to pick up next — read it first. `docs/reports/phase-N.md`
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

- **Clerk's `auth()` may only be called inside `app/(app)/**` and
  `app/(onboarding)/**`.** Never in `app/layout.tsx`, never under
  `app/(public)/**`, never in `proxy.ts` logic for a public path. `auth()` reads cookies, so one line in the root layout opts the
  entire app into dynamic rendering and silently voids every `revalidate` in the
  tree. Bot traffic then keeps Neon awake continuously. This is the single
  highest-probability compute regression in this repo.
- Public routes declare an explicit `export const revalidate`. Freshness comes
  from on-write revalidation, never from a short window.
- No database write in a render path. Ever.

### Mutations

- A server action does four things in order: `requireSession()` →
  `assertCan(...)` → write → invalidate the section's cache tag.
- **A server action that does not invalidate is a bug, not a style choice.** Reads
  are cached for an hour; without it the UI silently serves stale data.
- **Use `updateTag(tag)`, not `revalidateTag(tag)`.** Next 16 changed this:
  `revalidateTag` now takes a required cache-life profile and purges for
  *future* requests, while `updateTag` exists for server actions and gives
  read-your-own-writes. With `revalidateTag` the person who just saved a row can
  be served the cached list that predates it — the exact failure this rule is
  about. See `lib/actions/bom.ts`.
- Tags come from the section registry (`lib/sections/registry.ts`), not string
  literals scattered through the codebase.

### Brands

- The hierarchy is organization → brands → collections → products. The
  organization is the account; the **brand** is what a factory sees on the tech
  pack. Anything brand-facing (logo, colour, PDF settings, currency, unit, and
  the libraries) belongs on `brands`; `organization_settings` keeps org-level
  defaults only.
- Every product and collection carries `brand_id`, NOT NULL. New tenant-owned
  tables that a factory sees should carry it too.
- `custm.ink` is a DBAI apparel **brand** and a domain. It is not the product's
  name — the product is The Studio™, and its name lives in `lib/brand.ts`.

### Provenance

- Every row table AI can write to carries `source`
  (`manual | library | import | api | ai_draft`) and `accepted_at`. Spread the
  `provenance` helper in `db/schema.ts` rather than redeclaring the columns.
- `source` defaults to `manual`: a path that forgets to set it records the row
  as human-entered, which is wrong in the safe direction. Defaulting to
  `ai_draft` would mark real work as unreviewed.
- `tests/schema-rules.test.ts` fails if one of the six listed tables lacks
  either column.

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

### Design system

- **Read `DESIGN.md` before generating or editing any UI** — a component, a
  stylesheet, a page, a dialog, an email, a PDF layout. It is the single source
  of truth for colour, type, shape, spacing and elevation.
- **Use its tokens as CSS variables.** The names in `DESIGN.md` are declared on
  `:root` in `app/globals.css` (`var(--linen)`, `var(--ember)`, `var(--radius-pill)`…)
  and mapped into the shadcn aliases that Tailwind utilities consume. Never
  hard-code a hex, radius, or shadow that has a token; if one is missing, add the
  token to `app/globals.css` **and** the table in `DESIGN.md` in the same change.
- **Ask before deviating.** A second accent colour, a square button, a cool-grey
  shadow, a different typeface — anything the Do/Don't lists rule out — is a
  question for the user, not a judgement call. Say what the design says, say
  what you want to do instead and why, and wait.
- The marketing site (`app/(marketing)/**`) is the one documented exception:
  it pins its own legacy palette on `.mk-site`. Do not migrate it as a side
  effect of other work.

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
lib/<section>/rows.ts                 pure: zod input schema + display mapping
lib/actions/<section>.ts              server actions, assertCan + updateTag
components/techpack/panels/<x>.tsx    client panel
app/(app)/products/[productId]/<x>/   route
tests/<section>.test.ts               tests
```

`lib/<section>/rows.ts` is not optional decoration: `server-only` throws under
Vitest, so validation and mapping placed inside `lib/data/` or `lib/actions/`
cannot be tested at all. Keep the part that decides *what a valid row is*
outside the server boundary.

Reference implementations already in the repo:

- **`db/schema.ts` + `lib/data/bom.ts` + `lib/actions/bom.ts` + `lib/bom/rows.ts`
  — the complete Phase 2 slice.** Start here for any new section.

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

Phase 1 is complete. **Phase 2 is in progress**: `brands`, `materials` and
`bom_items` have shipped with real persistence, and the BOM section reads and
writes Postgres through `lib/data/bom.ts` and `lib/actions/bom.ts` — copy that
slice rather than inventing a new shape. Colorways, measurements, construction
and packaging still read `lib/demo-data.ts`; `tests/bom.test.ts` tracks which,
and fails if the list falls out of step with the schema in either direction.

Auth is Clerk (Vercel Marketplace) for identity plus a **seat** in Postgres for
authorization: `users.external_id` is the Clerk user id, and a session needs a
`memberships` row. Seats are provisioned by email
(`npm run member:add -- --email … --org <slug> --role owner`) and claimed at
`/welcome` on first sign-in — `lib/seats/rules.ts` is the decision,
`lib/auth/claim.ts` the one write that precedes `requireSession()`. Creating a
Clerk account grants nothing on its own.

One Phase-1 bridge remains, so do not build on it:

- **`lib/draft-store.ts` keeps created tech packs in `localStorage`** because no
  create action exists yet. Phase 2 replaces it with a server action.

Colorways, measurements, and the workflow lists still read from
`lib/demo-data.ts`. Their tables arrive with the remaining Phase 2 screens; the
reader signatures in `lib/data/` are already product-scoped so only the bodies
change.
