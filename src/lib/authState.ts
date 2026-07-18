import { observable } from '@legendapp/state';

/**
 * True once a Supabase auth session exists on this device. The synced tables
 * in `createTable` (src/lib/sync.ts) pass this as `waitFor`, so remote sync
 * doesn't start — and doesn't 401 against the authenticated-only RLS policies —
 * until the user is logged in. The AuthProvider (src/lib/auth.tsx) keeps it in
 * sync with `supabase.auth`.
 *
 * Lives in its own module so both `sync.ts` and `auth.tsx` can import it without
 * a circular dependency. When Supabase is not configured we run local-only and
 * this value is never read.
 */
export const isAuthed$ = observable(false);
