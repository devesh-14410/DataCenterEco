import { useState } from 'react';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/lib/auth';
import type { AuthView, Page } from '@/lib/types';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';

interface AuthPageProps {
  initial: AuthView;
  onNavigate: (p: Page) => void;
}

type AuthScreen = AuthView | 'verify';

function readableAuthError(err: unknown) {
  const message = err instanceof Error ? err.message : 'Authentication failed. Please try again.';
  const normalized = message.toLowerCase();
  if (normalized.includes('over_email_send_rate_limit') || normalized.includes('email rate limit')) {
    return 'Too many verification emails were requested. Please wait before trying again. Email delivery needs the configured SMTP service.';
  }
  if (normalized.includes('email_address_not_authorized')) {
    return 'Email delivery is not enabled for this address yet. The project owner must configure a custom SMTP sender.';
  }
  if (normalized.includes('invalid') && (normalized.includes('otp') || normalized.includes('token'))) {
    return 'That code is invalid or expired. Check the latest email or request a new code.';
  }
  if (normalized.includes('invalid login credentials')) {
    return 'Email or password is incorrect, or this account has not completed email verification.';
  }
  if (normalized.includes('already registered') || normalized.includes('user already exists')) {
    return 'An account may already exist for this email. Try signing in or use Forgot password.';
  }
  return message;
}

export function AuthPage({ initial, onNavigate }: AuthPageProps) {
  const [view, setView] = useState<AuthScreen>(initial);
  const { login, signup, verifySignupOtp, resendSignupOtp, resetPassword } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setNotice('');

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    if (view !== 'reset' && view !== 'verify' && password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (view === 'signup' && name.trim().length < 2) {
      setError('Enter your full name.');
      return;
    }
    if (view === 'verify' && !/^\d{6}$/.test(otp.trim())) {
      setError('Enter the 6-digit code from your email.');
      return;
    }

    setLoading(true);
    try {
      if (view === 'reset') {
        await resetPassword(email.trim());
        setNotice('If this email is registered, a secure password reset email will be sent.');
      } else if (view === 'signup') {
        await signup(name.trim(), email.trim(), password);
        setView('verify');
        setNotice('A 6-digit verification code has been requested for your email. Enter it below to activate your account.');
      } else if (view === 'verify') {
        await verifySignupOtp(email.trim(), otp);
        onNavigate('dashboard');
      } else {
        await login(email.trim(), password);
        onNavigate('dashboard');
      }
    } catch (err) {
      setError(readableAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    setError('');
    setNotice('');
    setLoading(true);
    try {
      await resendSignupOtp(email.trim());
      setNotice('A new verification code has been requested. Use the newest email; older codes may no longer work.');
    } catch (err) {
      setError(readableAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  const title = view === 'login'
    ? 'Sign in to EcoVolt AI'
    : view === 'signup'
      ? 'Create your operator account'
      : view === 'verify'
        ? 'Verify your email'
        : 'Reset your password';

  const subtitle = view === 'login'
    ? 'Access your infrastructure dashboard.'
    : view === 'signup'
      ? 'Create your EcoVolt account.'
      : view === 'verify'
        ? `Enter the 6-digit code sent to ${email}.`
        : 'We will email you a secure recovery link.';

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="relative w-full max-w-md">
        <div className="card-surface rounded-2xl p-7 shadow-card sm:p-9">
          <div className="flex flex-col items-center text-center">
            <Logo size={48} withGlow />
            <h1 className="mt-4 text-xl font-bold text-ink-100">{title}</h1>
            <p className="mt-1.5 text-sm text-ink-400">{subtitle}</p>
          </div>

          {notice && <p className="mt-5 rounded-lg border border-volt-500/30 bg-volt-500/10 p-3 text-sm text-ink-100">{notice}</p>}

          <form onSubmit={submit} className="mt-7 space-y-4">
            {view === 'signup' && (
              <Field icon={<UserIcon size={15} />}>
                <input className="input-field pl-9" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
              </Field>
            )}

            {view !== 'verify' && (
              <Field icon={<Mail size={15} />}>
                <input type="email" className="input-field pl-9" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required readOnly={view === 'verify'} />
              </Field>
            )}

            {view === 'verify' && (
              <Field icon={<ShieldCheck size={15} />}>
                <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" className="input-field pl-9 tracking-[0.35em]" placeholder="6-digit email code" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} required />
              </Field>
            )}

            {view !== 'reset' && view !== 'verify' && (
              <Field icon={<Lock size={15} />}>
                <input type={showPw ? 'text' : 'password'} className="input-field pl-9 pr-9" placeholder="Password (minimum 8 characters)" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={view === 'login' ? 'current-password' : 'new-password'} required />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400" aria-label="Toggle password visibility">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </Field>
            )}

            {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

            <button type="submit" disabled={loading} className="btn-volt flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm disabled:opacity-60">
              {loading ? 'Please wait…' : <>{view === 'login' ? 'Sign in' : view === 'signup' ? 'Create account' : view === 'verify' ? 'Verify email' : 'Send reset link'}<ArrowRight size={15} /></>}
            </button>
          </form>

          <div className="mt-5 flex flex-col items-center gap-3 text-center text-sm text-ink-400">
            {view === 'verify' && <button type="button" disabled={loading} onClick={resendCode} className="text-volt-400 disabled:opacity-60">Resend verification code</button>}
            {view === 'login' && <><span>No account? <button onClick={() => { setView('signup'); setError(''); setNotice(''); }} className="text-volt-400">Create one</button></span><button onClick={() => { setView('reset'); setError(''); setNotice(''); }} className="text-volt-400">Forgot password?</button></>}
            {view === 'signup' && <>Already registered? <button onClick={() => { setView('login'); setError(''); setNotice(''); }} className="text-volt-400">Sign in</button></>}
            {view === 'reset' && <button onClick={() => { setView('login'); setError(''); setNotice(''); }} className="text-volt-400">Back to sign in</button>}
            {view === 'verify' && <button onClick={() => { setView('signup'); setOtp(''); setError(''); setNotice(''); }} className="text-volt-400">Back to sign up</button>}
          </div>
          {view === 'login' && <p className="mt-4 text-center text-xs text-ink-500">You’ll stay signed in on this device until you sign out. Sessions are securely managed by Supabase Auth.</p>}
        </div>
      </div>
    </div>
  );
}

function Field({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">{icon}</span>{children}</div>;
}
