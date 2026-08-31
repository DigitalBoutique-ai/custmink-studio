import "server-only";

import { cache } from "react";

import type { Role } from "@/lib/auth/permissions";

/**
 * Server-side session resolution.
 *
 * Phase 1B ships the boundary, not the provider: Clerk needs account
 * credentials that are not configured yet (see docs/reports/phase-1.md). Every
 * caller already goes through `requireSession()`, so wiring Clerk means
 * replacing the body of `resolveSession` — no call site changes.
 *
 * Until then a development session is returned, and only when
 * `ALLOW_DEV_SESSION` is set. In production with no provider configured the app
 * refuses to hand out a session rather than defaulting to an authenticated one.
 */

export type Session = {
  userId: string;
  organizationId: string;
  role: Role;
  email: string;
  name: string;
};

export class UnauthenticatedError extends Error {
  constructor(message = "No authenticated session") {
    super(message);
    this.name = "UnauthenticatedError";
  }
}

function devSessionAllowed(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.ALLOW_DEV_SESSION === "true";
}

const resolveSession = cache(async (): Promise<Session | null> => {
  // TODO(Phase 1B, blocked on credentials): replace with Clerk `auth()` plus a
  // lookup of the mapped users/organizations/memberships rows.
  if (!devSessionAllowed()) return null;

  const organizationId = process.env.DEV_ORGANIZATION_ID;
  const userId = process.env.DEV_USER_ID;
  if (!organizationId || !userId) return null;

  return {
    userId,
    organizationId,
    role: "owner",
    email: "tim@custmink.studio",
    name: "Tim de Vallée",
  };
});

export async function getSession(): Promise<Session | null> {
  return resolveSession();
}

export async function requireSession(): Promise<Session> {
  const session = await resolveSession();
  if (!session) {
    throw new UnauthenticatedError();
  }
  return session;
}
