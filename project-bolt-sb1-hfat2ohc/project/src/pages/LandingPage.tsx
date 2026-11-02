import { Logo } from '@/components/Logo';
import { PRICING, FEATURES, STATS } from '@/lib/content';
import { useAuth } from '@/lib/auth';
import type { Page } from '@/lib/types';
import {
  Cpu, Wind, ShieldCheck, Webhook, ArrowRight, Check, Activity, Zap, Gauge, Server, ChevronRight, type LucideIcon,
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (p: Page) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const { user, subscribe } = useAuth();
  const dest: Page = user ? 'dashboard' : 'auth';

  function handleTierClick(tierName: string) {
    // Enterprise routes to sales contact
    if (tierName === 'Enterprise') {
      onNavigate('contact');
      return;
    }
    // Trial just routes to auth/dashboard
    if (tierName === 'Trial') {
      onNavigate(dest);
      return;
    }
    // Paid tiers (Growth, Scale) — simulate successful payment, then open dashboard
    if (user) {
      subscribe(tierName);
      onNavigate('dashboard');
    } else {
      onNavigate('auth');
    }
  }

  return (
    <div className="relative">
      {/* HERO */}
      <section className="relative overflow-hidden px-5 pt-20 pb-24 sm:px-8 sm:pt-28 sm:pb-32">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div
          className="absolute inset-x-0 top-0 h-[600px]"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(34,197,94,0.12), transparent 70%)' }}
        />
        <div className="relative mx-auto max-w-5xl text-center">
          <div className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-volt-500/30 bg-volt-500/5 px-4 py-1.5 text-xs text-volt-300">
            <span className="h-1.5 w-1.5 rounded-full bg-volt-500 animate-blink" />
            Live agent v4.2 — now with predictive cooling algorithms
          </div>
          <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-ink-100 sm:text-6xl">
            Cut Data Center GPU Energy
            <br />
            & Cooling Costs by <span className="text-volt-500 text-glow">25%</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ink-300 sm:text-lg">
            EcoVolt AI deploys a real-time predictive automation layer across your racks — forecasting thermal
            headroom, throttling cores, and orchestrating cooling fans every 5 seconds. No workload SLAs touched.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={() => onNavigate(dest)}
              className="btn-volt flex items-center gap-2 rounded-md px-6 py-3 text-sm"
            >
              {user ? 'Open Dashboard' : 'Start Free Trial'} <ArrowRight size={16} />
            </button>
            <button
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-ghost rounded-md px-6 py-3 text-sm"
            >
              View Pricing
            </button>
          </div>

          {/* hero visual */}
          <div className="relative mt-14">
            <div className="card-surface mx-auto max-w-4xl overflow-hidden rounded-2xl p-1 shadow-card">
              <div className="rounded-xl bg-ink-950/80 p-5 sm:p-8">
                <div className="flex items-center justify-between border-b border-ink-700/60 pb-3">
                  <LogoLockupInline />
                  <div className="flex items-center gap-2 text-xs text-volt-400">
                    <Activity size={13} /> agent streaming
                  </div>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <MiniMetric icon={<Gauge size={16} />} label="GPU Temp" value="62°C" trend="-12°C" />
                  <MiniMetric icon={<Zap size={16} />} label="Power Draw" value="335kW" trend="-115kW" />
                  <MiniMetric icon={<Wind size={16} />} label="Fan Exhaust" value="4,210 RPM" trend="auto" />
                </div>
                <div className="mt-4 h-24 w-full">
                  <HeroSparkline />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-ink-700/60 bg-ink-900/40 px-5 py-10 sm:px-8">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-extrabold text-volt-500 text-glow sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-xs text-ink-400 sm:text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            kicker="Platform"
            title="A control plane for every joule"
            sub="Four agents, one decision loop. The agent reads telemetry, predicts, acts, and writes an audit trail — continuously."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => {
              const Icon = iconMap[f.icon] ?? Cpu;
              return (
                <div key={f.title} className="card-surface card-surface-hover rounded-xl p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-volt-500/30 bg-volt-500/5 text-volt-400">
                    <Icon size={18} />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-ink-100">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-300">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ARCHITECTURE STRIP */}
      <section className="px-5 pb-20 sm:px-8 sm:pb-24">
        <div className="mx-auto max-w-6xl card-surface rounded-2xl p-7 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-volt-400">The Decision Loop</p>
              <h3 className="mt-2 text-2xl font-bold text-ink-100">Telemetry → Predict → Act → Audit</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-300">
                Every 5 seconds the agent ingests per-GPU temperature, total rack power, and fan exhaust speed. It
                forecasts thermal headroom 60 seconds ahead, throttles clocks, and recomputes RPM curves — then writes
                the decision into an immutable, SOC2-ready log stream.
              </p>
              <button
                onClick={() => onNavigate(dest)}
                className="btn-ghost mt-5 inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm"
              >
                See it live <ChevronRight size={15} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {LOOP.map((step, i) => (
                <div key={step.title} className="rounded-lg border border-ink-700 bg-ink-900/40 p-4">
                  <div className="text-xs font-mono text-volt-400">0{i + 1}</div>
                  <p className="mt-1 text-sm font-semibold text-ink-100">{step.title}</p>
                  <p className="mt-1 text-xs text-ink-400">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="px-5 pb-24 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            kicker="Pricing"
            title="Four tiers, clear compliance"
            sub="From a single monitored rack to infinite clusters with a gain-share option."
          />
          <div className="mt-12 grid gap-5 lg:grid-cols-4">
            {PRICING.map((tier) => (
              <div
                key={tier.name}
                className={`relative flex flex-col rounded-2xl p-6 ${
                  tier.highlight
                    ? 'border-2 border-volt-500/60 bg-ink-900/60 shadow-volt-glow'
                    : 'card-surface card-surface-hover'
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-volt-500 px-3 py-0.5 text-xs font-semibold text-ink-950">
                    Most Popular
                  </div>
                )}
                <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-300">{tier.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-ink-100">{tier.price}</span>
                  <span className="text-sm text-ink-400">{tier.cadence}</span>
                </div>
                <p className="mt-2 text-xs text-ink-400">{tier.tagline}</p>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-ink-200">
                      <Check size={15} className="mt-0.5 shrink-0 text-volt-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleTierClick(tier.name)}
                  className={`mt-6 rounded-md px-4 py-2.5 text-sm ${
                    tier.highlight ? 'btn-volt' : 'btn-ghost'
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-24 sm:px-8">
        <div className="mx-auto max-w-4xl card-surface rounded-2xl p-10 text-center">
          <Server className="mx-auto text-volt-500" size={28} />
          <h3 className="mt-4 text-2xl font-bold text-ink-100">Deploy the agent in under 10 minutes</h3>
          <p className="mx-auto mt-3 max-w-xl text-sm text-ink-300">
            Install the signed Python client, point it at your rack, and watch power slide. No agents on your GPUs,
            no black box.
          </p>
          <button onClick={() => onNavigate(dest)} className="btn-volt mt-6 inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm">
            {user ? 'Open Dashboard' : 'Start Free Trial'} <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </div>
  );
}

const iconMap: Record<string, LucideIcon> = {
  Cpu, Wind, ShieldCheck, Webhook,
};

const LOOP = [
  { title: 'Ingest', desc: 'GPU temp, power draw, fan RPM every 5s.' },
  { title: 'Predict', desc: '60s ahead thermal headroom forecast.' },
  { title: 'Act', desc: 'Throttle clocks, recompute RPM curves.' },
  { title: 'Audit', desc: 'Immutable, SOC2-ready decision log.' },
];

function SectionHeading({ kicker, title, sub }: { kicker: string; title: string; sub: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-volt-400">{kicker}</p>
      <h2 className="mt-2 text-3xl font-bold text-ink-100 sm:text-4xl">{title}</h2>
      <p className="mt-3 text-sm text-ink-300 sm:text-base">{sub}</p>
    </div>
  );
}

function MiniMetric({ icon, label, value, trend }: { icon: React.ReactNode; label: string; value: string; trend: string }) {
  return (
    <div className="rounded-lg border border-ink-700 bg-ink-900/40 p-4">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs text-ink-400">{icon} {label}</span>
        <span className="text-xs text-volt-400">{trend}</span>
      </div>
      <p className="mt-2 text-2xl font-bold text-ink-100">{value}</p>
    </div>
  );
}

function LogoLockupInline() {
  return (
    <div className="flex items-center gap-2">
      <Logo size={24} withGlow />
      <span className="text-sm font-bold uppercase tracking-tight text-ink-100">
        EcoVolt<span className="text-volt-500"> AI</span>
      </span>
    </div>
  );
}

function HeroSparkline() {
  // dual line: power dropping after AI activation
  const points = Array.from({ length: 40 }, (_, i) => {
    const x = (i / 39) * 100;
    const baseline = 450 - Math.sin(i / 3) * 8;
    const optimized = i > 18 ? 335 - Math.sin(i / 2) * 4 : null;
    return { x, baseline, optimized };
  });
  const path = (key: 'baseline' | 'optimized', color: string, w = 2) => {
    const pts = points.filter((p) => p[key] !== null) as { x: number; baseline: number; optimized: number | null }[];
    const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x}% ${100 - ((p[key] as number) - 320) / 1.4}`).join(' ');
    return <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />;
  };
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
      <defs>
        <linearGradient id="sparkFade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(91,112,136,0.4)" />
          <stop offset="100%" stopColor="rgba(91,112,136,0.4)" />
        </linearGradient>
      </defs>
      {path('baseline', 'url(#sparkFade)', 1.5)}
      {path('optimized', '#22c55e', 2)}
    </svg>
  );
}
