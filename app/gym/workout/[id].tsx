import { useState } from 'react';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { observer } from '@legendapp/state/react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import {
  Screen,
  Card,
  Button,
  Field,
  H2,
  H3,
  Body,
  Muted,
  Row,
  Divider,
  EmptyState,
} from '@/components/ui';
import {
  getWorkout,
  deleteWorkout,
  exerciseIdsInWorkout,
  setsForExerciseInWorkout,
  addSet,
  deleteSet,
  sessionsForExercise,
} from '@/modules/gym/data/workouts';
import { getExercise, listExercises } from '@/modules/gym/data/exercises';
import { computeRecommendation, type RecAction } from '@/modules/gym/logic/recommend';
import { formatDate, weight } from '@/lib/format';
import { colors, spacing, radius, font } from '@/theme';

const ACTION_COLOR: Record<RecAction, string> = {
  start: colors.textMuted,
  increase_weight: colors.success,
  add_rep: colors.primary,
  hold: colors.warning,
};

const ACTION_LABEL: Record<RecAction, string> = {
  start: 'Start',
  increase_weight: 'Add weight',
  add_rep: 'Add a rep',
  hold: 'Hold',
};

export default observer(function WorkoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [picking, setPicking] = useState(false);
  const [extra, setExtra] = useState<string[]>([]);
  const [confirming, setConfirming] = useState(false);

  const workout = getWorkout(id);
  if (!workout) {
    return (
      <Screen>
        <EmptyState icon="❓" title="Workout not found" />
      </Screen>
    );
  }

  const activeIds = [...new Set([...exerciseIdsInWorkout(id), ...extra])];

  const addExercise = (exerciseId: string) => {
    setExtra((prev) => (prev.includes(exerciseId) ? prev : [...prev, exerciseId]));
    setPicking(false);
  };

  const doDelete = () => {
    deleteWorkout(id);
    router.back();
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: formatDate(workout.date) }} />

      {activeIds.length === 0 ? (
        <EmptyState
          icon="➕"
          title="Add your first exercise"
          subtitle="Pick an exercise to start logging sets."
        />
      ) : (
        <View style={{ gap: spacing.lg }}>
          {activeIds.map((exId) => (
            <ExerciseBlock key={exId} workoutId={id} exerciseId={exId} />
          ))}
        </View>
      )}

      <View style={{ height: spacing.lg }} />
      <Button label="+ Add exercise" onPress={() => setPicking(true)} />
      <View style={{ height: spacing.xxl }} />

      {confirming ? (
        <Row gap={spacing.md}>
          <View style={{ flex: 1 }}>
            <Button label="Delete workout" variant="danger" onPress={doDelete} />
          </View>
          <View style={{ flex: 1 }}>
            <Button label="Keep" variant="secondary" onPress={() => setConfirming(false)} />
          </View>
        </Row>
      ) : (
        <Button label="Delete workout" variant="ghost" onPress={() => setConfirming(true)} />
      )}

      <ExercisePickerModal
        visible={picking}
        onClose={() => setPicking(false)}
        onSelect={addExercise}
      />
    </Screen>
  );
});

// ---------------------------------------------------------------------------

const ExerciseBlock = observer(function ExerciseBlock({
  workoutId,
  exerciseId,
}: {
  workoutId: string;
  exerciseId: string;
}) {
  const exercise = getExercise(exerciseId);
  const sets = setsForExerciseInWorkout(workoutId, exerciseId);

  // Recommendation from prior sessions only (exclude the one in progress).
  const priorSessions = sessionsForExercise(exerciseId).filter(
    (s) => s.workoutId !== workoutId,
  );
  const rec = exercise
    ? computeRecommendation(exercise, priorSessions)
    : null;

  const [weightInput, setWeightInput] = useState(
    rec && rec.targetWeight > 0 ? String(rec.targetWeight) : '',
  );
  const [repsInput, setRepsInput] = useState(rec ? String(rec.targetReps) : '');

  if (!exercise) return null;

  const onAddSet = () => {
    const w = parseFloat(weightInput);
    const r = parseInt(repsInput, 10);
    if (isNaN(w) || w < 0 || isNaN(r) || r <= 0) return;
    addSet(workoutId, exerciseId, { weight: w, reps: r });
  };

  return (
    <Card>
      <H3>{exercise.name}</H3>

      {rec && (
        <View style={[styles.rec, { borderColor: ACTION_COLOR[rec.action] }]}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Body style={{ color: ACTION_COLOR[rec.action], fontWeight: '700' }}>
              {ACTION_LABEL[rec.action]}
            </Body>
            {rec.lastTopSet && (
              <Muted>
                Last: {weight(rec.lastTopSet.weight, exercise.unit)} × {rec.lastTopSet.reps}
              </Muted>
            )}
          </Row>
          <Muted>{rec.reason}</Muted>
        </View>
      )}

      {sets.length > 0 && (
        <View style={{ marginTop: spacing.sm }}>
          {sets.map((s, i) => (
            <Row key={s.id} style={styles.setRow}>
              <Muted>Set {i + 1}</Muted>
              <Body style={{ flex: 1, textAlign: 'center' }}>
                {weight(s.weight, exercise.unit)} × {s.reps}
              </Body>
              <Pressable onPress={() => deleteSet(s.id)} hitSlop={8}>
                <Body style={{ color: colors.danger, fontSize: font.body }}>✕</Body>
              </Pressable>
            </Row>
          ))}
        </View>
      )}

      <Divider />
      <Row gap={spacing.sm}>
        <View style={{ flex: 1 }}>
          <Field
            label={`Weight (${exercise.unit})`}
            value={weightInput}
            onChangeText={setWeightInput}
            keyboardType="decimal-pad"
            placeholder="0"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Field
            label="Reps"
            value={repsInput}
            onChangeText={setRepsInput}
            keyboardType="number-pad"
            placeholder="0"
          />
        </View>
        <View style={{ justifyContent: 'flex-end' }}>
          <Button label="Add set" onPress={onAddSet} style={{ paddingHorizontal: spacing.lg }} />
        </View>
      </Row>
    </Card>
  );
});

// ---------------------------------------------------------------------------

const ExercisePickerModal = observer(function ExercisePickerModal({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState('');
  const all = listExercises();
  const filtered = query.trim()
    ? all.filter((e) => e.name.toLowerCase().includes(query.trim().toLowerCase()))
    : all;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          <Row style={{ justifyContent: 'space-between', marginBottom: spacing.md }}>
            <H2>Add exercise</H2>
            <Pressable onPress={onClose} hitSlop={8}>
              <Body style={{ color: colors.textMuted }}>Close</Body>
            </Pressable>
          </Row>
          <Field
            placeholder="Search…"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
          />
          <ScrollView style={styles.modalList} keyboardShouldPersistTaps="handled">
            {filtered.map((e) => (
              <Pressable key={e.id} onPress={() => onSelect(e.id)} style={styles.pickRow}>
                <Body>{e.name}</Body>
                {e.equipment ? <Muted>{e.equipment}</Muted> : null}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  rec: {
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderLeftWidth: 3,
    backgroundColor: colors.surfaceAlt,
    gap: 2,
  },
  setRow: {
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    gap: spacing.md,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#000A',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    maxHeight: '80%',
  },
  modalList: { marginTop: spacing.md },
  pickRow: {
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
});
