import type { Config } from "tailwindcss";

const config = {
  darkMode: "class",
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Core App Palette - Deep Navy/Black
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        // Custom Dashboard Colors
        app: {
          DEFAULT: "var(--color-app-bg)",
          panel: "var(--color-panel-bg)",
          card: "var(--color-card-bg)",
          canvas: "var(--color-canvas-bg)",
          overlay: "var(--color-overlay-bg)",
        },

        // Borders
        border: {
          DEFAULT: "hsl(var(--border))",
          subtle: "var(--color-border-subtle)",
          medium: "var(--color-border-medium)",
          strong: "var(--color-border-strong)",
        },

        // Text
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          tertiary: "var(--color-text-tertiary)",
          inverse: "var(--color-text-inverse)",
        },

        // Semantics
        success: {
          DEFAULT: "var(--color-success)",
          foreground: "var(--color-text-inverse)",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          foreground: "var(--color-text-inverse)",
        },
        error: {
          DEFAULT: "var(--color-error)",
          foreground: "var(--color-text-inverse)",
        },
        info: {
          DEFAULT: "var(--color-info)",
          foreground: "var(--color-text-inverse)",
        },

        // Brand Accents
        brand: {
          blue: "var(--color-brand-blue)",
          gray: "var(--color-brand-gray)",
          purple: "var(--color-brand-purple)",
        },

        // Shadcn/UI Mappings (Preserving existing functionality)
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"], // IBM Plex Mono priority
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;

export default config;
