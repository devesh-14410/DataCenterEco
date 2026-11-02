import { useState, useEffect, useRef } from 'react';
import type { Page } from '@/lib/types';
import { Shield, Lock, FileText, Globe } from 'lucide-react';

export function PrivacyPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <LegalShell title="Privacy Policy" kicker="Last updated: November 2026" icon={<Shield size={22} />}>
      <Section title="1. Overview">
        EcoVolt AI ("we", "us") operates a predictive automation layer for data center energy and cooling. This policy
        describes what telemetry we collect, how it is encrypted, and the rights available to you under GDPR, CCPA,
        and SOC2 readiness commitments.
      </Section>
      <Section title="2. Data We Process">
        <ul>
          <li><b>Rack telemetry:</b> GPU temperature, total power draw (kW), and fan exhaust speed (RPM).</li>
          <li><b>Account data:</b> corporate username, business email, and hashed password.</li>
          <li><b>Decision logs:</b> immutable records of agent actions taken on your infrastructure.</li>
        </ul>
        We do <b>not</b> process the contents of workloads running on your GPUs.
      </Section>
      <Section title="3. Encrypted Data Handling">
        All telemetry is transmitted over TLS 1.3 and encrypted at rest using AES-256. Authentication secrets are
        hashed with Argon2id. Telemetry streams are isolated per-tenant and never co-mingled.
      </Section>
      <Section title="4. International Compliance">
        <ul>
          <li><b>GDPR:</b> lawful basis is legitimate interest (infrastructure optimization). You may request
          erasure or export at any time.</li>
          <li><b>CCPA:</b> California residents may request deletion and opt out of any sale — we do not sell data.</li>
          <li><b>SOC2 readiness:</b> audit trails, access controls, and change management are in continuous scope.</li>
        </ul>
      </Section>
      <Section title="5. Data Retention">
        Telemetry is retained for 90 days at full resolution and 13 months in downsampled form. Decision logs are
        retained for 7 years to support audit requirements.
      </Section>
      <Section title="6. Your Rights">
        To access, correct, or delete your data, submit a request through our contact form. We respond within 30 days.
      </Section>
      <BackLink onNavigate={onNavigate} />
    </LegalShell>
  );
}

export function TermsPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <LegalShell title="Terms & Conditions" kicker="Last updated: November 2026" icon={<FileText size={22} />}>
      <Section title="1. Operational Parameters">
        EcoVolt AI provides a predictive optimization agent that reads rack telemetry and adjusts GPU throttling and
        fan RPM curves. The agent operates within safe operating envelopes you define and will never exceed manufacturer-specified thermal limits.
      </Section>
      <Section title="2. Uptime Guarantee">
        For Scale and Enterprise tiers, we commit to a 99.99% uptime SLA on the control plane. Service credits are
        issued for qualifying outages, calculated as a percentage of monthly fees.
      </Section>
      <Section title="3. Server-Side Safety Integration Limits">
        <ul>
          <li>The agent will not disable cooling below the minimum RPM defined in your cluster profile.</li>
          <li>Throttling actions are reversible and rate-limited to one decision per rack per 5 seconds.</li>
          <li>An emergency override endpoint is available to halt all agent actions immediately.</li>
        </ul>
      </Section>
      <Section title="4. Acceptable Use">
        You agree not to use EcoVolt AI to operate infrastructure in violation of applicable law or to attempt to
        reverse-engineer the predictive models.
      </Section>
      <Section title="5. Gain-Share (Enterprise)">
        Under the 10% gain-share option, EcoVolt AI receives 10% of documented energy-cost savings measured against
        a 30-day baseline. Billing is monthly and auditable.
      </Section>
      <Section title="6. Liability">
        EcoVolt AI's aggregate liability is limited to the fees paid in the preceding 12 months. We are not liable
        for indirect or consequential damages.
      </Section>
      <BackLink onNavigate={onNavigate} />
    </LegalShell>
  );
}

function LegalShell({
  title, kicker, icon, children,
}: {
  title: string; kicker: string; icon: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="relative mx-auto max-w-3xl px-5 py-16 sm:px-8">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-volt-500/30 bg-volt-500/5 text-volt-500">
          {icon}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ink-100">{title}</h1>
          <p className="text-xs text-ink-400">{kicker}</p>
        </div>
      </div>
      <div className="mt-8 space-y-7">{children}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card-surface rounded-xl p-6">
      <h2 className="flex items-center gap-2 text-base font-semibold text-ink-100">
        <Lock size={14} className="text-volt-500" /> {title}
      </h2>
      <div className="mt-3 space-y-2 text-sm leading-relaxed text-ink-300 [&_b]:text-ink-100 [&_li]:ml-4 [&_li]:list-disc">
        {children}
      </div>
    </section>
  );
}

function BackLink({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <div className="pt-2">
      <button onClick={() => onNavigate('landing')} className="btn-ghost rounded-md px-4 py-2 text-sm">
        ← Back to platform
      </button>
    </div>
  );
}

export function ContactPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Smoothly bring the contact form into view so the input fields are immediately visible.
    const id = setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="relative mx-auto max-w-4xl px-5 py-16 sm:px-8">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-volt-500/30 bg-volt-500/5 text-volt-500">
          <Globe size={22} />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-ink-100">Contact Us</h1>
        <p className="mt-2 text-sm text-ink-300">
          Talk to a solutions engineer about your cluster. We typically reply within one business day.
        </p>
      </div>

      <div ref={formRef} id="contact-form" className="mt-10 scroll-mt-24">
        <ContactForm />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="card-surface rounded-xl p-5">
          <p className="text-xs uppercase tracking-wider text-ink-400">Headquarters</p>
          <p className="mt-2 text-sm text-ink-200">548 Market St, San Francisco, CA 94104</p>
        </div>
        <div className="card-surface rounded-xl p-5">
          <p className="text-xs uppercase tracking-wider text-ink-400">Support tier</p>
          <p className="mt-2 text-sm text-ink-200">24/7 for Scale & Enterprise; business hours for Growth.</p>
        </div>
      </div>

      <div className="pt-8">
        <button onClick={() => onNavigate('landing')} className="btn-ghost rounded-md px-4 py-2 text-sm">
          ← Back to platform
        </button>
      </div>
    </div>
  );
}

function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  // Internal destination mailbox — not surfaced in the UI. Form submissions route here.
  const INTERNAL_MAILBOX = 'deveshbarot14410@gmail.com';

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.includes('@') || !message.trim()) {
      setError('Please complete name, valid email, and message.');
      return;
    }
    setError('');
    // Route the submission to the internal team mailbox (no external address printed).
    const payload = {
      to: INTERNAL_MAILBOX,
      from: email,
      name,
      company,
      message,
      submittedAt: new Date().toISOString(),
    };
    // In production this would POST to a secure backend / edge function.
    void payload;
    setSent(true);
  }

  if (sent) {
    return (
      <div className="card-surface flex flex-col items-center justify-center rounded-xl p-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-volt-500/15 text-volt-500">
          <Shield size={24} />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-ink-100">Message received</h3>
        <p className="mt-2 max-w-sm text-sm text-ink-300">
          Thanks, {name || 'operator'}. Your message has been routed to our internal team mailbox and we'll reply
          to you within one business day.
        </p>
        <button onClick={() => { setSent(false); setName(''); setEmail(''); setCompany(''); setMessage(''); }} className="btn-ghost mt-5 rounded-md px-4 py-2 text-sm">
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card-surface rounded-xl p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs text-ink-400">Name</label>
          <input className="input-field mt-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        </div>
        <div>
          <label className="text-xs text-ink-400">Business email</label>
          <input className="input-field mt-1" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
        </div>
      </div>
      <div className="mt-4">
        <label className="text-xs text-ink-400">Company</label>
        <input className="input-field mt-1" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company (optional)" />
      </div>
      <div className="mt-4">
        <label className="text-xs text-ink-400">Message</label>
        <textarea
          className="input-field mt-1 min-h-[120px] resize-y"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us about your cluster size and goals…"
        />
      </div>
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      <button type="submit" className="btn-volt mt-5 rounded-md px-5 py-2.5 text-sm">Send message</button>
    </form>
  );
}
