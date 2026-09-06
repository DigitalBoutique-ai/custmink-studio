import { RuleTester } from "eslint";
import { describe, it } from "vitest";

import plugin from "../tools/eslint-plugin-custmink/index.mjs";

/**
 * The project lint rules are a security control, so they get tested like one.
 * A rule that silently stops firing is worse than no rule — it reads as a
 * passing gate.
 *
 * Cases are written in plain JavaScript with `.ts` filenames: the rules key off
 * paths and AST shape, not TypeScript syntax, so no TS parser is needed here.
 */

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: "module" },
});

const DATA_FILE = "/repo/lib/data/colorways.ts";
const ACTION_FILE = "/repo/lib/actions/colorways.ts";

ruleTester.run("require-server-only", plugin.rules["require-server-only"], {
  valid: [
    { code: 'import "server-only";\nexport const x = 1;', filename: DATA_FILE },
    // Pure mapping modules are deliberately isomorphic.
    { code: "export const x = 1;", filename: "/repo/lib/data/product-mapping.ts" },
    // The Drizzle schema is imported by migration tooling outside Next.
    { code: "export const x = 1;", filename: "/repo/db/schema.ts" },
    // Not a guarded directory.
    { code: "export const x = 1;", filename: "/repo/components/thing.tsx" },
  ],
  invalid: [
    { code: "export const x = 1;", filename: DATA_FILE, errors: [{ messageId: "missing" }] },
    {
      code: 'import { cache } from "react";\nexport const x = 1;',
      filename: "/repo/lib/auth/session.ts",
      errors: [{ messageId: "missing" }],
    },
  ],
});

ruleTester.run("tenant-scoped-query", plugin.rules["tenant-scoped-query"], {
  valid: [
    {
      code: "const rows = await db().select().from(products).where(eq(products.organizationId, organizationId));",
      filename: DATA_FILE,
    },
    {
      code: "await db().insert(colorways).values({ organizationId, name });",
      filename: ACTION_FILE,
    },
    // Not a db() chain at all.
    { code: "const rows = client.select().from(x);", filename: DATA_FILE },
  ],
  invalid: [
    {
      code: "const rows = await db().select().from(products);",
      filename: DATA_FILE,
      errors: [{ messageId: "unscoped" }],
    },
    {
      code: "await db().delete(colorways).where(eq(colorways.id, id));",
      filename: ACTION_FILE,
      errors: [{ messageId: "unscoped" }],
    },
    {
      // The classic mistake: scoping to an argument the caller controls.
      code: "await db().update(products).set(v).where(eq(products.id, productId));",
      filename: ACTION_FILE,
      errors: [{ messageId: "unscoped" }],
    },
  ],
});

ruleTester.run("require-capability-check", plugin.rules["require-capability-check"], {
  valid: [
    {
      code: "export const list = cache(async () => { const s = await getSession(); assertCan(s.role, 'product:read'); return []; });",
      filename: DATA_FILE,
    },
    {
      code: "export async function save(v) { const s = await requireSession(); return s; }",
      filename: ACTION_FILE,
    },
    // Sync helpers that build a cache key are not data access.
    { code: "export function tagFor(orgId) { return `x:${orgId}`; }", filename: DATA_FILE },
    // Non-exported helpers are covered by their caller.
    { code: "async function inner() { return 1; }", filename: DATA_FILE },
  ],
  invalid: [
    {
      code: "export async function listAll() { return db().select().from(products); }",
      filename: DATA_FILE,
      errors: [{ messageId: "missing" }],
    },
    {
      code: "export const load = cache(async () => { return rows; });",
      filename: DATA_FILE,
      errors: [{ messageId: "missing" }],
    },
  ],
});

ruleTester.run("no-dynamic-in-public", plugin.rules["no-dynamic-in-public"], {
  valid: [
    // The whole point: dynamic APIs are fine inside the authenticated segment.
    { code: "const { userId } = await auth();", filename: "/repo/app/(app)/layout.tsx" },
    { code: "const c = await cookies();", filename: "/repo/app/(app)/products/page.tsx" },
    { code: "export default function Layout() { return null; }", filename: "/repo/app/layout.tsx" },
    {
      code: "export const revalidate = 3600; export default function Page() { return null; }",
      filename: "/repo/app/(marketing)/page.tsx",
    },
  ],
  invalid: [
    {
      code: "const { userId } = await auth();",
      filename: "/repo/app/layout.tsx",
      errors: [{ messageId: "forbidden" }],
    },
    // The marketing group is public: static, crawled, never reads the request.
    {
      code: "const c = await cookies();",
      filename: "/repo/app/(marketing)/page.tsx",
      errors: [{ messageId: "forbidden" }],
    },
    {
      code: "const { userId } = await auth();",
      filename: "/repo/app/(marketing)/layout.tsx",
      errors: [{ messageId: "forbidden" }],
    },
    {
      code: "const c = await cookies();",
      filename: "/repo/app/(public)/sign-in/page.tsx",
      errors: [{ messageId: "forbidden" }],
    },
    {
      code: "const h = await headers();",
      filename: "/repo/middleware.ts",
      errors: [{ messageId: "forbidden" }],
    },
  ],
});
