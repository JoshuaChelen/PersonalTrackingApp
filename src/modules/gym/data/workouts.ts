import type { Workout, WorkoutSet } from '@/modules/gym/types';
import {
  putRow,
  removeRow,
  rows,
  updateRow,
  workoutSets$,
  workouts$,
} from './tables';

/** Local date as YYYY-MM-DD (not UTC, so "today" matches the user's day). */
export function todayISO(): string {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Workouts
// ---------------------------------------------------------------------------

export function listWorkouts(): Workout[] {
  return rows(workouts$).sort((a, b) => b.date.localeCompare(a.date));
}

export function getWorkout(id: string): Workout | undefined {
  const row = workouts$[id].get();
  return row && !row.deleted ? row : undefined;
}

export function createWorkout(date: string = todayISO()): Workout {
  return putRow(workouts$, { date, notes: null });
}

export function updateWorkout(id: string, patch: Partial<Workout>): void {
  updateRow(workouts$, id, patch);
}

export function deleteWorkout(id: string): void {
  for (const s of rows(workoutSets$).filter((s) => s.workout_id === id)) {
    removeRow(workoutSets$, s.id);
  }
  removeRow(workouts$, id);
}

// ---------------------------------------------------------------------------
// Sets
// ---------------------------------------------------------------------------

export function setsForWorkout(workoutId: string): WorkoutSet[] {
  return rows(workoutSets$)
    .filter((s) => s.workout_id === workoutId)
    .sort((a, b) => a.set_index - b.set_index);
}

/** Distinct exercise ids in a workout, in the order they were first added. */
export function exerciseIdsInWorkout(workoutId: string): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const s of rows(workoutSets$)
    .filter((s) => s.workout_id === workoutId)
    .sort((a, b) => (a.created_at ?? '').localeCompare(b.created_at ?? ''))) {
    if (!seen.has(s.exercise_id)) {
      seen.add(s.exercise_id);
      ordered.push(s.exercise_id);
    }
  }
  return ordered;
}

export function setsForExerciseInWorkout(
  workoutId: string,
  exerciseId: string,
): WorkoutSet[] {
  return setsForWorkout(workoutId).filter((s) => s.exercise_id === exerciseId);
}

export interface NewSet {
  weight: number;
  reps: number;
  rpe?: number | null;
  is_warmup?: boolean;
}

export function addSet(
  workoutId: string,
  exerciseId: string,
  set: NewSet,
): WorkoutSet {
  const nextIndex = setsForExerciseInWorkout(workoutId, exerciseId).length;
  return putRow(workoutSets$, {
    workout_id: workoutId,
    exercise_id: exerciseId,
    set_index: nextIndex,
    weight: set.weight,
    reps: set.reps,
    rpe: set.rpe ?? null,
    is_warmup: set.is_warmup ?? false,
  });
}

export function updateSet(id: string, patch: Partial<WorkoutSet>): void {
  updateRow(workoutSets$, id, patch);
}

export function deleteSet(id: string): void {
  removeRow(workoutSets$, id);
}

// ---------------------------------------------------------------------------
// History (for recommendations + stats)
// ---------------------------------------------------------------------------

export interface ExerciseSession {
  workoutId: string;
  date: string;
  /** Working sets (warmups excluded), ordered by set_index. */
  sets: WorkoutSet[];
}

/** All sessions containing an exercise, ascending by date. Warmups excluded. */
export function sessionsForExercise(exerciseId: string): ExerciseSession[] {
  const byWorkout = new Map<string, WorkoutSet[]>();
  for (const s of rows(workoutSets$)) {
    if (s.exercise_id !== exerciseId || s.is_warmup) continue;
    const list = byWorkout.get(s.workout_id) ?? [];
    list.push(s);
    byWorkout.set(s.workout_id, list);
  }

  const sessions: ExerciseSession[] = [];
  for (const [workoutId, sets] of byWorkout) {
    const workout = getWorkout(workoutId);
    if (!workout || sets.length === 0) continue;
    sessions.push({
      workoutId,
      date: workout.date,
      sets: sets.sort((a, b) => a.set_index - b.set_index),
    });
  }
  return sessions.sort((a, b) => a.date.localeCompare(b.date));
}
