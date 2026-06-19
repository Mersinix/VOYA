---
name: Database bootstrap
description: The Postgres DB starts empty — drizzle-kit push must be run before the app can serve any request.
---

# Database bootstrap

The Replit Postgres database starts with zero tables. Drizzle is code-first with no auto-migration on startup.

**Rule:** Before the app can handle any request (login, register, etc.), the schema must be pushed once:

```bash
pnpm --filter @workspace/db run push --force
```

Run from workspace root. Takes ~5 seconds, prints `[✓] Changes applied`.

**Why:** `lib/db/src/index.ts` just opens a pool connection — it does NOT run migrations. drizzle-kit push is the only migration mechanism configured (no migration files, no `migrate()` call in app startup).

**How to apply:** Any time the DB is freshly provisioned, the container restarts from scratch, or a new developer sets up the project — run push before starting the API server.
