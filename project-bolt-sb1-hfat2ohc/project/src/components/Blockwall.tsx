import { useState } from 'react';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/lib/auth';
import { PRICING } from '@/lib/content';
import type { Page } from '@/lib/types';
import { ShieldCheck, Lock, Check, ArrowRight, Loader2 } from 'lucide-react';

interface BlockwallProps {
  onNavigate: (p: Page) => void;
}

export function Blockwall({ onNavigate }: BlockwallProps) {
  const { subscribe, session } = useAuth();
  const [processing, setProcessing] = useState<string | null>(null);

  const paidTiers = PRICING.filter((t) => t.name !== 'Trial');

  function checkout(tierName: string) {
    setProcessing(tierName);
    // Simulated successful payment integration event
    setTimeout(() => {
      subscribe(tierName);
      setProcessing(null);
    }, 1100);
  }

  const daysOver = session
    ? Math.max(0, Math.floor((Date.now() - new Date(session.trial_expired_date).getTime()) / 86400000))
    : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-10 backdrop-blur-md">
      <div className="absolute inset-0 bg-ink-950/85" />
      <div className="relative w-full max-w-3xl">
        <div className="card-surface rounded-2xl border-volt-500/30 p-7 shadow-volt-glow-lg sm:p-9">
          {/* shield header */}
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-volt-500/40 bg-volt-500/10 text-volt-500 shadow-volt-glow">
              <Lock size={26} />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Logo size={26} withGlow />
              <span className="text-sm font-bold uppercase tracking-tight text-ink-100">
                EcoVolt<span className="text-volt-500"> AI</span>
              </span>
            </div>
            <h2 className="mt-4 text-xl font-bold text-ink-100 sm:text-2xl">Trial Access Locked</h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-300">
              Your 1-Month Free Trial has expired. Please select a premium tier to restore infrastructure
              optimization controls.
            </p>
            {daysOver > 0 && (
              <p className="mt-2 text-xs text-amber-400">
                Trial ended {daysOver} day{daysOver === 1 ? '' : 's'} ago · account is read-only until a plan is selected.
              </p>
            )}
          </div>

          {/* paid tiers */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {paidTiers.map((tier) => (
              <div
                key={tier.name}
                className={`flex flex-col rounded-xl p-5 ${
                  tier.highlight ? 'border-2 border-volt-500/60 bg-ink-900/60' : 'border border-ink-700 bg-ink-900/40'
                }`}
              >
                <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-300">{tier.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-ink-100">{tier.price}</span>
                  <span className="text-xs text-ink-400">{tier.cadence}</span>
                </div>
                <ul className="mt-3 flex-1 space-y-1.5">
                  {tier.features.slice(0, 2).map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-xs text-ink-200">
                      <Check size={12} className="mt-0.5 shrink-0 text-volt-500" /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => checkout(tier.name)}
                  disabled={!!processing}
                  className={`mt-4 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs disabled:opacity-60 ${
                    tier.highlight ? 'btn-volt' : 'btn-ghost'
                  }`}
                >
                  {processing === tier.name ? (
                    <><Loader2 size={13} className="animate-spin" /> Processing…</>
                  ) : (
                    <><ShieldCheck size={13} /> Subscribe</>
                  )}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-col items-center gap-3 text-center">
            <p className="text-xs text-ink-500">
              Checkout is simulated. On success, full dashboard controls restore instantly.
            </p>
            <button onClick={() => onNavigate('contact')} className="btn-ghost flex items-center gap-2 rounded-md px-4 py-2 text-xs">
              Talk to sales <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
