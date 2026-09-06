import type { Role } from "@/lib/auth/permissions";

/**
 * Seat linking — the pure decision. Lives outside `lib/auth/` (which is
 * `server-only`) so it can be unit-tested and loaded from scripts, the same
 * arrangement as `lib/bom/rows.ts`.
 *
 * Access is by invitation: an owner provisions a seat for an email address
 * (`scripts/add-member.ts`), which creates a `users` row whose `external_id`
 * is `pending:<email>` plus a membership. On first sign-in the person claims
 * the seat and the row is linked to their Clerk user id. Clerk is identity
 * only; the seat is the authorization.
 */

export const PENDING_PREFIX = "pending:";

export function pendingExternalId(email: string): string {
  return `${PENDING_PREFIX}${normalizeEmail(email)}`;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export type SeatRow = { externalId: string; email: string };

export type ClerkIdentity = {
  userId: string;
  /** Primary email as Clerk reports it, verified. */
  email: string;
  name: string | null;
  avatarUrl: string | null;
};

export type ClaimDecision =
  /** Row exists for this email and is unclaimed — link it. */
  | { kind: "link" }
  /** Row is already linked to this Clerk user. */
  | { kind: "linked" }
  /** Row is linked to a different identity; refuse rather than reassign. */
  | { kind: "conflict" }
  /** Nobody has provisioned a seat for this email. */
  | { kind: "none" };

export function decideClaim(row: SeatRow | null, identity: ClerkIdentity): ClaimDecision {
  if (!row) return { kind: "none" };
  if (row.externalId === identity.userId) return { kind: "linked" };
  if (row.externalId.startsWith(PENDING_PREFIX)) return { kind: "link" };
  return { kind: "conflict" };
}

export type SeatMembership = { organizationId: string; role: Role };

/**
 * Which membership a session runs under. Clerk's active organization is not
 * used — the org model lives in Postgres — so the first membership wins. A
 * workspace switcher can replace this without touching callers.
 */
export function pickMembership(memberships: SeatMembership[]): SeatMembership | null {
  return memberships[0] ?? null;
}
