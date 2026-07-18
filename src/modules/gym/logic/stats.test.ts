import {
  epley1RM,
  computeSessionStat,
  sessionStats,
  seriesFor,
  progressSummary,
  rangeCutoff,
  filterSessionsByRange,
} from './stats';
import type { ExerciseSession } from '@/modules/gym/data/workouts';
import type { WorkoutSet } from '@/modules/gym/types';

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

describe('epley1RM', () => {
  it('returns the weight for a single rep', () => {
    expect(epley1RM(200, 1)).toBe(200);
  });
  it('applies the Epley formula for multiple reps', () => {
    expect(epley1RM(100, 10)).toBeCloseTo(133.33, 1);
  });
});

describe('computeSessionStat', () => {
  it('computes top set, est 1RM and volume', () => {
    const s = computeSessionStat(session('2026-07-01', [set(135, 10), set(145, 6)]));
    expect(s.topSetWeight).toBe(145);
    expect(s.topSetReps).toBe(6);
    expect(s.volume).toBe(135 * 10 + 145 * 6);
    // Best 1RM is the higher of the two sets.
    expect(s.est1RM).toBeCloseTo(Math.max(epley1RM(135, 10), epley1RM(145, 6)), 1);
  });
});

describe('seriesFor', () => {
  it('maps stats to points by metric', () => {
    const stats = sessionStats([
      session('2026-07-01', [set(100, 10)]),
      session('2026-07-08', [set(110, 10)]),
    ]);
    const pts = seriesFor(stats, 'topSet');
    expect(pts).toEqual([
      { x: '2026-07-01', y: 100 },
      { x: '2026-07-08', y: 110 },
    ]);
  });
});

describe('progressSummary', () => {
  it('compares first and last session', () => {
    const stats = sessionStats([
      session('2026-07-01', [set(135, 8)]),
      session('2026-07-15', [set(140, 10)]),
    ]);
    const summary = progressSummary(stats)!;
    expect(summary.startWeight).toBe(135);
    expect(summary.endWeight).toBe(140);
    expect(summary.delta1RM).toBeGreaterThan(0);
    expect(summary.percent1RM).toBeGreaterThan(0);
  });
  it('returns null with no data', () => {
    expect(progressSummary([])).toBeNull();
  });
});

describe('range filtering', () => {
  const now = new Date('2026-07-17T00:00:00');
  it('computes a one-month cutoff', () => {
    expect(rangeCutoff('1m', now)).toBe('2026-06-17');
    expect(rangeCutoff('all', now)).toBeNull();
  });
  it('filters sessions outside the range', () => {
    const sessions = [
      session('2026-05-01', [set(100, 8)]),
      session('2026-07-10', [set(110, 8)]),
    ];
    const within = filterSessionsByRange(sessions, '1m', now);
    expect(within).toHaveLength(1);
    expect(within[0].date).toBe('2026-07-10');
  });
});
