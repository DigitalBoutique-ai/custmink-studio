/**
 * Project-specific lint rules for Custm.ink Studio.
 *
 * These encode the four mistakes that are cheap to make here and expensive to
 * find later: leaking a server module into the client bundle, running a query
 * without a tenant filter, exposing a data function with no authorization
 * check, and opting the whole app into dynamic rendering from a shared layout.
 *
 * Lint is the right layer for them — it is local, deterministic, runs on every
 * save, and blocks before commit rather than after deploy.
 */

/** Posix-normalized path so the globs behave the same on any platform. */
function filePath(context) {
  return (context.filename ?? context.getFilename()).replaceAll("\\", "/");
}

/** Every function/method name called anywhere inside a subtree. */
function collectCallNames(node, out = new Set()) {
  if (!node || typeof node !== "object") return out;
  if (Array.isArray(node)) {
    for (const child of node) collectCallNames(child, out);
    return out;
  }
  if (node.type === "CallExpression") {
    const callee = node.callee;
    if (callee?.type === "Identifier") {
      out.add(callee.name);
    } else if (callee?.type === "MemberExpression" && callee.property?.type === "Identifier") {
      out.add(callee.property.name);
    }
  }
  for (const key of Object.keys(node)) {
    if (key === "parent") continue;
    const value = node[key];
    if (value && typeof value === "object") collectCallNames(value, out);
  }
  return out;
}

const SERVER_ONLY_DIRS = ["/lib/data/", "/lib/actions/", "/lib/auth/", "/db/"];

/** @type {import("eslint").Rule.RuleModule} */
const requireServerOnly = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Server-only modules must import 'server-only' so they can never be pulled into a client bundle",
    },
    schema: [],
    messages: {
      missing:
        "Add `import \"server-only\";` as the first import. Without it this module can be bundled into the client, shipping database access and secrets to the browser.",
    },
  },
  create(context) {
    const path = filePath(context);
    if (!SERVER_ONLY_DIRS.some((dir) => path.includes(dir))) return {};
    // Pure mapping and config modules are deliberately isomorphic.
    if (path.endsWith("-mapping.ts") || path.endsWith("/permissions.ts")) return {};
    // The schema is table definitions, not credentials or queries, and
    // drizzle-kit and scripts/seed.ts import it outside the Next runtime.
    if (path.endsWith("/db/schema.ts")) return {};

    return {
      Program(node) {
        const hasServerOnly = node.body.some(
          (statement) =>
            statement.type === "ImportDeclaration" && statement.source.value === "server-only",
        );
        if (!hasServerOnly) {
          context.report({ node, messageId: "missing" });
        }
      },
    };
  },
};

const TENANT_QUERY_METHODS = new Set(["select", "insert", "update", "delete"]);

/** @type {import("eslint").Rule.RuleModule} */
const tenantScopedQuery = {
  meta: {
    type: "problem",
    docs: {
      description: "Database queries must filter on the session's organization",
    },
    schema: [],
    messages: {
      unscoped:
        "This `db()` query never mentions `organizationId`. Every tenant-owned query must filter on the organization from `getSession()` — never from an argument, a route param, or model output. Add the filter, or add an eslint-disable with a one-line reason if the table is genuinely global.",
    },
  },
  create(context) {
    const source = context.sourceCode ?? context.getSourceCode();

    return {
      CallExpression(node) {
        // Match `db().select(...)` and friends — the start of a query chain.
        if (node.callee.type !== "MemberExpression") return;
        const property = node.callee.property;
        if (property?.type !== "Identifier" || !TENANT_QUERY_METHODS.has(property.name)) return;

        const object = node.callee.object;
        const isDbCall =
          object.type === "CallExpression" &&
          object.callee.type === "Identifier" &&
          object.callee.name === "db";
        if (!isDbCall) return;

        // Walk up to the outermost chained expression so `.where()` is included.
        let outermost = node;
        while (
          outermost.parent &&
          (outermost.parent.type === "MemberExpression" ||
            outermost.parent.type === "CallExpression")
        ) {
          outermost = outermost.parent;
        }

        if (!source.getText(outermost).includes("organizationId")) {
          context.report({ node, messageId: "unscoped" });
        }
      },
    };
  },
};

const AUTH_CALLS = new Set(["assertCan", "requireSession", "getSession"]);

/** @type {import("eslint").Rule.RuleModule} */
const requireCapabilityCheck = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Exported data and action functions must resolve a session and check a capability",
    },
    schema: [],
    messages: {
      missing:
        'Exported function "{{name}}" never calls `requireSession()`, `getSession()`, or `assertCan()`. Authorization belongs in the data layer, not the UI.',
    },
  },
  create(context) {
    const path = filePath(context);
    if (!path.includes("/lib/data/") && !path.includes("/lib/actions/")) return {};
    if (path.endsWith("-mapping.ts")) return {};

    const CACHE_WRAPPERS = new Set(["cache", "unstable_cache"]);

    /** Data access is async, or wrapped in a cache helper. Sync helpers are not. */
    function isDataAccess(node) {
      if (node.type === "CallExpression") {
        const callee = node.callee;
        return callee?.type === "Identifier" && CACHE_WRAPPERS.has(callee.name);
      }
      return node.async === true;
    }

    function check(node, name) {
      if (!isDataAccess(node)) return;
      const called = collectCallNames(node);
      const guarded = [...called].some((callName) => AUTH_CALLS.has(callName));
      if (!guarded) {
        context.report({ node, messageId: "missing", data: { name: name ?? "anonymous" } });
      }
    }

    return {
      "ExportNamedDeclaration > FunctionDeclaration"(node) {
        check(node, node.id?.name);
      },
      // Covers `export const listX = cache(async () => {...})`.
      "ExportNamedDeclaration > VariableDeclaration > VariableDeclarator"(node) {
        if (!node.init) return;
        const initType = node.init.type;
        if (
          initType !== "ArrowFunctionExpression" &&
          initType !== "FunctionExpression" &&
          initType !== "CallExpression"
        ) {
          return;
        }
        check(node.init, node.id?.name);
      },
    };
  },
};

const DYNAMIC_APIS = new Set(["cookies", "headers", "draftMode", "connection", "auth"]);

/** @type {import("eslint").Rule.RuleModule} */
const noDynamicInPublic = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Dynamic request APIs must not appear in the root layout or public routes",
    },
    schema: [],
    messages: {
      forbidden:
        "`{{name}}()` reads the request, which opts this route and everything below it into dynamic rendering and voids the `revalidate` windows the Neon compute rules depend on. Move it into `app/(app)/**`.",
    },
  },
  create(context) {
    const path = filePath(context);
    const isRootLayout = path.endsWith("/app/layout.tsx");
    const isPublicRoute = path.includes("/app/(public)/");
    const isMiddleware = path.endsWith("/middleware.ts");
    if (!isRootLayout && !isPublicRoute && !isMiddleware) return {};

    return {
      CallExpression(node) {
        if (node.callee.type !== "Identifier") return;
        if (!DYNAMIC_APIS.has(node.callee.name)) return;
        context.report({ node, messageId: "forbidden", data: { name: node.callee.name } });
      },
    };
  },
};

const plugin = {
  meta: { name: "eslint-plugin-custmink", version: "1.0.0" },
  rules: {
    "require-server-only": requireServerOnly,
    "tenant-scoped-query": tenantScopedQuery,
    "require-capability-check": requireCapabilityCheck,
    "no-dynamic-in-public": noDynamicInPublic,
  },
};

export default plugin;
