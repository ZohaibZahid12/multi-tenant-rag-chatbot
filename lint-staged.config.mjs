/**
 * Runs on `git commit` for staged files outside any package that has its own config.
 * lint-staged always picks the config closest to each staged file.
 *
 * @type {import("lint-staged").Configuration}
 */
const config = {
  "*": "prettier --write --ignore-unknown",
};

export default config;
