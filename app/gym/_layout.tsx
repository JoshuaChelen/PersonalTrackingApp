import { Stack } from 'expo-router';
import { colors } from '@/theme';

export default function GymLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Gym' }} />
      <Stack.Screen name="exercises/index" options={{ title: 'Exercises' }} />
      <Stack.Screen
        name="exercises/new"
        options={{ title: 'New Exercise', presentation: 'modal' }}
      />
      <Stack.Screen name="exercises/[id]" options={{ title: 'Exercise' }} />
      <Stack.Screen name="workout/[id]" options={{ title: 'Workout' }} />
      <Stack.Screen name="stats/index" options={{ title: 'Progress' }} />
    </Stack>
  );
}
