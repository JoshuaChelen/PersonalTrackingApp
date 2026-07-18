import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ensureLocalSeed } from '@/modules/gym/data/exercises';
import { AuthProvider, useAuth } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase';
import { colors } from '@/theme';

export default function RootLayout() {
  // Populate starter data on first launch when running without Supabase.
  useEffect(() => {
    ensureLocalSeed();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="light" />
          <RootNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootNavigator() {
  const { loading } = useAuth();

  // Wait for the persisted session to load before routing, so we don't flash
  // the home screen and then bounce to login. Only relevant with Supabase on.
  if (isSupabaseConfigured && loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Progress Tracker' }} />
        <Stack.Screen name="gym" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack>
      <AuthGate />
    </>
  );
}

/**
 * Redirects between the app and the login screen based on auth state. No-op when
 * Supabase isn't configured (local-only has no login).
 */
function AuthGate() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isSupabaseConfigured || loading) return;
    const onLogin = segments[0] === 'login';
    if (!session && !onLogin) router.replace('/login');
    else if (session && onLogin) router.replace('/');
  }, [session, loading, segments]);

  return null;
}
