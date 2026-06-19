---
name: Zod esbuild compatibility in api-server
description: Zod v4 syntax and zod/v4 subpath imports break esbuild bundling in api-server — use Zod v3 syntax and "zod" direct import
---

## Rule
Never use `z.email()` or `import from "zod/v4"` in api-server route/lib files.

**Why:** The pnpm workspace catalog pins `zod: ^3.25.76`. esbuild bundles api-server from src/, and it cannot resolve the `zod/v4` package subpath export. Also, `z.email()` is Zod v4 API — it doesn't exist in v3.

**How to apply:**
- In api-server, always import: `import { z } from "zod";`
- Use Zod v3 validation syntax: `z.string().email()` not `z.email()`
- The db schema files use `zod/v4` syntax (compiled by tsc, not esbuild) — that's fine, don't change those
- Only applies to api-server route and lib files bundled by esbuild
