export type Page =
  | 'landing'
  | 'auth'
  | 'dashboard'
  | 'privacy'
  | 'terms'
  | 'contact';

export type AuthView = 'login' | 'signup' | 'reset';

export interface User {
  name: string;
  email: string;
}

export type Role = 'admin' | 'client';

export interface Session {
  user: User;
  is_subscribed: boolean;
  trial_started_date: string; // ISO
  trial_expired_date: string; // ISO, 30 days after start
  tier: string | null;
  role: Role;
}

export interface NavItem {
  id: DashboardView;
  label: string;
  icon: string;
}

export type DashboardView = 'live' | 'analytics' | 'api' | 'master';

export interface Metrics {
  gpuTemp: number;
  powerUsage: number;
  fanSpeed: number;
}

export interface LogPacket {
  t: string;
  status: 'success' | 'warn' | 'info';
  gpu_temp: number;
  power_usage: number;
  fan_speed: number;
}
