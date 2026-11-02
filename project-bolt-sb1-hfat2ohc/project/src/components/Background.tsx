export function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Base */}
      <div className="absolute inset-0 bg-ink-950" />
      {/* Grid */}
      <div className="absolute inset-0 grid-bg opacity-60" />
      {/* Radial vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(34,197,94,0.08), transparent 60%), radial-gradient(ellipse 60% 50% at 90% 100%, rgba(34,197,94,0.05), transparent 60%)',
        }}
      />
      {/* Animated glowing orbs */}
      <div
        className="absolute top-[-10%] left-[15%] h-[420px] w-[420px] rounded-full opacity-30 animate-pulse-slow"
        style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.18), transparent 70%)' }}
      />
      <div
        className="absolute bottom-[-15%] right-[10%] h-[520px] w-[520px] rounded-full opacity-20 animate-pulse-slow"
        style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.12), transparent 70%)', animationDelay: '1.5s' }}
      />
      {/* SVG glow lines */}
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="bgLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="rgba(34,197,94,0.35)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <path
          d="M0 120 Q 480 60 960 140 T 1920 100"
          fill="none"
          stroke="url(#bgLine)"
          strokeWidth="1.5"
          className="animate-flow"
        />
        <path
          d="M0 80 Q 600 140 1200 60 T 2400 110"
          fill="none"
          stroke="url(#bgLine)"
          strokeWidth="1"
          opacity="0.5"
          className="animate-flow"
          style={{ animationDelay: '2s' }}
        />
      </svg>
    </div>
  );
}
