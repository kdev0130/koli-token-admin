/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0d0f14',
          1: '#131720',
          2: '#1a2030',
          3: '#222840',
          border: '#2a3350',
        },
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        status: {
          active: '#10b981',
          frozen: '#ef4444',
          pending: '#f59e0b',
          approved: '#10b981',
          rejected: '#ef4444',
        },
      },
      fontFamily: {
        display: ['var(--font-syne)', 'sans-serif'],
        body: ['var(--font-dm-sans)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern':
          'linear-gradient(rgba(42,51,80,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(42,51,80,0.4) 1px, transparent 1px)',
        'amber-glow':
          'radial-gradient(ellipse at top, rgba(245,158,11,0.15) 0%, transparent 60%)',
      },
      backgroundSize: {
        grid: '32px 32px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
