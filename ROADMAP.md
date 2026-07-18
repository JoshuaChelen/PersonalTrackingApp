# Roadmap / Status

## Done (v1)
- Universal Expo scaffold (iOS/Android/web) + module registry & selector
- Gym: exercise library, specific muscle mapping, ~29 seeded lifts
- Custom exercise creation (name, equipment, rep range, muscle picker)
- Double-progression next-session recommendations
- Progress charts: est. 1RM / top set / volume, with date ranges
- Offline-first local persistence; Legend-State + Supabase sync wired
- Supabase schema + seed SQL; unit tests for recommend/stats logic

## Next up
- [ ] Create Supabase project, run migration + seed, fill in .env
- [ ] Deploy web build to Railway (PWA)
- [ ] EAS build to install on phone
- [ ] Edit an existing exercise (only create + delete exist today)

## Backlog / ideas
- Passcode + auth-scoped RLS (currently no login)
- Habits module (second tracker)
- Rest timer, bodyweight tracking, workout templates, kg toggle
