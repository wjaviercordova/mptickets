import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        // Variables CSS del tema dinámico
        theme: {
          bg: {
            primary: "var(--bg-primary)",
            secondary: "var(--bg-secondary)",
            tertiary: "var(--bg-tertiary)",
          },
          glass: {
            base: "var(--glass-base)",
            overlay: "var(--glass-overlay)",
          },
          border: {
            primary: "var(--border-primary)",
            secondary: "var(--border-secondary)",
          },
          text: {
            primary: "var(--text-primary)",
            secondary: "var(--text-secondary)",
            tertiary: "var(--text-tertiary)",
          },
          accent: {
            cyan: "var(--accent-cyan)",
            purple: "var(--accent-purple)",
            emerald: "var(--accent-emerald)",
            red: "var(--accent-red)",
            yellow: "var(--accent-yellow)",
          },
        },
      },
      backgroundColor: {
        DEFAULT: "var(--bg-primary)",
      },
      textColor: {
        DEFAULT: "var(--text-primary)",
      },
      borderColor: {
        DEFAULT: "var(--border-primary)",
      },
      backdropBlur: {
        theme: "var(--blur-intensity)",
      },
      borderRadius: {
        theme: "var(--border-radius)",
      },
      transitionDuration: {
        theme: "var(--animation-speed)",
      },
    },
  },
  plugins: [],
};

export default config;
