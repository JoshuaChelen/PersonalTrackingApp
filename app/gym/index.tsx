import { useRouter } from 'expo-router';
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
  EmptyState,
} from '@/components/ui';
import { createWorkout, listWorkouts, setsForWorkout, exerciseIdsInWorkout } from '@/modules/gym/data/workouts';
import { listExercises } from '@/modules/gym/data/exercises';
import { formatDate } from '@/lib/format';
import { colors, spacing, radius } from '@/theme';

export default observer(function GymHome() {
  const router = useRouter();
  const workouts = listWorkouts();
  const exerciseCount = listExercises().length;

  const startWorkout = () => {
    const w = createWorkout();
    router.push(`/gym/workout/${w.id}`);
  };

  return (
    <Screen>
      <Button label="+ Start a workout" onPress={startWorkout} />

      <Row gap={spacing.md} style={styles.navRow}>
        <NavTile
          icon="📋"
          label="Exercises"
          sub={`${exerciseCount} in library`}
          onPress={() => router.push('/gym/exercises')}
        />
        <NavTile
          icon="📈"
          label="Progress"
          sub="Charts & PRs"
          onPress={() => router.push('/gym/stats')}
        />
      </Row>

      <H2>Recent workouts</H2>
      {workouts.length === 0 ? (
        <EmptyState
          icon="🏋️"
          title="No workouts yet"
          subtitle="Start a workout to log your first sets."
        />
      ) : (
        <View style={{ gap: spacing.sm }}>
          {workouts.slice(0, 20).map((w) => {
            const sets = setsForWorkout(w.id);
            const exCount = exerciseIdsInWorkout(w.id).length;
            return (
              <Card key={w.id} onPress={() => router.push(`/gym/workout/${w.id}`)}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <View>
                    <H3>{formatDate(w.date)}</H3>
                    <Muted>
                      {exCount} exercise{exCount === 1 ? '' : 's'} · {sets.length} set
                      {sets.length === 1 ? '' : 's'}
                    </Muted>
                  </View>
                  <Body style={{ color: colors.textFaint }}>›</Body>
                </Row>
              </Card>
            );
          })}
        </View>
      )}
    </Screen>
  );
});

function NavTile({
  icon,
  label,
  sub,
  onPress,
}: {
  icon: string;
  label: string;
  sub: string;
  onPress: () => void;
}) {
  return (
    <Card style={styles.tile} onPress={onPress}>
      <Body style={{ fontSize: 24 }}>{icon}</Body>
      <H3>{label}</H3>
      <Muted>{sub}</Muted>
    </Card>
  );
}

const styles = StyleSheet.create({
  navRow: { marginVertical: spacing.xl },
  tile: { flex: 1, gap: 2, borderRadius: radius.lg },
});
