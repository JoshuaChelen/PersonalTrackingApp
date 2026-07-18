import { useState } from 'react';
import { useRouter } from 'expo-router';
import { observer } from '@legendapp/state/react';
import { Pressable, StyleSheet, View } from 'react-native';
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
} from '@/components/ui';
import {
  createExercise,
  muscleGroupsWithMuscles,
  DEFAULT_REP_MIN,
  DEFAULT_REP_MAX,
  DEFAULT_INCREMENT,
} from '@/modules/gym/data/exercises';
import type { MuscleRole } from '@/modules/gym/types';
import { colors, spacing, radius, font } from '@/theme';

const nextRole = (r?: MuscleRole): MuscleRole | undefined =>
  r === undefined ? 'primary' : r === 'primary' ? 'secondary' : undefined;

export default observer(function NewExercise() {
  const router = useRouter();
  const groups = muscleGroupsWithMuscles();

  const [name, setName] = useState('');
  const [equipment, setEquipment] = useState('');
  const [repMin, setRepMin] = useState(String(DEFAULT_REP_MIN));
  const [repMax, setRepMax] = useState(String(DEFAULT_REP_MAX));
  const [increment, setIncrement] = useState(String(DEFAULT_INCREMENT));
  const [roles, setRoles] = useState<Record<string, MuscleRole>>({});

  const toggle = (muscleId: string) => {
    setRoles((prev) => {
      const next = { ...prev };
      const role = nextRole(prev[muscleId]);
      if (role) next[muscleId] = role;
      else delete next[muscleId];
      return next;
    });
  };

  const canSave = name.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    createExercise({
      name,
      equipment: equipment.trim() || null,
      target_rep_min: parseInt(repMin, 10) || DEFAULT_REP_MIN,
      target_rep_max: parseInt(repMax, 10) || DEFAULT_REP_MAX,
      weight_increment: parseFloat(increment) || DEFAULT_INCREMENT,
      muscles: Object.entries(roles).map(([muscleId, role]) => ({ muscleId, role })),
    });
    router.back();
  };

  return (
    <Screen>
      <Field label="Name" placeholder="e.g. Cable Lateral Raise" value={name} onChangeText={setName} />
      <View style={{ height: spacing.md }} />
      <Field label="Equipment (optional)" placeholder="Cable, Dumbbell…" value={equipment} onChangeText={setEquipment} />

      <View style={{ height: spacing.lg }} />
      <H3>Progression</H3>
      <Muted>Climb from min to max reps, then add weight and reset.</Muted>
      <Row gap={spacing.md} style={{ marginTop: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <Field label="Min reps" value={repMin} onChangeText={setRepMin} keyboardType="number-pad" />
        </View>
        <View style={{ flex: 1 }}>
          <Field label="Max reps" value={repMax} onChangeText={setRepMax} keyboardType="number-pad" />
        </View>
        <View style={{ flex: 1 }}>
          <Field label="Weight step" value={increment} onChangeText={setIncrement} keyboardType="decimal-pad" />
        </View>
      </Row>

      <View style={{ height: spacing.lg }} />
      <H2>Muscles worked</H2>
      <Muted>Tap once for primary, twice for secondary.</Muted>

      <View style={{ gap: spacing.md, marginTop: spacing.md }}>
        {groups.map(({ group, muscles }) => (
          <Card key={group.id}>
            <H3>{group.name}</H3>
            <Row gap={spacing.sm} style={styles.wrap}>
              {muscles.map((mu) => {
                const role = roles[mu.id];
                return (
                  <Pressable
                    key={mu.id}
                    onPress={() => toggle(mu.id)}
                    style={[
                      styles.pill,
                      role === 'primary' && { backgroundColor: colors.primary, borderColor: colors.primary },
                      role === 'secondary' && { backgroundColor: colors.roleSecondary, borderColor: colors.roleSecondary },
                    ]}
                  >
                    <Body style={[styles.pillText, role ? { color: '#fff' } : undefined]}>
                      {mu.name}
                      {role === 'primary' ? '  ●' : role === 'secondary' ? '  ○' : ''}
                    </Body>
                  </Pressable>
                );
              })}
            </Row>
          </Card>
        ))}
      </View>

      <View style={{ height: spacing.xl }} />
      <Button label="Save exercise" onPress={save} disabled={!canSave} />
      <View style={{ height: spacing.sm }} />
      <Button label="Cancel" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
});

const styles = StyleSheet.create({
  wrap: { flexWrap: 'wrap', marginTop: spacing.sm },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  pillText: { fontSize: font.small, fontWeight: '600' },
});
