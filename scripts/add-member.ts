import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "../db/schema";
import { ROLES, type Role } from "../lib/auth/permissions";
import { normalizeEmail, pendingExternalId } from "../lib/seats/rules";

config({ path: ".env.local" });
config({ path: ".env" });

// Its own client rather than `db/index.ts`, which imports "server-only" and so
// cannot be loaded from a script. Same arrangement as `scripts/seed.ts`.
const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is not set — copy .env.example to .env.local first.");
}
const db = () => drizzle(neon(url), { schema });

/**
 * Provision a seat: `npm run member:add -- --email x@y.com --org <slug> --role owner`
 * Add `--create-org "Display Name"` to create the organization under that slug
 * first — a fresh production database has none.
 *
 * Creates (or finds) the `users` row for the email and grants the membership.
 * The row is created unclaimed (`pending:<email>`); the person links it to
 * their Clerk identity at `/welcome` on first sign-in. Re-running is safe: an
 * existing user keeps their link, and an existing membership takes the new
 * role. Runs against whatever `DATABASE_URL` is in the environment — check it.
 */

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

async function main() {
  const email = arg("email");
  const slug = arg("org");
  const role = (arg("role") ?? "designer") as Role;

  if (!email || !slug) throw new Error("Usage: --email <address> --org <slug> [--role <role>]");
  if (!ROLES.includes(role)) throw new Error(`Unknown role "${role}". One of: ${ROLES.join(", ")}`);

  const createName = arg("create-org");
  if (createName) {
    await db()
      .insert(schema.organizations)
      .values({ externalId: `local:${slug}`, name: createName, slug })
      .onConflictDoNothing({ target: schema.organizations.slug });
  }

  const [organization] = await db()
    .select({ id: schema.organizations.id, name: schema.organizations.name })
    .from(schema.organizations)
    .where(eq(schema.organizations.slug, slug))
    .limit(1);
  if (!organization) throw new Error(`No organization with slug "${slug}" — pass --create-org "Name" to create it`);

  const [user] = await db()
    .insert(schema.users)
    .values({ externalId: pendingExternalId(email), email: normalizeEmail(email) })
    .onConflictDoUpdate({ target: schema.users.email, set: { updatedAt: new Date() } })
    .returning({ id: schema.users.id, externalId: schema.users.externalId });
  if (!user) throw new Error("Failed to upsert the user");

  await db()
    .insert(schema.memberships)
    .values({ organizationId: organization.id, userId: user.id, role })
    .onConflictDoUpdate({
      target: [schema.memberships.organizationId, schema.memberships.userId],
      set: { role, updatedAt: new Date() },
    });

  const state = user.externalId.startsWith("pending:") ? "unclaimed — claim at /welcome" : "linked";
  console.log(`${normalizeEmail(email)} is ${role} of ${organization.name} (${state})`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
