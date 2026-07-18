# Progress Tracker

A personal, offline-first progress tracker. Starts with a **gym / weightlifting**
module and is architected so other trackers (habits, etc.) can be added behind a
module selector. One codebase runs on **iOS, Android, and the web/desktop** via
Expo + React Native Web.

## Features (gym module)

- **Exercise library** with specific muscle mapping (e.g. Triceps Pushdown →
  triceps *lateral head* + *medial head* primary, *long head* secondary).
  Prepopulated with ~29 common lifts; add your own with a muscle picker.
- **Next-session recommendations** using double progression: climb from your min
  reps to max reps at a fixed weight, then add weight and reset (your 7→10 rep
  method). Shown inline while logging.
- **Progress charts**: estimated 1RM (Epley), top-set weight, and volume over
  time, with 1M / 3M / All ranges and a then-vs-now summary.
- **Offline-first**: log at the gym with no signal; syncs automatically when back
  online (via Legend-State + Supabase). Works fully local-only with no backend.

## Tech stack

- **Expo (SDK 57) + Expo Router + TypeScript**, React Native Web for desktop.
- **Legend-State v3** (`syncedSupabase`) for offline-first state + sync.
  Local persistence: IndexedDB on web, AsyncStorage on native.
- **Supabase** (Postgres) as the backend. `react-native-svg` for charts.

## Getting started

```bash
npm install
npm run start      # then press 'w' for web, or scan the QR in Expo Go
npm run web        # web directly
npm test           # unit tests for the recommendation + stats logic
npm run typecheck  # tsc --noEmit
```

Without any configuration the app runs **local-only** (data persists on the
device but does not sync across devices).

## Enabling cloud sync (Supabase)

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run `supabase/migrations/0001_init.sql`, then
   `supabase/seed.sql` (the seed populates the muscle + exercise catalogue).
3. Copy your project URL and anon key (Settings → API) into `.env`:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   ```
4. Restart the dev server. Data now syncs across every device using the same
   keys, with realtime updates.

> **Security note:** v1 has no login. The anon key ships in the client bundle, so
> your data is protected only by the obscurity of your project URL + key. The
> schema keeps RLS enabled with permissive `anon` policies; to lock it down later,
> add auth and switch the policies in `0001_init.sql` to `auth.uid()`-scoped ones.

## Deploying

**Web / PWA (desktop):**
```bash
npx expo export -p web     # outputs a static site to ./dist
```
Serve `./dist` as a static site on Railway (or any static host). Because the web
build uses `output: "single"` (SPA), configure the host to fall back to
`index.html` for all routes.

**Phone (native install):** iterate with Expo Go (`npm run start`). For a real
installable build, use [EAS Build](https://docs.expo.dev/build/introduction/):
```bash
npm i -g eas-cli && eas build --profile development --platform android
```
(iOS builds run in the cloud via EAS — no Mac required.)

## Project structure

```
app/                     Expo Router routes (screens)
  index.tsx              module selector / home
  gym/                   gym module screens (dashboard, workout, exercises, stats)
src/
  modules/registry.ts    module registry — add new trackers here
  modules/gym/
    types.ts             domain types
    data/                Legend-State tables + CRUD + queries + local seed
    logic/               recommend.ts, stats.ts (pure, unit-tested)
  lib/                   supabase client, sync config, formatting
  components/            shared UI + LineChart
  theme/                 design tokens
supabase/                SQL migration + seed (mirrors data/seedData.ts)
```

## Adding a new module later

Add an entry to `src/modules/registry.ts`, create an `app/<id>/` route folder,
and give it its own tables in `src/lib/sync.ts` (`COLLECTIONS`) + Supabase
migration. The home shell and navigation need no changes.
```
