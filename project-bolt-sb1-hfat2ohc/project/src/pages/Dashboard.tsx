import { useEffect, useMemo, useRef, useState } from 'react';
import { LogoLockup } from '@/components/Logo';
import { LiveChart, type ChartPoint } from '@/components/LiveChart';
import { Blockwall } from '@/components/Blockwall';
import { useAuth } from '@/lib/auth';
import type { DashboardView, LogPacket, Page } from '@/lib/types';
import {
  Activity, BarChart3, Terminal, Zap, Gauge, Wind, DollarSign, Power, Copy, Check, Cpu, Server, AlertTriangle,
  ShieldCheck, Users, Building2, TrendingUp, Cpu as CpuIcon,
} from 'lucide-react';

const MAX_POINTS = 30;

const PYTHON_SCRIPT = `#!/usr/bin/env python3
"""EcoVolt AI — signed telemetry client. Stream rack metrics to the agent."""
import json, time, socket, hmac, hashlib, random

ECOVOLT_ENDPOINT = "agent.ecovolt.ai"
ECOVOLT_PORT = 443
SECRET = "your-ed25519-shared-secret"

def sign(payload: str) -> str:
    return hmac.new(SECRET.encode(), payload.encode(), hashlib.sha256).hexdigest()

def read_sensors():
    return {
        "status": "success",
        "gpu_temp": round(random.uniform(58, 72), 2),
        "power_usage": round(random.uniform(330, 460), 2),
        "fan_speed": round(random.uniform(3000, 5200), 1),
    }

def main():
    while True:
        packet = read_sensors()
        body = json.dumps(packet)
        signature = sign(body)
        print(f"[ecovolt] tx -> {body}  sig={signature[:16]}...")
        # sock = socket.create_connection((ECOVOLT_ENDPOINT, ECOVOLT_PORT))
        # sock.sendall(body.encode())
        # sock.close()
        time.sleep(5)

if __name__ == "__main__":
    main()
`;

export function Dashboard({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const { session, isTrialExpired, role } = useAuth();
  const isAdmin = role === 'admin';
  const [view, setView] = useState<DashboardView>('live');

  // Once role resolves from the async session restore, snap admins to the master view.
  useEffect(() => {
    if (isAdmin) setView('master');
  }, [isAdmin]);
  const [aiActive, setAiActive] = useState(false);

  // base simulated metrics
  const [gpuTemp, setGpuTemp] = useState(64);
  const [power, setPower] = useState(450);
  const [fan, setFan] = useState(4200);

  // history
  const [tempHist, setTempHist] = useState<ChartPoint[]>([]);
  const [powerHist, setPowerHist] = useState<ChartPoint[]>([]);
  const [fanHist, setFanHist] = useState<ChartPoint[]>([]);
  const [logs, setLogs] = useState<LogPacket[]>([]);
  const [savings, setSavings] = useState(0);
  const [copyState, setCopyState] = useState(false);

  const tick = useRef(0);
  const savingsRef = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      tick.current += 1;
      const t = tick.current;
      const label = `t${t}`;

      const targetPower = aiActive ? 335 + Math.sin(t / 3) * 6 : 450 + Math.sin(t / 3) * 12 + (Math.random() - 0.5) * 6;
      const targetTemp = aiActive ? 52 + Math.sin(t / 4) * 2 : 64 + Math.sin(t / 4) * 3 + (Math.random() - 0.5) * 2;
      const targetFan = aiActive ? 3600 + Math.sin(t / 5) * 120 : 4200 + Math.sin(t / 5) * 180 + (Math.random() - 0.5) * 80;

      setPower((p) => +(p + (targetPower - p) * 0.55).toFixed(1));
      setGpuTemp((tp) => +(tp + (targetTemp - tp) * 0.5).toFixed(1));
      setFan((f) => +(f + (targetFan - f) * 0.5).toFixed(0));

      setPowerHist((h) => [...h.slice(-MAX_POINTS + 1), { label, value: targetPower }]);
      setTempHist((h) => [...h.slice(-MAX_POINTS + 1), { label, value: targetTemp }]);
      setFanHist((h) => [...h.slice(-MAX_POINTS + 1), { label, value: targetFan }]);

      const packet: LogPacket = {
        t: new Date().toLocaleTimeString('en-US', { hour12: false }),
        status: targetPower > 430 ? 'warn' : 'success',
        gpu_temp: +targetTemp.toFixed(2),
        power_usage: +targetPower.toFixed(2),
        fan_speed: +targetFan.toFixed(1),
      };
      setLogs((l) => [packet, ...l].slice(0, 40));

      if (aiActive) {
        // savings accrue at ~$0.18/kW saved per 5s tick, scaled
        const savedKw = 450 - targetPower;
        savingsRef.current += savedKw * 0.18 * 8;
        setSavings(Math.floor(savingsRef.current));
      }
    }, 1000);

    return () => clearInterval(id);
  }, [aiActive]);

  function toggleAi() {
    setAiActive((v) => !v);
    if (!aiActive) savingsRef.current = 0;
    setSavings(0);
  }

  function copyScript() {
    navigator.clipboard?.writeText(PYTHON_SCRIPT).then(() => {
      setCopyState(true);
      setTimeout(() => setCopyState(false), 1600);
    });
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1500px] gap-0 px-3 sm:px-5">
      {/* Sidebar */}
      <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 flex-col border-r border-ink-700/60 py-6 md:flex">
        <div className="px-4">
          <LogoLockup size={26} textClass="text-sm" />
        </div>
        <div className="divider my-4" />
        <nav className="flex-1 space-y-1 px-3">
          {isAdmin && (
            <NavItem id="master" current={view} onClick={setView} icon={<ShieldCheck size={16} />} label="Global Master Panel" />
          )}
          {!isAdmin && (
            <>
              <NavItem id="live" current={view} onClick={setView} icon={<Activity size={16} />} label="Live Infrastructure" />
              <NavItem id="analytics" current={view} onClick={setView} icon={<BarChart3 size={16} />} label="Energy Savings Analytics" />
              <NavItem id="api" current={view} onClick={setView} icon={<Terminal size={16} />} label="API & Script Hub" />
            </>
          )}
        </nav>
        <div className="px-3">
          <div className="divider mb-4" />
          <div className="card-surface rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-ink-300">
              {isAdmin ? <ShieldCheck size={13} className="text-volt-500" /> : <Server size={13} className="text-volt-500" />}
              {isAdmin ? 'Admin access' : 'Cluster'}
            </div>
            {isAdmin ? (
              <>
                <p className="mt-1 text-sm font-semibold text-ink-100">Super-Admin Console</p>
                <p className="mt-1 text-xs text-volt-400">all tenant data</p>
              </>
            ) : (
              <>
                <p className="mt-1 text-sm font-semibold text-ink-100">us-east-hyperscale-01</p>
                <p className="mt-1 text-xs text-volt-400">1,248 GPUs online</p>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 py-6 md:pl-6">
        {/* mobile nav */}
        {!isAdmin && (
          <div className="mb-4 flex gap-1 overflow-x-auto md:hidden">
            {(['live', 'analytics', 'api'] as DashboardView[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs ${
                  view === v ? 'btn-volt' : 'btn-ghost'
                }`}
              >
                {v === 'live' ? 'Live' : v === 'analytics' ? 'Analytics' : 'API Hub'}
              </button>
            ))}
          </div>
        )}

        {isAdmin && <AdminMasterPanel />}

        {!isAdmin && view === 'live' && (
          <LiveView
            aiActive={aiActive}
            toggleAi={toggleAi}
            gpuTemp={gpuTemp}
            power={power}
            fan={fan}
            tempHist={tempHist}
            powerHist={powerHist}
            fanHist={fanHist}
            savings={savings}
            logs={logs}
          />
        )}
        {!isAdmin && view === 'analytics' && <AnalyticsView savings={savings} aiActive={aiActive} powerHist={powerHist} tempHist={tempHist} />}
        {!isAdmin && view === 'api' && <ApiView copyScript={copyScript} copyState={copyState} logs={logs} />}
      </main>

      {/* Hard paywall / Blockwall — locks controls when trial expires and not subscribed */}
      {session && !session.is_subscribed && isTrialExpired && <Blockwall onNavigate={onNavigate} />}
    </div>
  );
}

/* ---------- Nav ---------- */
function NavItem({
  id, current, onClick, icon, label,
}: {
  id: DashboardView; current: DashboardView; onClick: (v: DashboardView) => void; icon: React.ReactNode; label: string;
}) {
  const active = current === id;
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
        active ? 'bg-volt-500/10 text-volt-400 shadow-volt-glow-sm' : 'text-ink-300 hover:bg-ink-800/40 hover:text-ink-100'
      }`}
    >
      {icon} {label}
    </button>
  );
}

/* ---------- Live View ---------- */
function LiveView(props: {
  aiActive: boolean;
  toggleAi: () => void;
  gpuTemp: number;
  power: number;
  fan: number;
  tempHist: ChartPoint[];
  powerHist: ChartPoint[];
  fanHist: ChartPoint[];
  savings: number;
  logs: LogPacket[];
}) {
  const { aiActive, toggleAi, gpuTemp, power, fan, tempHist, powerHist, fanHist, savings, logs } = props;
  return (
    <div className="fade-in space-y-5">
      {/* header row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink-100">Live Infrastructure</h1>
          <p className="text-sm text-ink-400">Streaming every 5s · cluster us-east-hyperscale-01</p>
        </div>
        <AiToggle active={aiActive} onClick={toggleAi} />
      </div>

      {/* savings counter */}
      <div className="card-surface relative overflow-hidden rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-volt-500/30 bg-volt-500/5 text-volt-400">
              <DollarSign size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-ink-400">Live Capital Saved This Month ($ USD)</p>
              <p className={`text-3xl font-extrabold tabular-nums ${aiActive ? 'text-volt-500 text-glow' : 'text-ink-300'}`}>
                ${savings.toLocaleString()}
              </p>
            </div>
          </div>
          <div className={`rounded-full px-3 py-1 text-xs font-semibold ${aiActive ? 'bg-volt-500/15 text-volt-400' : 'bg-ink-800 text-ink-400'}`}>
            {aiActive ? 'AI OPTIMIZING' : 'BASELINE'}
          </div>
        </div>
      </div>

      {/* 3 charts */}
      <div className="grid gap-5 lg:grid-cols-3">
        <ChartCard title="GPU Core Temperature" unit="°C" icon={<Gauge size={16} />} color="#f59e0b" data={tempHist} current={gpuTemp} currentUnit="°C" />
        <ChartCard title="Total Power Consumption" unit="kW" icon={<Zap size={16} />} color="#22c55e" data={powerHist} current={power} currentUnit="kW" />
        <ChartCard title="Cooling Fan Exhaust Speed" unit="RPM" icon={<Wind size={16} />} color="#38bdf8" data={fanHist} current={fan} currentUnit="RPM" />
      </div>

      {/* log terminal */}
      <LogTerminal logs={logs} />
    </div>
  );
}

function AiToggle({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition ${
        active ? 'border-volt-500/60 bg-volt-500/10 shadow-volt-glow' : 'border-ink-700 bg-ink-900/40'
      }`}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-950/60 text-volt-500">
        <Power size={18} />
      </div>
      <div className="text-left">
        <p className="text-sm font-semibold text-ink-100">AI Predictive Optimization</p>
        <p className="text-xs text-ink-400">{active ? 'Active — agent controlling' : 'Inactive — baseline mode'}</p>
      </div>
      <span
        className={`relative ml-2 h-6 w-11 rounded-full transition ${active ? 'bg-volt-500' : 'bg-ink-600'}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${active ? 'left-[22px] shadow-volt-glow' : 'left-0.5'}`}
        />
      </span>
    </button>
  );
}

function ChartCard({
  title, unit, icon, color, data, current, currentUnit,
}: {
  title: string; unit: string; icon: React.ReactNode; color: string; data: ChartPoint[]; current: number; currentUnit: string;
}) {
  return (
    <div className="card-surface rounded-xl p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-ink-300">
          <span className="text-volt-500">{icon}</span> {title}
        </div>
        <span className="text-xs text-ink-400">{unit}</span>
      </div>
      <p className="mt-2 text-2xl font-bold text-ink-100">
        {current.toFixed(1)} <span className="text-sm text-ink-400">{currentUnit}</span>
      </p>
      <div className="mt-3">
        <LiveChart data={data} color={color} unit={unit} height={150} />
      </div>
    </div>
  );
}

function LogTerminal({ logs }: { logs: LogPacket[] }) {
  return (
    <div className="card-surface scanline relative overflow-hidden rounded-xl">
      <div className="flex items-center justify-between border-b border-ink-700/60 px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-ink-200">
          <Terminal size={15} className="text-volt-500" /> API Log Terminal
        </div>
        <div className="flex items-center gap-1.5 text-xs text-volt-400">
          <span className="h-1.5 w-1.5 rounded-full bg-volt-500 animate-blink" /> streaming
        </div>
      </div>
      <div className="h-64 overflow-y-auto p-4 font-mono text-xs">
        {logs.length === 0 && <p className="text-ink-500">awaiting telemetry…</p>}
        {logs.map((l, i) => (
          <div key={i} className="py-1">
            <span className="text-ink-500">{l.t} </span>
            <span className={l.status === 'warn' ? 'text-amber-400' : 'text-volt-400'}>
              {l.status === 'warn' ? '⚠' : '✓'}
            </span>{' '}
            <span className="text-ink-200">
              {'{"status": "'}{l.status}{'", "gpu_temp": '}{l.gpu_temp}
              {', "power_usage": '}{l.power_usage}
              {', "fan_speed": '}{l.fan_speed}{'}'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Analytics View ---------- */
function AnalyticsView({
  savings, aiActive, powerHist, tempHist,
}: {
  savings: number; aiActive: boolean; powerHist: ChartPoint[]; tempHist: ChartPoint[];
}) {
  const avgPower = powerHist.length ? powerHist.reduce((s, p) => s + p.value, 0) / powerHist.length : 0;
  const avgTemp = tempHist.length ? tempHist.reduce((s, p) => s + p.value, 0) / tempHist.length : 0;
  return (
    <div className="fade-in space-y-5">
      <div>
        <h1 className="text-xl font-bold text-ink-100">Energy Savings Analytics</h1>
        <p className="text-sm text-ink-400">Rolling 30-tick window · last 30s of agent decisions</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <StatBox icon={<DollarSign size={18} />} label="Capital Saved (MTD)" value={`$${savings.toLocaleString()}`} accent />
        <StatBox icon={<Zap size={18} />} label="Avg Power Draw" value={`${avgPower.toFixed(0)} kW`} />
        <StatBox icon={<Gauge size={18} />} label="Avg GPU Temp" value={`${avgTemp.toFixed(1)} °C`} />
      </div>
      <div className="card-surface rounded-xl p-5">
        <div className="flex items-center gap-2 text-sm text-ink-200">
          <BarChart3 size={15} className="text-volt-500" /> Power Consumption — 30s window
        </div>
        <div className="mt-4">
          <LiveChart data={powerHist} color="#22c55e" unit="kW" height={220} min={300} max={500} />
        </div>
      </div>
      <div className="card-surface rounded-xl p-5">
        <div className="flex items-center gap-2 text-sm text-ink-200">
          <Gauge size={15} className="text-volt-500" /> GPU Temperature — 30s window
        </div>
        <div className="mt-4">
          <LiveChart data={tempHist} color="#f59e0b" unit="°C" height={220} min={48} max={72} />
        </div>
      </div>
      {!aiActive && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-300">
          <AlertTriangle size={15} /> Activate AI Predictive Optimization to begin accruing capital savings.
        </div>
      )}
    </div>
  );
}

function StatBox({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className={`card-surface rounded-xl p-5 ${accent ? 'border-volt-500/40 shadow-volt-glow-sm' : ''}`}>
      <div className="flex items-center gap-2 text-xs text-ink-400">
        <span className={accent ? 'text-volt-500' : 'text-ink-400'}>{icon}</span> {label}
      </div>
      <p className={`mt-2 text-2xl font-bold ${accent ? 'text-volt-500 text-glow' : 'text-ink-100'}`}>{value}</p>
    </div>
  );
}

/* ---------- API View ---------- */
function ApiView({ copyScript, copyState, logs }: { copyScript: () => void; copyState: boolean; logs: LogPacket[] }) {
  const recent = logs[0];
  return (
    <div className="fade-in space-y-5">
      <div>
        <h1 className="text-xl font-bold text-ink-100">API & Script Hub</h1>
        <p className="text-sm text-ink-400">Run the signed Python client locally to stream rack telemetry.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* python script */}
        <div className="card-surface overflow-hidden rounded-xl">
          <div className="flex items-center justify-between border-b border-ink-700/60 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-ink-200">
              <Cpu size={15} className="text-volt-500" /> ecovolt_client.py
            </div>
            <button onClick={copyScript} className="btn-ghost flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs">
              {copyState ? <><Check size={13} className="text-volt-500" /> Copied</> : <><Copy size={13} /> Copy</>}
            </button>
          </div>
          <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-ink-200">
            <code>{PYTHON_SCRIPT}</code>
          </pre>
        </div>

        {/* latest packet + schema */}
        <div className="space-y-5">
          <div className="card-surface rounded-xl p-5">
            <p className="text-xs uppercase tracking-wider text-ink-400">Latest packet</p>
            {recent ? (
              <pre className="mt-3 overflow-x-auto rounded-lg bg-ink-950/60 p-3 font-mono text-xs text-volt-300">
{JSON.stringify(
  { status: recent.status, gpu_temp: recent.gpu_temp, power_usage: recent.power_usage, fan_speed: recent.fan_speed },
  null, 2,
)}
              </pre>
            ) : (
              <p className="mt-3 text-sm text-ink-500">awaiting telemetry…</p>
            )}
          </div>
          <div className="card-surface rounded-xl p-5">
            <p className="text-xs uppercase tracking-wider text-ink-400">Payload schema</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-200">
              <li><code className="text-volt-400">status</code> · string — "success" | "warn"</li>
              <li><code className="text-volt-400">gpu_temp</code> · float — Celsius</li>
              <li><code className="text-volt-400">power_usage</code> · float — kilowatts</li>
              <li><code className="text-volt-400">fan_speed</code> · float — RPM</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Admin Master Panel ---------- */
const ADMIN_CLIENTS = [
  { id: 'tx-compute-alpha', name: 'Texas Compute Alpha', gpus: 1200, power: 332, temp: 51, fan: 3550, ai: true, savings: 4520 },
  { id: 'eu-munich-01', name: 'EuroNode Munich', gpus: 450, power: 318, temp: 50, fan: 3400, ai: true, savings: 1890 },
  { id: 'nordic-green-01', name: 'Nordic Green Vault', gpus: 3200, power: 448, temp: 65, fan: 4300, ai: false, savings: 12400 },
];

function AdminMasterPanel() {
  const totalGpus = ADMIN_CLIENTS.reduce((s, c) => s + c.gpus, 0);
  const totalSavings = ADMIN_CLIENTS.reduce((s, c) => s + c.savings, 0);
  const activeSyncs = ADMIN_CLIENTS.filter((c) => c.ai).length;
  const totalPower = ADMIN_CLIENTS.reduce((s, c) => s + c.power, 0);

  return (
    <div className="fade-in space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-ink-100">
            <ShieldCheck size={20} className="text-volt-500" /> Global Master Panel
          </h1>
          <p className="text-sm text-ink-400">Founder / Super-Admin · all tenant clusters & unified savings</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-volt-500/40 bg-volt-500/10 px-3 py-1 text-xs text-volt-400">
          <span className="h-1.5 w-1.5 rounded-full bg-volt-500 animate-blink" /> {activeSyncs} active AI syncs
        </span>
      </div>

      {/* Unified counters */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStat icon={<CpuIcon size={18} />} label="Total GPUs Synced" value={totalGpus.toLocaleString()} accent />
        <AdminStat icon={<DollarSign size={18} />} label="Unified Savings (MTD)" value={`${totalSavings.toLocaleString()}`} accent />
        <AdminStat icon={<TrendingUp size={18} />} label="Aggregate Power" value={`${totalPower.toLocaleString()} kW`} />
        <AdminStat icon={<Building2 size={18} />} label="Tenant Clusters" value={`${ADMIN_CLIENTS.length}`} />
      </div>

      {/* Client cluster table */}
      <div className="card-surface overflow-hidden rounded-xl">
        <div className="flex items-center justify-between border-b border-ink-700/60 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-ink-200">
            <Users size={15} className="text-volt-500" /> Active Client Data Center Syncs
          </div>
          <span className="text-xs text-ink-400">live simulated telemetry</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink-700/60 text-xs uppercase tracking-wider text-ink-400">
              <tr>
                <th className="px-4 py-2.5 font-medium">Cluster</th>
                <th className="px-4 py-2.5 font-medium">Client</th>
                <th className="px-4 py-2.5 font-medium">GPUs</th>
                <th className="px-4 py-2.5 font-medium">Power</th>
                <th className="px-4 py-2.5 font-medium">Temp</th>
                <th className="px-4 py-2.5 font-medium">Fan</th>
                <th className="px-4 py-2.5 font-medium">AI</th>
                <th className="px-4 py-2.5 font-medium">Saved</th>
              </tr>
            </thead>
            <tbody>
              {ADMIN_CLIENTS.map((c) => (
                <tr key={c.id} className="border-b border-ink-700/40 last:border-0 hover:bg-ink-800/30">
                  <td className="px-4 py-3 font-mono text-xs text-volt-400">{c.id}</td>
                  <td className="px-4 py-3 text-ink-100">{c.name}</td>
                  <td className="px-4 py-3 tabular-nums text-ink-200">{c.gpus.toLocaleString()}</td>
                  <td className="px-4 py-3 tabular-nums text-ink-200">{c.power} kW</td>
                  <td className="px-4 py-3 tabular-nums text-ink-200">{c.temp}°C</td>
                  <td className="px-4 py-3 tabular-nums text-ink-200">{c.fan.toLocaleString()} RPM</td>
                  <td className="px-4 py-3">
                    {c.ai ? (
                      <span className="rounded-full bg-volt-500/15 px-2 py-0.5 text-xs text-volt-400">active</span>
                    ) : (
                      <span className="rounded-full bg-ink-700/60 px-2 py-0.5 text-xs text-ink-400">baseline</span>
                    )}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-volt-400">${c.savings.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Aggregate power trend */}
      <div className="card-surface rounded-xl p-5">
        <div className="flex items-center gap-2 text-sm text-ink-200">
          <BarChart3 size={15} className="text-volt-500" /> Aggregate Power Across All Clusters (simulated)
        </div>
        <div className="mt-4">
          <LiveChart
            data={Array.from({ length: 30 }, (_, i) => ({ label: `t${i}`, value: 4800 + Math.sin(i / 3) * 120 }))}
            color="#22c55e"
            unit="kW"
            height={200}
            min={4500}
            max={5200}
          />
        </div>
      </div>
    </div>
  );
}

function AdminStat({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className={`card-surface rounded-xl p-5 ${accent ? 'border-volt-500/40 shadow-volt-glow-sm' : ''}`}>
      <div className="flex items-center gap-2 text-xs text-ink-400">
        <span className={accent ? 'text-volt-500' : 'text-ink-400'}>{icon}</span> {label}
      </div>
      <p className={`mt-2 text-2xl font-bold tabular-nums ${accent ? 'text-volt-500 text-glow' : 'text-ink-100'}`}>{value}</p>
    </div>
  );
}
