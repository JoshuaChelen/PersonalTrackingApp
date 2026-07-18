import { useState } from 'react';
import { useRouter } from 'expo-router';
import { observer } from '@legendapp/state/react';
import { View, StyleSheet } from 'react-native';
import {
  Screen,
  Card,
  Button,
  Field,
  H3,
  Muted,
  Row,
  Chip,
  EmptyState,
} from '@/components/ui';
import { listExercises, musclesForExercise } from '@/modules/gym/data/exercises';
import { colors, spacing } from '@/theme';

export default observer(function ExerciseLibrary() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const all = listExercises();
  const filtered = query.trim()
    ? all.filter((e) => e.name.toLowerCase().includes(query.trim().toLowerCase()))
    : all;

  return (
    <Screen>
      <Button
        label="+ New exercise"
        onPress={() => router.push('/gym/exercises/new')}
      />
      <View style={{ height: spacing.md }} />
      <Field
        placeholder="Search exercises…"
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
      />
      <View style={{ height: spacing.md }} />

      {filtered.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No exercises found"
          subtitle={query ? 'Try a different search.' : 'Add your first exercise.'}
        />
      ) : (
        <View style={{ gap: spacing.sm }}>
          {filtered.map((ex) => {
            const primary = musclesForExercise(ex.id).filter((m) => m.role === 'primary');
            const groups = [...new Set(primary.map((m) => m.group))];
            return (
              <Card key={ex.id} onPress={() => router.push(`/gym/exercises/${ex.id}`)}>
                <H3>{ex.name}</H3>
                {ex.equipment ? <Muted>{ex.equipment}</Muted> : null}
                <Row gap={spacing.xs} style={styles.chips}>
                  {groups.map((g) => (
                    <Chip key={g} label={g} color={colors.primaryDim} textColor="#fff" />
                  ))}
                </Row>
              </Card>
            );
          })}
        </View>
      )}
    </Screen>
  );
});

const styles = StyleSheet.create({
  chips: { flexWrap: 'wrap', marginTop: spacing.sm },
});
