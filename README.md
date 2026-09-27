# Multi-tenant RAG Chatbot

Monorepo with a Next.js frontend and a Django REST Framework backend.

```
.
├── apps/
│   ├── frontend/            # Next.js 16 + TypeScript + Tailwind  → see apps/frontend/README.md
│   └── backend/             # Django REST Framework API (coming next)
├── .husky/pre-commit        # Runs lint-staged on every commit
├── .vscode/                 # Shared editor settings + recommended extensions
├── .editorconfig            # Indentation / line endings for every editor
├── .gitignore               # One ignore file for Node and Python
├── .nvmrc                   # Node version
├── .prettierignore
├── lint-staged.config.mjs   # Pre-commit formatting for root-level files
├── prettier.config.mjs      # Shared Prettier config
└── package.json             # npm workspaces + root scripts
```

## Requirements

- Node.js ≥ 20.9 (`nvm use` picks the version in `.nvmrc`)
- Python 3.12+ for the backend

## Getting started

```bash
npm install                  # installs every JS workspace and sets up the git hook
cp apps/frontend/.env.example apps/frontend/.env.local
npm run dev                  # frontend on http://localhost:3000
```

## Scripts (run from the repo root)

| Script                 | What it does                                  |
| ---------------------- | --------------------------------------------- |
| `npm run dev`          | Start the Next.js dev server                  |
| `npm run build`        | Production build of the frontend              |
| `npm run lint`         | ESLint on the frontend                        |
| `npm run lint:fix`     | ESLint with auto-fix                          |
| `npm run typecheck`    | TypeScript check                              |
| `npm run format`       | Prettier on the whole repo                    |
| `npm run format:check` | Fail if anything is not formatted (use in CI) |

Add a dependency to the frontend with `npm install <pkg> -w frontend`.

## Code quality

- **Prettier** formats JS/TS/JSON/CSS/Markdown and sorts Tailwind classes.
- **ESLint** lints the frontend. `eslint-config-prettier` turns off rules that would clash with Prettier.
- **Husky + lint-staged** run ESLint and Prettier on staged files before each commit.
