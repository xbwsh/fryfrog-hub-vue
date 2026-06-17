# Fryfrog Hub

Vue 3 media center frontend (music, comics, ebooks, video).

## Commands

```bash
npm run dev          # Vite dev server on :3540, proxies /api → :20058
npm run build        # vue-tsc -b && vite build
```

No lint, test, or formatter scripts exist. Type-check via `npm run build` (runs `vue-tsc -b`).

## Architecture

- **Three backends**: custom API (`/api`), Navidrome (`/navidrome-proxy`), Komga (`/komga-proxy`)
- **API clients**: `src/api/backend.ts`, `src/api/navidrome.ts`, `src/api/komga.ts` — each manages its own config/auth state
- **Stores**: `src/stores/connection.ts` (auth), `src/stores/player.ts` (audio playback), `src/stores/library.ts`, `src/stores/theme.ts`
- **Path alias**: `@/` → `src/` (configured in both `vite.config.ts` and `tsconfig.json`)

## Conventions

- Vue 3 Composition API with `<script setup lang="ts">`
- Chinese user-facing text (error messages, UI labels)
- CSS variables defined in `src/styles/main.css` (light theme only, no dark mode)
- Strict TS: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch` all enabled
- No ESLint/Prettier — follow existing code style

## Gotchas

- Dev server binds `0.0.0.0:3540` — accessible on LAN
- Navidrome/Komga proxies use `http-proxy-middleware` with custom error handling and `x-target-url` header forwarding
- Backend auth is hardcoded `666/666` — not a real auth system
- `player.ts` manages both Navidrome `Track` and backend `MusicTrack` via union type `AnyTrack`
