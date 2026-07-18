import { isSupabaseConfigured } from '@/lib/supabase';
import type {
  Exercise,
  Muscle,
  MuscleGroup,
  MuscleRole,
  WeightUnit,
} from '@/modules/gym/types';
import {
  exerciseMuscles$,
  exercises$,
  muscleGroups$,
  muscles$,
  putRow,
  removeRow,
  rows,
  updateRow,
} from './tables';
import { EXERCISES, MUSCLE_GROUPS } from './seedData';

export const DEFAULT_REP_MIN = 7;
export const DEFAULT_REP_MAX = 10;
export const DEFAULT_INCREMENT = 5;
export const DEFAULT_UNIT: WeightUnit = 'lb';

/** A muscle enriched with its group + the role it plays in an exercise. */
export interface MuscleWorked {
  muscleId: string;
  muscle: string;
  group: string;
  role: MuscleRole;
}

export interface ExerciseInput {
  name: string;
  equipment?: string | null;
  notes?: string | null;
  target_rep_min?: number;
  target_rep_max?: number;
  weight_increment?: number;
  unit?: WeightUnit;
  muscles: { muscleId: string; role: MuscleRole }[];
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export function listExercises(): Exercise[] {
  return rows(exercises$).sort((a, b) => a.name.localeCompare(b.name));
}

export function getExercise(id: string): Exercise | undefined {
  const row = exercises$[id].get();
  return row && !row.deleted ? row : undefined;
}

export function listMuscleGroups(): MuscleGroup[] {
  return rows(muscleGroups$).sort((a, b) => a.name.localeCompare(b.name));
}

/** Muscle groups each with their muscles — for the muscle picker. */
export function muscleGroupsWithMuscles(): {
  group: MuscleGroup;
  muscles: Muscle[];
}[] {
  const allMuscles = rows(muscles$);
  return listMuscleGroups().map((group) => ({
    group,
    muscles: allMuscles
      .filter((mu) => mu.muscle_group_id === group.id)
      .sort((a, b) => a.name.localeCompare(b.name)),
  }));
}

/** The specific muscles an exercise works, with role, primary first. */
export function musclesForExercise(exerciseId: string): MuscleWorked[] {
  const groupsById = new Map(rows(muscleGroups$).map((g) => [g.id, g]));
  const musclesById = new Map(rows(muscles$).map((mu) => [mu.id, mu]));
  return rows(exerciseMuscles$)
    .filter((em) => em.exercise_id === exerciseId)
    .map((em) => {
      const mu = musclesById.get(em.muscle_id);
      const group = mu ? groupsById.get(mu.muscle_group_id) : undefined;
      return {
        muscleId: em.muscle_id,
        muscle: mu?.name ?? 'Unknown',
        group: group?.name ?? 'Unknown',
        role: em.role,
      };
    })
    .sort((a, b) => {
      if (a.role !== b.role) return a.role === 'primary' ? -1 : 1;
      return a.group.localeCompare(b.group);
    });
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

export function createExercise(input: ExerciseInput): Exercise {
  const exercise = putRow(exercises$, {
    name: input.name.trim(),
    equipment: input.equipment ?? null,
    notes: input.notes ?? null,
    is_custom: true,
    target_rep_min: input.target_rep_min ?? DEFAULT_REP_MIN,
    target_rep_max: input.target_rep_max ?? DEFAULT_REP_MAX,
    weight_increment: input.weight_increment ?? DEFAULT_INCREMENT,
    unit: input.unit ?? DEFAULT_UNIT,
  });
  setExerciseMuscles(exercise.id, input.muscles);
  return exercise;
}

export function updateExercise(
  id: string,
  patch: Partial<Omit<Exercise, 'id'>>,
): void {
  updateRow(exercises$, id, patch);
}

export function deleteExercise(id: string): void {
  for (const em of rows(exerciseMuscles$).filter((e) => e.exercise_id === id)) {
    removeRow(exerciseMuscles$, em.id);
  }
  removeRow(exercises$, id);
}

/** Replace an exercise's muscle mappings with the given set. */
export function setExerciseMuscles(
  exerciseId: string,
  list: { muscleId: string; role: MuscleRole }[],
): void {
  for (const em of rows(exerciseMuscles$).filter(
    (e) => e.exercise_id === exerciseId,
  )) {
    removeRow(exerciseMuscles$, em.id);
  }
  for (const item of list) {
    putRow(exerciseMuscles$, {
      exercise_id: exerciseId,
      muscle_id: item.muscleId,
      role: item.role,
    });
  }
}

// ---------------------------------------------------------------------------
// Local-only seeding (dev / no-Supabase mode)
// ---------------------------------------------------------------------------

/**
 * Populate starter muscles + exercises into local storage. Runs only when
 * Supabase is NOT configured (otherwise the SQL seed owns this data) and only
 * when the catalogue is empty, so it is safe to call on every launch.
 */
export function ensureLocalSeed(): void {
  if (isSupabaseConfigured) return;
  if (rows(muscleGroups$).length > 0) return;

  const muscleIdByKey = new Map<string, string>();
  for (const [groupName, muscleNames] of Object.entries(MUSCLE_GROUPS)) {
    const group = putRow(muscleGroups$, { name: groupName });
    for (const muscleName of muscleNames) {
      const mu = putRow(muscles$, {
        muscle_group_id: group.id,
        name: muscleName,
      });
      muscleIdByKey.set(`${groupName}/${muscleName}`, mu.id);
    }
  }

  for (const ex of EXERCISES) {
    const exercise = putRow(exercises$, {
      name: ex.name,
      equipment: ex.equipment ?? null,
      notes: null,
      is_custom: false,
      target_rep_min: DEFAULT_REP_MIN,
      target_rep_max: DEFAULT_REP_MAX,
      weight_increment: DEFAULT_INCREMENT,
      unit: DEFAULT_UNIT,
    });
    for (const ref of ex.muscles) {
      const muscleId = muscleIdByKey.get(`${ref.group}/${ref.muscle}`);
      if (!muscleId) continue;
      putRow(exerciseMuscles$, {
        exercise_id: exercise.id,
        muscle_id: muscleId,
        role: ref.role,
      });
    }
  }
}
