import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Backwards-compatible aliases */
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: {
          DEFAULT: "var(--surface)",
          subtle: "var(--surface-subtle)",
          card: "var(--surface-card)",
        },
        border: "var(--border)",
        accent: {
          DEFAULT: "var(--accent)",
          subtle: "var(--accent-subtle)",
          glow: "var(--accent-glow)",
        },

        /* AEGIS Master Design System Palette */
        aegis: {
          bg: "var(--aegis-bg)",
          "bg-elevated": "var(--aegis-bg-elevated)",
          surface: "var(--aegis-surface)",
          "surface-raised": "var(--aegis-surface-raised)",
          "surface-hover": "var(--aegis-surface-hover)",
          "surface-glass": "var(--aegis-surface-glass)",
          border: {
            DEFAULT: "var(--aegis-border)",
            subtle: "var(--aegis-border-subtle)",
            strong: "var(--aegis-border-strong)",
            focus: "var(--aegis-border-focus)",
          },
          text: {
            primary: "var(--aegis-text-primary)",
            secondary: "var(--aegis-text-secondary)",
            muted: "var(--aegis-text-muted)",
            inverse: "var(--aegis-text-inverse)",
          },
          violet: {
            DEFAULT: "var(--aegis-violet)",
            bright: "var(--aegis-violet-bright)",
            surface: "var(--aegis-violet-surface)",
            subtle: "var(--aegis-violet-subtle)",
            border: "var(--aegis-violet-border)",
          },
          cyan: {
            DEFAULT: "var(--aegis-cyan)",
            surface: "var(--aegis-cyan-surface)",
            subtle: "var(--aegis-cyan-subtle)",
            border: "var(--aegis-cyan-border)",
          },
          warning: {
            DEFAULT: "var(--aegis-warning)",
            surface: "var(--aegis-warning-surface)",
            subtle: "var(--aegis-warning-subtle)",
            border: "var(--aegis-warning-border)",
          },
          danger: {
            DEFAULT: "var(--aegis-danger)",
            surface: "var(--aegis-danger-surface)",
            subtle: "var(--aegis-danger-subtle)",
            border: "var(--aegis-danger-border)",
          },
          success: {
            DEFAULT: "var(--aegis-success)",
            surface: "var(--aegis-success-surface)",
            subtle: "var(--aegis-success-subtle)",
            border: "var(--aegis-success-border)",
          },
          neutral: {
            DEFAULT: "var(--aegis-neutral)",
            surface: "var(--aegis-neutral-surface)",
          },
        },
      },
      boxShadow: {
        "aegis-card": "var(--aegis-shadow-card)",
        "aegis-elevated": "var(--aegis-shadow-elevated)",
        "aegis-glow-violet": "var(--aegis-glow-violet)",
        "aegis-glow-cyan": "var(--aegis-glow-cyan)",
      },
      transitionTimingFunction: {
        "aegis-standard": "var(--aegis-ease-standard)",
        "aegis-decelerate": "var(--aegis-ease-decelerate)",
        "aegis-accelerate": "var(--aegis-ease-accelerate)",
      },
    },
  },
  plugins: [],
};

export default config;
