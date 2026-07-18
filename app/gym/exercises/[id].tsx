import { useState } from 'react';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { observer } from '@legendapp/state/react';
import { View, StyleSheet } from 'react-native';
import {
  Screen,
  Card,
  Button,
  H2,
  H3,
  Body,
  Muted,
  Row,
  Chip,
  Divider,
  EmptyState,
} from '@/components/ui';
import { LineChart } from '@/components/LineChart';
import {
  getExercise,
  musclesForExercise,
  deleteExercise,
} from '@/modules/gym/data/exercises';
import { sessionsForExercise } from '@/modules/gym/data/workouts';
import { sessionStats, seriesFor, progressSummary } from '@/modules/gym/logic/stats';
import { weight } from '@/lib/format';
import { colors, spacing } from '@/theme';

export default observer(function ExerciseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  const exercise = getExercise(id);
  if (!exercise) {
    return (
      <Screen>
        <EmptyState icon="❓" title="Exercise not found" />
      </Screen>
    );
  }

  const muscles = musclesForExercise(id);
  const primary = muscles.filter((m) => m.role === 'primary');
  const secondary = muscles.filter((m) => m.role === 'secondary');

  const stats = sessionStats(sessionsForExercise(id));
  const series = seriesFor(stats, 'est1RM');
  const summary = progressSummary(stats);

  const doDelete = () => {
    deleteExercise(id);
    router.back();
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: exercise.name }} />
      <H2>{exercise.name}</H2>
      {exercise.equipment ? <Muted>{exercise.equipment}</Muted> : null}
      <Muted>
        Target {exercise.target_rep_min}–{exercise.target_rep_max} reps · +
        {exercise.weight_increment} {exercise.unit} when cleared
      </Muted>

      <View style={{ height: spacing.lg }} />
      <Card>
        <H3>Muscles worked</H3>
        {primary.length > 0 && (
          <>
            <Muted>Primary</Muted>
            <Row gap={spacing.xs} style={styles.wrap}>
              {primary.map((m) => (
                <Chip
                  key={m.muscleId}
                  label={`${m.group}: ${m.muscle}`}
                  color={colors.primary}
                  textColor="#fff"
                />
              ))}
            </Row>
          </>
        )}
        {secondary.length > 0 && (
          <>
            <View style={{ height: spacing.sm }} />
            <Muted>Secondary</Muted>
            <Row gap={spacing.xs} style={styles.wrap}>
              {secondary.map((m) => (
                <Chip
                  key={m.muscleId}
                  label={`${m.group}: ${m.muscle}`}
                  color={colors.surfaceAlt}
                  textColor={colors.text}
                />
              ))}
            </Row>
          </>
        )}
        {muscles.length === 0 && <Muted>No muscles assigned.</Muted>}
      </Card>

      <View style={{ height: spacing.lg }} />
      <H2>Progress</H2>
      {series.length < 2 ? (
        <EmptyState
          icon="📈"
          title="Not enough data yet"
          subtitle="Log this exercise across a few workouts to see your estimated 1RM trend."
        />
      ) : (
        <Card>
          <H3>Estimated 1RM</H3>
          <LineChart data={series} unitLabel={exercise.unit} />
          {summary && (
            <>
              <Divider />
              <Row style={{ justifyContent: 'space-between' }}>
                <View>
                  <Muted>Then</Muted>
                  <Body>{weight(summary.startWeight, exercise.unit)} × {summary.startReps}</Body>
                </View>
                <View>
                  <Muted>Now</Muted>
                  <Body>{weight(summary.endWeight, exercise.unit)} × {summary.endReps}</Body>
                </View>
                <View>
                  <Muted>Est. 1RM</Muted>
                  <Body style={{ color: summary.delta1RM >= 0 ? colors.success : colors.danger }}>
                    {summary.delta1RM >= 0 ? '+' : ''}
                    {weight(summary.delta1RM, exercise.unit)} ({summary.percent1RM >= 0 ? '+' : ''}
                    {summary.percent1RM}%)
                  </Body>
                </View>
              </Row>
            </>
          )}
        </Card>
      )}

      <View style={{ height: spacing.xxl }} />
      {confirming ? (
        <Row gap={spacing.md}>
          <View style={{ flex: 1 }}>
            <Button label="Confirm delete" variant="danger" onPress={doDelete} />
          </View>
          <View style={{ flex: 1 }}>
            <Button label="Keep" variant="secondary" onPress={() => setConfirming(false)} />
          </View>
        </Row>
      ) : (
        <Button label="Delete exercise" variant="ghost" onPress={() => setConfirming(true)} />
      )}
    </Screen>
  );
});

const styles = StyleSheet.create({
  wrap: { flexWrap: 'wrap', marginTop: spacing.xs },
});
