import { useState } from 'react';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/lib/auth';
import type { AuthView, Page } from '@/lib/types';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, ArrowRight } from 'lucide-react';

interface AuthPageProps {
  initial: AuthView;
  onNavigate: (p: Page) => void;
}

export function AuthPage({ initial, onNavigate }: AuthPageProps) {
  const [view, setView] = useState<AuthView>(initial);
  const { login, signup, resetPassword } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  function friendlyAuthError(err: unknown) {
    const message = err instanceof Error ? err.message : 'Authentication failed. Please try again.';
    if (/invalid login credentials/i.test(message)) {
      return 'Email/password did not match an account. If this is your first time on the new system, choose Create one below.';
    }
    if (/email not confirmed/i.test(message)) {
      return 'Please confirm your email using the link sent to your inbox before signing in.';
    }
    if (/already registered|already been registered|user already exists/i.test(message)) {
      return 'An account already exists for this email. Sign in, or use Forgot password if needed.';
    }
    if (/rate.?limit|over_email_send_rate_limit/i.test(message)) {
      return 'Too many email requests. Please wait a little and try again.';
    }
    return message;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setNotice('');

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Enter a valid email address.');
      return;
    }
    if (view !== 'reset' && password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (view === 'signup' && name.trim().length < 2) {
      setError('Enter your full name.');
      return;
    }

    setLoading(true);
    try {
      if (view === 'reset') {
        await resetPassword(normalizedEmail);
        setNotice('If this email is registered, a password reset link will be sent. Check your inbox and spam folder.');
      } else if (view === 'signup') {
        const hasSession = await signup(name.trim(), normalizedEmail, password);
        if (hasSession) {
          onNavigate('dashboard');
        } else {
          setNotice('Account signup was accepted. Check your email for the confirmation link, open it, then return here and sign in.');
        }
      } else {
        await login(normalizedEmail, password);
        onNavigate('dashboard');
      }
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="relative w-full max-w-md">
        <div className="card-surface rounded-2xl p-7 shadow-card sm:p-9">
          <div className="flex flex-col items-center text-center">
            <Logo size={48} withGlow />
            <h1 className="mt-4 text-xl font-bold text-ink-100">
              {view === 'login' ? 'Sign in to EcoVolt AI' : view === 'signup' ? 'Create your operator account' : 'Reset your password'}
            </h1>
            <p className="mt-1.5 text-sm text-ink-400">
              {view === 'login' ? 'Access your infrastructure dashboard.' : view === 'signup' ? 'Create your EcoVolt account with email and password.' : 'We will email you a secure recovery link.'}
            </p>
          </div>

          {notice && <p role="status" className="mt-5 rounded-lg border border-volt-500/30 bg-volt-500/10 p-3 text-sm text-ink-100">{notice}</p>}

          <form onSubmit={submit} className="mt-7 space-y-4">
            {view === 'signup' && (
              <Field icon={<UserIcon size={15} />}>
                <input className="input-field pl-9" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
              </Field>
            )}
            <Field icon={<Mail size={15} />}>
              <input type="email" className="input-field pl-9" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </Field>
            {view !== 'reset' && (
              <Field icon={<Lock size={15} />}>
                <input type={showPw ? 'text' : 'password'} className="input-field pl-9 pr-9" placeholder="Password (minimum 8 characters)" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={view === 'login' ? 'current-password' : 'new-password'} />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400" aria-label="Toggle password visibility">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </Field>
            )}
            {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
            <button type="submit" disabled={loading} className="btn-volt flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm disabled:opacity-60">
              {loading ? 'Please wait…' : <>{view === 'login' ? 'Sign in' : view === 'signup' ? 'Create account' : 'Send reset link'}<ArrowRight size={15} /></>}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-ink-400">
            {view === 'login' && <>No account? <button onClick={() => { setView('signup'); setError(''); setNotice(''); }} className="text-volt-400">Create one</button></>}
            {view === 'signup' && <>Already registered? <button onClick={() => { setView('login'); setError(''); setNotice(''); }} className="text-volt-400">Sign in</button></>}
            {view === 'reset' && <button onClick={() => { setView('login'); setError(''); setNotice(''); }} className="text-volt-400">Back to sign in</button>}
          </div>
          {view === 'login' && (
            <button type="button" onClick={() => { setView('reset'); setError(''); setNotice(''); }} className="mt-3 block w-full text-center text-xs text-volt-400">Forgot password?</button>
          )}
          {view === 'login' && <p className="mt-4 text-center text-xs text-ink-500">Your secure session is remembered on this device until you sign out.</p>}
        </div>
      </div>
    </div>
  );
}

function Field({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">{icon}</span>{children}</div>;
}
