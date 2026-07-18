import type { ExerciseSession } from '@/modules/gym/data/workouts';

/** Estimated one-rep max via the Epley formula. */
export function epley1RM(weight: number, reps: number): number {
  if (reps <= 1) return weight;
  return weight * (1 + reps / 30);
}

export type StatMetric = 'est1RM' | 'topSet' | 'volume';

export interface SessionStat {
  workoutId: string;
  date: string;
  /** Heaviest weight lifted in the session. */
  topSetWeight: number;
  /** Reps performed on that heaviest set. */
  topSetReps: number;
  /** Best estimated 1RM across all sets. */
  est1RM: number;
  /** Sum of weight x reps across working sets. */
  volume: number;
}

export function computeSessionStat(session: ExerciseSession): SessionStat {
  let topSetWeight = 0;
  let topSetReps = 0;
  let est1RM = 0;
  let volume = 0;

  for (const s of session.sets) {
    volume += s.weight * s.reps;
    const e = epley1RM(s.weight, s.reps);
    if (e > est1RM) est1RM = e;
    // Top set = heaviest weight; break ties by reps.
    if (s.weight > topSetWeight || (s.weight === topSetWeight && s.reps > topSetReps)) {
      topSetWeight = s.weight;
      topSetReps = s.reps;
    }
  }

  return {
    workoutId: session.workoutId,
    date: session.date,
    topSetWeight,
    topSetReps,
    est1RM: Math.round(est1RM * 10) / 10,
    volume,
  };
}

export function sessionStats(sessions: ExerciseSession[]): SessionStat[] {
  return sessions
    .map(computeSessionStat)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export interface Point {
  /** ISO date (x axis). */
  x: string;
  y: number;
}

export function seriesFor(stats: SessionStat[], metric: StatMetric): Point[] {
  return stats.map((s) => ({
    x: s.date,
    y: metric === 'est1RM' ? s.est1RM : metric === 'topSet' ? s.topSetWeight : s.volume,
  }));
}

export type RangeKey = '1m' | '3m' | 'all';

export const RANGE_LABELS: Record<RangeKey, string> = {
  '1m': '1 month',
  '3m': '3 months',
  all: 'All time',
};

/** ISO date cutoff for a range, or null for "all". `now` injectable for tests. */
export function rangeCutoff(range: RangeKey, now: Date = new Date()): string | null {
  if (range === 'all') return null;
  const d = new Date(now);
  d.setMonth(d.getMonth() - (range === '1m' ? 1 : 3));
  return d.toISOString().slice(0, 10);
}

export function filterSessionsByRange(
  sessions: ExerciseSession[],
  range: RangeKey,
  now: Date = new Date(),
): ExerciseSession[] {
  const cutoff = rangeCutoff(range, now);
  if (!cutoff) return sessions;
  return sessions.filter((s) => s.date >= cutoff);
}

export interface ProgressSummary {
  startWeight: number;
  startReps: number;
  endWeight: number;
  endReps: number;
  start1RM: number;
  end1RM: number;
  delta1RM: number;
  /** Percent change in estimated 1RM over the window. */
  percent1RM: number;
}

/** Compare the first vs most recent session in a set of stats. */
export function progressSummary(stats: SessionStat[]): ProgressSummary | null {
  if (stats.length === 0) return null;
  const first = stats[0];
  const last = stats[stats.length - 1];
  const delta1RM = Math.round((last.est1RM - first.est1RM) * 10) / 10;
  const percent1RM =
    first.est1RM > 0 ? Math.round((delta1RM / first.est1RM) * 1000) / 10 : 0;
  return {
    startWeight: first.topSetWeight,
    startReps: first.topSetReps,
    endWeight: last.topSetWeight,
    endReps: last.topSetReps,
    start1RM: first.est1RM,
    end1RM: last.est1RM,
    delta1RM,
    percent1RM,
  };
}
