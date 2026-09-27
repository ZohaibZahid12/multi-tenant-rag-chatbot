/**
 * Shared Prettier config for every JS/TS package in the monorepo.
 * Python code in apps/backend is formatted by Ruff instead.
 *
 * @type {import("prettier").Config}
 */
const config = {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  bracketSpacing: true,
  arrowParens: "always",
  endOfLine: "lf",
  plugins: ["prettier-plugin-tailwindcss"],
  overrides: [
    {
      // Lets the Tailwind plugin sort class names using the frontend's Tailwind v4 theme.
      files: "apps/frontend/**",
      options: {
        tailwindStylesheet: "./apps/frontend/src/app/globals.css",
        tailwindFunctions: ["clsx", "cn", "cva"],
      },
    },
  ],
};

export default config;
