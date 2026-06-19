---
name: Drizzle ORM inArray for set membership
description: Use inArray() helper, NOT sql template literals with ANY() for array IN clauses
---

## Rule
When filtering by a set of IDs in Drizzle ORM, always use the `inArray` helper:

```ts
import { inArray } from "drizzle-orm";

// CORRECT
.where(inArray(table.columnId, arrayOfIds))

// WRONG — causes runtime SQL error
.where(sql`column_id = ANY(${arrayOfIds})`)
```

## Why
The `sql` template literal doesn't serialize JS arrays as PostgreSQL `ARRAY` literals automatically. The `inArray` helper generates the correct `col IN ($1, $2, ...)` SQL.
