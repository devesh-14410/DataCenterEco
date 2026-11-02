/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        volt: {
          50: '#effaf2',
          100: '#d7f5dd',
          200: '#b0ebbd',
          300: '#7ddb93',
          400: '#45c069',
          500: '#22c55e',
          600: '#17a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          glow: '#4ade80',
        },
        ink: {
          950: '#05070a',
          900: '#0a0f14',
          850: '#0d141b',
          800: '#111a23',
          700: '#1a2733',
          600: '#243443',
          500: '#364a5e',
          400: '#5b7088',
          300: '#8aa0b8',
          200: '#c3d2e3',
          100: '#e6edf5',
        },
      },
      boxShadow: {
        'volt-glow': '0 0 15px rgba(34,197,94,0.5)',
        'volt-glow-lg': '0 0 30px rgba(34,197,94,0.45)',
        'volt-glow-sm': '0 0 8px rgba(34,197,94,0.35)',
        'card': '0 8px 32px rgba(0,0,0,0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'flow': 'flow 8s linear infinite',
        'blink': 'blink 1s steps(2,start) infinite',
        'spin-slow': 'spin 6s linear infinite',
        'sweep': 'sweep 4s ease-in-out infinite',
      },
      keyframes: {
        flow: {
          '0%': { strokeDashoffset: '200' },
          '100%': { strokeDashoffset: '0' },
        },
        blink: {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.15' },
        },
        sweep: {
          '0%,100%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
};
