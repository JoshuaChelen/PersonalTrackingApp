/** Domain types for the gym module. Field names mirror the Postgres schema. */

/** Columns every synced table carries (Legend-State change tracking + soft delete). */
export interface SyncRow {
  id: string;
  created_at?: string | null;
  updated_at?: string | null;
  deleted?: boolean | null;
}

export type MuscleRole = 'primary' | 'secondary';
export type WeightUnit = 'lb' | 'kg';

export interface MuscleGroup extends SyncRow {
  name: string;
}

export interface Muscle extends SyncRow {
  muscle_group_id: string;
  /** Specific head/region, e.g. "Lateral head". */
  name: string;
}

export interface Exercise extends SyncRow {
  name: string;
  equipment?: string | null;
  notes?: string | null;
  is_custom: boolean;
  /** Bottom of the working rep range (double-progression floor). */
  target_rep_min: number;
  /** Top of the working rep range (add weight once cleared). */
  target_rep_max: number;
  /** How much to add when progressing weight, in `unit`. */
  weight_increment: number;
  unit: WeightUnit;
}

export interface ExerciseMuscle extends SyncRow {
  exercise_id: string;
  muscle_id: string;
  role: MuscleRole;
}

export interface Workout extends SyncRow {
  /** ISO date (YYYY-MM-DD) of the session. */
  date: string;
  notes?: string | null;
}

export interface WorkoutSet extends SyncRow {
  workout_id: string;
  exercise_id: string;
  /** Order of the set within the exercise for that workout (0-based). */
  set_index: number;
  weight: number;
  reps: number;
  rpe?: number | null;
  is_warmup: boolean;
}

/** Legend-State `as: 'object'` stores each table as a map keyed by id. */
export type Table<T> = Record<string, T>;
