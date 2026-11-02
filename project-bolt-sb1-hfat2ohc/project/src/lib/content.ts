import { useAuth } from '@/lib/auth';

export const PRICING = [
  {
    name: 'Trial',
    price: '$0',
    cadence: '/mo',
    tagline: 'Evaluate the agent on a single rack.',
    features: ['1 Monitored Server Rack', 'Core analytics dashboard', 'Basic logs (24h retention)', 'Community support'],
    cta: 'Start Trial',
    highlight: false,
  },
  {
    name: 'Growth',
    price: '$499',
    cadence: '/mo',
    tagline: 'Automated throttling for mid-size fleets.',
    features: ['Up to 100 GPUs', 'Automated throttling', '24/7 logging & alerts', 'Email support'],
    cta: 'Choose Growth',
    highlight: false,
  },
  {
    name: 'Scale',
    price: '$1,499',
    cadence: '/mo',
    tagline: 'Predictive cooling for hyperscale ops.',
    features: ['Up to 1,000 GPUs', 'Predictive cooling algorithms', 'Full webhooks & API access', 'Priority support'],
    cta: 'Choose Scale',
    highlight: true,
  },
  {
    name: 'Cluster',
    price: '$2,999',
    cadence: '/mo',
    tagline: 'Advanced dynamic throttling for large clusters.',
    features: ['Up to 5,000 GPUs', 'Advanced Dynamic Power Throttling', 'Dedicated Predictive Cooling SLA', 'Priority 24/7 Solutions Engineer Support', 'Full Webhook Event Streams'],
    cta: 'Choose Cluster',
    highlight: false,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    cadence: '',
    tagline: 'Infinite clusters, dedicated models, gain-share.',
    features: ['Infinite infrastructure clusters', 'Dedicated container models', '10% gain-share option', 'Dedicated solutions engineer'],
    cta: 'Contact Sales',
    highlight: false,
  },
];

export const FEATURES = [
  {
    icon: 'Cpu',
    title: 'Per-GPU Predictive Throttling',
    desc: 'The agent forecasts thermal headroom per core and scales clocks 60s ahead of hotspots, eliminating wasted draw.',
  },
  {
    icon: 'Wind',
    title: 'Cooling-Fan Auto-Orchestration',
    desc: 'RPM curves are recomputed every 5 seconds against live exhaust deltas, keeping PUE flat under bursty loads.',
  },
  {
    icon: 'ShieldCheck',
    title: 'SOC2-Ready Audit Trail',
    desc: 'Every optimization decision is written to an immutable log stream you can pipe into your SIEM.',
  },
  {
    icon: 'Webhook',
    title: 'Webhooks & Script Hub',
    desc: 'Ship raw JSON packets to your stack or run our signed Python client locally — no black box.',
  },
];

export const STATS = [
  { value: '25%', label: 'Average energy & cooling cut' },
  { value: '5s', label: 'Decision refresh interval' },
  { value: '1M+', label: 'GPUs under management' },
  { value: '99.99%', label: 'Agent uptime SLA' },
];

export function useFooterContact() {
  const { user } = useAuth();
  return { isAuthed: !!user };
}
