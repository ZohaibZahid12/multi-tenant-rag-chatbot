# Frontend

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4.

Run everything from the **repo root** — dependencies are installed once there via npm workspaces.

```bash
npm run dev          # http://localhost:3000
npm run build
npm run lint         # ESLint (next/core-web-vitals + typescript + prettier)
npm run typecheck    # next typegen && tsc --noEmit
```

Copy `.env.example` to `.env.local` and point `NEXT_PUBLIC_API_URL` at the Django API.

## Source layout

```
src/
├── app/                 # Routes only: page.tsx, layout.tsx, loading.tsx, route groups like (auth)/
├── components/
│   ├── ui/              # Generic, reusable primitives (Button, Input, Dialog…) — no business logic
│   └── layout/          # App shell pieces (Sidebar, Header, TenantSwitcher…)
├── features/            # One folder per domain, e.g. auth/, chat/, documents/, tenants/
│                        #   each with its own components/, hooks/, api.ts, types.ts
├── hooks/               # Hooks shared across features
├── lib/                 # Framework-agnostic helpers: API client for the DRF backend, utils
└── types/               # Types shared across features (API responses, etc.)
```

Rules of thumb:

- Keep `app/` thin — a page imports from `features/` and composes it.
- Code used by one feature lives inside that feature; move it to `components/`, `hooks/` or `lib/` only once a second feature needs it.
- Import with the `@/` alias (`@/features/chat/...`) instead of long relative paths.
