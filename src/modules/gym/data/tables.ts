import type { Observable } from '@legendapp/state';
import { createTable, generateId } from '@/lib/sync';
import type {
  SyncRow,
  Table,
  MuscleGroup,
  Muscle,
  Exercise,
  ExerciseMuscle,
  Workout,
  WorkoutSet,
} from '@/modules/gym/types';

/** Raw synced table observables (each is a map keyed by row id). */
export const muscleGroups$ = createTable<MuscleGroup>('muscle_groups');
export const muscles$ = createTable<Muscle>('muscles');
export const exercises$ = createTable<Exercise>('exercises');
export const exerciseMuscles$ = createTable<ExerciseMuscle>('exercise_muscles');
export const workouts$ = createTable<Workout>('workouts');
export const workoutSets$ = createTable<WorkoutSet>('workout_sets');

export function nowIso(): string {
  return new Date().toISOString();
}

/** All non-deleted rows of a table as a plain array. */
export function rows<T extends SyncRow>(table$: Observable<Table<T>>): T[] {
  const map = (table$.get() ?? {}) as Table<T>;
  return Object.values(map).filter((r): r is T => !!r && !r.deleted);
}

/**
 * Legend-State supports dynamic key access (`table$[id]`) and returns an
 * observable with `.set`/`.assign`, but TS can't express that through generics,
 * so this helper narrows the dynamic access in one place.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function node<T>(table$: Observable<Table<T>>, id: string): any {
  return (table$ as unknown as Record<string, unknown>)[id];
}

type NewRow<T> = Omit<T, 'id' | 'created_at' | 'updated_at' | 'deleted'> & {
  id?: string;
};

/** Insert a row (generating id + timestamps). Returns the full row. */
export function putRow<T extends SyncRow>(
  table$: Observable<Table<T>>,
  data: NewRow<T>,
): T {
  const id = data.id ?? generateId();
  const ts = nowIso();
  const full = { ...data, id, created_at: ts, updated_at: ts, deleted: false } as T;
  node(table$, id).set(full);
  return full;
}

/** Patch a row and bump updated_at. */
export function updateRow<T extends SyncRow>(
  table$: Observable<Table<T>>,
  id: string,
  patch: Partial<T>,
): void {
  node(table$, id).assign({ ...patch, updated_at: nowIso() } as Partial<T>);
}

/** Soft-delete a row (kept locally with deleted=true, filtered out by `rows`). */
export function removeRow<T extends SyncRow>(
  table$: Observable<Table<T>>,
  id: string,
): void {
  node(table$, id).assign({ deleted: true, updated_at: nowIso() } as Partial<T>);
}
