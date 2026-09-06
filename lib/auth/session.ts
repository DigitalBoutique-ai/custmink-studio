import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";
import { and, eq, isNull } from "drizzle-orm";
import { cache } from "react";

import { db, schema } from "@/db";
import type { Role } from "@/lib/auth/permissions";
import { type ClerkIdentity, normalizeEmail, pickMembership } from "@/lib/seats/rules";
import { hasDatabase } from "@/lib/env";

/**
 * Server-side session resolution.
 *
 * Clerk answers "who is this?"; the `users` → `memberships` rows answer "which
 * workspace, and what may they do?". Both are required for a session. A person
 * who is signed in but holds no seat gets `null` here and is sent to `/welcome`
 * by the `(app)` layout to claim one — see `lib/seats/rules.ts`.
 *
 * `auth()` reads the request cookie, so anything that calls this renders
 * dynamically. That is why it is only reachable from `app/(app)/**` and
 * `app/(onboarding)/**`, never a public route or the root layout.
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

/** The signed-in Clerk identity, or null. Verified primary email only. */
export const getIdentity = cache(async (): Promise<ClerkIdentity | null> => {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  if (!user) return null;

  const primary = user.emailAddresses.find((address) => address.id === user.primaryEmailAddressId);
  if (!primary || primary.verification?.status !== "verified") return null;

  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || null;
  return { userId, email: normalizeEmail(primary.emailAddress), name, avatarUrl: user.imageUrl ?? null };
});

const resolveSession = cache(async (): Promise<Session | null> => {
  const { userId } = await auth();
  if (!userId || !hasDatabase()) return null;

  const rows = await db()
    .select({
      userId: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
      organizationId: schema.memberships.organizationId,
      role: schema.memberships.role,
    })
    .from(schema.users)
    .innerJoin(schema.memberships, eq(schema.memberships.userId, schema.users.id))
    .innerJoin(schema.organizations, eq(schema.organizations.id, schema.memberships.organizationId))
    .where(and(eq(schema.users.externalId, userId), isNull(schema.organizations.deletedAt)))
    .orderBy(schema.memberships.createdAt);

  const membership = pickMembership(rows);
  const user = rows[0];
  if (!membership || !user) return null;

  return {
    userId: user.userId,
    organizationId: membership.organizationId,
    role: membership.role,
    email: user.email,
    name: user.name ?? user.email,
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
