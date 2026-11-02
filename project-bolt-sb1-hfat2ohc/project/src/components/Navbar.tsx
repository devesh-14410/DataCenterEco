import { useState } from 'react';
import { createPortal } from 'react-dom';
import { LogoLockup } from '@/components/Logo';
import { useAuth } from '@/lib/auth';
import type { Page } from '@/lib/types';
import { Menu, X, LayoutDashboard, LogOut, ShieldAlert } from 'lucide-react';

interface NavbarProps {
  page: Page;
  onNavigate: (p: Page) => void;
}

const LINKS: { label: string; page: Page }[] = [
  { label: 'Platform', page: 'landing' },
  { label: 'Privacy', page: 'privacy' },
  { label: 'Terms', page: 'terms' },
  { label: 'Contact', page: 'contact' },
];

export function Navbar({ page, onNavigate }: NavbarProps) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);

  function go(p: Page) {
    setOpen(false);
    onNavigate(p);
  }

  function confirmSignOut() {
    setShowSignOut(false);
    setOpen(false);
    logout();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-ink-700/60 bg-ink-950/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <button onClick={() => go(user ? 'dashboard' : 'landing')} className="transition hover:opacity-90">
          <LogoLockup size={32} textClass="text-base sm:text-lg" />
        </button>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <button
              key={l.page}
              onClick={() => go(l.page)}
              className={`rounded-md px-3 py-2 text-sm transition ${
                page === l.page
                  ? 'text-volt-400 text-glow-sm'
                  : 'text-ink-300 hover:text-ink-100'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <button
                onClick={() => go('dashboard')}
                className="btn-ghost flex items-center gap-2 rounded-md px-3.5 py-2 text-sm"
              >
                <LayoutDashboard size={15} /> Dashboard
              </button>
              <button
                onClick={() => setShowSignOut(true)}
                className="flex items-center gap-2 rounded-md px-3.5 py-2 text-sm text-ink-300 hover:text-ink-100"
              >
                <LogOut size={15} /> Sign out
              </button>
            </>
          ) : (
            <>
              <button onClick={() => go('auth')} className="btn-ghost rounded-md px-4 py-2 text-sm">
                Sign in
              </button>
              <button onClick={() => go('auth')} className="btn-volt rounded-md px-4 py-2 text-sm">
                Get Started
              </button>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-2 text-ink-200 md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-ink-700/60 bg-ink-950/95 px-5 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <button
                key={l.page}
                onClick={() => go(l.page)}
                className={`rounded-md px-3 py-2.5 text-left text-sm ${
                  page === l.page ? 'bg-volt-500/10 text-volt-400' : 'text-ink-200'
                }`}
              >
                {l.label}
              </button>
            ))}
            <div className="divider my-2" />
            {user ? (
              <>
                <button onClick={() => go('dashboard')} className="rounded-md px-3 py-2.5 text-left text-sm text-ink-100">
                  Dashboard
                </button>
                <button onClick={() => setShowSignOut(true)} className="rounded-md px-3 py-2.5 text-left text-sm text-ink-300">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <button onClick={() => go('auth')} className="rounded-md px-3 py-2.5 text-left text-sm text-ink-100">
                  Sign in
                </button>
                <button onClick={() => go('auth')} className="btn-volt mt-1 rounded-md px-3 py-2.5 text-sm">
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {showSignOut && createPortal(
        <div
          onClick={() => setShowSignOut(false)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}
        >
          <div
            className="card-surface w-full max-w-sm rounded-2xl p-6 shadow-card"
            style={{ maxWidth: 380, margin: '0 1rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-volt-500/30 bg-volt-500/10 text-volt-500">
                <ShieldAlert size={24} />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-ink-100">Confirm sign out</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-300">
                Are you sure you want to sign out of EcoVolt AI Super-Admin Panel?
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowSignOut(false)}
                className="btn-ghost flex-1 rounded-md px-4 py-2.5 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmSignOut}
                className="flex flex-1 items-center justify-center gap-2 rounded-md bg-red-500/90 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500"
              >
                <LogOut size={15} /> Confirm Sign Out
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </header>
  );
}
