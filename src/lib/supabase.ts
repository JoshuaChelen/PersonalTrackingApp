import 'react-native-url-polyfill/auto';
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
 * Supabase client, or null when not configured. We disable auth session
 * handling because v1 has no login — data is accessed with the anon key.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
  : null;
