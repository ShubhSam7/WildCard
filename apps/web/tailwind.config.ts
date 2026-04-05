import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // The Void
        void: "var(--void)",
        surface: {
          DEFAULT: "var(--surface)",
          dim: "var(--surface-dim)",
          bright: "var(--surface-bright)",
          low: "var(--surface-container-low)",
          high: "var(--surface-container-highest)",
          variant: "var(--surface-variant)",
        },
        // Neon Accents
        primary: {
          DEFAULT: "var(--primary)",
          container: "var(--primary-container)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
        },
        error: {
          DEFAULT: "var(--error)",
        },
        tertiary: {
          DEFAULT: "var(--tertiary)",
        },
        // Text Colors
        on: {
          surface: "var(--on-surface)",
          variant: "var(--on-surface-variant)",
          primary: "var(--on-primary)",
          secondary: "var(--on-secondary)",
          error: "var(--on-error)",
        },
      },
      fontFamily: {
        grotesk: ["var(--font-space-grotesk)", "sans-serif"],
        manrope: ["var(--font-manrope)", "sans-serif"],
      },
      spacing: {
        xs: "var(--spacing-xs)",
        sm: "var(--spacing-sm)",
        md: "var(--spacing-md)",
        lg: "var(--spacing-lg)",
        xl: "var(--spacing-xl)",
      },
      borderRadius: {
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        full: "var(--radius-full)",
      },
      boxShadow: {
        ambient: "var(--shadow-ambient)",
        glow: "0 0 12px currentColor",
        "glow-primary": "var(--glow-primary)",
        "glow-secondary": "var(--glow-secondary)",
        "glow-error": "var(--glow-error)",
      },
      backdropBlur: {
        glass: "20px",
      },
      transitionDuration: {
        base: "200ms",
      },
    },
  },
  plugins: [],
};
export default config;
