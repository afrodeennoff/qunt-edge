import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: 'hsl(var(--bg-base))',
          elevated: 'hsl(var(--bg-elevated))',
          card: 'hsl(var(--bg-card))',
          'card-hover': 'hsl(var(--bg-card-hover))',
          overlay: 'hsl(var(--bg-overlay))',
          modal: 'hsl(var(--bg-modal))',
          highlight: 'hsl(var(--bg-highlight))',
        },
        foreground: {
          DEFAULT: 'hsl(var(--fg-primary))',
          secondary: 'hsl(var(--fg-secondary))',
          tertiary: 'hsl(var(--fg-tertiary))',
          muted: 'hsl(var(--fg-muted))',
          disabled: 'hsl(var(--fg-disabled))',
        },
        accent: {
          teal: 'hsl(var(--accent-teal))',
          'teal-hover': 'hsl(var(--accent-teal-hover))',
          'teal-active': 'hsl(var(--accent-teal-active))',
          'teal-subtle': 'hsl(var(--accent-teal-subtle))',
          'teal-glow': 'hsl(var(--accent-teal-glow))',
        },
        neutral: {
          50: 'hsl(var(--neutral-50))',
          100: 'hsl(var(--neutral-100))',
          200: 'hsl(var(--neutral-200))',
          300: 'hsl(var(--neutral-300))',
          400: 'hsl(var(--neutral-400))',
          500: 'hsl(var(--neutral-500))',
          600: 'hsl(var(--neutral-600))',
          700: 'hsl(var(--neutral-700))',
          800: 'hsl(var(--neutral-800))',
          900: 'hsl(var(--neutral-900))',
          950: 'hsl(var(--neutral-950))',
        },
        border: {
          DEFAULT: 'hsl(var(--border-default))',
          subtle: 'hsl(var(--border-subtle))',
          strong: 'hsl(var(--border-strong))',
          focus: 'hsl(var(--border-focus))',
          error: 'hsl(var(--border-error))',
          warning: 'hsl(var(--border-warning))',
          success: 'hsl(var(--border-success))',
        },
        glass: {
          DEFAULT: 'hsl(var(--glass-bg))',
          strong: 'hsl(var(--glass-bg-strong))',
          subtle: 'hsl(var(--glass-bg-subtle))',
        },
        semantic: {
          error: 'hsl(var(--color-error))',
          'error-bg': 'hsl(var(--color-error-bg))',
          warning: 'hsl(var(--color-warning))',
          'warning-bg': 'hsl(var(--color-warning-bg))',
          success: 'hsl(var(--color-success))',
          'success-bg': 'hsl(var(--color-success-bg))',
          info: 'hsl(var(--color-info))',
          'info-bg': 'hsl(var(--color-info-bg))',
        },
        chart: {
          positive: 'hsl(var(--chart-positive))',
          negative: 'hsl(var(--chart-negative))',
          neutral: 'hsl(var(--chart-neutral))',
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
          6: 'hsl(var(--chart-6))',
          7: 'hsl(var(--chart-7))',
          8: 'hsl(var(--chart-8))',
        },
      },
      backdropBlur: {
        glass: '20px',
        'glass-strong': '40px',
      },
      boxShadow: {
        glass: 'var(--glass-shadow)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms',
      },
      transitionTimingFunction: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        in: 'cubic-bezier(0.4, 0, 1, 1)',
        out: 'cubic-bezier(0, 0, 0.2, 1)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'glow-subtle': 'glow-subtle 3s ease-in-out infinite',
        'glow-success': 'glow-success 2s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'glow-subtle': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '0.7' },
        },
        'glow-success': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
