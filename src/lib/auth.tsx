import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabase';
import { isAuthed$ } from './authState';

interface AuthValue {
  /** Current session, or null when signed out / local-only. */
  session: Session | null;
  user: User | null;
  /** True while the persisted session is still being read on startup. */
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

/**
 * Tracks the Supabase auth session and mirrors it into `isAuthed$` (which gates
 * sync). Startup reads the *persisted* session via `getSession()` — a local
 * read, no network — so an offline device with a valid cached session still
 * enters the app and can read/write locally.
 *
 * When Supabase isn't configured (local-only), there's no login: we report a
 * ready, session-less state and the app renders without a gate.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      isAuthed$.set(!!data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      isAuthed$.set(!!next);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const value: AuthValue = {
    session,
    user: session?.user ?? null,
    loading,
    async signIn(email, password) {
      if (!supabase) return { error: 'Cloud sync is not configured.' };
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      return { error: error?.message ?? null };
    },
    async signOut() {
      await supabase?.auth.signOut();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
