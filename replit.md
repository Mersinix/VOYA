# VOYA — Plateforme SaaS d'Affiliation

Plateforme professionnelle connectant des entreprises (partenaires) avec des influenceurs et vendeurs digitaux.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/web run dev` — run the frontend (port from $PORT)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server exec tsx src/seed.ts` — re-run seed data
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` — JWT secrets (defaults set for dev)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 + JWT auth (jsonwebtoken + bcryptjs)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (v3 syntax in api-server — use `z.string().email()` not `z.email()`)
- API codegen: Orval (from OpenAPI spec)
- Frontend: React + Vite, wouter, shadcn/ui, TanStack Query
- Build: esbuild (CJS bundle)

## Where things live

- `lib/db/src/schema/` — Drizzle table definitions (8 files: users, partners, influencers, categories, subscriptions, campaigns, tracking, commissions)
- `lib/api-spec/openapi.yaml` — source of truth for API contract
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `lib/api-zod/src/generated/` — generated Zod schemas
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/api-server/src/lib/auth.ts` — JWT utilities
- `artifacts/web/src/` — React frontend

## Architecture decisions

- JWT auth: access token 15min, refresh token 7 days stored in `refresh_tokens` table
- Three roles: `admin`, `partner`, `influencer` (pgEnum)
- Influencer levels computed from total followers: bronze (<10k), silver (10k-49k), gold (50k-99k), platinum (100k+)
- Zod v4 syntax (`z.email()`) does NOT work in api-server — esbuild resolves zod v3; use `z.string().email()`
- esbuild bundles api-server; `zod/v4` subpath import breaks the build — use `"zod"` import

## Product

VOYA est une plateforme SaaS d'affiliation B2B avec trois rôles :
- **Admin** : gestion globale (utilisateurs, campagnes, approbations)
- **Partenaire** : crée des campagnes d'affiliation, gère son abonnement, suit ses conversions
- **Influenceur** : rejoint des campagnes, génère des liens traçables, perçoit des commissions

Plans : Starter (49 DT/mo, 3 campagnes), Business (149 DT/mo, 10 campagnes), Premium (349 DT/mo, illimité)

## Test accounts (seed data)

- Admin: `admin@voya.com` / `admin123456`
- Partner 1: `beauty@glamour.tn` / `partner123`
- Partner 2: `contact@techpro.tn` / `partner123`
- Influencer: `sarah.beauty@gmail.com` / `influencer123`

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- **Never use `z.email()` in api-server** — this is Zod v4 syntax; esbuild bundles Zod v3. Use `z.string().email()`
- **Never import `zod/v4`** in api-server — use `"zod"` directly
- Express 5: wildcard routes use `/{*splat}`, async handlers need `: Promise<void>`, early returns use `res.status().json(); return;`
- pnpm-workspace: never run `pnpm dev` at workspace root; use `restart_workflow`
- Seed script uses tsx: `pnpm --filter @workspace/api-server exec tsx src/seed.ts`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
