import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        botchain: {
          50: "#e6fff6",
          100: "#cdffed",
          200: "#9bffd9",
          300: "#69ffc5",
          400: "#37ffb1",
          500: "#05ff9d",
          600: "#00cc7a",
          700: "#00995c",
          800: "#00663d",
          900: "#00331f",
        },
        cyber: {
          cyan: "#00f0ff",
          blue: "#3b82f6",
          purple: "#a855f7",
          dark: "#0a0d14",
          card: "#0f1420",
          border: "#1e293b",
          muted: "#94a3b8",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "cyber-grid": "linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        "glow-cyan": "0 0 25px -5px rgba(0, 240, 255, 0.3)",
        "glow-bot": "0 0 25px -5px rgba(5, 255, 157, 0.3)",
        "glow-card": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
    },
  },
  plugins: [],
};
export default config;
