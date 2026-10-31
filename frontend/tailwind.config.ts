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
      },
    },
  },
  plugins: [],
};

export default config;

