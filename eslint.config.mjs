import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescriptConfig from "eslint-config-next/typescript";

import custmink from "./tools/eslint-plugin-custmink/index.mjs";

/** Flat config — eslint-config-next 16 ships native flat configs, no FlatCompat needed. */
const eslintConfig = [
  { ignores: ["archive/**", ".next/**", "node_modules/**", "next-env.d.ts"] },
  ...coreWebVitals,
  ...typescriptConfig,
  {
    rules: {
      // Placeholder parameters on the data-access seams stay named for the
      // signatures Phase 1B fills in.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    // Project-specific rules: tenancy, the server boundary, and the rendering
    // mistakes that silently void the Neon compute budget. See
    // tools/eslint-plugin-custmink/index.mjs.
    files: ["app/**/*.{ts,tsx}", "lib/**/*.ts", "db/**/*.ts", "middleware.ts"],
    plugins: { custmink },
    rules: {
      "custmink/require-server-only": "error",
      "custmink/tenant-scoped-query": "error",
      "custmink/require-capability-check": "error",
      "custmink/no-dynamic-in-public": "error",
    },
  },
];

export default eslintConfig;
