---
name: customFetch export from api-client-react
description: customFetch must be explicitly re-exported from the package index for frontend use
---

## Rule
`lib/api-client-react/src/index.ts` must explicitly export `customFetch` alongside `setBaseUrl` and `setAuthTokenGetter`. Without this, frontend code importing `customFetch` from `@workspace/api-client-react` gets a SyntaxError at runtime.

## Why
The package's barrel file uses selective exports — `export *` only covers generated hooks/schemas. The custom-fetch utilities must be named individually.

## How to apply
The correct export in `lib/api-client-react/src/index.ts`:
```ts
export { setBaseUrl, setAuthTokenGetter, customFetch } from "./custom-fetch";
```

## Custom API hooks pattern
For new endpoints not in the OpenAPI spec, create hooks in `artifacts/web/src/hooks/useApi.ts` that call `customFetch` directly with React Query. This avoids the need to update openapi.yaml and run codegen for every new endpoint.
