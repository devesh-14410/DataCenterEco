import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session as SupabaseSession } from '@supabase/supabase-js';
import type { User, Session, Role } from '@/lib/types';
import { supabase } from '@/lib/supabase';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  role: Role | null;
  isTrialExpired: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  verifySignupOtp: (email: string, token: string) => Promise<void>;
  resendSignupOtp: (email: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  subscribe: (tier: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function mapSession(authSession: SupabaseSession): Session {
  const authUser = authSession.user;
  const role: Role = authUser.app_metadata?.role === 'admin' ? 'admin' : 'client';
  const started = authUser.user_metadata?.trial_started_date ?? authUser.created_at;
  const expires = authUser.user_metadata?.trial_expired_date ??
    new Date(new Date(started).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

  return {
    user: {
      name: authUser.user_metadata?.full_name ?? authUser.email?.split('@')[0] ?? 'Operator',
      email: authUser.email ?? '',
    },
    is_subscribed: authUser.app_metadata?.is_subscribed === true,
    trial_started_date: started,
    trial_expired_date: expires,
    tier: authUser.app_metadata?.tier ?? null,
    role,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authSession, setAuthSession] = useState<SupabaseSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) console.error('Session restore failed:', error.message);
      setAuthSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setAuthSession(nextSession);
      setLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signup(name: string, email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) throw error;
    return Boolean(data.session);
  }

  async function verifySignupOtp(email: string, token: string) {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup',
    });
    if (error) throw error;
  }

  async function resendSignupOtp(email: string) {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    if (error) throw error;
  }

  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) throw error;
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  function subscribe(_tier: string) {
    console.warn('Subscription changes must be completed through the verified billing flow.');
  }

  const session = authSession ? mapSession(authSession) : null;
  const user = session?.user ?? null;
  const role = session?.role ?? null;
  const isTrialExpired = Boolean(
    session && !session.is_subscribed && new Date() > new Date(session.trial_expired_date)
  );

  if (loading) {
    return <div className="min-h-screen" aria-label="Restoring secure session" />;
  }

  return (
    <AuthContext.Provider value={{ user, session, role, isTrialExpired, login, signup, verifySignupOtp, resendSignupOtp, resetPassword, logout, subscribe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
