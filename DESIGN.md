---
name: Warm Linen Notebook
source: Refero styles catalog — Monarch (monarchmoney.com)
refero_id: a9dd8050-c03a-4901-b7fa-a9cc0ca54812
rendered: 2026-09-06
theme: light
industry: fintech → applied to apparel tech-pack tooling
tags: [warm-neutral, single-accent, light, dashboard, precise, editorial, pill-buttons, hairline-borders]
applies_to: app/(app)/**, app/(onboarding)/**, app/(public)/**, components/layout/**, components/techpack/**, components/ui/**
exempt: app/(marketing)/** (legacy lime/cobalt palette, pinned in `.mk-site` — pending alignment)
---

# The Studio™ design system

## North star

> **Warm linen notebook under morning light.**

A soft cream canvas, white paper surfaces, and a single vivid orange that acts
as functional punctuation against an otherwise monochrome warm-grey system. The
interface should feel handcrafted rather than corporate: pill-shaped controls,
hairline warm borders, whisper-light shadows, and generous breathing room. For
The Studio™ that reads as a *precision instrument on paper* — the same
material a factory holds in its hands — not a cold blue SaaS console.

Why this one, out of the catalog: it is the purest warm-neutral + single-accent
system among the light, dashboard-shaped styles (Plain and Runway were the
runners-up; Cal.com is cool-white, Linear is dark). The accent is decisive
without being a "tech blue", and every neutral carries the same warm undertone
so tables, sketches, and PDFs sit on it without fighting.

## Colours

| Token       | Name          | Hex       | Role                                                                                                              |
| ----------- | ------------- | --------- | ----------------------------------------------------------------------------------------------------------------- |
| `--linen`   | Linen         | `#efecea` | **Canvas.** Page background, sidebar, section bands. Never invert this with Paper.                                |
| `--paper`   | Paper         | `#ffffff` | **Surface.** Cards, panels, topbar, inputs, product screenshots — floats above Linen.                              |
| `--ink`     | Ink           | `#22201d` | **Text.** Primary text, headings, icon strokes, inverse surfaces. Warm near-black — never pure `#000`.            |
| `--graphite`| Graphite      | `#777573` | **Muted text.** Secondary copy, helper text, captions, inactive nav, placeholders.                                 |
| `--stone`   | Stone         | `#dcd9d6` | **Hairline.** All 1px borders, dividers, table rules, input outlines.                                              |
| `--smoke`   | Smoke         | `#cccccc` | **Inverse text.** Light text and labels on an Ink surface. Never a CTA colour.                                     |
| `--ember`   | Ember Orange  | `#ff692d` | **The accent.** Filled primary buttons, active/selected states, eyebrow labels, focus rings. The only chroma.      |

Derived (declared once in `app/globals.css`, never re-computed inline):

| Token             | Value                       | Use                                                     |
| ----------------- | --------------------------- | ------------------------------------------------------- |
| `--linen-deep`    | `#e6e2de`                   | Hover on a Linen surface; thumbnail wells; progress tracks |
| `--ember-ink`     | `#d9521a`                   | Ember on Paper when it must pass 4.5:1 as **text**      |
| `--ember-wash`    | `#fff1ea`                   | Soft tint behind a selected row or an Ember chip. Sparingly. |
| `--ink-2`         | `#3d3a36`                   | Dark badge fills where full Ink is too heavy            |
| `--destructive`   | `#c7361f`                   | Errors only. Warm red so it does not read as a second accent |
| `--success`       | `#2f7d4f`                   | Completed checks and "on track" only. Never decorative. |

Surface stack (bottom → top): Linen canvas → Paper card → Ember action.

## Typography

| Role                        | Original      | Substitute used here                | Weight   | Tracking                         |
| --------------------------- | ------------- | ----------------------------------- | -------- | -------------------------------- |
| UI — body, nav, buttons, tables | ABC Oracle | **Inter** (`--font-ui`)             | 400 / 500 | `-0.010em` (16px) to `-0.012em` (14px) |
| Display — headings ≥ 24px   | Copernicus    | **Fraunces** (`--font-display`)     | 350 – 400 | `-0.050em` at 32px → `-0.067em` at 48px |

- Headings use **one weight** and build hierarchy through size + tracking, not
  bold. The tighter the tracking as size grows, the more "sculpted" the heading.
- Below 24px, headings stay in the UI face at weight 500 — the serif is for
  page titles and hero statements, not every `<h2>` in a panel.
- Body is set light (400, never 600+) so the orange accent carries the weight.
- Tracked uppercase is reserved for eyebrow labels (`.eyebrow`) and table
  headers. Never for body copy.

Type scale (px / line-height / tracking): caption 12/1.4/-0.01em · body 14/1.5/-0.012em ·
body-lg 16/1.5/-0.010em · subheading 20/1.33/-0.010em · heading-sm 32/1.2/-0.050em ·
heading 40/1.2/-0.060em · display 48/1.2/-0.067em.

## Shape, space, elevation

| Token              | Value                                                                           |
| ------------------ | ------------------------------------------------------------------------------- |
| `--radius-card`    | `12px` — cards, panels, dialogs, image wells                                    |
| `--radius-input`   | `8px` — inputs, selects, textareas, icon buttons, nav items                     |
| `--radius-pill`    | `9999px` — **every button**, tag, badge, chip                                   |
| `--shadow-hairline`| `0 1px 2px rgba(34, 32, 29, .05)` — buttons, raised nav items                   |
| `--shadow-card`    | `0 10px 15px -3px rgba(34, 32, 29, .10), 0 4px 6px -4px rgba(34, 32, 29, .10)` — hover/lifted cards, popovers, panels that slide in |
| Base unit          | 8px. Element gap 16px, card padding 24px (20px in dense dashboards), section gap 64px |
| Page max-width     | 1200px for content; the app shell itself is fluid                               |

Shadows are tinted with Ink, never neutral grey, so they stay warm.

## Do

- Use `--ember` **only** for filled primary buttons, active/selected states,
  eyebrow labels and focus rings. When Ember must be text on Paper, use
  `--ember-ink` for contrast.
- Set every button to `--radius-pill`. The pill is the system's most
  recognisable element.
- Keep Linen as the canvas and Paper as the card — one step, never inverted.
- Use `--stone` at 1px for all borders and dividers; separation comes from
  hairlines and tone, not from shadows.
- Use the display face for headings ≥ 24px with the matching negative tracking;
  the UI face at 500 for smaller headings.
- Tint shadows with Ink and keep them at 5–10 % opacity.
- Give every inverse (Ink) surface `--smoke` text and `--paper` for its strongest line.

## Don't

- Don't introduce a second accent. No blues, no lime, no gradients on UI. The
  warm-neutral stack plus one orange **is** the system.
- Don't ship square or 4px buttons. Cards are 12px, inputs 8px, buttons pill.
- Don't use pure `#000` for text or pure white as the page background.
- Don't apply heavy or cool-grey shadows to cards.
- Don't use uppercase tracked text for body or nav labels — eyebrows and table
  headers only.
- Don't set body in the display face or headings under 24px in the display face.
- Don't hard-code a hex in a component or stylesheet that has a token above.
  If a colour is missing, add the token to `app/globals.css` and this table.

## Component notes for this product

- **App shell.** Sidebar and content both sit on Linen; the topbar is a 64px
  Paper bar with a Stone hairline. Sidebar nav items: Graphite at rest, Ink on
  hover with a Paper fill, and the **active item is Paper with a hairline
  shadow, Ink text, and an Ember icon** — the accent marks where you are.
- **Metric / panel cards.** Paper, 1px Stone, `--radius-card`, no shadow at
  rest, `--shadow-card` only on hover of something clickable.
- **Insight / AI card.** The one inverse surface on the dashboard: Ink fill,
  Smoke copy, Paper headline, an Ember-filled orb for the icon.
- **Tables.** Stone rules, uppercase Graphite headers at 11px, Ink cells;
  the first column may be weight 500, never orange.
- **Progress.** Track `--linen-deep`, fill Ink. Ember is not a progress colour.
- **Status.** `Badge` defaults to a Linen pill with Ink text; Ember badges are
  for "needs you" states only.
- **Brand mark.** Ink tile, Paper cells, two Ember cells. (The marketing site
  still shows the lime/cobalt mark until it is aligned.)

## Tokens as CSS variables

Declared on `:root` in `app/globals.css` and mapped into the shadcn aliases
(`--background`, `--card`, `--primary`, `--border`, `--ring`, `--sidebar*`…)
so Tailwind utilities and `components/ui/*` inherit them. Consume the DESIGN.md
names in hand-written CSS (`var(--linen)`, `var(--ember)`); consume the shadcn
aliases through Tailwind utilities (`bg-primary`, `border-border`). Fonts are
loaded once in `app/layout.tsx` with `next/font` and exposed as `--font-ui` and
`--font-display`.

The marketing site (`app/(marketing)/**`, `app/marketing.css`) predates this
document and pins its own palette on `.mk-site`. Bringing it onto these tokens
is a separate, deliberate change — do not do it as a side effect.
