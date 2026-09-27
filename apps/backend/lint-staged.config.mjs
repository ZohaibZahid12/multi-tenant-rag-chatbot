/**
 * Runs on `git commit` for staged files inside apps/backend.
 * Uses Ruff from the backend virtualenv, so run `npm run setup:backend` once first.
 *
 * @type {import("lint-staged").Configuration}
 */
const config = {
  "*.py": [".venv/bin/ruff check --fix", ".venv/bin/ruff format"],
};

export default config;
