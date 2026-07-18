import { useMemo, useState } from 'react';
import { observer } from '@legendapp/state/react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import {
  Screen,
  Card,
  H2,
  H3,
  Body,
  Muted,
  Row,
  Divider,
  SegmentedControl,
  EmptyState,
} from '@/components/ui';
import { LineChart } from '@/components/LineChart';
import { listExercises } from '@/modules/gym/data/exercises';
import { sessionsForExercise } from '@/modules/gym/data/workouts';
import {
  sessionStats,
  seriesFor,
  filterSessionsByRange,
  progressSummary,
  type RangeKey,
  type StatMetric,
} from '@/modules/gym/logic/stats';
import { weight } from '@/lib/format';
import { colors, spacing, radius, font } from '@/theme';

const METRIC_OPTIONS: { value: StatMetric; label: string }[] = [
  { value: 'est1RM', label: 'Est. 1RM' },
  { value: 'topSet', label: 'Top set' },
  { value: 'volume', label: 'Volume' },
];

const RANGE_OPTIONS: { value: RangeKey; label: string }[] = [
  { value: '1m', label: '1M' },
  { value: '3m', label: '3M' },
  { value: 'all', label: 'All' },
];

export default observer(function Stats() {
  const [range, setRange] = useState<RangeKey>('1m');
  const [metric, setMetric] = useState<StatMetric>('est1RM');
  const [selected, setSelected] = useState<string | null>(null);

  // Exercises that actually have logged data, most-logged first.
  const withData = useMemo(() => {
    return listExercises()
      .map((e) => ({ exercise: e, count: sessionsForExercise(e.id).length }))
      .filter((x) => x.count > 0)
      .sort((a, b) => b.count - a.count);
  }, []);

  const currentId = selected ?? withData[0]?.exercise.id ?? null;
  const exercise = withData.find((x) => x.exercise.id === currentId)?.exercise;

  if (withData.length === 0 || !exercise) {
    return (
      <Screen>
        <EmptyState
          icon="📊"
          title="No data yet"
          subtitle="Log a few workouts and your progress charts will appear here."
        />
      </Screen>
    );
  }

  const sessions = filterSessionsByRange(sessionsForExercise(exercise.id), range);
  const stats = sessionStats(sessions);
  const series = seriesFor(stats, metric);
  const summary = progressSummary(stats);

  return (
    <Screen>
      <H2>Progress</H2>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pills}
      >
        {withData.map(({ exercise: e }) => {
          const active = e.id === currentId;
          return (
            <Pressable
              key={e.id}
              onPress={() => setSelected(e.id)}
              style={[styles.pill, active && styles.pillActive]}
            >
              <Body style={[styles.pillText, active && { color: '#fff' }]}>{e.name}</Body>
            </Pressable>
          );
        })}
      </ScrollView>

      <Row gap={spacing.md} style={{ marginBottom: spacing.md }}>
        <View style={{ flex: 2 }}>
          <SegmentedControl options={METRIC_OPTIONS} value={metric} onChange={setMetric} />
        </View>
        <View style={{ flex: 1 }}>
          <SegmentedControl options={RANGE_OPTIONS} value={range} onChange={setRange} />
        </View>
      </Row>

      {series.length < 2 ? (
        <EmptyState
          icon="📈"
          title="Not enough data in this range"
          subtitle="Try a wider range, or log more sessions."
        />
      ) : (
        <Card>
          <H3>{exercise.name}</H3>
          <LineChart data={series} unitLabel={metric === 'volume' ? `${exercise.unit}·reps` : exercise.unit} />
          {summary && (
            <>
              <Divider />
              <Row style={{ justifyContent: 'space-between' }}>
                <Stat label="Then" value={`${weight(summary.startWeight, exercise.unit)} × ${summary.startReps}`} />
                <Stat label="Now" value={`${weight(summary.endWeight, exercise.unit)} × ${summary.endReps}`} />
                <Stat
                  label="Est. 1RM Δ"
                  value={`${summary.delta1RM >= 0 ? '+' : ''}${summary.percent1RM}%`}
                  color={summary.delta1RM >= 0 ? colors.success : colors.danger}
                />
              </Row>
            </>
          )}
        </Card>
      )}
    </Screen>
  );
});

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View>
      <Muted>{label}</Muted>
      <Body style={color ? { color, fontWeight: '700' } : undefined}>{value}</Body>
    </View>
  );
}

const styles = StyleSheet.create({
  pills: { gap: spacing.sm, paddingVertical: spacing.md },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { color: colors.text, fontSize: font.small, fontWeight: '600' },
});
