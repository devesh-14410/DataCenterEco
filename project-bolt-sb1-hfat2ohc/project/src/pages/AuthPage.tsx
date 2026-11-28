import { useState } from 'react';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/lib/auth';
import type { AuthView, Page } from '@/lib/types';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';

interface AuthPageProps {
  initial: AuthView;
  onNavigate: (p: Page) => void;
}

export function AuthPage({ initial, onNavigate }: AuthPageProps) {
  const [view, setView] = useState<AuthView>(initial);
  const { login, signup, verifySignupOtp, resendSignupOtp, resetPassword } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [awaitingOtp, setAwaitingOtp] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  function friendlyAuthError(err: unknown) {
    const message = err instanceof Error ? err.message : 'Authentication failed. Please try again.';
    if (/rate.?limit|over_email_send_rate_limit/i.test(message)) {
      return 'Too many emails were requested. Please wait before requesting another code.';
    }
    if (/invalid.*otp|otp.*expired|token.*expired|token.*invalid/i.test(message)) {
      return 'That verification code is invalid or expired. Request a new code and try again.';
    }
    if (/already registered|already been registered|user already exists/i.test(message)) {
      return 'An account may already exist for this email. Try signing in instead.';
    }
    return message;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setNotice('');

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return setError('Enter a valid email address.');
    }

    if (awaitingOtp) {
      if (!/^\d{6}$/.test(otp)) return setError('Enter the 6-digit code from your email.');
    } else {
      if (view !== 'reset' && password.length < 8) return setError('Password must be at least 8 characters.');
      if (view === 'signup' && name.trim().length < 2) return setError('Enter your full name.');
    }

    setLoading(true);
    try {
      if (awaitingOtp) {
        await verifySignupOtp(email.trim(), otp.trim());
        onNavigate('dashboard');
      } else if (view === 'reset') {
        await resetPassword(email.trim());
        setNotice('If this email is registered, a secure password reset link will be sent.');
      } else if (view === 'signup') {
        const hasSession = await signup(name.trim(), email.trim(), password);
        if (hasSession) onNavigate('dashboard');
        else {
          setAwaitingOtp(true);
          setNotice('A 6-digit verification code has been requested. Check your inbox and spam folder.');
        }
      } else {
        await login(email.trim(), password);
        onNavigate('dashboard');
      }
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    setLoading(true);
    setError('');
    setNotice('');
    try {
      await resendSignupOtp(email.trim());
      setNotice('A new verification code has been requested. Check your inbox and spam folder.');
      setOtp('');
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
              {awaitingOtp ? 'Verify your email' : view === 'login' ? 'Sign in to EcoVolt AI' : view === 'signup' ? 'Create your operator account' : 'Reset your password'}
            </h1>
            <p className="mt-1.5 text-sm text-ink-400">
              {awaitingOtp
                ? `Enter the 6-digit code sent to ${email}.`
                : view === 'login' ? 'Access your infrastructure dashboard.' : view === 'signup' ? 'Create your EcoVolt account.' : 'We will email you a secure recovery link.'}
            </p>
          </div>

          {notice && <p className="mt-5 rounded-lg border border-volt-500/30 bg-volt-500/10 p-3 text-sm text-ink-100">{notice}</p>}

          <form onSubmit={submit} className="mt-7 space-y-4">
            {!awaitingOtp && view === 'signup' && (
              <Field icon={<UserIcon size={15} />}>
                <input className="input-field pl-9" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
              </Field>
            )}

            {!awaitingOtp && (
              <Field icon={<Mail size={15} />}>
                <input type="email" className="input-field pl-9" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              </Field>
            )}

            {awaitingOtp && (
              <Field icon={<ShieldCheck size={15} />}>
                <input
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  className="input-field pl-9 text-center tracking-[0.4em]"
                  placeholder="6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  aria-label="Email verification code"
                />
              </Field>
            )}

            {!awaitingOtp && view !== 'reset' && (
              <Field icon={<Lock size={15} />}>
                <input type={showPw ? 'text' : 'password'} className="input-field pl-9 pr-9" placeholder="Password (minimum 8 characters)" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={view === 'login' ? 'current-password' : 'new-password'} />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400" aria-label="Toggle password visibility">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </Field>
            )}

            {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

            <button type="submit" disabled={loading} className="btn-volt flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm disabled:opacity-60">
              {loading ? 'Please wait…' : <>{awaitingOtp ? 'Verify code' : view === 'login' ? 'Sign in' : view === 'signup' ? 'Create account' : 'Send reset link'}<ArrowRight size={15} /></>}
            </button>
          </form>

          {awaitingOtp ? (
            <div className="mt-6 flex flex-col items-center gap-3 text-center text-sm text-ink-400">
              <button type="button" onClick={resendCode} disabled={loading} className="text-volt-400 disabled:opacity-50">Resend verification code</button>
              <button type="button" onClick={() => { setAwaitingOtp(false); setOtp(''); setError(''); setNotice(''); }} className="text-ink-400">Back to sign up</button>
            </div>
          ) : (
            <div className="mt-6 text-center text-sm text-ink-400">
              {view === 'login' && <>No account? <button onClick={() => { setView('signup'); setError(''); setNotice(''); }} className="text-volt-400">Create one</button></>}
              {view === 'signup' && <>Already registered? <button onClick={() => { setView('login'); setError(''); setNotice(''); }} className="text-volt-400">Sign in</button></>}
              {view === 'reset' && <button onClick={() => { setView('login'); setError(''); setNotice(''); }} className="text-volt-400">Back to sign in</button>}
            </div>
          )}
          {!awaitingOtp && view === 'login' && (
            <button type="button" onClick={() => { setView('reset'); setError(''); setNotice(''); }} className="mt-3 block w-full text-center text-xs text-volt-400">Forgot password?</button>
          )}
          {!awaitingOtp && view === 'login' && <p className="mt-4 text-center text-xs text-ink-500">Your session is securely remembered on this device until you sign out.</p>}
        </div>
      </div>
    </div>
  );
}

function Field({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">{icon}</span>{children}</div>;
}
