# SoftPage Business — Menu / Storefront App (`fastie`)

> Single source of truth for AI coding assistants. Tool-agnostic: Claude Code
> imports this via `CLAUDE.md`; Cursor and OpenAI Codex read `AGENTS.md`
> natively; `.github/copilot-instructions.md` links here. **Edit this file
> only** — the others are thin pointers. Keep it current: update the matching
> section in the same PR as the code change.
>
> ⚠️ Note: the `<!-- BEGIN:nextjs-agent-rules -->` block at the bottom is
> **auto-generated and re-added by `next dev`** (Next.js 16). Leave it in place —
> don't delete it (it just regenerates). Edit the SoftPage sections above it.

## What this is

The **customer-facing menu / storefront** app for **SoftPage Business** — the
public store a shopper/diner sees (restaurant menu, catalog, cart, checkout).
It is **multi-tenant by host**: the store is resolved from the request Host
(e.g. `asian-box-restaurant.softpage.in`) via the backend
`GET /api/v1/public/store/by-host`. Talks to the NestJS backend
(`new-softpagebusiness-nest-backend`).

## Tech stack

- **Framework:** **Next.js 16** (App Router, root `app/`) — see the note above;
  Next 16 has breaking changes vs older versions.
- **Language:** TypeScript, **React 19**. Node **>= 20**.
- **UI:** **Chakra UI v2** + `@chakra-ui/next-js` + Emotion, `framer-motion`,
  `react-icons`, `@fontsource` fonts; Leaflet / react-leaflet (+ optional Google
  Maps) for location.
- **State:** **Redux Toolkit** + `react-redux` + **redux-saga** (classic
  Redux store under `store/`).
- **Data:** `axios` + **GraphQL** at `${NEXT_PUBLIC_API_URL}/api/v1/graphql`;
  `js-cookie` for cookies.

## Running it

```bash
npm install
npm run dev          # next dev
npm run build        # next build
npm run start        # next start
npm run lint         # eslint
```

- **Backend origin:** `NEXT_PUBLIC_API_URL` (no trailing `/api`); GraphQL is
  `${NEXT_PUBLIC_API_URL}/api/v1/graphql`.
- **Store resolution:** production uses the Host subdomain; localhost/preview
  falls back to `NEXT_PUBLIC_BUSINESS_ID` / `NEXT_PUBLIC_BUSINESS_APP_ID` /
  `NEXT_PUBLIC_STORE_SUBDOMAIN`.
- **Maps:** `NEXT_PUBLIC_USE_GOOGLE_MAPS`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
  (OSM fallback). `NEXT_PUBLIC_*` is compile-time — restart/redeploy after
  changes. Copy `.env.example` → `.env.local`.

## Layout

```
app/            # LIVE Next.js 16 App Router app
  (menu)/       # the storefront/menu route group
  api/          # route handlers
  cdn-img/      # image handling
  layout.tsx, providers.tsx, sitemap.ts, robots.ts, emotion-registry.tsx
components/     # shared UI components
lib/            # data/helpers (API, GraphQL queries, store resolution, etc.)
store/          # Redux store (Redux Toolkit + redux-saga)
```

> Heads-up: a `src/` folder with CRA-style files (`App.js`, `index.js`,
> `Routes`, a separate `Store`) also exists and appears to be **legacy** from a
> pre-Next.js app. The live application is the root `app/` directory. Confirm
> before touching `src/`.

## Conventions (follow these)

- **Next.js 16 / App Router.** Before writing framework code, check the behavior
  against this Next version (the managed block below points at
  `node_modules/next/dist/docs/`) — don't assume older Next APIs.
- Server components by default; add `"use client"` only where needed.
- **Multi-tenant:** never hardcode a store/business — resolve it from Host (prod)
  or the `NEXT_PUBLIC_BUSINESS_*` fallbacks (local). Respect the active store
  context.
- **Data:** go through the existing `lib/` GraphQL/axios helpers and the Redux
  store rather than scattering fetch calls.
- **Public & SEO-sensitive:** this is a public storefront (has `sitemap.ts`,
  `robots.ts`) — keep pages SSR-friendly and fast (there's a
  `lighthouse-budget.json`).

## Monitoring (New Relic)

- Browser monitoring via `@newrelic/browser-agent` in
  `components/NewRelicBrowser.tsx` (mounted in `app/(menu)/layout.tsx`). Off unless
  `NEXT_PUBLIC_NEW_RELIC_ACCOUNT_ID`, `NEXT_PUBLIC_NEW_RELIC_BROWSER_APP_ID` and
  `NEXT_PUBLIC_NEW_RELIC_BROWSER_LICENSE_KEY` are set in Vercel (compile-time —
  redeploy after changing). Setup: `NEW_RELIC.md` in the backend repo.

## Documentation index

- No standalone docs yet — this file is the primary reference. Add topic docs at
  the repo root and index them here as the app grows.

> When a doc and the code disagree, the code wins — then fix the doc.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
