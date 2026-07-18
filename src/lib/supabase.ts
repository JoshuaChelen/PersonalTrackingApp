import 'react-native-url-polyfill/auto';
import { AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Whether cloud sync is available. When false the app runs entirely on local
 * persistence (Legend-State) — you can still log workouts; they just won't sync
 * across devices until Supabase env vars are filled in.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

/**
 * Supabase client, or null when not configured.
 *
 * Auth is configured to keep you logged in across app restarts — you enter your
 * password once per device and stay signed in until you sign out:
 *  - `persistSession` writes the session to storage (AsyncStorage on native,
 *    localStorage on web) so it survives reloads and works offline.
 *  - `autoRefreshToken` silently renews the short-lived access token from the
 *    long-lived refresh token, so the session effectively never expires in use.
 *  - `detectSessionInUrl` is off; we sign in with email/password, not links.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        // Web uses the default localStorage adapter; native needs AsyncStorage.
        ...(Platform.OS === 'web' ? {} : { storage: AsyncStorage }),
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null;

// On native, pause/resume token auto-refresh with app foreground state so we
// don't refresh in the background and we recover promptly on resume. (Web keeps
// refreshing via timers; AppState 'active' there is a no-op we skip.)
if (supabase && Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
