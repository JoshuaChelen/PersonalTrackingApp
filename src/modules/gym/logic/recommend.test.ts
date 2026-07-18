import { computeRecommendation } from './recommend';
import type { ExerciseSession } from '@/modules/gym/data/workouts';
import type { WorkoutSet } from '@/modules/gym/types';

const exercise = {
  target_rep_min: 7,
  target_rep_max: 10,
  weight_increment: 5,
  unit: 'lb' as const,
};

let setId = 0;
function set(weight: number, reps: number): WorkoutSet {
  return {
    id: `s${setId++}`,
    workout_id: 'w',
    exercise_id: 'e',
    set_index: 0,
    weight,
    reps,
    is_warmup: false,
  };
}

function session(date: string, sets: WorkoutSet[]): ExerciseSession {
  return { workoutId: `wo-${date}`, date, sets };
}

describe('computeRecommendation (double progression)', () => {
  it('suggests starting when there is no history', () => {
    const rec = computeRecommendation(exercise, []);
    expect(rec.action).toBe('start');
    expect(rec.targetReps).toBe(7);
    expect(rec.targetWeight).toBe(0);
  });

  it('adds a rep when inside the rep range', () => {
    const sessions = [session('2026-07-01', [set(140, 8)])];
    const rec = computeRecommendation(exercise, sessions);
    expect(rec.action).toBe('add_rep');
    expect(rec.targetWeight).toBe(140);
    expect(rec.targetReps).toBe(9);
    expect(rec.lastTopSet).toEqual({ weight: 140, reps: 8 });
  });

  it('increases weight and resets reps when the top of the range is cleared', () => {
    const sessions = [session('2026-07-01', [set(140, 10)])];
    const rec = computeRecommendation(exercise, sessions);
    expect(rec.action).toBe('increase_weight');
    expect(rec.targetWeight).toBe(145);
    expect(rec.targetReps).toBe(7);
  });

  it('holds when below the rep floor', () => {
    const sessions = [session('2026-07-01', [set(140, 5)])];
    const rec = computeRecommendation(exercise, sessions);
    expect(rec.action).toBe('hold');
    expect(rec.targetWeight).toBe(140);
    expect(rec.targetReps).toBe(7);
  });

  it('uses the heaviest weight and best reps at that weight from the latest session', () => {
    const sessions = [
      session('2026-07-01', [set(135, 10)]),
      // Latest session: mixed weights — top set is 145, best reps at 145 is 9.
      session('2026-07-08', [set(140, 10), set(145, 8), set(145, 9)]),
    ];
    const rec = computeRecommendation(exercise, sessions);
    expect(rec.lastTopSet).toEqual({ weight: 145, reps: 9 });
    expect(rec.action).toBe('add_rep');
    expect(rec.targetReps).toBe(10);
  });
});
