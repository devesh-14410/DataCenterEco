import { useMemo } from 'react';

export interface ChartPoint {
  label: string;
  value: number;
}

interface LiveChartProps {
  data: ChartPoint[];
  color?: string;
  unit: string;
  height?: number;
  min?: number;
  max?: number;
}

export function LiveChart({ data, color = '#22c55e', unit, height = 180, min, max }: LiveChartProps) {
  const { path, area, last, range } = useMemo(() => {
    if (data.length < 2) return { path: '', area: '', last: 0, range: [0, 1] as [number, number] };
    const values = data.map((d) => d.value);
    let lo = min ?? Math.min(...values);
    let hi = max ?? Math.max(...values);
    if (hi === lo) hi = lo + 1;
    const pad = (hi - lo) * 0.12;
    lo -= pad;
    hi += pad;
    const W = 100;
    const H = 100;
    const scaleX = (i: number) => (i / (data.length - 1)) * W;
    const scaleY = (v: number) => H - ((v - lo) / (hi - lo)) * H;

    const p = data
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i).toFixed(2)} ${scaleY(d.value).toFixed(2)}`)
      .join(' ');

    const a = `${p} L ${W} ${H} L 0 ${H} Z`;
    return { path: p, area: a, last: values[values.length - 1], range: [lo, hi] as [number, number] };
  }, [data, min, max]);

  const gradId = `grad-${unit.replace(/[^a-z]/gi, '')}`;
  const gid = useMemo(() => gradId + Math.random().toString(36).slice(2, 6), [gradId]);

  return (
    <div className="relative" style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* gridlines */}
        {[25, 50, 75].map((y) => (
          <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(54,74,94,0.35)" strokeWidth="0.4" />
        ))}
        {area && <path d={area} fill={`url(#${gid})`} />}
        {path && (
          <path
            d={path}
            fill="none"
            stroke={color}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: `drop-shadow(0 0 4px ${color}88)` }}
          />
        )}
      </svg>
      <div className="pointer-events-none absolute right-2 top-2 rounded-md border border-ink-700 bg-ink-950/70 px-2 py-1 text-xs text-ink-200">
        {last.toFixed(1)} {unit}
      </div>
    </div>
  );
}
