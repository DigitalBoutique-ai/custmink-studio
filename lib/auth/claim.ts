"use server";

import "server-only";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db, schema } from "@/db";
import { decideClaim } from "@/lib/seats/rules";
import { getIdentity } from "@/lib/auth/session";

/**
 * Claim the seat provisioned for the signed-in person's email.
 *
 * This lives in `lib/auth/`, not `lib/actions/`, because it runs *before* a
 * session exists — there is no organization to scope to and no role to check
 * yet. It is the one write that precedes `requireSession()`, and it can only
 * ever link a `pending:` row to the verified email that matches it.
 */
export type ClaimResult = { ok: true } | { ok: false; reason: "none" | "conflict" | "unverified" };

export async function claimSeat(): Promise<ClaimResult> {
  const identity = await getIdentity();
  if (!identity) return { ok: false, reason: "unverified" };

  // eslint-disable-next-line custmink/tenant-scoped-query -- `users` is global; the seat is matched by verified email before any organization exists
  const [row] = await db()
    .select({ id: schema.users.id, externalId: schema.users.externalId, email: schema.users.email })
    .from(schema.users)
    .where(eq(schema.users.email, identity.email))
    .limit(1);

  const decision = decideClaim(row ?? null, identity);
  if (decision.kind === "none" || decision.kind === "conflict") {
    return { ok: false, reason: decision.kind };
  }

  if (decision.kind === "link" && row) {
    // eslint-disable-next-line custmink/tenant-scoped-query -- links the global `users` row found above to its Clerk id
    await db()
      .update(schema.users)
      .set({
        externalId: identity.userId,
        name: identity.name ?? undefined,
        avatarUrl: identity.avatarUrl ?? undefined,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, row.id));
  }

  redirect("/dashboard");
}
