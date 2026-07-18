import type { Exercise } from '@/modules/gym/types';
import type { ExerciseSession } from '@/modules/gym/data/workouts';

export type RecAction = 'start' | 'increase_weight' | 'add_rep' | 'hold';

export interface Recommendation {
  action: RecAction;
  /** Suggested weight for the next session (0 when unknown). */
  targetWeight: number;
  /** Suggested rep target for the next session. */
  targetReps: number;
  reason: string;
  /** The reference set from last time, for display. */
  lastTopSet?: { weight: number; reps: number };
}

/**
 * Double-progression recommendation. The user climbs reps from `target_rep_min`
 * to `target_rep_max` at a fixed weight, then adds `weight_increment` and resets
 * to `target_rep_min`. We look at the best set at the heaviest weight in the most
 * recent session and pick the next step.
 *
 * Pure function — pass the exercise config and its sessions (ascending by date).
 */
export function computeRecommendation(
  exercise: Pick<
    Exercise,
    'target_rep_min' | 'target_rep_max' | 'weight_increment' | 'unit'
  >,
  sessions: ExerciseSession[],
): Recommendation {
  const { target_rep_min, target_rep_max, weight_increment, unit } = exercise;

  const last = sessions[sessions.length - 1];
  if (!last || last.sets.length === 0) {
    return {
      action: 'start',
      targetWeight: 0,
      targetReps: target_rep_min,
      reason: `No history yet — log a set, then aim for ${target_rep_min} reps to start progressing.`,
    };
  }

  // Best set at the heaviest weight lifted last session.
  const topWeight = Math.max(...last.sets.map((s) => s.weight));
  const repsAtTop = Math.max(
    ...last.sets.filter((s) => s.weight === topWeight).map((s) => s.reps),
  );
  const lastTopSet = { weight: topWeight, reps: repsAtTop };

  if (repsAtTop >= target_rep_max) {
    return {
      action: 'increase_weight',
      targetWeight: topWeight + weight_increment,
      targetReps: target_rep_min,
      reason: `You hit ${repsAtTop} reps at ${topWeight} ${unit} — add ${weight_increment} ${unit} and drop back to ${target_rep_min} reps.`,
      lastTopSet,
    };
  }

  if (repsAtTop >= target_rep_min) {
    return {
      action: 'add_rep',
      targetWeight: topWeight,
      targetReps: repsAtTop + 1,
      reason: `Add a rep — aim for ${repsAtTop + 1} at ${topWeight} ${unit} (build to ${target_rep_max}, then add weight).`,
      lastTopSet,
    };
  }

  return {
    action: 'hold',
    targetWeight: topWeight,
    targetReps: target_rep_min,
    reason: `Hold ${topWeight} ${unit} and build back up to ${target_rep_min} reps before progressing.`,
    lastTopSet,
  };
}
