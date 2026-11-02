import { LogoLockup } from '@/components/Logo';
import type { Page } from '@/lib/types';
import { Mail, Shield, FileText, MessageSquare, Github, Linkedin, Twitter } from 'lucide-react';

interface FooterProps {
  onNavigate: (p: Page) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="relative z-10 border-t border-ink-700/60 bg-ink-950/80">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <LogoLockup size={32} textClass="text-base" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-300">
              Predictive AI automation layer for data center GPU energy and cooling. Cut draw by 25% without
              touching your workload SLAs.
            </p>
            <div className="mt-5 flex gap-3">
              {[Github, Linkedin, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-ink-700 text-ink-300 transition hover:border-volt-500/50 hover:text-volt-400"
                  aria-label="social link"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-400">Legal</h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <button onClick={() => onNavigate('privacy')} className="flex items-center gap-2 text-ink-300 hover:text-volt-400">
                  <Shield size={14} /> Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('terms')} className="flex items-center gap-2 text-ink-300 hover:text-volt-400">
                  <FileText size={14} /> Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="flex items-center gap-2 text-ink-300 hover:text-volt-400">
                  <MessageSquare size={14} /> Contact Us
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-400">Contact</h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="flex items-center gap-2 text-ink-300 hover:text-volt-400"
                >
                  <Mail size={14} /> Submit a request
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="divider my-8" />
        <div className="flex flex-col items-center justify-between gap-3 text-xs text-ink-400 sm:flex-row">
          <p>© 2026 EcoVolt AI. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-volt-500 animate-blink" /> All systems operational
            </span>
            <span>GDPRR · CCPA · SOC2 Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
