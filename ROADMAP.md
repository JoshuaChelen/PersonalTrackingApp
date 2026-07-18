# Roadmap / Status

## Done (v1)
- Universal Expo scaffold (iOS/Android/web) + module registry & selector
- Gym: exercise library, specific muscle mapping, ~29 seeded lifts
- Custom exercise creation (name, equipment, rep range, muscle picker)
- Double-progression next-session recommendations
- Progress charts: est. 1RM / top set / volume, with date ranges
- Offline-first local persistence; Legend-State + Supabase sync wired
- Supabase schema + seed SQL; unit tests for recommend/stats logic

## Next up (cross-device sync — code done, needs your accounts)
Code + config landed: email/password login, session persistence, auth-gated
sync (`waitFor`), `0002_auth.sql`, `vercel.json`, `eas.json`. Remaining steps
are account setup (see README):
- [ ] Create Supabase project; run migrations 0001 + 0002 + seed; fill `.env`
- [ ] Enable Email auth, disable sign-ups, create your one account
- [ ] Deploy web build to **Vercel** (was Railway); add env vars there
- [ ] EAS `preview` APK to install on Android (set EAS env vars first)
- [ ] Edit an existing exercise (only create + delete exist today)

## Backlog / ideas
- Multi-user: `user_id` column + `auth.uid()`-scoped RLS (today: single account)
- PWA offline: add a service worker so the web app loads with no signal
- Habits module (second tracker)
- Rest timer, bodyweight tracking, workout templates, kg toggle
