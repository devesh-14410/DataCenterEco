import { useState } from 'react';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/lib/auth';
import type { AuthView, Page } from '@/lib/types';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';

interface AuthPageProps {
  initial: AuthView;
  onNavigate: (p: Page) => void;
}

export function AuthPage({ initial, onNavigate }: AuthPageProps) {
  const [view, setView] = useState<AuthView>(initial);
  const { login } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (view !== 'reset') {
      if (!email.includes('@')) return setError('Enter a valid business email.');
      if (password.length < 6) return setError('Password must be at least 6 characters.');
    }
    if (view === 'signup' && name.trim().length < 2) return setError('Enter your full name.');

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (view === 'reset') {
        setResetSent(true);
        setError('');
        return;
      }
      login({ name: name || email.split('@')[0] || 'Operator', email }, remember);
      onNavigate('dashboard');
    }, 650);
  }

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="card-surface rounded-2xl p-7 sm:p-9 shadow-card">
          <div className="flex flex-col items-center text-center">
            <Logo size={48} withGlow />
            <h1 className="mt-4 text-xl font-bold text-ink-100">
              {view === 'login' && 'Sign in to EcoVolt AI'}
              {view === 'signup' && 'Create your operator account'}
              {view === 'reset' && 'Reset your password'}
            </h1>
            <p className="mt-1.5 text-sm text-ink-400">
              {view === 'login' && 'Access your live infrastructure dashboard.'}
              {view === 'signup' && 'Start your 14-day trial — no credit card.'}
              {view === 'reset' && 'We will email you a secure recovery link.'}
            </p>
          </div>

          {view === 'reset' && resetSent && (
            <div className="mt-7 flex items-start gap-3 rounded-xl border border-volt-500/40 bg-volt-500/10 p-4">
              <Mail size={18} className="mt-0.5 shrink-0 text-volt-500" />
              <p className="text-sm leading-relaxed text-ink-100">
                Password reset link has been securely routed and dispatched to your email address. Please check your inbox/spam folder to proceed.
              </p>
            </div>
          )}

          {view === 'reset' && resetSent && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => { setResetSent(false); setView('login'); setEmail(''); }}
                className="text-sm text-volt-400 hover:text-glow-sm"
              >
                Back to sign in
              </button>
            </div>
          )}

          {!(view === 'reset' && resetSent) && (
          <form onSubmit={submit} className="mt-7 space-y-4">
            {view === 'signup' && (
              <Field icon={<UserIcon size={15} />}>
                <input
                  className="input-field pl-9"
                  placeholder="Corporate username / full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>
            )}

            <Field icon={<Mail size={15} />}>
              <input
                type="email"
                className="input-field pl-9"
                placeholder="Business email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>

            {view !== 'reset' && (
              <Field icon={<Lock size={15} />}>
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input-field pl-9 pr-9"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-200"
                  aria-label="toggle password visibility"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </Field>
            )}

            {view === 'login' && (
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setRemember((v) => !v)}
                  className="flex items-center gap-2 text-sm text-ink-300"
                >
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded border transition ${
                      remember ? 'border-volt-500 bg-volt-500/20' : 'border-ink-600'
                    }`}
                  >
                    {remember && <Check size={11} className="text-volt-400" />}
                  </span>
                  Remember me
                </button>
                <button
                  type="button"
                  onClick={() => setView('reset')}
                  className="text-sm text-ink-300 hover:text-volt-400"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn-volt flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm disabled:opacity-60"
            >
              {loading ? 'Authenticating…' : (
                <>
                  {view === 'login' && 'Sign in'}
                  {view === 'signup' && 'Create account'}
                  {view === 'reset' && 'Send Reset Link'}
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
          )}

          <div className="mt-6 text-center text-sm text-ink-400">
            {view === 'login' && (
              <>
                No account?{' '}
                <button onClick={() => setView('signup')} className="text-volt-400 hover:text-glow-sm">
                  Create one
                </button>
              </>
            )}
            {view === 'signup' && (
              <>
                Already registered?{' '}
                <button onClick={() => setView('login')} className="text-volt-400 hover:text-glow-sm">
                  Sign in
                </button>
              </>
            )}
            {view === 'reset' && (
              <button onClick={() => setView('login')} className="text-volt-400 hover:text-glow-sm">
                Back to sign in
              </button>
            )}
          </div>

          {view === 'login' && (
            <p className="mt-4 text-center text-xs text-ink-500">
              Remember-me persists your session across browser restarts via local storage.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">{icon}</span>
      {children}
    </div>
  );
}
