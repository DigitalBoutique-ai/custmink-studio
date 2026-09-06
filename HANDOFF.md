# Handoff — The Studio™

*(formerly Custm.ink Studio; renamed 2026-09-05. `custm.ink` is still a DBAI
apparel brand, and `custmink-studio` is still the repo/Vercel/Neon project id.)*

Multi-tenant SaaS where apparel brands build, review, version, share, and export
factory-ready tech packs. `CLAUDE_CODE_MASTER_PROMPT.md` is the product spec;
`CLAUDE.md` is the working agreement for anyone (human or agent) touching this
repo. Read both before changing anything.

Last updated: 2026-09-06 (design system + /about).

> **Read `git status` before staging anything.** As of this handoff a second
> session is wiring Clerk in this checkout, **uncommitted**: `proxy.ts`,
> `ClerkProvider` in `app/layout.tsx`, real session resolution in
> `lib/auth/session.ts`, `app/(onboarding)/welcome`, `lib/seats/`,
> `lib/auth/claim.ts`, Clerk catch-all sign-in/sign-up routes (the old pages
> deleted), `scripts/add-member.ts`, `tests/seat.test.ts`, and `@clerk/nextjs`
> in `package.json`. That work is blocked on Clerk keys. It is not in any
> commit. **Do not `git add -A`**; commit by explicit path, and do not build on
> those files until they land — see item 1 and surprise #25.
>
> **The 2026-09-05 scope amendment has been applied.** It is recorded in
> `docs/DECISIONS.md`, marked `<!-- amended 2026-09-05 -->` in the master
> prompt, and its two irreversible schema rules (`brands` + `brand_id`, and
> `source`/`accepted_at` provenance) are now enforced by
> `tests/schema-rules.test.ts` — assertions that are dormant today and arm
> themselves the moment those tables land. The research behind it is in
> `docs/research/`. **Read `docs/DECISIONS.md` before planning Phase 2**;
> two of its decisions are cheap now and expensive after the first product
> child table exists.

---

## Where things stand

**Phase 1 of 6 is complete.** Phases 2–6 are not started. One de-risking spike
is done.

| | |
|---|---|
| Source | 103 files across `app/ components/ lib/ db/ types/ tests/ scripts/ tools/` |
| Tests | 227 passing, 13 files (`npm run verify` exit 0 at handoff; `npm run build` exit 0) |
| Schema | 12 tables of ~48, 4 migrations applied (`0000`–`0003`) |
| Spec | `CLAUDE_CODE_MASTER_PROMPT.md` + the 2026-09-05 amendment; decisions in `docs/DECISIONS.md`, accounts in `docs/ACCOUNTS.md` |
| CI | `.github/workflows/ci.yml`, green on the last two runs |
| Repo | `DigitalBoutique-ai/custmink-studio` (private), Vercel git-connected — pushes to `main` deploy |
| Neon | `custmink-studio` / `purple-king-22972792`, us-east-1, PG 17, 0.25 CU, 5-min scale-to-zero |
| Production | https://techpack.intlo.com — `/`, `/pricing`, `/about`, `/demo` are the static marketing site; every `(app)` route is behind Clerk sign-in; no seats provisioned yet (item 1) |
| Stable preview alias | https://custmink-studio-git-main-digitalboutique.vercel.app |

**Verified at handoff** (`npm run verify`, exit 0): typecheck, eslint, 225
tests across 13 files, Neon compute preflight. `npm run build` exit 0 on the
working tree (which includes the other session's uncommitted Clerk files) and
on HEAD alone in a throwaway worktree. Production checked after the last push:
`/` `/pricing` `/demo` `/sitemap.xml` 200, `x-vercel-cache: HIT`,
`/dashboard` → 307 `/sign-in`. **Not run:** Playwright end-to-end (none
written; the marketing pages were checked interactively), `db:migrate` (no
pending migrations).

What actually works end to end: the full prototype UI on real routes, products
and readiness read from Postgres scoped to an organization, the create-tech-pack
wizard, and a parametric hoodie flat renderer.

The commercialization plan this session worked from lives at
`~/.claude/plans/now-what-would-it-abundant-lynx.md` — it has the phase
sequencing, cost model, and the reasoning behind the decisions below.

---

## Pick up here

**1. Clerk is live; the first seat is the next step — [WORK, needs the user's
email].** Landed 2026-09-06. Clerk (Marketplace resource `custmink-studio-clerk`,
a *development* instance — `pk_test`/`sk_test`) is identity only; authorization
is a **seat**: a `users` row keyed by email whose `external_id` is
`pending:<email>` until claimed, plus a `memberships` row. Provision one with
`npm run member:add -- --email <addr> --org <slug> --role owner --create-org "<Name>"`
against the target `DATABASE_URL` (production has no organizations — it was
never seeded), then the person signs in, lands on `/welcome`, and clicks "Claim
my seat", which links the row to their Clerk id (`lib/auth/claim.ts`, the one
write that precedes `requireSession()`). A Clerk account with no seat sees "No
seat has been set up for this email" — sign-up is open but grants nothing.

Shape: `proxy.ts` runs `clerkMiddleware()` on every non-static path;
`lib/auth/session.ts` resolves Clerk `auth()` → `users` → first membership;
`app/(app)/layout.tsx` sends no-session to `/sign-in` and signed-in-but-no-seat
to `/welcome`; `lib/seats/rules.ts` is the pure decision, tested in
`tests/seat.test.ts`. `/sign-in` and `/sign-up` are optional catch-alls with
`generateStaticParams` so the bare routes prerender (Clerk's sub-steps render on
demand, cached 1h). CI builds with `vars.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` —
public by design; the secret key is not needed to build.

Still TODO before real customers: a **production Clerk instance** with a custom
domain (see `docs/ACCOUNTS.md`), and a workspace switcher — `pickMembership`
takes the first membership, so a person in two organizations always lands in
the older one. The `DEV_*` / `ALLOW_DEV_SESSION` code path is gone.

**2. Confirm Exora's first style is a hoodie — [DECISION, needs the client].**
Exora Ink is now the designated pilot (see "What shipped"). `hoodie` is the only
flat template that exists. A tee or a jogger means a new
`lib/flats/templates/*.ts` — roughly 300 lines of geometry — so this answer
gates the flat template and the PDF's subject matter. Also needed from them: reference blank SKU, target fit changes,
fabric and weight, trims and labels, artwork, colorways, target factory and MOQ.

**3. Anthropic credentials — [DECISION].** Blocks the AI structured-draft spike.
No `ANTHROPIC_API_KEY` and the `ant` CLI is not installed.

**4. Replace the `TODO(exora)` placeholders — [WORK, needs item 2].** The PDF
slice ships with every unresolved pilot value marked `TODO(exora)` and printed
as `TBC` rather than invented. `grep -rn "TODO(exora)" lib/` lists them:
supplier, target cost, MOQ, lead time, brand colour, the flat spec, and the
artwork rows. `tests/pdf.test.ts` asserts the unknown ones still read `TBC`, so
a plausible-looking invented value cannot slip in unnoticed.

**5. Finish the hoodie template — [WORK].** See "What surprised me" #6. It is a
credible schematic, not an illustrator-grade flat. The hood is still a plain
arch with no shaped face opening, which is now visible at print size in
`npm run pdf:preview`.

**6. Section generator — [WORK].** `scripts/gen/section.ts` plus
`.claude/skills/techpack-section/SKILL.md`. Deterministic parts get a script,
judgment parts get a skill. Emitted stubs must **throw**, never return a
plausible empty array — a silently-passing stub is how a section gets marked
done. The registry it generates against already exists.

**7. Neon branch-per-PR — [WORK].** Use Neon's own Vercel integration. A
hand-rolled Actions workflow that creates and reaps branches is ~200 lines of
rot.

**8. `scripts/verify-routes.ts` — [WORK].** Derive the post-deploy route-200
sweep from `lib/sections/registry.ts` plus `lib/marketing/nav.ts`, so it stops
being a manual curl loop. `app/sitemap.ts` now exists but is marketing-only by
design (the workspace is disallowed in robots); do not add app routes to it.

**9. `tests/migrations.test.ts` — [WORK].** Regex `drizzle/*.sql` for
`DROP TABLE|DROP COLUMN|ALTER COLUMN … TYPE`, failing unless annotated
`-- expand-contract:`. Enforces the master prompt's rollback-path rule.

**10. Finish Phase 2 — [WORK, in progress].** `brands`, `materials` and
`bom_items` have shipped with real persistence; see `docs/reports/phase-2.md`.
Four sections remain on demo data — colorways, measurements, construction,
packaging — and each is the BOM slice repeated. `PENDING_PHASE_2_TABLES` in
`tests/bom.test.ts` is the list, and it fails in both directions so it cannot go
stale. Then `tests/isolation.test.ts`: two seeded organizations on a Neon
branch, org B reading zero of org A's rows. That is the test that actually
proves tenancy — everything shipped so far proves only shape, and mutations now
exist to make it writable. `tests/isolation.test.ts` (two seeded orgs on a Neon branch, org B
reads zero of org A's rows) becomes writable once mutations exist. That is the
test that actually proves tenancy; the lint rule only proves shape.

---

## What shipped this session, and why

Decisions a fresh session cannot infer from the code.

**Sequencing was deliberately changed.** The spec (§15) puts the factory PDF and
the AI drafting in phase 5 of 6. Those are the two things that decide whether
anyone buys this, so following spec order means learning whether the product
works after ~4 months of CRUD — with nothing to show outbound in the meantime.
A 2–3 week de-risking spike was inserted before Phase 2 instead. Item 3 above is
the rest of it.

**Flats are parametric, never generated as images.** The model emits a
`FlatSpecV1` — enums and bounded numerics — and geometry is rendered
deterministically from it. Raster→vector tracing was rejected outright: it
yields thousands of unnamed paths with no layers, no callout anchors, no
measurable geometry, and no front/back parity. It looks like a flat and cannot
function as one. Image generation is reserved as a labeled concept side-channel
that is never auto-promoted to spec geometry.

**`canvas_documents.content` will be `{ flatSpec, overlay: [...] }` — this one
is not reversible.** The flat regenerates from parameters; artwork and callouts
live as overlay objects keyed to named template anchors. Change "hood → no hood"
and it re-renders correctly instead of orphaning paths. Storing raw
Fabric/Konva JSON forecloses this permanently.

**Four deliberate deviations from the master prompt:**
- §3 names OpenAI for structured output → use `claude-opus-5`; a separate
  provider for images only.
- §3 names Fabric.js/Konva → SVG-native. Canvas-raster tooling for a vector
  technical flat loses layers, anchors, and print-resolution PDF.
- §5 lists `ai_jobs` but no proposals table → `ai_proposals` is required, or
  "review before apply" has nowhere to live.
- §9 translation → never free-translate numbers. Tokenize measurements out,
  translate prose, re-insert. "12.5 cm ± 0.5" mistranslated reaches a factory.

**The section registry was built before the generator.** A generator without a
single source just multiplies hand-maintained lists. `lib/sections/registry.ts`
now feeds navigation, the readiness denominator, cache tags, and the route
tests; the sitemap and route sweep will feed from it too.

**Tenancy rules live in lint, not CI.** Agents already run eslint, it is local
and deterministic, and it blocks before commit rather than after deploy.
`tools/eslint-plugin-custmink/` has four rules, each tested with `RuleTester` in
both directions — a rule that silently stops firing reads as a passing gate.

**Visual regression against the archived prototype was considered and skipped.**
It discharged its purpose in `docs/compatibility-checklist.md`. Phases 2–6
intentionally diverge, so every diff would be an expected diff, and a baseline
that always fails is ignored within two weeks. The prototype stays for manual
side-by-side.

**Business decisions taken:** pricing $49 / $149 / $399 / Enterprise; full
master-prompt scope; no deadline. **Ownership was recorded as DBAI-owned over a
stated answer of "product for the custm.ink client"** — see surprise #4.

**"Cold outbound to apparel brands" has been superseded.** It was the answer
given in the build session, and the 2026-09-05 amendment replaces it with an
**Exora Ink pilot** — an existing DBAI client moving from decorating SanMar
blanks to original cut-and-sew, with a named contact. That is a better first
customer than cold outreach for the reason the amendment gives: a real garment
produces a real factory response, and the outbound demo falls out of the pilot
rather than having to precede it. The reversal arrived as a file in the repo
rather than in conversation; it was **confirmed in session on 2026-09-05** and
the amendment applied. The go-to-market in §2 changed with it: decorators and
print shops moving to private label first, independent apparel brands second.

**The factory PDF vertical slice shipped.** One style renders through React PDF
to a 10-page branded document: cover, contents, overview, front and back flats,
colorways, artwork, BOM, measurements, construction, packaging, and a sampling
page with factory and brand signature blocks. Version and disclaimer footer on
every page, repeating table headers, no row split across a page break.

- `GET /products/[productId]/export` — verified end to end against Postgres:
  200, `application/pdf`, 25,967 bytes, 10 pages,
  `attachment; filename="ci-hod-2407-riviera-oversized-hoodie-techpack.pdf"`,
  `Cache-Control: private, no-store`. The prototype's `window.print()` button is
  now a real download.
- **The flat is real vector geometry in the PDF, not a rasterized preview** —
  `tests/pdf.test.ts` asserts the bytes contain no `/Subtype /Image`. That
  assertion is the parametric-flats decision made enforceable.
- **No font is embedded and no network call happens during an export.** Only the
  standard PDF fonts, asserted by the absence of `/FontFile`. `Font.register`
  would fetch a file mid-export.
- `npm run pdf:preview` writes a PDF to disk for visual review, the sibling of
  `flats:preview` and for the same reason — see surprise #6.

**The marketing site shipped.** `/` is a static landing page (Concept · Features ·
Design · Ideas, anchored), `/pricing` is the published price list, and `/demo`
is a read-only tour of the Riviera hoodie's full record fed from
`lib/demo-data.ts`. All three build **○ Static, 1h**. Try Now goes to `/demo`,
not `/dashboard`, because the workspace is now gated behind sign-in and a demo
that dead-ends at a login wall is worse than no demo.

- The hero is a spec sheet: the real `renderFlatSvg` flat with two POM callouts
  from the demo measurements and a drawing title block. The one product image
  on the site is literally the product's output.
- Every claim is `shipped` or `roadmap` in `lib/marketing/features.ts`, set by
  hand — **not** derived from the registry's `deliveredInPhase`, which still
  says four demo-data sections are phase-2 delivered. `tests/marketing.test.ts`
  asserts the unshipped ones stay marked roadmap, that prices match
  `docs/DECISIONS.md`, that nothing under `(marketing)` imports a session or
  the database, and that no `opengraph-image` route exists.
- The product name lives in `lib/brand.ts`; `SITE_URL` was added there.
  `metadataBase` is set in the marketing **layout's** metadata, not the root
  layout, which another session owns while wiring Clerk.
- Guardrails now cover the new surface: `custmink/no-dynamic-in-public` matches
  `(marketing)`, preflight #4 matches every `page.tsx` outside the gated
  `(app)` and `(onboarding)` segments, and `tests/routes.test.ts` asserts the
  root redirect is gone.
- `npm run pdf:preview` + `pdftoppm` produced `public/pdf-cover.png`;
  `public/og.png` is a 1200×630 screenshot of the hero. Both static; neither is
  a route.
- The footer carries "Powered by" and the DBAI agency mark, centered.
  `public/dbai-agency.png` is the logo knocked out of its black background and
  recoloured to ink (`public/dbai-agency-white.png` for dark surfaces); the
  source is `~/Code/Logo/dbai_agency.png`. Header and footer share one
  `<Wordmark/>`, asserted by eye and by the shared component.

**The design system landed — `DESIGN.md` is canonical for product UI
(2026-09-06).** The style was chosen from the Refero styles catalog
(`styles.refero.design`, 1,288 styles mirrored; the `refero` MCP is not
installed here, so the catalog API was read directly). Brief: light, precise,
dashboard-shaped, warm neutrals, one accent, Cal.com/Linear family. Winner:
Monarch — "warm linen notebook under morning light" — over Plain (green-tinted
neutrals) and Runway (amber accent fails as text). `DESIGN.md` carries the
tokens, type, shape, do/don't lists, and the component notes; `CLAUDE.md` now
says read it before any UI, use its tokens as CSS variables, ask before
deviating.

- `app/globals.css` `:root` is the token layer (`--linen`, `--paper`, `--ink`,
  `--graphite`, `--stone`, `--smoke`, `--ember` + derived, radii, shadows,
  fonts) mapped into the shadcn aliases, so `components/ui/*` and Tailwind
  utilities inherit it. Every hard-coded hex in the product CSS was replaced;
  the app shell (sidebar, topbar), the dashboard, and the sign-in card were
  rebuilt on it. Inter and Fraunces load through `next/font` in the root
  layout as variables only.
- **The marketing site is the documented exception.** It shipped hours earlier
  on cobalt/lime and consumes the same `:root` names, so `.mk-site` pins the
  legacy palette, eyebrow colour, and brand mark. Pixel-identical, verified
  against production. Migrating it onto `DESIGN.md` is its own change.
- Two pre-existing sign-in bugs fixed on the way: the brand mark rendered as a
  solid tile (`.public-brand div` clobbered its grid) and Clerk's duplicate
  header was never hidden — `appearance.elements.header: "hidden"` only adds a
  class name and Tailwind never emitted `.hidden`; it is a plain CSS rule now.
- `/about` was added to the marketing site: what the product does, who it is
  for, how it is built. Its "N of 10 sections live" line is counted from
  `SECTION_CLAIMS`, so it cannot outrun the features grid.
- **Seen, not fixed:** production `/sign-in` renders Clerk's "Development
  mode" badge — the publishable key on Vercel is a `pk_test_` key.

---

## What surprised me

**1. A Drizzle correlated subquery silently scored every product 0% readiness.**
Drizzle renders subquery columns *unqualified*, so
`where product_id = id` compared each row to itself and matched nothing. The
data was correct in Postgres; the query was wrong; typecheck and tests were
green. Found only by looking at the rendered UI. Fixed with a grouped left join
— see `completeSectionCount` in `lib/data/products.ts`. **Assume this trap
applies to every future aggregate.**

**2. There was no git remote.** Four commits existed on one Mac with no offsite
copy, no CI, and no PRs. Now `DigitalBoutique-ai/custmink-studio`, private, with
Vercel git-connected.

**3. Vercel auto-promoted the *first* deployment to production**, so production
existed before it was intended to. It is safe — no session variables there, so
it renders demo data rather than tenant data — but do not assume production is
gated just because you did not deploy it.

**4. custm.ink is not a client — The Studio™ is a DBAI first-party
product.** The stated answer during the build session was "product for the
custm.ink client," and it was wrong. The domain was registered 21 Aug 2026, the
repo is days old, `src/lib/business.ts` has empty address/phone/ratings, Stripe
is unkeyed, the allowlist holds one row (the operator), and
`/Users/aiserver/Code/Cere/prompts/brain-curated-tier-cc-prompt.md:84` lists
`custm-ink` as one of four first-party DBAI entities. **This is settled as of the
2026-09-05 amendment:** Digital Boutique AI (Tim de Vallée, James) owns the
product, and custm.ink is DBAI's house brand rather than a customer. Build
accordingly — there is no external client to bill or defer to.

**Exora Ink** (`/Users/aiserver/Code/exora-ink-orders`, live at exoraops.app,
five named staff) is a separate, real operating business and an existing DBAI
client. It is the **designated pilot**: a brand under the DBAI organization now,
org #1 once Clerk is wired, on preview with a dev session until then. Exora being
the pilot does not change who owns The Studio™.

Consequence worth acting on: every external service must be owned by a DBAI
account, not a personal one. `docs/ACCOUNTS.md` tracks which are and which are
still TODO — Clerk, Anthropic, Stripe, Resend, Sentry, PostHog and the custm.ink
registrar are all unowned today.

**5. The lint plugin found five real authorization gaps on its first run.**
`getLibrary`, `getWorkflow`, `getColorways`, `getBomRows`, and `getMeasurements`
read data with no session resolution and no capability check. They returned demo
content so nothing leaked, but they would have become tenant queries in Phase 2
with the hole already in place. Fixed to match the `products.ts` pattern.

**6. The first flat render looked wrong and every test passed.** The hood
rendered as a balloon floating above the shoulders and the sleeves as sticks.
All 18 tests were green — they assert determinism, parameter response, and
front/back correspondence, none of which notice bad proportions. Fixed by
widening the hood base to scale with the shoulder, making it a filled panel the
body occludes, and rebuilding sleeves as closed panels seamed to the armhole via
`bodyEdgeAt()`. **Run `npm run flats:preview` and look at the output after any
geometry change.** It is still a schematic, not an illustrator-grade flat — the
hood is a simple arch with no shaped face opening.

**7. Readiness percentages differ from the prototype on purpose.** It shows
60 / 60 / 100 where the prototype showed 82 / 54 / 100. The prototype's numbers
were static and contradicted its own checklist, which ticked 6 of 10 sections.
Readiness is now derived from `product_section_statuses` as §7 requires. This
looks like a regression in a side-by-side and is not one — it is the one
intentional data deviation, recorded in `docs/compatibility-checklist.md`.

**8. `TOTAL_SECTIONS` is annotated `: number` deliberately.** The `as const`
registry narrowed it to the literal `10`, which made the divide-by-zero guard in
`readinessScore` provably dead and failed typecheck. Widening keeps the guard
live. Do not "simplify" the annotation away.

**9. Deployment Protection does not cover the production custom domain.**
`techpack.intlo.com` serves the app to anyone, with no SSO gate — protection
applies to preview and `*.vercel.app` deployment URLs only. No tenant data is
exposed, because production has neither `ALLOW_DEV_SESSION` nor the `DEV_*` ids,
so `getSession()` returns null and the data layer returns the demo dataset
without touching Postgres (which also keeps Neon asleep under bot traffic). What
*is* public is the entire workspace UI. `robots.ts` disallows crawling, so it
should not get indexed, but the URL is browsable by anyone who has it. **Decide
whether to gate it before Clerk lands.** A plain `curl` against a *preview*
deployment still returns an SSO redirect, not your page — early route checks reported 200 for the
login page. Use `vercel curl <url>`, and put curl's own flags **after** the URL.
Related: a misordered `-w` flag wrote a file literally named `-w` containing
9.7 KB of Vercel 404 HTML, and it got committed. It is gitignored now.

**10. `eslint-config-next` 16 ships native flat configs.** The `FlatCompat`
approach crashes with "Converting circular structure to JSON". Import
`eslint-config-next/core-web-vitals` and `/typescript` directly.

**11. `typedRoutes` is off on purpose.** With it on, every dynamic
`` `/products/${id}/overview` `` href needs a `Route` cast. Not worth it.

**12. A scope amendment arrived in the repo between sessions, and it was
right.** `research/` appeared untracked on 2026-09-05 with a competitive
teardown, a gap analysis, a six-screen completed-state mockup, and an amendment
prompt — none of it authored in a build session. It has now been applied: the
research moved to `docs/research/`, the master prompt carries ten
`<!-- amended 2026-09-05 -->` changes, and `docs/DECISIONS.md` records the lot.
Two of its items (`brands`, and `source`/`accepted_at` provenance) were cheap
before Phase 2 and expensive after, which is why they were applied before any
CRUD work rather than folded in later. The lesson generalises: **check for
untracked files in the repo at the start of a session.** A directory arriving
between sessions carried a go-to-market change and a pilot-customer decision that
nothing in the code or git history would have revealed.

**13. The two research copies of the amendment prompt differed.** The root
`custmink-scope-amendment-prompt.md` was a *later* revision than the dated
`2026-09-05_scope-amendment-prompt.md` beside it — it added the §2 go-to-market
change, the ownership decision, and `docs/ACCOUNTS.md`. Applying the dated file
because it looked canonical would have silently dropped three decisions. The
later revision is now the dated file; the earlier draft is gone.

**14. The seed hoodie was sleeveless, and three other files disagreed with it.**
`RIVIERA_HOODIE` had `sleeve: "sleeveless"` while the measurement rows specified
"P03 sleeve length from shoulder, 58-62 cm", the BOM specified 2x2 rib for
"cuffs / waistband", and the spec itself set `cuff: "ribbed"`. Every test
passed — nothing cross-checks the flat against the measurement table. The
contradiction only became visible when the drawing and the measurement table
appeared in one document, which is precisely what a tech pack is for. Fixed to
`long`, with the seed description corrected. `tests/pdf.test.ts` now fails if a
sleeve measurement exists on a sleeveless spec. **Assume other cross-file
contradictions are waiting**; a factory reading the PDF is the first thing that
checks them, and that is far too late.

**15. React PDF cannot read the flat renderer's SVG.** The renderer emits
`<path class="flat-body">` plus a `<style>` block and CSS custom properties.
`@react-pdf/renderer` supports none of that — no stylesheets, no classes, no
cascade, no custom properties. The fix was to make the template emit structured
elements and serialize *those* to markup, so the browser SVG and the PDF are two
serializations of one geometry rather than two drawings kept in agreement by
hand. Stroke weights now live once, in `lib/flats/style.ts`. The refactor was
verified byte-identical against the previous output across four spec variants in
both views before anything was built on it.

**16. Sleeves were correct geometry that looked broken the moment a colorway
tinted the flat.** They were drawn after the body with `fill: none`, so the body
filled and the sleeves stayed white. The template already had the answer for the
hood — a filled panel the body occludes — and sleeves now use it. Nothing
detected this but looking at the render, again.

**17. `@react-pdf/renderer`'s dependency graph is ESM-only, and `tsx` compiles
this repo to CJS.** `@react-pdf/hyphenate` declares an `import` condition and no
`require`, so `npx tsx script.ts` dies with `ERR_PACKAGE_PATH_NOT_EXPORTED`.
Vitest and Next both resolve it correctly; only the tsx-based scripts do not.
`npm run pdf:preview` therefore bundles with esbuild to ESM first. Do not
"simplify" it back to `tsx`.

**18. Vitest only collects `tests/**/*.test.ts`, so PDF tests cannot use JSX.**
The document is exposed as `techPackDocument(data)` returning an element rather
than as a JSX component, which the route wanted anyway. Related: `server-only`
throws under Vitest, so anything that must be tested has to sit outside
`lib/data/`, `lib/actions/`, `lib/auth/` and `db/`. That is why `exportFilename`
lives in `lib/pdf/` beside the document contract rather than next to the
session-scoped read that uses it.

**19. A test asserting "the Colorways section is present" passed with the whole
Colorways page deleted.** The table of contents still named it. Section
assertions now require the string twice — once as a contents entry, once as the
heading — and the check was confirmed by deleting the page and watching three
tests go red. Verified the same way as `tests/schema-rules.test.ts`: a guard
nobody has watched fail is not yet a guard.

**20. Next 16 changed `revalidateTag` out from under CLAUDE.md's rule.** It now
takes a required cache-life profile — `revalidateTag(tag, profile)` — and purges
for *future* requests. The new `updateTag(tag)` is the one meant for server
actions, and it gives read-your-own-writes. Following the rule as written would
have served someone the BOM list that predates their own save, which is exactly
the staleness the rule exists to prevent. CLAUDE.md is updated. **Assume other
Next 16 API changes are lying in wait** in rules written against 15.

**21. `brand_id NOT NULL` cannot ship in one migration.** Declaring the final
state in `db/schema.ts` makes drizzle-kit emit `ADD COLUMN ... NOT NULL`, which
fails against any populated table. It took three steps — add nullable, backfill,
set NOT NULL — and the middle one is a script, not a migration. This will recur
for every future NOT NULL column on a live table, so `scripts/backfill-brands.ts`
is worth reading before the next one.

**22. The seed had to reconcile with its own migration.** The backfill created a
`default`-slug brand for existing rows; the seed then wants "Custm.ink" and
"Exora Ink". Re-seeding naively would have left three brands, one of them an
artefact of a migration. The seed now folds the placeholder onto the house brand
and deletes it. A backfill that invents a row is a row someone has to clean up.

**23. The registry claimed four sections were delivered that had no tables.**
`deliveredInPhase: 2` on colorways, measurements, construction and packaging was
aspirational — a statement about the plan being read as a statement about the
code. `tests/bom.test.ts` now tracks the gap explicitly and fails in both
directions: a section that leaves the pending list without a table fails, and a
table that ships while still listed fails too. A one-directional allowlist
becomes a place where finished work stays marked pending.

**24. The lint plugin caught a delegated authorization check.** `getDefaultBrand`
called `listBrands`, which does check — but `require-capability-check` rejected
it anyway, and it was right to. An exported reader whose authorization lives one
call away is the shape that becomes a hole when someone reuses the inner helper.
Fixed by repeating the check, not by suppressing the rule.

**25. Two sessions were editing this checkout at once, and the tree was still
buildable.** While the marketing site was being built, another session was
wiring Clerk in the same working copy — `ClerkProvider` in the root layout,
`proxy.ts`, real session resolution, the sign-in pages replaced by catch-all
routes. Neither of us used `git add -A`; each committed by explicit path and
messaged the other a file map. Two shared files (the lint plugin, the routes
test) carried both sets of edits and merged cleanly. What did bite: with a
placeholder Clerk key the dev server 500s on every page and `clerkMiddleware`
bounces browsers to a handshake URL, so the marketing pages were verified by
serving `.next/server/app/*.html` — the exact static artifact — over a scratch
HTTP server instead. **Check `git status` for another session's uncommitted
files before staging anything.**

**26. Widening preflight to "every page outside `(app)`" immediately flagged
`(onboarding)/welcome`.** That page calls `auth()` by design — it is gated, not
public — so the check now excludes both authenticated segments by name. A new
route group that needs a session has to be added to that list, or preflight
will (correctly) refuse to pass it.

**Deliberate and load-bearing, so do not "fix" them:**
- `lib/draft-store.ts` keeps created tech packs in `localStorage`. A Phase 1A
  bridge until a create server action exists; its tab title reads "Tech pack"
  because the server cannot resolve an id it never stored.
- Production rendering demo data is the safe fallback, not a bug.
- `archive/vinext-prototype/` is the preserved pre-migration prototype with its
  dependencies installed so it can be run side by side. Never edit or import it.

---

## Project skills

`.claude/skills/` holds Clerk's official agent skills (`clerk-nextjs-patterns`,
`clerk-orgs`, `clerk-webhooks`, `clerk-backend-api`, `clerk-custom-ui`,
`clerk-setup`), installed by `vercel integration add clerk` on 2026-09-06 and
pinned by `skills-lock.json`. The files live in `.agents/skills/`; `.claude/`
symlinks to them. Load one with the Skill tool before touching Clerk orgs or
webhooks — they are the vendor's current docs, not memory. Re-sync with
`npx skills add https://github.com/clerk/skills`.

## Commands

```bash
npm run verify        # typecheck + lint + test + preflight — the fast gate
npm run build         # next build
npm run preflight     # Neon compute rules; exits 1 on violation
npm run db:generate   # after editing db/schema.ts
npm run db:seed       # development only, prints the DEV_* ids for .env.local
npm run flats:preview <out.html>   # render flat variants for visual review
npm run pdf:preview <out.pdf>      # render the factory tech pack for visual review
```

`file:` URLs are blocked in the Playwright MCP; serve previews over HTTP
(`python3 -m http.server`) to screenshot them.
