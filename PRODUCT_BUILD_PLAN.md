# Custm.ink Studio Product Build Plan

## Current prototype

The supplied app already demonstrates the product direction and primary workflows:

- Product development dashboard
- Tech-pack list and collection libraries
- Guided tech-pack table of contents
- Product overview and completion scoring
- Garment canvas controls
- Colorway selection
- Editable bill of materials
- Editable measurements and grading table
- Artwork placement screen
- Sampling, construction, packaging, and history sections
- AI product-creation wizard
- Contextual AI copilot
- Supplier, attachment, artwork, material, color, size-chart, and purchase-order libraries
- Factory link, sharing, version cues, and PDF print flow
- Responsive desktop, tablet, and mobile layouts
- Local product creation and persistence for demonstration

## Production build sequence

| Phase | Outcome | Target effort |
| --- | --- | --- |
| 1. Foundation | Auth, organizations, database, permissions, environments, dashboard | 1–2 weeks |
| 2. Tech-pack data | Full CRUD for all written specifications and libraries | 2–3 weeks |
| 3. Canvas and assets | Real design canvas, uploads, artwork, previews, autosave | 3–5 weeks |
| 4. Collaboration | Sampling, comments, versions, approvals, factory links | 2–3 weeks |
| 5. AI and PDF | Guided generation, copilot, background jobs, factory PDFs | 2–4 weeks |
| 6. Billing and launch | Stripe, usage limits, onboarding, tests, security, launch | 2–3 weeks |

Estimated production build: 12–20 weeks for one strong full-time engineer. A focused two-person team can target 8–12 weeks by splitting platform work from canvas, AI, and export work.

## Build priorities

1. Lock tenant security, product schema, and version architecture before expanding AI.
2. Make the manual tech-pack workflow complete before relying on generation.
3. Build the canvas as a separate versioned document with preview assets.
4. Make factory export deterministic and tied to immutable versions.
5. Add AI through reviewable proposals, never direct silent edits.
6. Add billing after the core workflow is measurable and stable.

## Launch definition

The first paid release should support:

- Organization and team accounts
- Product and collection management
- Overview, colorways, BOM, measurement, construction, packaging, and sampling data
- A stable canvas with apparel templates, artwork, annotations, and dimensions
- Version snapshots and approvals
- Secure factory links
- Complete branded PDF export
- Guided AI draft and three high-value copilot actions
- Stripe subscriptions and server-enforced limits

Purchase orders, advanced real-time collaboration, enterprise SSO, and broad template marketplaces can follow after launch.
