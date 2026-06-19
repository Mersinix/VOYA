---
name: Dashboard tab routing
description: How tab navigation works in VOYA dashboards — query params, not sub-routes
---

## Rule
Dashboards (Admin, Partner, Influencer) use `?tab=xxx` query params for tab navigation. Each role has a single route in App.tsx (`/admin`, `/partner`, `/influencer`). Sub-navigation is handled within the component using `useSearch()` from wouter.

## Why
Adding wildcard routes for each sub-page would complicate App.tsx and require additional ProtectedRoute wrappers. Query params are simpler and keep route config minimal.

## How to apply
- Sidebar nav items use `href="?tab=xxx"` links (plain `<a>` tags, not wouter `<Link>`)
- Dashboard components read: `const search = useSearch(); const tab = new URLSearchParams(search).get("tab") || "default"`
- Active state in sidebar: compare `currentTab` (from `window.location.search`) to each item's tab value
- In-page navigation buttons: use `window.location.search = "?tab=xxx"` or `<a href="?tab=xxx">`
