import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescriptConfig from "eslint-config-next/typescript";

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
];

export default eslintConfig;
