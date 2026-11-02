import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User, Session, Role } from '@/lib/types';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  role: Role | null;
  isTrialExpired: boolean;
  login: (user: User, remember: boolean) => void;
  logout: () => void;
  subscribe: (tier: string) => void;
}

const REMEMBER_KEY = 'ecovolt_session_remember';
const SESSION_KEY = 'ecovolt_session';

const AuthContext = createContext<AuthContextValue | null>(null);

function addDays(date: Date, days: number): Date {
  const d = new Date(date.getTime());
  d.setDate(d.getDate() + days);
  return d;
}

function createSession(u: User): Session {
  const start = new Date();
  const end = addDays(start, 30);
  return {
    user: u,
    is_subscribed: false,
    trial_started_date: start.toISOString(),
    trial_expired_date: end.toISOString(),
    tier: null,
    role: (u.email.toLowerCase() === 'deveshbarot14410@gmail.com' ? 'admin' : 'client') as Role,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    try {
      const remember = localStorage.getItem(REMEMBER_KEY) === 'true';
      const store = remember ? localStorage : sessionStorage;
      const raw = store.getItem(SESSION_KEY);
      if (raw) {
        setSession(JSON.parse(raw) as Session);
      }
    } catch {
      // ignore malformed storage
    }
  }, []);

  function persist(s: Session, remember: boolean) {
    const json = JSON.stringify(s);
    if (remember) {
      localStorage.setItem(REMEMBER_KEY, 'true');
      localStorage.setItem(SESSION_KEY, json);
      sessionStorage.removeItem(SESSION_KEY);
    } else {
      localStorage.removeItem(REMEMBER_KEY);
      sessionStorage.setItem(SESSION_KEY, json);
      localStorage.removeItem(SESSION_KEY);
    }
  }

  function login(u: User, remember: boolean) {
    const s = createSession(u);
    setSession(s);
    persist(s, remember);
  }

  function logout() {
    setSession(null);
    localStorage.removeItem(REMEMBER_KEY);
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  }

  function subscribe(tier: string) {
    setSession((prev) => {
      if (!prev) return prev;
      const next: Session = { ...prev, is_subscribed: true, tier };
      const remember = localStorage.getItem(REMEMBER_KEY) === 'true';
      persist(next, remember);
      return next;
    });
  }

  const user = session?.user ?? null;
  const role = session?.role ?? null;
  const isTrialExpired = !!session && !session.is_subscribed && new Date() > new Date(session.trial_expired_date);

  return (
    <AuthContext.Provider value={{ user, session, role, isTrialExpired, login, logout, subscribe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
