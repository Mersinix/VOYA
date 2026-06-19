---
name: Express 5 req.params type
description: req.params values are string | string[] in Express 5, must be cast before parseInt
---

## Rule
In Express 5, `req.params["id"]` has type `string | string[]`. Always cast to string before numeric parsing:

```ts
// WRONG — TypeScript error
const id = parseInt(req.params["id"]!, 10);

// CORRECT
const id = parseInt(req.params["id"] as string, 10);
```

## Why
Express 5 changed the params type signature to allow arrays for repeated segments. TypeScript will reject the non-casted version.
