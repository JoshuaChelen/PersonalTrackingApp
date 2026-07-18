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

Supabase is the cloud database that syncs your data across devices — it's the
one thing that makes the same workouts appear on your phone and your computers.
(Hosting the web app on Vercel, below, is a separate concern: that just serves
the web *page*; it stores no data.)

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run in order: `supabase/migrations/0001_init.sql`,
   `supabase/migrations/0002_auth.sql`, then `supabase/seed.sql` (the seed
   populates the muscle + exercise catalogue).
3. Copy your project URL and anon key (Settings → API) into `.env`:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   ```
4. Restart the dev server. Data now syncs across every device using the same
   keys, with realtime updates.

### Set up your login

`0002_auth.sql` locks the data behind an authenticated login. This is a
single-account personal app, so:

1. Authentication → Providers → **Email**: enable it, and turn **off** "Enable
   sign ups" (so only your account can ever exist).
2. Authentication → Users → **Add user**: create your one account (email +
   password), and confirm it.
3. Launch the app — it now shows a login screen. Sign in once per device and you
   stay signed in (session is persisted + auto-refreshed) until you tap Sign out.

> **Security note:** the anon key ships in the client bundle (public by design),
> but with `0002_auth.sql` the RLS policies require an authenticated session, so
> the data isn't readable with the key alone. Because only your account exists,
> "any authenticated user" effectively means you. To grow to true multi-user
> later, add a `user_id` column and `auth.uid()`-scoped policies (see the note in
> `0002_auth.sql`).

## Deploying

**Web / PWA (desktop + laptop):**
```bash
npx expo export -p web     # outputs a static site to ./dist
```
Deploy `./dist` as a static site on **Vercel** (`vercel.json` in the repo sets
the build command, output dir, and the SPA rewrite to `index.html` that the
`output: "single"` build needs). Add `EXPO_PUBLIC_SUPABASE_URL` and
`EXPO_PUBLIC_SUPABASE_ANON_KEY` as Vercel project env vars so the build embeds
them. Any static host works (Netlify, Cloudflare Pages, etc.) — just replicate
the SPA fallback.

On Android/Chrome you can "Add to Home Screen" to install this as a PWA (an
app-like icon, full screen). Note: the web export has no service worker, so the
PWA won't load with *zero* signal — use the native Android build below for
fully-offline gym logging.

**Phone (native install, Android):** iterate day-to-day with Expo Go
(`npm run start`). For a real installable app with true offline support, use
[EAS Build](https://docs.expo.dev/build/introduction/) — `eas.json` defines a
`preview` profile that outputs an installable **APK**:
```bash
npm i -g eas-cli
eas login
eas build:configure
# Make the Supabase keys available to the cloud build (.env is gitignored, so
# it isn't uploaded). Set them as EAS environment variables once:
eas env:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://xxxx.supabase.co"
eas env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "eyJhbGci..."
eas build --profile preview --platform android   # download + install the APK
```
Because native bundles the JS, logging works with no signal and syncs when back
online. (iOS builds also run in the cloud via EAS — no Mac required — but
installing on an iPhone needs an Apple Developer account.)

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
