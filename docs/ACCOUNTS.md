# Accounts and service ownership

The Studio™ is a **Digital Boutique AI first-party product**. Every external
service it depends on must be owned by a DBAI account, with at least two people
holding access. Nothing load-bearing may sit on a personal account — an
individual's login is a single point of failure for a product, and it makes the
product unsellable and untransferable.

**A personal login that is a member of a DBAI org is fine. A resource whose
*owner* is a personal account is not.** That distinction is the whole point of
the Owner column below.

Last audited: 2026-09-05.

---

## Provisioned

| Service | Resource | Owner | Access | Notes |
|---|---|---|---|---|
| GitHub | `DigitalBoutique-ai/custmink-studio` (private) | `DigitalBoutique-ai` org ✅ | `zthebaron` (admin) | TODO: confirm a second org admin. One admin is one bus. |
| Vercel | project `custmink-studio` (`prj_opXAyjRU2RRkVIuuzpAUV6J3q6gh`) | team `digitalboutique` — "Digital Boutique Projects" ✅ | `zthebaron` | Git-connected; pushes to `main` deploy. |
| Vercel | domain `intlo.com` → `techpack.intlo.com` | team `digitalboutique` ✅ | `zthebaron` | Production domain. Public, no auth gate — see HANDOFF surprise #9. |
| Neon | project `custmink-studio` / `purple-king-22972792` | TODO: confirm the owning Neon **organization**, not the personal account | `zthebaron` | us-east-1, PG 17, 0.25 CU, 5-min scale-to-zero. |

## Not yet created

Each of these is a hard blocker for the phase named, and each must be created
**as DBAI from the start**. Migrating a Clerk instance or a Stripe account
between owners after it holds live data is materially harder than opening it
correctly on day one.

| Service | Needed for | Owner to create as | Status |
|---|---|---|---|
| Clerk | Phase 2 — real tenancy. The hard blocker. | DBAI organization account | TODO |
| Anthropic | AI drafting spike, Phase 5 | DBAI org on the Anthropic Console, not a personal API key | TODO — no `ANTHROPIC_API_KEY` set |
| Stripe | Phase 6 — billing | DBAI Stripe account, test mode first | TODO — unkeyed |
| Resend | invitations, export delivery, approvals | DBAI account, domain-verified | TODO |
| Sentry | Phase 6 — errors and tracing | DBAI organization | TODO |
| PostHog | Phase 6 — analytics and flags | DBAI organization | TODO |
| Vercel Blob | Phase 3 — uploads | Already inside the `digitalboutique` Vercel team | TODO to enable |
| Domain registrar — `custm.ink` | the product's own brand domain | TODO: identify the registrar and the account holding it | TODO — registered 2026-08-21; owner not yet confirmed in this repo |

## Rules

1. Create the account under DBAI first, then invite individuals. Never the reverse.
2. Two people minimum on every account. Recovery codes stored where both can reach them.
3. Secrets live in Vercel environment variables and `.env.local`, never in the
   repo. `.env.example` carries placeholder names only.
4. When a service moves from TODO to provisioned, update this table in the same
   commit that adds its environment variable.
5. `zthebaron` is a personal login with access to DBAI-owned resources. That is
   the intended arrangement. If a row's Owner column ever reads a personal
   account, it is a defect to fix, not a note to keep.
