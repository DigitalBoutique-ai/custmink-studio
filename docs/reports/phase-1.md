# Phase 1 report — Foundation

**Date:** 2026-08-31
**Scope:** Phase 1A runtime migration, Phase 1B database and authorization foundations.

---

## 1. What was completed

### Phase 1A — runtime migration

The supplied prototype was a Vite + `vinext` + Cloudflare Workers app
(`package.json` name `site-creator-vinext-starter`, `wrangler` dev, `worker/index.ts`
entry), not the Next.js on Vercel stack the master prompt requires. Phase 1A
replaced the runtime and decomposed the single-component prototype.

- Committed the prototype untouched as the migration baseline (`9bf919a`), then
  moved it to `archive/vinext-prototype/`. It is preserved, not deleted, and its
  dependencies still install and run for side-by-side comparison.
- Removed Vite, vinext, Wrangler, `@cloudflare/vite-plugin`, `worker/`,
  `vite.config.ts`, and the Cloudflare build scripts from the working tree.
- Stood up Next.js 16.2.6 (App Router, React 19.2.6, TypeScript strict,
  Tailwind 4) with `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`
  (native flat config), and `tsconfig.json` with `noUncheckedIndexedAccess`.
- Split `tech-pack-studio.tsx` (34.5 KB, one file, 20 inner components) into
  layouts, routes, feature components, panels, types, and data modules.
- Ported `globals.css`, the vendored shadcn stylesheet, public assets, and the
  seven shadcn components actually used.

### Phase 1B — database, tenancy, authorization

- Neon Postgres project provisioned, schema migrated, development data seeded.
- Drizzle schema with nine tables, UUID keys, organization scoping, timestamps,
  soft deletes, and indexes on the columns the UI filters by.
- Central authorization service covering all six roles from master prompt §6.
- Server-only session boundary with a pluggable provider (Clerk drops in).
- Product reads now come from Postgres, scoped to the session's organization and
  gated on `product:read`, with readiness derived from section statuses.

---

## 2. Screens and routes completed

36 routes build. All 35 requestable routes verified 200 on the preview
deployment.

**Authenticated** (`app/(app)/`) — `/dashboard`, `/products`, `/products/new`,
`/products/[productId]` (redirects to overview) and its ten sections
(`/overview`, `/design`, `/colorways`, `/bom`, `/artwork`, `/measurements`,
`/sampling`, `/construction`, `/packaging`, `/history`), `/collections`,
`/libraries/{sketches,materials,artwork,colors,size-charts,attachments}`,
`/suppliers`, `/purchase-orders`, `/activity`,
`/settings/{organization,team,brand,billing}`.

**Public / token-gated** (`app/(public)/`) — `/sign-in`, `/sign-up`,
`/share/[token]`, `/share/[token]/comments`, `/accept-invite/[token]`.

**Other** — `/` (redirects to `/dashboard`), `/robots.txt`.

Fully built screens: dashboard, products list, all nine library screens, the
product workspace shell, and all ten product sections. `/activity` and the four
settings screens are reserved routes that state which phase delivers them.

Per-screen fidelity against the prototype: `docs/compatibility-checklist.md`
(60 rows, four disclosed deviations).

---

## 3. Database migrations added

`drizzle/0000_large_mandarin.sql` — applied to the Neon `production` branch.

Nine tables: `users`, `organizations`, `memberships`, `organization_settings`,
`collections`, `products`, `product_section_statuses`, `product_versions`,
`activity_logs`. Three enums: `membership_role`, `product_status`,
`section_status`.

Every tenant-owned row carries `organization_id`. Indexes cover
`(organization_id, status)`, `(organization_id, updated_at)`, and a unique
`(organization_id, article_code)`.

The remaining tables from master prompt §5 — colorways, BOM, measurements,
sampling, sharing, AI jobs, exports, billing — land in the phases that own those
screens.

---

## 4. APIs and jobs added

None. Phase 1 is read-only: no route handlers, server actions, or background
jobs yet. Data access is through server-only modules:

- `lib/data/products.ts` — `listProducts`, `getProduct`, plus colorway/BOM/
  measurement readers still on demo data
- `lib/data/libraries.ts` — `getLibrary`, `getWorkflow`
- `lib/data/product-mapping.ts` — readiness scoring, status labels, relative time
- `lib/auth/permissions.ts` — roles, capabilities, `can`, `assertCan`
- `lib/auth/session.ts` — `getSession`, `requireSession`
- `db/index.ts` — lazily constructed Neon HTTP client

---

## 5. Tests run and exact results

```
$ npx tsc --noEmit
TypeScript: No errors found

$ npx eslint .
(no output — clean)

$ npx vitest run
 ✓ tests/permissions.test.ts      (10 tests)
 ✓ tests/product-mapping.test.ts  (11 tests)
 ✓ tests/routes.test.ts           (34 tests)
 ✓ tests/data.test.ts              (8 tests)
 Test Files  4 passed (4)
      Tests  63 passed (63)

$ npm run build
✓ Compiled successfully
✓ Generating static pages (23/23)
36 routes
```

Coverage: role/capability matrix for all six roles, `AuthorizationError`
behaviour, readiness scoring including clamping, status-label mapping, relative
timestamps, presence of every route file the master prompt requires, sidebar
links resolving to real pages, and demo-data integrity (hex colours, BOM column
counts, monotonic size grading).

Manual verification: every ported screen compared against the running prototype
at 1440×900 and 390×844, zero console errors, and the create-tech-pack wizard
driven end to end (two steps → draft created → routed to its workspace →
persisted across a full reload).

---

## 6. Security checks completed

- Tenant scoping enforced in the data-access layer, not the UI: every product
  query filters on the session's `organization_id`.
- Central authorization service; `assertCan` guards reads. No capability is
  granted implicitly — each role's set is written out explicitly and tested.
- Factory guests are confined to `product:read` and `comment:create`, asserted
  against the full capability list.
- `server-only` on every data, session, and database module, so none can be
  pulled into a client bundle.
- Environment variables parsed with Zod and failing loudly by name.
- No secrets in the repo: `.env.local` is gitignored (verified with
  `git check-ignore`); `.env.example` carries placeholders only.
- Production refuses to issue a development session unless `ALLOW_DEV_SESSION`
  is explicitly set. It is set on preview only, never production.
- Vercel Deployment Protection is on, so neither deployment is publicly readable.
- `robots.ts` disallows every workspace, API, share, and invite path.
- Neon compute preflight gate passes: no `force-dynamic`, no `revalidate = 0`,
  no `cookies()`/`headers()`/`draftMode()` in any layout, no polling intervals,
  no writes in a render path, no crons, and every public route declares an
  explicit `revalidate`.

---

## 7. Known limitations

1. **No real authentication.** Clerk needs account credentials that are not
   configured (§9). `lib/auth/session.ts` ships the boundary and returns a
   development session gated behind `ALLOW_DEV_SESSION`. Every caller already
   goes through `requireSession()`, so wiring Clerk is a single function body.
2. **No mutations.** Editing BOM rows, measurements, colorways, and canvas state
   is still client-only, exactly as the prototype behaved. Phase 2 adds server
   actions and `revalidateTag(productsTag(orgId))`.
3. **Locally created drafts.** The wizard writes to `lib/draft-store.ts`
   (`localStorage`), so a new tech pack is visible only in that browser and its
   tab title reads "Tech pack". Phase 2 replaces this with a server action.
4. **Colorways, BOM, measurements, workflow lists still read demo data.** Their
   tables arrive with the Phase 2 screens; the reader signatures are already
   product-scoped.
5. **Section ticks are static.** The overview checklist and the "3 sections need
   input" caption come from config, not `product_section_statuses`. The headline
   readiness percentage *is* derived.
6. **Readiness numbers differ from the prototype** (60/60/100 vs 82/54/100) —
   the prototype's static figures contradicted its own checklist. Disclosed in
   the compatibility checklist.
7. **No on-write revalidation yet.** Product reads use `unstable_cache` with a
   1-hour window, so reseeding is not visible until the window lapses or the
   build cache is cleared. Correct per the Neon compute rules, but worth knowing
   during development.
8. **Production renders demo data.** With no session provider, production has no
   organization context and falls back to the demo dataset. Preview is the
   database-backed environment until Clerk lands.
9. **No Playwright suite yet.** Master prompt §14's end-to-end flows depend on
   auth and mutations; they are Phase 2+.

---

## 8. Environment variables added

| Variable | Where | Purpose |
|---|---|---|
| `DATABASE_URL` | local, preview, production, development | Neon pooled connection for app reads |
| `DATABASE_URL_UNPOOLED` | local, preview, production, development | Direct endpoint for `drizzle-kit` migrations |
| `DEV_ORGANIZATION_ID` | local, preview | Development-session organization (temporary) |
| `DEV_USER_ID` | local, preview | Development-session user (temporary) |
| `ALLOW_DEV_SESSION` | preview only | Permits the development session outside development |
| `VERCEL_OIDC_TOKEN` | local | Added by `vercel link`, gitignored |

All three are placeholders that Clerk replaces. `.env.example` documents the set.

---

## 9. Manual setup still required

1. **Clerk** — create the application, then set `CLERK_SECRET_KEY` and
   `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, replace the body of `resolveSession` in
   `lib/auth/session.ts`, and delete `DEV_ORGANIZATION_ID` / `DEV_USER_ID` /
   `ALLOW_DEV_SESSION`. **This is the one blocker for finishing Phase 1B.**
2. **Neon preview branches** — connect the Neon Vercel integration so preview
   deployments get their own branch instead of sharing the production branch.
3. Later phases: Vercel Blob, OpenAI, Stripe, Resend, Inngest, Sentry, PostHog.

Unrelated finding, not changed: the separate `custm-ink` Neon project
(`odd-breeze-02558903`, the custm.ink site) runs at 1 CU with scale-to-zero
disabled, which contradicts the project's Neon compute rules. Worth a look.

---

## 10. Deployment

| | |
|---|---|
| Vercel project | `digitalboutique/custmink-studio` |
| Preview URL | https://custmink-studio-q4kx728va-digitalboutique.vercel.app |
| Production URL | https://custmink-studio-4amjcrp8i-digitalboutique.vercel.app |
| Neon project | `custmink-studio` (`purple-king-22972792`), AWS us-east-1, PG 17 |
| Neon compute | 0.25 CU ceiling, 5-minute scale-to-zero |
| Branch | `production` (`br-old-mouse-awc54igd`), database `custmink_studio` |

Both deployments sit behind Vercel Deployment Protection and need a Vercel
login. The first deploy was auto-promoted to production by Vercel; it carries no
session variables, so it renders the demo dataset rather than tenant data. The
preview deployment is the database-backed one.

Rollback: `vercel rollback <previous-deployment-url>`, or promote a known-good
deployment from the Vercel dashboard. The database has no destructive migration
to unwind — `0000` is additive and the app is read-only.

---

## 11. Next phase plan

**Finish Phase 1B** (blocked on credentials): wire Clerk, map Clerk users and
organizations onto `users` / `organizations` / `memberships` on first sign-in,
enforce `requireSession()` in the `(app)` layout, and delete the development
session path.

**Phase 2 — complete tech pack CRUD:**

1. Tables for colorways, BOM items, materials, size charts, points of measure,
   measurement values, construction, packaging, suppliers, attachments.
2. Server actions for every section, each calling `assertCan` and
   `revalidateTag(productsTag(organizationId))` on write.
3. Autosave with conflict detection; real per-section completion driving the
   readiness score and the checklist ticks.
4. Replace the draft store with a real create action.
5. Integration tests for organization isolation — the cross-tenant read must
   fail — plus autosave and section CRUD.
6. Activity log written on every mutation, surfaced at `/activity`.
