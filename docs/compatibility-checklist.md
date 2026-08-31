# Prototype → Next.js compatibility checklist

Every screen and interaction in the archived vinext prototype
(`archive/vinext-prototype/components/techpack/tech-pack-studio.tsx`, 34.5 KB,
201 lines) and where it now lives. Verified by running both apps side by side —
prototype on `:3300`, migrated app on `:3200` — at 1440×900 and 390×844.

Legend: **Ported** = same markup and styles, same behaviour · **Changed** =
deliberate production change, reason given.

## Shell and navigation

| # | Prototype | Now | Status |
|---|---|---|---|
| 1 | Sidebar, three groups (Workspace / Libraries / Operations) | `components/layout/app-sidebar.tsx` | Ported |
| 2 | Active nav item driven by `activeNav` state | Driven by `usePathname()` against real URLs | Changed — routing owns page selection |
| 3 | Nav items are `<button>` | `<Link>` with `aria-current="page"` | Changed — real navigation, keyboard and middle-click work |
| 4 | Sidebar collapse toggle | `AppShell` state, unchanged markup | Ported |
| 5 | Brand mark (four squares) | `components/layout/brand-mark.tsx` | Ported |
| 6 | Help centre button | Same, still inert | Ported |
| 7 | Account card "TD / Tim de Vallée / Owner" | Now links to `/settings/organization` | Changed — the settings route exists |
| 8 | Topbar: mobile menu, search with `⌘ K`, Ask AI, bell + dot, New tech pack | `components/layout/topbar.tsx` | Ported |
| 9 | — | "Activity" nav item | Added — `/activity` is required by master prompt §4 |

## Dashboard

| # | Prototype | Now | Status |
|---|---|---|---|
| 10 | Greeting block, eyebrow date, Create tech pack | `components/techpack/dashboard-view.tsx` | Ported |
| 11 | Four metric cards (Active styles, In sampling, Factory ready, Open POs) | Same, data from `lib/demo-data.ts` | Ported |
| 12 | Recent tech packs table with thumb, code/season, status badge, progress bar, timestamp | Same markup, rows now `<Link>` | Ported |
| 13 | "Studio intelligence" card, two insight actions | Same; actions link to the first product's overview and measurements | Changed — was `openProduct()` on static state |
| 14 | Collection progress, 68%, four milestones | Ported | Ported |

## Products

| # | Prototype | Now | Status |
|---|---|---|---|
| 15 | Tech packs page heading + New tech pack | `components/techpack/products-view.tsx` | Ported |
| 16 | Client-side search filter over name/code/category | Ported verbatim | Ported |
| 17 | Filter / Sort buttons (inert) | Ported, still inert | Ported |
| 18 | Product card grid: garment visual, tinted background, status badge, code · season, progress | Ported | Ported |
| 19 | Card click sets `selectedProduct` | Navigates to `/products/[id]/overview` | Changed — linkable, refresh-safe |

## Libraries, suppliers, purchase orders

| # | Prototype | Now | Status |
|---|---|---|---|
| 20 | One `LibraryPage` switching on nine `NavKey`s | `components/techpack/library-view.tsx`, one route each | Changed — nine real URLs, shared view |
| 21 | Per-library title, subtitle, item list | `lib/demo-data.ts` → `lib/data/libraries.ts` (server) | Ported |
| 22 | Search filter, Filter/Sort, Add new | Ported | Ported |
| 23 | Library cards with icon preview and "Updated N days ago" | Ported | Ported |
| 24 | Colour library swatch previews | Ported | Ported |
| 25 | Suppliers → "Approved" badge, POs → "Open" badge | Ported | Ported |

## Product workspace

| # | Prototype | Now | Status |
|---|---|---|---|
| 26 | Workspace shell replaced the page body | Nested layout `app/(app)/products/[productId]/layout.tsx` | Changed — header/TOC stay mounted across section routes |
| 27 | Header: back, thumb, breadcrumb, name, status badge | `components/techpack/product-workspace.tsx` | Ported |
| 28 | Actions: "✓ Saved", Share, Export PDF, AI assistant, more | Ported, including `window.print()` | Ported |
| 29 | Share / factory-link toasts | Ported (sonner) | Ported |
| 30 | Readiness card + progress | Ported; value now derived (see Deviations) | Changed |
| 31 | Table of contents, 10 sections, per-section tick | `<Link>` per section, active from `useSelectedLayoutSegment()` | Changed — one URL per section |
| 32 | Factory live-link card + copy toast | Ported | Ported |
| 33 | Content header: eyebrow, "Canvas editor" / "Product specification" / section label, "Last edited 8 minutes ago" | Ported, same conditional rules | Ported |
| 34 | Section key `instructions` | Renamed `construction` | Changed — master prompt §4 names the route `/construction` |

## Product sections

| # | Prototype | Now | Status |
|---|---|---|---|
| 35 | Overview: garment, six-field detail grid, design intent, readiness checklist | `panels/overview-panel.tsx` | Ported |
| 36 | Design: canvas toolbar (back, zoom ±, %, undo, save + toast) | `panels/design-panel.tsx` | Ported |
| 37 | Design: scaled canvas, callouts, properties panel, decoration select, print-width slider, colour swatches, notes, AI suggest | Ported | Ported |
| 38 | Garment colour and artwork width shared across Overview / Design / Colorways | Shared via workspace context, survives section navigation | Ported |
| 39 | Colorways: four cards, tinted garment, swatch, selection tick | `panels/colorways-panel.tsx` | Ported |
| 40 | BOM: editable table, per-cell edit, add row, delete row, Suggest with AI | `panels/bom-panel.tsx` | Ported |
| 41 | Artwork: garment stage, file meta, four-field spec, Remove background | `panels/artwork-panel.tsx` | Ported |
| 42 | Measurements: POM table, editable size cells, Grade from M, Add POM, footer note, Validate grading | `panels/measurements-panel.tsx` | Ported |
| 43 | Sampling / Construction / Packaging / History workflow lists | `panels/workflow-panel.tsx`, one route each | Ported |
| 44 | History rows all "Complete", others first-row-only | Ported | Ported |

## Dialogs, copilot, persistence

| # | Prototype | Now | Status |
|---|---|---|---|
| 45 | Create wizard step 1: eight garment type cards | `components/techpack/create-tech-pack-dialog.tsx` | Ported |
| 46 | Create wizard step 2: name, generated description, upload drop | Ported | Ported |
| 47 | Wizard progress "Step N of 2" | Ported | Ported |
| 48 | Create → prepend product, select it, toast | Creates the draft, toasts, routes to its overview | Ported |
| 49 | AI panel: header, context badge, message list, three chips, composer, Enter to send | `components/ai/ai-panel.tsx` | Ported |
| 50 | AI panel opens from topbar and from product header | Both, via `useStudioShell()` context | Ported |
| 51 | `localStorage` product persistence | `lib/draft-store.ts` (`useSyncExternalStore`), drafts only | Changed — seeded products come from Postgres |
| 52 | Sonner toaster, bottom-right, rich colours | Ported | Ported |
| 53 | Responsive desktop / tablet / mobile, sidebar overlay on mobile | Ported, verified at 390×844 | Ported |
| 54 | — | `/products/new` | Added — master prompt §4 requires the route; opens the same wizard |

## Assets and styles

| # | Prototype | Now | Status |
|---|---|---|---|
| 55 | `app/globals.css` (418 lines) | Copied verbatim, plus a `.public-shell` block for the new unauthenticated routes | Ported |
| 56 | `vendor/shadcn-tailwind-4.13.0.css` | Copied verbatim | Ported |
| 57 | `public/*.svg`, favicon | Copied | Ported |
| 58 | Metadata title/description/icons | Copied into the root layout | Ported |
| 59 | 62 vendored shadcn components | Seven that are actually used: badge, button, dialog, input, progress, textarea, sonner | Changed — the other 55 stay in `archive/`, unreferenced |
| 60 | `hooks/use-mobile.ts` | Dropped | Changed — only consumed by the unported `ui/sidebar.tsx` |

## Deviations, and why

1. **Readiness percentages.** The prototype showed a static 82% / 54% / 100%
   while its own checklist ticked 6 of 10 sections — the two disagreed. Master
   prompt §7 requires the score to be automatic, so it is now derived from
   `product_section_statuses`: 60% / 60% / 100%. The section ticks are
   unchanged. This is the one visible number that differs from the prototype.
2. **Product ordering and timestamps.** Ordering is now `updated_at desc` rather
   than array order. The seed sets explicit timestamps so the list still reads
   Riviera → Harbor → Atlas with "N min ago / Yesterday / Aug 27"; the first
   value now drifts with real time instead of being frozen at "8 min ago".
3. **Locally created drafts.** A draft created by the wizard lives in the
   browser until Phase 2 adds the server action, so its browser tab title reads
   "Tech pack" (the server cannot resolve an id it has never stored) and it is
   not visible to other users or devices.
4. **Section completion ticks** in the overview checklist and the
   "3 sections need input" caption still come from static config, not per-row
   `product_section_statuses`. Phase 2 wires them.
