import { colors } from '@/theme';

/**
 * A tracker "module". The home screen renders one card per entry and routes
 * into `/<route>`. Add a new tracker by adding an entry here + a route folder
 * under `app/<route>/` and its own data tables — the shell stays untouched.
 */
export interface AppModule {
  id: string;
  name: string;
  description: string;
  /** Emoji shown on the selector card (no icon-font dependency needed). */
  icon: string;
  color: string;
  /** Expo Router path, e.g. "/gym". */
  route: string;
  enabled: boolean;
}

export const MODULES: AppModule[] = [
  {
    id: 'gym',
    name: 'Gym',
    description: 'Log lifts, get progression cues, and track PRs over time.',
    icon: '🏋️',
    color: colors.primary,
    route: '/gym',
    enabled: true,
  },
  {
    id: 'habits',
    name: 'Habits',
    description: 'Daily habit streaks and check-ins.',
    icon: '✅',
    color: colors.success,
    route: '/habits',
    enabled: false,
  },
];

export const ENABLED_MODULES = MODULES.filter((m) => m.enabled);
