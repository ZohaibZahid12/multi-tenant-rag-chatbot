/**
 * Runs on `git commit` for staged files inside apps/frontend.
 * (Files elsewhere in the repo use the root lint-staged.config.mjs.)
 *
 * @type {import("lint-staged").Configuration}
 */
const config = {
  "*.{js,jsx,ts,tsx,mjs,cjs}": ["eslint --fix", "prettier --write"],
  "*.{json,css,md,yml,yaml}": "prettier --write",
};

export default config;
