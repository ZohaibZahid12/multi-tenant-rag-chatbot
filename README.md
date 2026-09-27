# Multi-tenant RAG Chatbot

Monorepo with a Next.js frontend and a Django REST Framework backend.

```
.
├── apps/
│   ├── frontend/            # Next.js 16 + TypeScript + Tailwind   → apps/frontend/README.md
│   └── backend/             # Django 6 + Django REST Framework     → apps/backend/README.md
├── .husky/pre-commit        # Runs lint-staged on every commit
├── .vscode/                 # Shared editor settings + recommended extensions
├── .editorconfig            # Indentation / line endings for every editor
├── .gitignore               # One ignore file for Node and Python
├── .nvmrc                   # Node version
├── .prettierignore
├── lint-staged.config.mjs   # Pre-commit formatting for root-level files
├── prettier.config.mjs      # Shared Prettier config (JS/TS/CSS/JSON/Markdown)
└── package.json             # npm workspaces + root scripts for both apps
```

## Requirements

- Node.js ≥ 20.9 (`nvm use` picks the version in `.nvmrc`)
- Python ≥ 3.12 (3.14 recommended, see `apps/backend/.python-version`)

## Getting started

```bash
npm install                  # JS dependencies for every workspace + the git hook
npm run setup:backend        # Python virtualenv, backend dependencies, database migrations
cp apps/frontend/.env.example apps/frontend/.env.local
cp apps/backend/.env.example apps/backend/.env
npm run dev                  # frontend on :3000 and backend on :8000, side by side
```

| URL                               | What                         |
| --------------------------------- | ---------------------------- |
| http://localhost:3000             | Next.js app                  |
| http://localhost:8000/api/health/ | API health check             |
| http://localhost:8000/api/docs/   | Swagger UI for the whole API |
| http://localhost:8000/admin/      | Django admin                 |

## Scripts (run from the repo root)

| Script                  | What it does                                       |
| ----------------------- | -------------------------------------------------- |
| `npm run setup:backend` | Create `apps/backend/.venv`, install deps, migrate |
| `npm run dev`           | Run frontend and backend together                  |
| `npm run dev:frontend`  | Only the Next.js dev server                        |
| `npm run dev:backend`   | Only the Django dev server                         |
| `npm run build`         | Production build of the frontend                   |
| `npm run lint`          | ESLint (frontend) + Ruff (backend)                 |
| `npm run lint:fix`      | Same, with auto-fix                                |
| `npm run typecheck`     | TypeScript check                                   |
| `npm run test`          | Backend tests (pytest)                             |
| `npm run format`        | Prettier (frontend/root) + Ruff format (backend)   |
| `npm run format:check`  | Fail if anything is not formatted (use in CI)      |

Add a frontend dependency with `npm install <pkg> -w frontend`.
Add a backend dependency to `apps/backend/requirements/base.txt` (or `dev.txt`) and re-run `npm run setup:backend`.

## Code quality

| Area     | Formatter                         | Linter                                  |
| -------- | --------------------------------- | --------------------------------------- |
| Frontend | Prettier (+ Tailwind class order) | ESLint (Next.js rules, Prettier-safe)   |
| Backend  | Ruff format                       | Ruff (pyflakes, isort, bugbear, Django) |

On every commit, Husky runs lint-staged. It lints and formats only the staged files and picks the closest `lint-staged.config.mjs`, so frontend, backend and root files each get the right tools.
