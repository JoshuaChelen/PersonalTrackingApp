import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Screen, Card, H1, Muted, Body, Field, Button } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { colors, spacing } from '@/theme';

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit() {
    if (busy) return;
    setError(null);
    setBusy(true);
    const { error } = await signIn(email, password);
    setBusy(false);
    // On success the auth listener flips the session and the gate redirects us;
    // no navigation needed here.
    if (error) setError(error);
  }

  return (
    <Screen>
      <View style={styles.header}>
        <H1>Welcome back</H1>
        <Muted>Sign in to sync your workouts across devices.</Muted>
      </View>

      <Card style={{ gap: spacing.md }}>
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="username"
          placeholder="you@example.com"
        />
        <Field
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="current-password"
          textContentType="password"
          placeholder="••••••••"
          onSubmitEditing={onSubmit}
          returnKeyType="go"
        />
        {error ? <Body style={styles.error}>{error}</Body> : null}
        <Button label="Sign in" onPress={onSubmit} loading={busy} />
        <Muted>You'll stay signed in on this device until you sign out.</Muted>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.xs, marginBottom: spacing.xl },
  error: { color: colors.danger },
});
