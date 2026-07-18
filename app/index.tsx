import { useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Screen, Card, H1, H3, Muted, Body } from '@/components/ui';
import { MODULES } from '@/modules/registry';
import { isSupabaseConfigured } from '@/lib/supabase';
import { colors, spacing, radius, font } from '@/theme';

export default function Home() {
  const router = useRouter();

  return (
    <Screen>
      <H1>What are you tracking?</H1>
      <Muted>Pick a module to get started.</Muted>

      <View style={styles.grid}>
        {MODULES.map((mod) => (
          <Card
            key={mod.id}
            style={{ opacity: mod.enabled ? 1 : 0.5 }}
            onPress={mod.enabled ? () => router.push(mod.route as never) : undefined}
          >
            <View style={styles.moduleRow}>
              <View style={[styles.iconBadge, { backgroundColor: mod.color + '22' }]}>
                <Body style={{ fontSize: 26 }}>{mod.icon}</Body>
              </View>
              <View style={{ flex: 1 }}>
                <H3>{mod.name}</H3>
                <Muted>{mod.description}</Muted>
              </View>
              {!mod.enabled && <Muted>Soon</Muted>}
            </View>
          </Card>
        ))}
      </View>

      <View style={styles.footer}>
        <View
          style={[
            styles.dot,
            { backgroundColor: isSupabaseConfigured ? colors.success : colors.warning },
          ]}
        />
        <Muted>
          {isSupabaseConfigured
            ? 'Cloud sync on — data syncs across your devices.'
            : 'Local-only — add Supabase keys to sync across devices.'}
        </Muted>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { gap: spacing.md, marginTop: spacing.xl },
  moduleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xxl,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
