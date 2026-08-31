import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { serverEnv } from "@/lib/env";
import * as schema from "@/db/schema";

/**
 * Database client.
 *
 * Uses the Neon HTTP driver for one-shot reads in serverless functions, per the
 * project's Neon compute rules — the pooled/WebSocket driver is reserved for
 * transactions and long interactive work. The client is created lazily so a
 * build or a route that never touches Postgres does not require DATABASE_URL
 * and does not wake the database.
 */

type Database = ReturnType<typeof createClient>;

function createClient() {
  const sql = neon(serverEnv().DATABASE_URL);
  return drizzle(sql, { schema });
}

let client: Database | null = null;

export function db(): Database {
  if (!client) {
    client = createClient();
  }
  return client;
}

export { schema };
