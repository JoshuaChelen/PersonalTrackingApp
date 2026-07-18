import { Platform } from 'react-native';
import { observable, type Observable } from '@legendapp/state';
import { configureSynced, syncObservable } from '@legendapp/state/sync';
import { syncedSupabase } from '@legendapp/state/sync-plugins/supabase';
import { observablePersistAsyncStorage } from '@legendapp/state/persist-plugins/async-storage';
import { observablePersistIndexedDB } from '@legendapp/state/persist-plugins/indexeddb';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import type { Table } from '@/modules/gym/types';

/**
 * All synced tables. IndexedDB (web) needs every table name declared up front;
 * bump the `version` below whenever this list changes.
 */
export const COLLECTIONS = [
  'muscle_groups',
  'muscles',
  'exercises',
  'exercise_muscles',
  'workouts',
  'workout_sets',
] as const;

export type Collection = (typeof COLLECTIONS)[number];

/**
 * RFC4122-style v4 id. Uses Math.random rather than a crypto polyfill — more
 * than sufficient for a single-user personal app, and avoids an extra native dep.
 */
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** Local persistence plugin: IndexedDB on web, AsyncStorage on native. */
const persistPlugin =
  Platform.OS === 'web'
    ? observablePersistIndexedDB({
        databaseName: 'progress_tracker',
        version: 1,
        tableNames: [...COLLECTIONS],
      })
    : observablePersistAsyncStorage({ AsyncStorage });

/**
 * Pre-configured Supabase sync with our table conventions baked in
 * (soft delete, incremental sync, local persistence, infinite retry).
 * Null when Supabase env vars are not set — then we run local-only.
 */
const supaSync = supabase
  ? configureSynced(syncedSupabase, {
      supabase,
      persist: { plugin: persistPlugin, retrySync: true },
      generateId,
      changesSince: 'last-sync',
      fieldCreatedAt: 'created_at',
      fieldUpdatedAt: 'updated_at',
      fieldDeleted: 'deleted',
      retry: { infinite: true },
    })
  : null;

/**
 * Create an observable map (keyed by row id) for a table.
 * - With Supabase configured: offline-first two-way sync + realtime.
 * - Without: local persistence only (still fully usable offline on one device).
 */
export function createTable<T extends { id: string }>(
  collection: Collection,
): Observable<Table<T>> {
  if (supaSync) {
    return observable(
      supaSync({
        collection,
        as: 'object',
        realtime: true,
        persist: { name: collection },
      }),
    ) as unknown as Observable<Table<T>>;
  }

  // Local-only fallback: a persisted observable with no remote.
  const obs$ = observable<Table<T>>({});
  syncObservable(obs$, { persist: { name: collection, plugin: persistPlugin } });
  return obs$;
}
