@AGENTS.md

# Progress Tracker — architecture notes

Personal offline-first tracker. Expo SDK 57 + Expo Router + React Native Web
(iOS/Android/web from one codebase). See `README.md` for setup/deploy.

## Key decisions

- **State/sync:** Legend-State **v3** (`@legendapp/state@3.0.0-beta.48`, pinned —
  v2 has no Supabase plugin). `syncedSupabase` gives offline-first sync; persist
  is IndexedDB on web / AsyncStorage on native. All sync config lives in
  `src/lib/sync.ts` (`createTable`, `COLLECTIONS`, `generateId`).
- **Local-only fallback:** `src/lib/supabase.ts` exports `isSupabaseConfigured`.
  With blank `.env`, `createTable` returns a locally-persisted observable and
  `ensureLocalSeed()` loads the starter catalogue. Do not break this path.
- **Reactivity:** screens are wrapped in `observer()` from
  `@legendapp/state/react`; data helpers read `.get()` inside them. Dynamic table
  key access goes through the `node()` helper in `data/tables.ts` (TS can't type
  `table$[id]` through generics).
- **Extensibility:** `src/modules/registry.ts` is the module seam. Gym is the
  first module under `app/gym/` + `src/modules/gym/`.
- **Sync columns:** every table has `created_at`, `updated_at`, `deleted` (soft
  delete). Selectors filter `deleted`; writes bump `updated_at`.

## Gotchas

- Reanimated 4 needs `react-native-worklets` installed (peer). Metro caches
  module resolution — restart the dev server after adding native deps.
- Pure logic (`logic/recommend.ts`, `logic/stats.ts`) is unit-tested via a
  lightweight `jest.config.js` (babel-jest, node env) — NOT jest-expo.
- SQL in `supabase/` mirrors `src/modules/gym/data/seedData.ts`; keep them in sync.

## Commands

`npm run start` · `npm run web` · `npm test` · `npm run typecheck`
