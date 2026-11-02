interface LogoProps {
  size?: number;
  withGlow?: boolean;
  className?: string;
}

export function Logo({ size = 36, withGlow = true, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={withGlow ? { filter: 'drop-shadow(0 0 8px rgba(34,197,94,0.7))' } : undefined}
      aria-label="EcoVolt AI logo"
    >
      <defs>
        <linearGradient id="voltHexFill" x1="32" y1="2" x2="32" y2="62" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0a0f14" />
          <stop offset="1" stopColor="#05070a" />
        </linearGradient>
        <linearGradient id="voltBoltFill" x1="32" y1="14" x2="32" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7ddb93" />
          <stop offset="1" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      {/* Hexagon server-rack frame */}
      <path
        d="M32 2 56 16 56 48 32 62 8 48 8 16Z"
        fill="url(#voltHexFill)"
        stroke="#22c55e"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Inner rack rails */}
      <path d="M20 19 20 45 M44 19 44 45" stroke="#15803d" strokeWidth="1.2" strokeOpacity="0.6" strokeLinecap="round" />
      {/* Server slots */}
      <g stroke="#15803d" strokeWidth="0.9" strokeOpacity="0.45">
        <path d="M22 24 H42 M22 30 H42 M22 36 H42 M22 42 H42" />
      </g>
      {/* Thunderbolt */}
      <path
        d="M35 15 22 34 H30 L28 50 43 29 H34 L36 15Z"
        fill="url(#voltBoltFill)"
        stroke="#4ade80"
        strokeWidth="0.6"
        strokeLinejoin="round"
        style={{ filter: 'drop-shadow(0 0 4px rgba(74,222,128,0.9))' }}
      />
    </svg>
  );
}

export function LogoLockup({
  size = 36,
  textClass = 'text-lg',
  className = '',
  withGlow = true,
}: {
  size?: number;
  textClass?: string;
  className?: string;
  withGlow?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <Logo size={size} withGlow={withGlow} />
      <span className={`font-sans font-extrabold uppercase tracking-tight text-ink-100 ${textClass}`}>
        EcoVolt<span className="text-volt-500 text-glow"> AI</span>
      </span>
    </div>
  );
}
